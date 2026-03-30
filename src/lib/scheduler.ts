import { v4 as uuidv4 } from 'uuid';
import {
  StaffMember,
  ShiftDefinition,
  ShiftAssignment,
  WeeklySchedule,
  ScheduleWarning,
  DayOfWeek,
  DAYS_OF_WEEK,
} from './types';
import {
  isOpeningShift,
  isClosingShift,
  shiftsOverlap,
  getAssignedHours,
  getStaffShiftsOnDay,
} from './utils';

interface SlotToFill {
  day: DayOfWeek;
  shift: ShiftDefinition;
  role: string;
  slotIndex: number; // when multiple staff needed for same role
}

/**
 * Check if a staff member passes ALL hard constraints for a given slot.
 */
function isEligible(
  staff: StaffMember,
  slot: SlotToFill,
  currentAssignments: ShiftAssignment[],
  allShifts: ShiftDefinition[]
): boolean {
  // 1. Staff must have the required role
  if (!staff.roles.includes(slot.role)) return false;

  // 2. Staff must be available on this day
  if (staff.unavailableDays.includes(slot.day)) return false;

  // 3. Must not exceed max weekly hours
  const currentHours = getAssignedHours(staff.id, currentAssignments, allShifts);
  if (currentHours + slot.shift.durationHours > staff.maxHoursPerWeek) return false;

  // 4. Opening shift restriction
  if (staff.neverOpeningShift && isOpeningShift(slot.shift, allShifts)) return false;

  // 5. Closing shift restriction
  if (staff.neverClosingShift && isClosingShift(slot.shift, allShifts)) return false;

  // 6. No overlapping shifts on same day
  const existingShifts = getStaffShiftsOnDay(staff.id, slot.day, currentAssignments, allShifts);
  for (const existing of existingShifts) {
    if (shiftsOverlap(existing, slot.shift)) return false;
  }

  return true;
}

/**
 * Score a candidate for soft constraint optimization.
 * Higher score = better candidate for this slot.
 */
function scoreCandidate(
  staff: StaffMember,
  slot: SlotToFill,
  currentAssignments: ShiftAssignment[],
  allShifts: ShiftDefinition[],
  allStaff: StaffMember[]
): number {
  let score = 0;
  const currentHours = getAssignedHours(staff.id, currentAssignments, allShifts);
  const targetHours = (staff.minHoursPerWeek + staff.maxHoursPerWeek) / 2;

  // Soft constraint 1: Prioritize staff furthest below their target hours
  // Normalize to 0-100 range
  const hoursGap = targetHours - currentHours;
  score += Math.max(0, hoursGap) * 3; // Weight: 3 points per hour below target

  // Soft constraint 2: Fair distribution - penalize staff who already have many hours
  // relative to their max
  const utilizationRate = currentHours / staff.maxHoursPerWeek;
  score -= utilizationRate * 20;

  // Soft constraint 3: Part-time vs full-time balance
  // Penalize part-time staff approaching full-time-like hours
  if (staff.employmentType === 'part-time') {
    const ptThreshold = staff.maxHoursPerWeek * 0.7;
    if (currentHours > ptThreshold) {
      score -= 15;
    }
  }

  // Soft constraint 4: Avoid opening + closing same day
  const dayShifts = getStaffShiftsOnDay(staff.id, slot.day, currentAssignments, allShifts);
  const hasOpening = dayShifts.some(s => isOpeningShift(s, allShifts));
  const hasClosing = dayShifts.some(s => isClosingShift(s, allShifts));

  if (isClosingShift(slot.shift, allShifts) && hasOpening) score -= 25;
  if (isOpeningShift(slot.shift, allShifts) && hasClosing) score -= 25;

  // Bonus: prefer staff who are below their minimum hours
  if (currentHours < staff.minHoursPerWeek) {
    score += 20;
  }

  return score;
}

/**
 * Count how many eligible staff exist for a given slot.
 * Used to sort slots by difficulty (harder-to-fill first).
 */
function countEligible(
  slot: SlotToFill,
  staff: StaffMember[],
  currentAssignments: ShiftAssignment[],
  allShifts: ShiftDefinition[]
): number {
  return staff.filter(s => isEligible(s, slot, currentAssignments, allShifts)).length;
}

/**
 * Generate a weekly schedule.
 */
