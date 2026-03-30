'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import { DAYS_OF_WEEK, DAY_LABELS, DayOfWeek, ShiftAssignment } from '@/lib/types';
import { getAssignedHours, getShiftColorClass } from '@/lib/utils';
import { checkManualAssignment } from '@/lib/scheduler';

export default function ScheduleGrid() {
  const staff = useStore((s) => s.staff);
  const shifts = useStore((s) => s.shifts);
  const schedule = useStore((s) => s.currentSchedule);
  const updateAssignment = useStore((s) => s.updateAssignment);
  const [draggedAssignment, setDraggedAssignment] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<string | null>(null);

  if (!schedule) return null;

  // Group assignments by day and shift
  const getAssignmentsForDayAndShift = (day: DayOfWeek, shiftId: string) => {
    return schedule.assignments.filter(
      (a) => a.day === day && a.shiftDefinitionId === shiftId
    );
  };

  // Get staff name by ID
  const getStaffName = (staffId: string | null) => {
    if (!staffId) return null;
    return staff.find((s) => s.id === staffId)?.name ?? 'Unknown';
  };

  // Calculate hours for a staff member
  const getHoursForStaff = (staffId: string) => {
    return getAssignedHours(staffId, schedule.assignments, shifts);
  };

  // Get all staff who appear in the schedule + unassigned staff
  const scheduledStaffIds = new Set(
    schedule.assignments.filter((a) => a.staffId).map((a) => a.staffId!)
  );

  // Handle drag start
  const handleDragStart = (assignmentId: string) => {
    setDraggedAssignment(assignmentId);
  };

  // Handle dropping a staff member onto an assignment slot
  const handleDropStaff = (assignmentId: string, staffId: string) => {
    if (!schedule) return;

    const staffMember = staff.find((s) => s.id === staffId);
    if (!staffMember) return;

    const warning = checkManualAssignment(staffMember, assignmentId, schedule, shifts);
    updateAssignment(assignmentId, staffId, true, warning);
    setDraggedAssignment(null);
    setDropTarget(null);
  };

  // Handle swapping two assignments
  const handleSwapAssignments = (targetAssignmentId: string) => {
    if (!draggedAssignment || !schedule) return;

    const sourceAssignment = schedule.assignments.find((a) => a.id === draggedAssignment);
    const targetAssignment = schedule.assignments.find((a) => a.id === targetAssignmentId);

    if (!sourceAssignment || !targetAssignment) return;

    // Swap staff IDs
    updateAssignment(targetAssignmentId, sourceAssignment.staffId, true);
    updateAssignment(draggedAssignment, targetAssignment.staffId, true);

    setDraggedAssignment(null);
    setDropTarget(null);
  };

  // Handle unassigning
  const handleUnassign = (assignmentId: string) => {
    updateAssignment(assignmentId, null, false);
  };

  // Reassign via dropdown
  const handleReassign = (assignmentId: string, newStaffId: string) => {
    if (newStaffId === '__unassign') {
      handleUnassign(assignmentId);
      return;
    }
    handleDropStaff(assignmentId, newStaffId);
  };

  return (
    <div className="bg-white rounded-xl border border-[var(--border)] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-[var(--secondary-light)]">
              <th className="p-3 text-left font-medium border-b border-r border-[var(--border)] min-w-[140px] sticky left-0 bg-[var(--secondary-light)] z-10">
                Shift / Role
              </th>
              {DAYS_OF_WEEK.map((day) => (
                <th
                  key={day}
                  className="p-3 text-center font-medium border-b border-r border-[var(--border)] min-w-[130px]"
                >
                  {DAY_LABELS[day]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {shifts.map((shift) => {
              const roles = Object.entries(shift.requiredStaff);
              if (roles.length === 0) return null;

              return roles.map(([role, count]) => {
                // Create array of slot indices for this role
                const slotIndices = Array.from({ length: count }, (_, i) => i);

                return slotIndices.map((slotIdx) => (
                  <tr
                    key={`${shift.id}-${role}-${slotIdx}`}
                    className="border-b border-[var(--border)] last:border-b-0 hover:bg-gray-50"
                  >
                    <td className="p-2 border-r border-[var(--border)] sticky left-0 bg-white z-10">
                      {slotIdx === 0 && (
                        <div>
                          <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${getShiftColorClass(shift.name)}`}>
                            {shift.name}
                          </span>
                          <span className="text-xs text-[var(--muted)] ml-1.5">{role}</span>
                          <div className="text-[10px] text-[var(--muted)]">
                            {shift.startTime}–{shift.endTime}
                          </div>
                        </div>
                      )}
                      {slotIdx > 0 && (
                        <span className="text-[10px] text-[var(--muted)] ml-2">slot {slotIdx + 1}</span>
                      )}
                    </td>
                    {DAYS_OF_WEEK.map((day) => {
                      const dayAssignments = getAssignmentsForDayAndShift(day, shift.id)
                        .filter((a) => a.role === role);
                      const assignment = dayAssignments[slotIdx];

                      if (!assignment) {
                        return (
                          <td key={day} className="p-1 border-r border-[var(--border)] text-center">
                            <span className="text-[10px] text-[var(--muted)]">—</span>
                          </td>
                        );
                      }

                      const staffName = getStaffName(assignment.staffId);
                      const isUnfilled = !assignment.staffId;
                      const hasWarning = !!assignment.warning;

                      return (
                        <td
                          key={day}
                          className={`p-1 border-r border-[var(--border)] ${
                            dropTarget === assignment.id ? 'bg-[var(--primary-light)]' : ''
                          }`}
                          onDragOver={(e) => {
                            e.preventDefault();
                            setDropTarget(assignment.id);
                          }}
                          onDragLeave={() => setDropTarget(null)}
                          onDrop={(e) => {
                            e.preventDefault();
                            const staffId = e.dataTransfer.getData('staffId');
                            if (staffId) {
                              handleDropStaff(assignment.id, staffId);
                            } else {
                              handleSwapAssignments(assignment.id);
                            }
                          }}
                        >
                          <div
                            className={`rounded-lg p-1.5 text-center text-xs cursor-grab active:cursor-grabbing transition-colors ${
                              isUnfilled
                                ? 'shift-unfilled border border-dashed'
                                : hasWarning
                                ? 'bg-[var(--warning-light)] border border-[var(--warning)]'
                                : 'bg-[var(--secondary-light)] border border-transparent hover:border-[var(--border)]'
                            }`}
                            draggable={!isUnfilled}
                            onDragStart={() => handleDragStart(assignment.id)}
                            onDragEnd={() => {
                              setDraggedAssignment(null);
                              setDropTarget(null);
                            }}
                          >
                            {isUnfilled ? (
                              <span className="text-[var(--danger)] font-medium">UNFILLED</span>
                            ) : (
                              <span className="font-medium">{staffName}</span>
                            )}
                            {hasWarning && (
                              <div
                                className="text-[10px] text-[var(--warning)] mt-0.5 truncate"
                                title={assignment.warning}
                              >
                                ⚠ {assignment.warning}
                              </div>
                            )}

                            {/* Reassignment dropdown */}
                            <select
                              className="w-full mt-1 text-[10px] bg-transparent border border-[var(--border)] rounded p-0.5 cursor-pointer"
                              value={assignment.staffId ?? ''}
                              onChange={(e) => handleReassign(assignment.id, e.target.value)}
                            >
                              <option value="">— Unassigned —</option>
                              <option value="__unassign">Remove assignment</option>
                              {staff.map((s) => (
                                <option key={s.id} value={s.id}>
                                  {s.name}
                                </option>
                              ))}
                            </select>
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ));
              });
            })}
          </tbody>
        </table>
      </div>

      {/* Hours Summary */}
      <div className="border-t border-[var(--border)] p-4 bg-[var(--secondary-light)]">
        <h3 className="text-sm font-semibold mb-3">Weekly Hours Summary</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
          {staff.map((member) => {
            const hours = getHoursForStaff(member.id);
            const isBelow = hours < member.minHoursPerWeek;
            const isAtMax = hours >= member.maxHoursPerWeek;
            const isScheduled = scheduledStaffIds.has(member.id);

            return (
              <div
                key={member.id}
                className={`p-2 rounded-lg text-xs ${
                  isBelow
                    ? 'bg-[var(--warning-light)] border border-[var(--warning)]'
                    : isAtMax
                    ? 'bg-[var(--danger-light)] border border-[var(--danger)]'
                    : isScheduled
                    ? 'bg-white border border-[var(--border)]'
                    : 'bg-white border border-dashed border-[var(--border)] opacity-50'
                }`}
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData('staffId', member.id);
                }}
              >
                <div className="font-medium truncate">{member.name}</div>
                <div className="text-[var(--muted)] mt-0.5">
                  {hours}h / {member.minHoursPerWeek}–{member.maxHoursPerWeek}h
                </div>
                {isBelow && (
                  <div className="text-[var(--warning)] mt-0.5">Below min</div>
                )}
                {isAtMax && (
                  <div className="text-[var(--danger)] mt-0.5">At max</div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
