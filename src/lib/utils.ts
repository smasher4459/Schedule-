import { ShiftDefinition, ShiftAssignment, DayOfWeek } from './types';

export function parseTime(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

export function formatTime(time: string): string {
  return time; // Already in HH:mm format
}

export function calculateDuration(startTime: string, endTime: string): number {
  const start = parseTime(startTime);
  const end = parseTime(endTime);
  return (end - start) / 60;
}

export function shiftsOverlap(a: ShiftDefinition, b: ShiftDefinition): boolean {
  const aStart = parseTime(a.startTime);
  const aEnd = parseTime(a.endTime);
  const bStart = parseTime(b.startTime);
  const bEnd = parseTime(b.endTime);
  return aStart < bEnd && bStart < aEnd;
}

export function isOpeningShift(shift: ShiftDefinition, allShifts: ShiftDefinition[]): boolean {
  const shiftStart = parseTime(shift.startTime);
  return allShifts.every(s => parseTime(s.startTime) >= shiftStart);
}

export function isClosingShift(shift: ShiftDefinition, allShifts: ShiftDefinition[]): boolean {
  const shiftEnd = parseTime(shift.endTime);
  return allShifts.every(s => parseTime(s.endTime) <= shiftEnd);
}

export function getAssignedHours(
  staffId: string,
  assignments: ShiftAssignment[],
  shifts: ShiftDefinition[]
): number {
  return assignments
    .filter(a => a.staffId === staffId)
    .reduce((total, a) => {
      const shift = shifts.find(s => s.id === a.shiftDefinitionId);
      return total + (shift?.durationHours ?? 0);
    }, 0);
}

export function getStaffShiftsOnDay(
  staffId: string,
  day: DayOfWeek,
  assignments: ShiftAssignment[],
  shifts: ShiftDefinition[]
): ShiftDefinition[] {
  return assignments
    .filter(a => a.staffId === staffId && a.day === day)
    .map(a => shifts.find(s => s.id === a.shiftDefinitionId))
    .filter((s): s is ShiftDefinition => s !== undefined);
}

export function getShiftColorClass(shiftName: string): string {
  const lower = shiftName.toLowerCase();
  if (lower.includes('morning') || lower.includes('open')) return 'shift-morning';
  if (lower.includes('middle') || lower.includes('mid')) return 'shift-middle';
  if (lower.includes('evening') || lower.includes('close') || lower.includes('night')) return 'shift-evening';
  return 'shift-morning';
}

export function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
