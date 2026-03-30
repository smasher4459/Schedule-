'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';

interface RoleManagerProps {
  onClose: () => void;
}

export default function RoleManager({ onClose }: RoleManagerProps) {
  const roles = useStore((s) => s.roles);
  const addRole = useStore((s) => s.addRole);
  const updateRole = useStore((s) => s.updateRole);
  const removeRole = useStore((s) => s.removeRole);
  const [newRole, setNewRole] = useState('');
  const [editingRole, setEditingRole] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const handleAdd = () => {
    const trimmed = newRole.trim();
    if (trimmed && !roles.includes(trimmed)) {
      addRole(trimmed);
      setNewRole('');
    }
  };

  const handleStartEdit = (role: string) => {
    setEditingRole(role);
    setEditValue(role);
  };

  const handleSaveEdit = () => {
    const trimmed = editValue.trim();
    if (editingRole && trimmed && trimmed !== editingRole) {
      updateRole(editingRole, trimmed);
    }
    setEditingRole(null);
    setEditValue('');
  };

  const handleDelete = (role: string) => {
    if (confirm(`Remove the "${role}" role? This will also remove it from all staff members and shift requirements.`)) {
      removeRole(role);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-[var(--border)] p-5 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Manage Roles</h2>
        <button
          onClick={onClose}
          className="text-[var(--muted)] hover:text-[var(--foreground)] text-xl"
        >
          ×
        </button>
      </div>

      <div className="space-y-2 mb-4">
        {roles.map((role) => (
          <div
            key={role}
            className="flex items-center gap-2 p-2 rounded-lg bg-[var(--secondary-light)]"
          >
            {editingRole === role ? (
              <>
                <input
                  type="text"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit()}
                  className="flex-1 px-2 py-1 border border-[var(--border)] rounded text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                  autoFocus
                />
                <button
                  onClick={handleSaveEdit}
                  className="px-2 py-1 text-xs text-[var(--success)] hover:bg-[var(--success-light)] rounded"
                >
                  Save
                </button>
                <button
                  onClick={() => setEditingRole(null)}
                  className="px-2 py-1 text-xs text-[var(--muted)] hover:bg-white rounded"
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                <span className="flex-1 text-sm">{role}</span>
                <button
                  onClick={() => handleStartEdit(role)}
                  className="px-2 py-1 text-xs text-[var(--primary)] hover:bg-[var(--primary-light)] rounded"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(role)}
                  className="px-2 py-1 text-xs text-[var(--danger)] hover:bg-[var(--danger-light)] rounded"
                >
                  Remove
                </button>
              </>
            )}
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={newRole}
          onChange={(e) => setNewRole(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          className="flex-1 px-3 py-2 border border-[var(--border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
          placeholder="New role name"
        />
        <button
          onClick={handleAdd}
          className="px-4 py-2 text-sm bg-[var(--primary)] text-white rounded-lg hover:bg-[var(--primary-hover)] transition-colors"
        >
          Add Role
        </button>
      </div>
    </div>
  );
}
