'use client';

import { useStore } from '@/lib/store';
import { StaffMember } from '@/lib/types';
import { capitalize } from '@/lib/utils';

interface StaffTableProps {
  onEdit: (staff: StaffMember) => void;
}

export default function StaffTable({ onEdit }: StaffTableProps) {
  const staff = useStore((s) => s.staff);
  const removeStaff = useStore((s) => s.removeStaff);

  const handleDelete = (member: StaffMember) => {
    if (confirm(`Remove ${member.name} from the staff list?`)) {
      removeStaff(member.id);
    }
  };

  if (staff.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-xl border border-[var(--border)]">
        <p className="text-[var(--muted)]">No staff members yet. Add one to get started.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-[var(--border)] overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[var(--border)] bg-[var(--secondary-light)]">
            <th className="text-left p-3 font-medium">Name</th>
            <th className="text-left p-3 font-medium">Roles</th>
            <th className="text-left p-3 font-medium">Type</th>
            <th className="text-left p-3 font-medium">Hours</th>
            <th className="text-left p-3 font-medium">Unavailable</th>
            <th className="text-left p-3 font-medium">Restrictions</th>
            <th className="text-right p-3 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {staff.map((member) => {
            const hasWarning = member.unavailableDays.length === 7;
            return (
              <tr
                key={member.id}
                className={`border-b border-[var(--border)] last:border-b-0 hover:bg-[var(--secondary-light)] transition-colors ${
                  hasWarning ? 'bg-[var(--warning-light)]' : ''
                }`}
              >
                <td className="p-3 font-medium">
                  {member.name}
                  {hasWarning && (
                    <span className="ml-2 text-xs text-[var(--warning)]" title="No available days">
                      ⚠️
                    </span>
                  )}
                </td>
                <td className="p-3">
                  <div className="flex flex-wrap gap-1">
                    {member.roles.map((role) => (
                      <span
                        key={role}
                        className="px-2 py-0.5 bg-[var(--primary-light)] text-[var(--primary)] rounded text-xs"
                      >
                        {role}
                      </span>
                    ))}
                    {member.roles.length === 0 && (
                      <span className="text-[var(--muted)]">None</span>
                    )}
                  </div>
                </td>
                <td className="p-3">
                  <span
                    className={`px-2 py-0.5 rounded text-xs ${
                      member.employmentType === 'full-time'
                        ? 'bg-[var(--success-light)] text-[var(--success)]'
                        : 'bg-[var(--warning-light)] text-[var(--warning)]'
                    }`}
                  >
                    {member.employmentType === 'full-time' ? 'Full-time' : 'Part-time'}
                  </span>
                </td>
                <td className="p-3 text-[var(--secondary)]">
                  {member.minHoursPerWeek}–{member.maxHoursPerWeek}h
                </td>
                <td className="p-3">
                  {member.unavailableDays.length > 0 ? (
                    <span className="text-xs text-[var(--secondary)]">
                      {member.unavailableDays.map((d) => capitalize(d).slice(0, 3)).join(', ')}
                    </span>
                  ) : (
                    <span className="text-xs text-[var(--success)]">All days</span>
                  )}
                </td>
                <td className="p-3">
                  <div className="flex flex-col gap-0.5 text-xs text-[var(--secondary)]">
                    {member.neverOpeningShift && <span>No opening</span>}
                    {member.neverClosingShift && <span>No closing</span>}
                    {!member.neverOpeningShift && !member.neverClosingShift && (
                      <span className="text-[var(--muted)]">None</span>
                    )}
                  </div>
                </td>
                <td className="p-3 text-right">
                  <button
                    onClick={() => onEdit(member)}
                    className="px-2 py-1 text-xs text-[var(--primary)] hover:bg-[var(--primary-light)] rounded transition-colors mr-1"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(member)}
                    className="px-2 py-1 text-xs text-[var(--danger)] hover:bg-[var(--danger-light)] rounded transition-colors"
                  >
                    Remove
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
