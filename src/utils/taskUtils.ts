// Inline types
type TaskCategory = 
  | 'lincoln_demands'
  | 'daily_rituals'
  | 'rotation'
  | 'weekly'
  | 'monthly'
  | 'life_admin'
  | 'skincare'
  | 'one_off';

type TaskSource = 'lincoln' | 'user';
type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6;

interface FrequencyRule {
  type: 'daily' | 'specific_days' | 'first_x_of_month' | 'one_off';
  days?: DayOfWeek[];
  dayOfMonth?: number;
  weekOccurrence?: number;
}

interface Task {
  id: string;
  title: string;
  description?: string;
  category: TaskCategory;
  source: TaskSource;
  frequency: FrequencyRule;
  reminderTimes?: string[];
  notificationText?: string;
  createdAt: Date;
  archived: boolean;
}

interface BloomState {
  percentage: number;
  level: 'wilted' | 'blooming-25' | 'blooming-50' | 'blooming-75' | 'full-bloom';
  tasksTotal: number;
  tasksCompleted: number;
}

/**
 * Check if a task is due on a given date
 */
export function isTaskDueOn(task: Task, date: Date): boolean {
  if (task.archived) return false;

  const dayOfWeek = date.getDay() as DayOfWeek;
  const { frequency } = task;

  switch (frequency.type) {
    case 'daily':
      return true;

    case 'specific_days':
      return frequency.days?.includes(dayOfWeek) ?? false;

    case 'first_x_of_month':
      if (!frequency.dayOfMonth || !frequency.weekOccurrence) return false;
      if (dayOfWeek !== frequency.dayOfMonth) return false;
      const dayOfMonth = date.getDate();
      const weekNumber = Math.ceil(dayOfMonth / 7);
      return weekNumber === frequency.weekOccurrence;

    case 'one_off':
      return false;

    default:
      return false;
  }
}

/**
 * Get all tasks due on a given date
 */
export function getTasksDueOn(tasks: Task[], date: Date): Task[] {
  return tasks.filter(task => isTaskDueOn(task, date));
}

/**
 * Get tasks due today
 */
export function getTodaysTasks(tasks: Task[]): Task[] {
  return getTasksDueOn(tasks, new Date());
}

/**
 * Group tasks by category
 */
export function groupTasksByCategory(tasks: Task[]): Record<string, Task[]> {
  return tasks.reduce((acc, task) => {
    if (!acc[task.category]) {
      acc[task.category] = [];
    }
    acc[task.category].push(task);
    return acc;
  }, {} as Record<string, Task[]>);
}

/**
 * Calculate bloom state based on completions
 */
export function calculateBloom(
  totalTasks: number,
  completedTasks: number
): BloomState {
  if (totalTasks === 0) {
    return {
      percentage: 100,
      level: 'full-bloom',
      tasksTotal: 0,
      tasksCompleted: 0,
    };
  }

  const percentage = Math.round((completedTasks / totalTasks) * 100);
  
  let level: BloomState['level'];
  if (percentage <= 25) {
    level = 'wilted';
  } else if (percentage <= 50) {
    level = 'blooming-25';
  } else if (percentage <= 75) {
    level = 'blooming-50';
  } else if (percentage < 100) {
    level = 'blooming-75';
  } else {
    level = 'full-bloom';
  }

  return {
    percentage,
    level,
    tasksTotal: totalTasks,
    tasksCompleted: completedTasks,
  };
}

/**
 * Format date for display
 */
export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-NZ', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}

/**
 * Order categories for display (Lincoln's Demands always first)
 */
export const categoryOrder = [
  'lincoln_demands',
  'daily_rituals',
  'rotation',
  'weekly',
  'monthly',
  'life_admin',
  'skincare',
  'one_off',
];
