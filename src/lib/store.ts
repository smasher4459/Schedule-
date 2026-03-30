'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { StaffMember, ShiftDefinition, WeeklySchedule } from './types';
import { DEFAULT_ROLES, DEFAULT_SHIFTS, SAMPLE_STAFF } from '@/data/defaults';

interface AppState {
  // Data
  staff: StaffMember[];
  shifts: ShiftDefinition[];
  roles: string[];
  currentSchedule: WeeklySchedule | null;

  // Staff actions
  addStaff: (member: StaffMember) => void;
  updateStaff: (id: string, updates: Partial<StaffMember>) => void;
  removeStaff: (id: string) => void;

  // Shift actions
  addShift: (shift: ShiftDefinition) => void;
  updateShift: (id: string, updates: Partial<ShiftDefinition>) => void;
  removeShift: (id: string) => void;

  // Role actions
  addRole: (role: string) => void;
  updateRole: (oldName: string, newName: string) => void;
  removeRole: (role: string) => void;

  // Schedule actions
  setSchedule: (schedule: WeeklySchedule) => void;
  updateAssignment: (assignmentId: string, staffId: string | null, isManualOverride?: boolean, warning?: string) => void;
  clearSchedule: () => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      staff: SAMPLE_STAFF,
      shifts: DEFAULT_SHIFTS,
      roles: DEFAULT_ROLES,
      currentSchedule: null,

      addStaff: (member) =>
        set((state) => ({ staff: [...state.staff, member] })),

      updateStaff: (id, updates) =>
        set((state) => ({
          staff: state.staff.map((s) => (s.id === id ? { ...s, ...updates } : s)),
        })),

      removeStaff: (id) =>
        set((state) => ({ staff: state.staff.filter((s) => s.id !== id) })),

      addShift: (shift) =>
        set((state) => ({ shifts: [...state.shifts, shift] })),

      updateShift: (id, updates) =>
        set((state) => ({
          shifts: state.shifts.map((s) => (s.id === id ? { ...s, ...updates } : s)),
        })),

      removeShift: (id) =>
        set((state) => ({ shifts: state.shifts.filter((s) => s.id !== id) })),

      addRole: (role) =>
        set((state) => ({
          roles: state.roles.includes(role) ? state.roles : [...state.roles, role],
        })),

      updateRole: (oldName, newName) =>
        set((state) => ({
          roles: state.roles.map((r) => (r === oldName ? newName : r)),
          staff: state.staff.map((s) => ({
            ...s,
            roles: s.roles.map((r) => (r === oldName ? newName : r)),
          })),
          shifts: state.shifts.map((s) => {
            const newRequired = { ...s.requiredStaff };
            if (oldName in newRequired) {
              newRequired[newName] = newRequired[oldName];
              delete newRequired[oldName];
            }
            return { ...s, requiredStaff: newRequired };
          }),
        })),

      removeRole: (role) =>
        set((state) => ({
          roles: state.roles.filter((r) => r !== role),
          staff: state.staff.map((s) => ({
            ...s,
            roles: s.roles.filter((r) => r !== role),
          })),
          shifts: state.shifts.map((s) => {
            const newRequired = { ...s.requiredStaff };
            delete newRequired[role];
            return { ...s, requiredStaff: newRequired };
          }),
        })),

      setSchedule: (schedule) => set({ currentSchedule: schedule }),

      updateAssignment: (assignmentId, staffId, isManualOverride = false, warning) =>
        set((state) => {
          if (!state.currentSchedule) return state;
          return {
            currentSchedule: {
              ...state.currentSchedule,
              assignments: state.currentSchedule.assignments.map((a) =>
                a.id === assignmentId
                  ? { ...a, staffId, isManualOverride, warning }
                  : a
              ),
            },
          };
        }),

      clearSchedule: () => set({ currentSchedule: null }),
    }),
    {
      name: 'staff-scheduler-storage',
    }
  )
);
