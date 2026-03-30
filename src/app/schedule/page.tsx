'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import { generateSchedule } from '@/lib/scheduler';
import ScheduleGrid from '@/components/schedule/ScheduleGrid';
import WarningsPanel from '@/components/schedule/WarningsPanel';

export default function SchedulePage() {
  const staff = useStore((s) => s.staff);
  const shifts = useStore((s) => s.shifts);
  const currentSchedule = useStore((s) => s.currentSchedule);
  const setSchedule = useStore((s) => s.setSchedule);
  const clearSchedule = useStore((s) => s.clearSchedule);
  const [showWarnings, setShowWarnings] = useState(false);

  const handleGenerate = () => {
    if (currentSchedule) {
      if (!confirm('This will overwrite the current schedule. Continue?')) return;
    }

    if (staff.length === 0) {
      alert('Add at least one staff member before generating a schedule.');
      return;
    }

    if (shifts.length === 0) {
      alert('Define at least one shift type before generating a schedule.');
      return;
    }

    // Use next Monday as the week start
    const today = new Date();
    const dayOfWeek = today.getDay();
    const daysUntilMonday = dayOfWeek === 0 ? 1 : (8 - dayOfWeek) % 7 || 7;
    const nextMonday = new Date(today);
    nextMonday.setDate(today.getDate() + daysUntilMonday);
    const weekStart = nextMonday.toISOString().split('T')[0];

    const schedule = generateSchedule(staff, shifts, weekStart);
    setSchedule(schedule);
    setShowWarnings(schedule.warnings.length > 0);
  };

  const unfilledCount = currentSchedule?.assignments.filter(a => !a.staffId).length ?? 0;
  const warningCount = currentSchedule?.warnings.length ?? 0;

  return (
    <div className="max-w-full mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-bold">Weekly Schedule</h1>
          {currentSchedule && (
            <p className="text-sm text-[var(--muted)]">
              Week of {new Date(currentSchedule.weekStartDate).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
              {' · '}
              Generated {new Date(currentSchedule.generatedAt).toLocaleTimeString()}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {warningCount > 0 && (
            <button
              onClick={() => setShowWarnings(!showWarnings)}
              className={`px-3 py-2 text-sm rounded-lg transition-colors flex items-center gap-1 ${
                unfilledCount > 0
                  ? 'bg-[var(--danger-light)] text-[var(--danger)]'
                  : 'bg-[var(--warning-light)] text-[var(--warning)]'
              }`}
            >
              {unfilledCount > 0 ? `${unfilledCount} unfilled` : `${warningCount} warnings`}
            </button>
          )}
          {currentSchedule && (
            <button
              onClick={() => { if (confirm('Clear the current schedule?')) clearSchedule(); }}
              className="px-4 py-2 text-sm border border-[var(--border)] rounded-lg hover:bg-[var(--secondary-light)] transition-colors"
            >
              Clear
            </button>
          )}
          <button
            onClick={handleGenerate}
            className="px-4 py-2 text-sm bg-[var(--primary)] text-white rounded-lg hover:bg-[var(--primary-hover)] transition-colors"
          >
            {currentSchedule ? 'Regenerate' : 'Generate Schedule'}
          </button>
        </div>
      </div>

      {showWarnings && currentSchedule && (
        <WarningsPanel
          warnings={currentSchedule.warnings}
          onClose={() => setShowWarnings(false)}
        />
      )}

      {currentSchedule ? (
        <ScheduleGrid />
      ) : (
        <div className="text-center py-20 bg-white rounded-xl border border-[var(--border)]">
          <div className="text-4xl mb-4">📅</div>
          <h2 className="text-lg font-semibold mb-2">No Schedule Generated</h2>
          <p className="text-sm text-[var(--muted)] mb-4">
            Click &ldquo;Generate Schedule&rdquo; to automatically create a weekly schedule
            <br />
            based on your staff data and shift configuration.
          </p>
          <p className="text-xs text-[var(--muted)]">
            {staff.length} staff · {shifts.length} shift types configured
          </p>
        </div>
      )}
    </div>
  );
}