export function generateSchedule(
  staff: StaffMember[],
  shifts: ShiftDefinition[],
  weekStartDate: string
): WeeklySchedule {
  const assignments: ShiftAssignment[] = [];
  const warnings: ScheduleWarning[] = [];

  // Warn about staff with 0 available days
  const unavailableStaff = staff.filter(
    s => s.unavailableDays.length === 7
  );
  for (const s of unavailableStaff) {
    warnings.push({
      type: 'no-available-days',
      message: `${s.name} has no available days and was excluded from scheduling.`,
      staffId: s.id,
    });
  }

  const eligibleStaff = staff.filter(s => s.unavailableDays.length < 7);

  // Step 1: Build all slots to fill
  const slots: SlotToFill[] = [];
  for (const day of DAYS_OF_WEEK) {
    for (const shift of shifts) {
      for (const [role, count] of Object.entries(shift.requiredStaff)) {
        for (let i = 0; i < count; i++) {
          slots.push({ day, shift, role, slotIndex: i });
        }
      }
    }
  }

  // Step 2: Sort slots by difficulty (fewer eligible staff first)
  // This is recalculated as we go, but initial sort helps
  slots.sort((a, b) => {
    const aCount = countEligible(a, eligibleStaff, assignments, shifts);
    const bCount = countEligible(b, eligibleStaff, assignments, shifts);
    return aCount - bCount;
  });

  // Step 3: Fill each slot
  for (const slot of slots) {
    // Find all eligible candidates
    const candidates = eligibleStaff.filter(s =>
      isEligible(s, slot, assignments, shifts)
    );

    if (candidates.length === 0) {
      // No one available — create unfilled assignment
      assignments.push({
        id: uuidv4(),
        shiftDefinitionId: slot.shift.id,
        staffId: null,
        day: slot.day,
        role: slot.role,
        isManualOverride: false,
        warning: 'No eligible staff available',
      });
      warnings.push({
        type: 'unfilled',
        message: `No eligible staff for ${slot.role} on ${slot.day} (${slot.shift.name} shift).`,
        day: slot.day,
        shiftId: slot.shift.id,
        role: slot.role,
      });
      continue;
    }

    // Score all candidates
    const scored = candidates.map(c => ({
      staff: c,
      score: scoreCandidate(c, slot, assignments, shifts, eligibleStaff),
    }));

    // Sort by score descending
    scored.sort((a, b) => b.score - a.score);

    // Randomized tiebreaking: among top candidates within epsilon
    const topScore = scored[0].score;
    const epsilon = 2;
    const topCandidates = scored.filter(s => topScore - s.score <= epsilon);
    const chosen = topCandidates[Math.floor(Math.random() * topCandidates.length)];

    assignments.push({
      id: uuidv4(),
      shiftDefinitionId: slot.shift.id,
      staffId: chosen.staff.id,
      day: slot.day,
      role: slot.role,
      isManualOverride: false,
    });
  }

  // Step 4: Post-processing — check for staff below min hours
  for (const member of eligibleStaff) {
    const totalHours = getAssignedHours(member.id, assignments, shifts);
    if (totalHours < member.minHoursPerWeek) {
      warnings.push({
        type: 'below-min-hours',
        message: `${member.name} is scheduled for ${totalHours}h but their minimum is ${member.minHoursPerWeek}h.`,
        staffId: member.id,
      });
    }
  }

  return {
    id: uuidv4(),
    weekStartDate,
    assignments,
    generatedAt: new Date().toISOString(),
    warnings,
  };
}

/**
 * Check constraints when manually assigning a staff member to a slot.
 * Returns a warning message if constraints are violated, or undefined if OK.
 */
export function checkManualAssignment(
  staff: StaffMember,
  assignmentId: string,
  schedule: WeeklySchedule,
  allShifts: ShiftDefinition[]
): string | undefined {
  const assignment = schedule.assignments.find(a => a.id === assignmentId);
  if (!assignment) return 'Assignment not found';

  const shift = allShifts.find(s => s.id === assignment.shiftDefinitionId);
  if (!shift) return 'Shift definition not found';

  const violations: string[] = [];

  // Check role
  if (!staff.roles.includes(assignment.role)) {
    violations.push(`${staff.name} doesn't have the ${assignment.role} role`);
  }

  // Check availability
  if (staff.unavailableDays.includes(assignment.day)) {
    violations.push(`${staff.name} is unavailable on ${assignment.day}`);
  }

  // Check max hours
  const otherAssignments = schedule.assignments.filter(
    a => a.id !== assignmentId
  );
  const currentHours = getAssignedHours(staff.id, otherAssignments, allShifts);
  if (currentHours + shift.durationHours > staff.maxHoursPerWeek) {
    violations.push(
      `Would exceed max hours (${currentHours + shift.durationHours}/${staff.maxHoursPerWeek})`
    );
  }

  // Check opening/closing restrictions
  if (staff.neverOpeningShift && isOpeningShift(shift, allShifts)) {
    violations.push(`${staff.name} has "never opening shift" restriction`);
  }
  if (staff.neverClosingShift && isClosingShift(shift, allShifts)) {
    violations.push(`${staff.name} has "never closing shift" restriction`);
  }

  // Check overlapping shifts
  const dayShifts = getStaffShiftsOnDay(
    staff.id,
    assignment.day,
    otherAssignments,
    allShifts
  );
  for (const existing of dayShifts) {
    if (shiftsOverlap(existing, shift)) {
      violations.push(`Overlaps with ${existing.name} shift on ${assignment.day}`);
    }
  }

  return violations.length > 0 ? violations.join('; ') : undefined;
}
