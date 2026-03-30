'use client';

import { useStore } from '@/lib/store';
import { ShiftDefinition } from '@/lib/types';

interface ShiftTableProps {
  onEdit: (shift: ShiftDefinition) => void;
}

export default function ShiftTable({ onEdit }: ShiftTableProps) {
  const shifts = useStore((s) => s.shifts);
  const removeShift = useStore((s) => s.removeShift);

  const handleDelete = (shift: ShiftDefinition) => {
    if (confirm(`Remove the "${shift.name}" shift type?`)) {
      removeShift(shift.id);
    }
  };

  if (shifts.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-xl border border-[var(--border)]">
        <p className="text-[var(--muted)]">No shift types defined. Add one to get started.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {shifts.map((shift) => (
        <div
          key={shift.id}
          className="bg-white rounded-xl border border-[var(--border)] p-4"
        >
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-lg">{shift.name}</h3>
              <p className="text-sm text-[var(--muted)]">
                {shift.startTime} – {shift.endTime} ({shift.durationHours}h)
              </p>
            </div>
            <div className="flex gap-1">
              <button
                onClick={() => onEdit(shift)}
                className="px-3 py-1.5 text-xs text-[var(--primary)] hover:bg-[var(--primary-light)] rounded-lg transition-colors"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(shift)}
                className="px-3 py-1.5 text-xs text-[var(--danger)] hover:bg-[var(--danger-light)] rounded-lg transition-colors"
              >
                Remove
              </button>
            </div>
          </div>

          {Object.keys(shift.requiredStaff).length > 0 && (
            <div className="mt-3 pt-3 border-t border-[var(--border)]">
              <p className="text-xs font-medium text-[var(--muted)] mb-2">
                Required Staff per Shift
              </p>
              <div className="flex flex-wrap gap-2">
                {Object.entries(shift.requiredStaff).map(([role, count]) => (
                  <span
                    key={role}
                    className="px-2.5 py-1 bg-[var(--primary-light)] text-[var(--primary)] rounded-lg text-xs"
                  >
                    {count}× {role}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
