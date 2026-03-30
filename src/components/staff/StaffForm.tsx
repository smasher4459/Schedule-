'use client';

import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useStore } from '@/lib/store';
import { StaffMember, DayOfWeek, DAYS_OF_WEEK } from '@/lib/types';
import { capitalize } from '@/lib/utils';

interface StaffFormProps {
  staff: StaffMember | null;
  onClose: () => void;
}

export default function StaffForm({ staff, onClose }: StaffFormProps) {
  const roles = useStore((s) => s.roles);
  const addStaff = useStore((s) => s.addStaff);
  const updateStaff = useStore((s) => s.updateStaff);

  const [name, setName] = useState(staff?.name ?? '');
  const [selectedRoles, setSelectedRoles] = useState<string[]>(staff?.roles ?? []);
  const [employmentType, setEmploymentType] = useState<'full-time' | 'part-time'>(
    staff?.employmentType ?? 'full-time'
  );
  const [minHours, setMinHours] = useState(staff?.minHoursPerWeek ?? 20);
  const [maxHours, setMaxHours] = useState(staff?.maxHoursPerWeek ?? 40);
  const [unavailableDays, setUnavailableDays] = useState<DayOfWeek[]>(
    staff?.unavailableDays ?? []
  );
  const [neverOpening, setNeverOpening] = useState(staff?.neverOpeningShift ?? false);
  const [neverClosing, setNeverClosing] = useState(staff?.neverClosingShift ?? false);

  const toggleRole = (role: string) => {
    setSelectedRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    );
  };

  const toggleDay = (day: DayOfWeek) => {
    setUnavailableDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const member: StaffMember = {
      id: staff?.id ?? uuidv4(),
      name: name.trim(),
      roles: selectedRoles,
      employmentType,
      minHoursPerWeek: minHours,
      maxHoursPerWeek: maxHours,
      unavailableDays,
      neverOpeningShift: neverOpening,
      neverClosingShift: neverClosing,
    };

    if (staff) {
      updateStaff(staff.id, member);
    } else {
      addStaff(member);
    }
    onClose();
  };

  return (
    <div className="bg-white rounded-xl border border-[var(--border)] p-5 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">
          {staff ? 'Edit Staff Member' : 'Add Staff Member'}
        </h2>
        <button
          onClick={onClose}
          className="text-[var(--muted)] hover:text-[var(--foreground)] text-xl"
        >
          ×
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium mb-1">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border border-[var(--border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
            placeholder="Enter staff name"
            required
          />
        </div>

        {/* Roles */}
        <div>
          <label className="block text-sm font-medium mb-1">Roles</label>
          <div className="flex flex-wrap gap-2">
            {roles.map((role) => (
              <button
                key={role}
                type="button"
                onClick={() => toggleRole(role)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  selectedRoles.includes(role)
                    ? 'bg-[var(--primary)] text-white'
                    : 'bg-[var(--secondary-light)] text-[var(--secondary)] hover:bg-[var(--border)]'
                }`}
              >
                {role}
              </button>
            ))}
          </div>
        </div>

        {/* Employment Type */}
        <div>
          <label className="block text-sm font-medium mb-1">Employment Type</label>
          <div className="flex gap-2">
            {(['full-time', 'part-time'] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setEmploymentType(type)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  employmentType === type
                    ? 'bg-[var(--primary)] text-white'
                    : 'bg-[var(--secondary-light)] text-[var(--secondary)] hover:bg-[var(--border)]'
                }`}
              >
                {type === 'full-time' ? 'Full-time' : 'Part-time'}
              </button>
            ))}
          </div>
        </div>

        {/* Hours */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Min Hours/Week</label>
            <input
              type="number"
              value={minHours}
              onChange={(e) => setMinHours(Number(e.target.value))}
              className="w-full px-3 py-2 border border-[var(--border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              min={0}
              max={168}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Max Hours/Week</label>
            <input
              type="number"
              value={maxHours}
              onChange={(e) => setMaxHours(Number(e.target.value))}
              className="w-full px-3 py-2 border border-[var(--border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              min={0}
              max={168}
            />
          </div>
        </div>

        {/* Unavailable Days */}
        <div>
          <label className="block text-sm font-medium mb-1">Days Unavailable</label>
          <div className="flex flex-wrap gap-2">
            {DAYS_OF_WEEK.map((day) => (
              <button
                key={day}
                type="button"
                onClick={() => toggleDay(day)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  unavailableDays.includes(day)
                    ? 'bg-[var(--danger)] text-white'
                    : 'bg-[var(--secondary-light)] text-[var(--secondary)] hover:bg-[var(--border)]'
                }`}
              >
                {capitalize(day)}
              </button>
            ))}
          </div>
        </div>

        {/* Shift Restrictions */}
        <div>
          <label className="block text-sm font-medium mb-1">Shift Restrictions</label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={neverOpening}
                onChange={(e) => setNeverOpening(e.target.checked)}
                className="rounded"
              />
              Never opening shift
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={neverClosing}
                onChange={(e) => setNeverClosing(e.target.checked)}
                className="rounded"
              />
              Never closing shift
            </label>
          </div>
        </div>

        {/* Actions */}
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
            {staff ? 'Save Changes' : 'Add Staff Member'}
          </button>
        </div>
      </form>
    </div>
  );
}
