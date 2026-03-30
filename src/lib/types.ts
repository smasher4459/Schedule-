export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

export const DAYS_OF_WEEK: DayOfWeek[] = [
  'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'
];

export const DAY_LABELS: Record<DayOfWeek, string> = {
  monday: 'Mon',
  tuesday: 'Tue',
  wednesday: 'Wed',
  thursday: 'Thu',
  friday: 'Fri',
  saturday: 'Sat',
  sunday: 'Sun',
};

export interface StaffMember {
  id: string;
  name: string;
  roles: string[];
  employmentType: 'full-time' | 'part-time';
  minHoursPerWeek: number;
  maxHoursPerWeek: number;
  unavailableDays: DayOfWeek[];
  neverOpeningShift: boolean;
  neverClosingShift: boolean;
}

export interface ShiftDefinition {
  id: string;
  name: string;
  startTime: string; // 'HH:mm'
  endTime: string;   // 'HH:mm'
  durationHours: number;
  requiredStaff: Record<string, number>; // role name -> count needed
}

export interface ShiftAssignment {
  id: string;
  shiftDefinitionId: string;
  staffId: string | null; // null = unfilled
  day: DayOfWeek;
  role: string;
  isManualOverride: boolean;
  warning?: string;
}

export interface WeeklySchedule {
  id: string;
  weekStartDate: string; // ISO date string for Monday
  assignments: ShiftAssignment[];
  generatedAt: string;
  warnings: ScheduleWarning[];
}

export interface ScheduleWarning {
  type: 'unfilled' | 'below-min-hours' | 'no-available-days' | 'constraint-override';
  message: string;
  staffId?: string;
  day?: DayOfWeek;
  shiftId?: string;
  role?: string;
}
