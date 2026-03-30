'use client';

import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useStore } from '@/lib/store';
import { ShiftDefinition } from '@/lib/types';
import { calculateDuration } from '@/lib/utils';

interface ShiftFormProps {
  shift: ShiftDefinition | null;
  onClose: () => void;
}

export default function ShiftForm({ shift, onClose }: ShiftFormProps) {
  const roles = useStore((s) => s.roles);
  const addShift = useStore((s) => s.addShift);
  const updateShift = useStore((s) => s.updateShift);

  const [name, setName] = useState(shift?.name ?? '');
  const [startTime, setStartTime] = useState(shift?.startTime ?? '07:00');
  const [endTime, setEndTime] = useState(shift?.endTime ?? '13:00');
  const [requiredStaff, setRequiredStaff] = useState<Record<string, number>>(
    shift?.requiredStaff ?? {}
  );

  const updateRequiredCount = (role: string, count: number) => {
    setRequiredStaff((prev) => {
      const next = { ...prev };
      if (count <= 0) {
        delete next[role];
      } else {
        next[role] = count;
      }
      return next;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const duration = calculateDuration(startTime, endTime);
    if (duration <= 0) {
      alert('End time must be after start time.');
      return;
    }

    const shiftDef: ShiftDefinition = {
      id: shift?.id ?? uuidv4(),
      name: name.trim(),
      startTime,
      endTime,
      durationHours: duration,
      requiredStaff,
    };

    if (shift) {
      updateShift(shift.id, shiftDef);
    } else {
      addShift(shiftDef);
    }
    onClose();
  };

  return (
    <div className="bg-white rounded-xl border border-[var(--border)] p-5 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">
          {shift ? 'Edit Shift Type' : 'Add Shift Type'}
        </h2>
        <button
          onClick={onClose}
          className="text-[var(--muted)] hover:text-[var(--foreground)] text-xl"
        >
          ×
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Shift Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border border-[var(--border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            placeholder="e.g. Morning, Evening"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Start Time</label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full px-3 py-2 border border-[var(--border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">End Time</label>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full px-3 py-2 border border-[var(--border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            />
          </div>
        </div>

        {startTime && endTime && calculateDuration(startTime, endTime) > 0 && (
          <p className="text-xs text-[var(--muted)]">
            Duration: {calculateDuration(startTime, endTime)} hours
          </p>
        )}

        <div>
          <label className="block text-sm font-medium mb-2">
            Required Staff per Shift (per role)
          </label>
          <div className="space-y-2">
            {roles.map((role) => (
              <div key={role} className="flex items-center gap-3">
                <span className="text-sm w-40">{role}</span>
                <input
                  type="number"
                  value={requiredStaff[role] ?? 0}
                  onChange={(e) =>
                    updateRequiredCount(role, parseInt(e.target.value) || 0)
                  }
                  className="w-20 px-2 py-1.5 border border-[var(--border)] rounded-lg text-sm text-center focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                  min={0}
                  max={20}
                />
                <span className="text-xs text-[var(--muted)]">staff needed</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm border border-[var(--border)] rounded-lg hover:bg-[var(--secondary-light)] transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm bg-[var(--primary)] text-white rounded-lg hover:bg-[var(--primary-hover)] transition-colors"
          >
            {shift ? 'Save Changes' : 'Add Shift Type'}
          </button>
        </div>
      </form>
    </div>
  );
}
