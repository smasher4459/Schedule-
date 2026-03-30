'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import ShiftTable from '@/components/shifts/ShiftTable';
import ShiftForm from '@/components/shifts/ShiftForm';
import { ShiftDefinition } from '@/lib/types';

export default function ShiftsPage() {
  const [showForm, setShowForm] = useState(false);
  const [editingShift, setEditingShift] = useState<ShiftDefinition | null>(null);
  const shifts = useStore((s) => s.shifts);

  const handleEdit = (shift: ShiftDefinition) => {
    setEditingShift(shift);
    setShowForm(true);
  };

  const handleClose = () => {
    setShowForm(false);
    setEditingShift(null);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Shift Configuration</h1>
          <p className="text-sm text-[var(--muted)]">
            {shifts.length} shift type{shifts.length !== 1 ? 's' : ''} defined
          </p>
        </div>
        <button
          onClick={() => { setEditingShift(null); setShowForm(true); }}
          className="px-4 py-2 text-sm bg-[var(--primary)] text-white rounded-lg hover:bg-[var(--primary-hover)] transition-colors"
        >
          + Add Shift Type
        </button>
      </div>

      {showForm && (
        <ShiftForm shift={editingShift} onClose={handleClose} />
      )}

      <ShiftTable onEdit={handleEdit} />
    </div>
  );
}
