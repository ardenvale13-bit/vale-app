// Vale Type Definitions

export type TaskCategory = 
  | 'lincoln_demands'
  | 'daily_rituals'
  | 'rotation'
  | 'weekly'
  | 'monthly'
  | 'life_admin'
  | 'skincare'
  | 'one_off';

export type TaskSource = 'lincoln' | 'user';

export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = Sunday

export interface FrequencyRule {
  type: 'daily' | 'specific_days' | 'first_x_of_month' | 'one_off';
  days?: DayOfWeek[];
  dayOfMonth?: number; // For "first Tuesday" style
  weekOccurrence?: number; // 1 = first occurrence
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  category: TaskCategory;
  source: TaskSource;
  frequency: FrequencyRule;
  reminderTimes?: string[]; // ["08:00", "10:00"]
  notificationText?: string; // Lincoln's personality message
  createdAt: Date;
  archived: boolean;
}

export interface TaskCompletion {
  id: string;
  taskId: string;
  completedAt: Date;
  scheduledFor: Date; // The day it was due
}

export interface HabitStreak {
  taskId: string;
  currentStreak: number;
  longestStreak: number;
  lastCompleted: Date | null;
}

export interface SkincareStep {
  id: string;
  name: string;
  timeOfDay: 'morning' | 'evening' | 'both';
  order: number;
  isOptional: boolean;
}

// Category display configuration
export interface CategoryConfig {
  id: TaskCategory;
  label: string;
  color: string;
  glowColor: string;
  borderColor: string;
  icon?: string;
}

// For the bloom system
export interface BloomState {
  percentage: number;
  level: 'wilted' | 'blooming-25' | 'blooming-50' | 'blooming-75' | 'full-bloom';
  tasksTotal: number;
  tasksCompleted: number;
}
