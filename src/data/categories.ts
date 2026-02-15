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

export interface CategoryConfig {
  id: TaskCategory;
  label: string;
  color: string;
  glowColor: string;
  borderColor: string;
  icon?: string;
}

export const categoryConfig: Record<TaskCategory, CategoryConfig> = {
  lincoln_demands: {
    id: 'lincoln_demands',
    label: "Lincoln's Demands",
    color: '#ffd700',
    glowColor: 'rgba(255, 215, 0, 0.5)',
    borderColor: 'rgba(255, 215, 0, 0.6)',
    icon: '✨',
  },
  daily_rituals: {
    id: 'daily_rituals',
    label: 'Daily Rituals',
    color: '#b794f6',
    glowColor: 'rgba(183, 148, 246, 0.4)',
    borderColor: 'rgba(183, 148, 246, 0.4)',
    icon: '🌙',
  },
  rotation: {
    id: 'rotation',
    label: 'Rotations',
    color: '#00fff7',
    glowColor: 'rgba(0, 255, 247, 0.4)',
    borderColor: 'rgba(0, 255, 247, 0.3)',
    icon: '🔄',
  },
  weekly: {
    id: 'weekly',
    label: 'Weekly',
    color: '#ff6b9d',
    glowColor: 'rgba(255, 107, 157, 0.4)',
    borderColor: 'rgba(255, 107, 157, 0.3)',
    icon: '📅',
  },
  monthly: {
    id: 'monthly',
    label: 'Monthly',
    color: '#9f7aea',
    glowColor: 'rgba(159, 122, 234, 0.4)',
    borderColor: 'rgba(159, 122, 234, 0.3)',
    icon: '🗓️',
  },
  life_admin: {
    id: 'life_admin',
    label: 'Life Admin',
    color: '#68d391',
    glowColor: 'rgba(104, 211, 145, 0.4)',
    borderColor: 'rgba(104, 211, 145, 0.3)',
    icon: '📋',
  },
  skincare: {
    id: 'skincare',
    label: 'Skincare',
    color: '#f687b3',
    glowColor: 'rgba(246, 135, 179, 0.4)',
    borderColor: 'rgba(246, 135, 179, 0.3)',
    icon: '🧴',
  },
  one_off: {
    id: 'one_off',
    label: 'One-Off',
    color: '#a0aec0',
    glowColor: 'rgba(160, 174, 192, 0.4)',
    borderColor: 'rgba(160, 174, 192, 0.3)',
    icon: '📝',
  },
};
