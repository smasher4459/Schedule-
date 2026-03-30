'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import StaffTable from '@/components/staff/StaffTable';
import StaffForm from '@/components/staff/StaffForm';
import RoleManager from '@/components/staff/RoleManager';
import { StaffMember } from '@/lib/types';

export default function StaffPage() {
  const [showForm, setShowForm] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  const [showRoles, setShowRoles] = useState(false);
  const staff = useStore((s) => s.staff);

  const handleEdit = (member: StaffMember) => {
    setEditingStaff(member);
    setShowForm(true);
  };

  const handleClose = () => {
    setShowForm(false);
    setEditingStaff(null);
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Staff Management</h1>
          <p className="text-sm text-[var(--muted)]">
            {staff.length} staff member{staff.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowRoles(!showRoles)}
            className="px-4 py-2 text-sm border border-[var(--border)] rounded-lg hover:bg-[var(--secondary-light)] transition-colors"
          >
            Manage Roles
          </button>
          <button
            onClick={() => { setEditingStaff(null); setShowForm(true); }}
            className="px-4 py-2 text-sm bg-[var(--primary)] text-white rounded-lg hover:bg-[var(--primary-hover)] transition-colors"
          >
            + Add Staff
          </button>
        </div>
      </div>

      {showRoles && <RoleManager onClose={() => setShowRoles(false)} />}

      {showForm && (
        <StaffForm
          staff={editingStaff}
          onClose={handleClose}
        />
      )}

      <StaffTable onEdit={handleEdit} />
    </div>
  );
}
