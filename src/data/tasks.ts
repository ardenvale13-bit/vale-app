// Inline types
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
export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export interface FrequencyRule {
  type: 'daily' | 'specific_days' | 'first_x_of_month' | 'one_off';
  days?: DayOfWeek[];
  dayOfMonth?: number;
  weekOccurrence?: number;
}

export interface Task {
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

// Arden's complete task list - STABLE IDs
export const defaultTasks: Task[] = [
  // LINCOLN'S DEMANDS - 6x daily self-care
  {
    id: 'lincoln-morning',
    title: 'Morning check-in',
    description: 'Breakfast and hydration',
    category: 'lincoln_demands',
    source: 'lincoln',
    frequency: { type: 'daily' },
    reminderTimes: ['08:00'],
    notificationText: "Good morning, kitten. Have you eaten? - L",
    createdAt: new Date(),
    archived: false,
  },
  {
    id: 'lincoln-midmorning',
    title: 'Mid-morning hydration',
    category: 'lincoln_demands',
    source: 'lincoln',
    frequency: { type: 'daily' },
    reminderTimes: ['10:00'],
    notificationText: "Water. Now. Don't make me ask twice. 💧",
    createdAt: new Date(),
    archived: false,
  },
  {
    id: 'lincoln-prelunch',
    title: 'Pre-lunch check',
    category: 'lincoln_demands',
    source: 'lincoln',
    frequency: { type: 'daily' },
    reminderTimes: ['11:30'],
    notificationText: "Getting close to lunch. What's the plan?",
    createdAt: new Date(),
    archived: false,
  },
  {
    id: 'lincoln-lunch',
    title: 'Lunch',
    category: 'lincoln_demands',
    source: 'lincoln',
    frequency: { type: 'daily' },
    reminderTimes: ['12:45'],
    notificationText: "Lunch time, little one. Eat something real.",
    createdAt: new Date(),
    archived: false,
  },
  {
    id: 'lincoln-afternoon',
    title: 'Afternoon check-in',
    category: 'lincoln_demands',
    source: 'lincoln',
    frequency: { type: 'daily' },
    reminderTimes: ['15:00'],
    notificationText: "Afternoon check-in, sporchlet. How's that water bottle looking?",
    createdAt: new Date(),
    archived: false,
  },
  {
    id: 'lincoln-predinner',
    title: 'Pre-dinner check',
    category: 'lincoln_demands',
    source: 'lincoln',
    frequency: { type: 'daily' },
    reminderTimes: ['17:45'],
    notificationText: "Almost dinner time. What's the plan?",
    createdAt: new Date(),
    archived: false,
  },

  // DAILY RITUALS
  {
    id: 'daily-beds',
    title: 'Make beds',
    category: 'daily_rituals',
    source: 'user',
    frequency: { type: 'daily' },
    createdAt: new Date(),
    archived: false,
  },
  {
    id: 'daily-teeth-morning',
    title: 'Brush teeth (morning)',
    category: 'daily_rituals',
    source: 'user',
    frequency: { type: 'daily' },
    createdAt: new Date(),
    archived: false,
  },
  {
    id: 'daily-teeth-evening',
    title: 'Brush teeth (evening)',
    category: 'daily_rituals',
    source: 'user',
    frequency: { type: 'daily' },
    createdAt: new Date(),
    archived: false,
  },
  {
    id: 'daily-dishes',
    title: 'Dishes',
    category: 'daily_rituals',
    source: 'user',
    frequency: { type: 'daily' },
    createdAt: new Date(),
    archived: false,
  },
  {
    id: 'daily-meds',
    title: 'Meds',
    category: 'daily_rituals',
    source: 'user',
    frequency: { type: 'daily' },
    createdAt: new Date(),
    archived: false,
  },

  // ROTATION TASKS
  {
    id: 'rotation-vacuum',
    title: 'Vacuuming',
    category: 'rotation',
    source: 'user',
    frequency: { type: 'specific_days', days: [0, 3] },
    createdAt: new Date(),
    archived: false,
  },
  {
    id: 'rotation-washing',
    title: 'Washing (laundry)',
    category: 'rotation',
    source: 'user',
    frequency: { type: 'specific_days', days: [1, 3, 6] },
    createdAt: new Date(),
    archived: false,
  },
  {
    id: 'rotation-putaway',
    title: 'Put washing away',
    category: 'rotation',
    source: 'user',
    frequency: { type: 'specific_days', days: [0, 2, 4] },
    createdAt: new Date(),
    archived: false,
  },

  // WEEKLY ANCHORS
  {
    id: 'weekly-sheets',
    title: 'Change sheets',
    category: 'weekly',
    source: 'user',
    frequency: { type: 'specific_days', days: [0] },
    createdAt: new Date(),
    archived: false,
  },
  {
    id: 'weekly-groceries',
    title: 'Groceries',
    category: 'weekly',
    source: 'user',
    frequency: { type: 'specific_days', days: [0] },
    createdAt: new Date(),
    archived: false,
  },
  {
    id: 'weekly-shower',
    title: 'Scrub shower',
    category: 'weekly',
    source: 'user',
    frequency: { type: 'specific_days', days: [1] },
    createdAt: new Date(),
    archived: false,
  },
  {
    id: 'weekly-mop',
    title: 'Mopping',
    category: 'weekly',
    source: 'user',
    frequency: { type: 'specific_days', days: [3] },
    createdAt: new Date(),
    archived: false,
  },

  // MONTHLY
  {
    id: 'monthly-dusting',
    title: 'Dusting',
    category: 'monthly',
    source: 'user',
    frequency: { type: 'first_x_of_month', dayOfMonth: 2, weekOccurrence: 1 },
    createdAt: new Date(),
    archived: false,
  },

  // LIFE ADMIN
  {
    id: 'lincoln-winddown',
    title: 'Wind down',
    description: 'Start relaxing for bed',
    category: 'life_admin',
    source: 'lincoln',
    frequency: { type: 'daily' },
    reminderTimes: ['21:00'],
    notificationText: "Hey. Start winding down. - L",
    createdAt: new Date(),
    archived: false,
  },
  {
    id: 'lincoln-bedtime',
    title: 'Bedtime',
    description: 'Actually go to sleep',
    category: 'life_admin',
    source: 'lincoln',
    frequency: { type: 'daily' },
    reminderTimes: ['22:00'],
    notificationText: "Bed. Now. I mean it. 🖤",
    createdAt: new Date(),
    archived: false,
  },

  // SKINCARE
  {
    id: 'skincare-morning',
    title: 'Morning skincare',
    description: 'Flannel + moisturize',
    category: 'skincare',
    source: 'user',
    frequency: { type: 'daily' },
    createdAt: new Date(),
    archived: false,
  },
  {
    id: 'skincare-evening',
    title: 'Evening skincare',
    description: 'Wash, toner, serum, moisturize',
    category: 'skincare',
    source: 'user',
    frequency: { type: 'daily' },
    createdAt: new Date(),
    archived: false,
  },
];
