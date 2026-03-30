'use client';

import { ScheduleWarning } from '@/lib/types';
import { capitalize } from '@/lib/utils';

interface WarningsPanelProps {
  warnings: ScheduleWarning[];
  onClose: () => void;
}

export default function WarningsPanel({ warnings, onClose }: WarningsPanelProps) {
  const grouped = {
    unfilled: warnings.filter((w) => w.type === 'unfilled'),
    belowMin: warnings.filter((w) => w.type === 'below-min-hours'),
    noAvail: warnings.filter((w) => w.type === 'no-available-days'),
    override: warnings.filter((w) => w.type === 'constraint-override'),
  };

  return (
    <div className="bg-white rounded-xl border border-[var(--border)] p-4 mb-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold">
          Schedule Warnings ({warnings.length})
        </h3>
        <button
          onClick={onClose}
          className="text-[var(--muted)] hover:text-[var(--foreground)] text-xl"
        >
          ×
        </button>
      </div>

      <div className="space-y-3 text-sm max-h-60 overflow-y-auto">
        {grouped.unfilled.length > 0 && (
          <div>
            <p className="font-medium text-[var(--danger)] mb-1">
              Unfilled Shifts ({grouped.unfilled.length})
            </p>
            {grouped.unfilled.map((w, i) => (
              <p key={i} className="text-[var(--secondary)] ml-3">
                • {w.message}
              </p>
            ))}
          </div>
        )}

        {grouped.belowMin.length > 0 && (
          <div>
            <p className="font-medium text-[var(--warning)] mb-1">
              Below Minimum Hours ({grouped.belowMin.length})
            </p>
            {grouped.belowMin.map((w, i) => (
              <p key={i} className="text-[var(--secondary)] ml-3">
                • {w.message}
              </p>
            ))}
          </div>
        )}

        {grouped.noAvail.length > 0 && (
          <div>
            <p className="font-medium text-[var(--muted)] mb-1">
              Excluded Staff ({grouped.noAvail.length})
            </p>
            {grouped.noAvail.map((w, i) => (
              <p key={i} className="text-[var(--secondary)] ml-3">
                • {w.message}
              </p>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
