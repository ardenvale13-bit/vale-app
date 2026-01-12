import { useState } from 'react';
import { categoryConfig } from '../../data/categories';

// Inline Task type
interface Task {
  id: string;
  title: string;
  description?: string;
  category: string;
  source: 'lincoln' | 'user';
  frequency: {
    type: string;
    days?: number[];
    dayOfMonth?: number;
    weekOccurrence?: number;
  };
  reminderTimes?: string[];
  notificationText?: string;
  createdAt: Date;
  archived: boolean;
}

interface TaskCardProps {
  task: Task;
  isCompleted: boolean;
  onToggle: (taskId: string) => void;
}

export function TaskCard({ task, isCompleted, onToggle }: TaskCardProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const config = categoryConfig[task.category as keyof typeof categoryConfig];
  const isLincoln = task.source === 'lincoln';

  const handleToggle = () => {
    if (!isCompleted) {
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 600);
    }
    onToggle(task.id);
  };

  return (
    <div
      className={`
        relative rounded-xl p-4 backdrop-blur-sm transition-all duration-300
        ${isLincoln ? 'lincoln-task bg-gray-900/50' : 'bg-gray-900/30'}
        ${isCompleted ? 'opacity-60' : 'opacity-100'}
        ${isAnimating ? 'scale-[1.02]' : 'scale-100'}
      `}
      style={{
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: isLincoln ? config.borderColor : `${config.borderColor}`,
        boxShadow: isLincoln ? `0 0 20px ${config.glowColor}` : 'none',
      }}
    >
      {/* Lincoln's gold pulse overlay */}
      {isLincoln && !isCompleted && (
        <div 
          className="absolute inset-0 rounded-xl pointer-events-none overflow-hidden"
          style={{
            background: `linear-gradient(90deg, transparent 0%, ${config.glowColor} 50%, transparent 100%)`,
            animation: 'gold-pulse 3s ease-in-out infinite',
            opacity: 0.3,
          }}
        />
      )}

      <div className="flex items-center gap-3 relative z-10">
        {/* Checkbox */}
        <button
          onClick={handleToggle}
          className={`
            w-7 h-7 rounded-full border-2 flex items-center justify-center
            transition-all duration-300 flex-shrink-0
            ${isCompleted ? 'bg-opacity-20' : 'bg-transparent'}
            ${isAnimating ? 'animate-pulse' : ''}
          `}
          style={{
            borderColor: config.color,
            backgroundColor: isCompleted ? config.color : 'transparent',
          }}
        >
          {isCompleted && (
            <svg
              className="w-4 h-4 text-gray-900"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={3}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          )}
        </button>

        {/* Task content */}
        <div className="flex-1 min-w-0">
          {/* Category label - ONLY for Lincoln's tasks */}
          {isLincoln && (
            <div
              className="text-xs uppercase tracking-wider mb-1 flex items-center gap-1"
              style={{ color: `${config.color}99` }}
            >
              <span>{config.icon}</span>
              <span>{config.label}</span>
              <span>{config.icon}</span>
            </div>
          )}

          {/* Task title */}
          <div
            className={`font-medium transition-all duration-300 ${
              isCompleted ? 'line-through opacity-70' : ''
            }`}
            style={{ color: isLincoln ? config.color : '#f0f4ff' }}
          >
            {task.title}
          </div>

          {/* Lincoln's notification text */}
          {isLincoln && task.notificationText && !isCompleted && (
            <div className="text-sm mt-1 opacity-70 italic" style={{ color: config.color }}>
              "{task.notificationText}"
            </div>
          )}

          {/* Description if exists (for non-Lincoln tasks) */}
          {!isLincoln && task.description && (
            <div className="text-sm text-purple-300/60 mt-1">
              {task.description}
            </div>
          )}
        </div>

        {/* Time badge if exists */}
        {task.reminderTimes && task.reminderTimes.length > 0 && (
          <div
            className="text-xs px-2 py-1 rounded-full bg-gray-800/50"
            style={{ color: config.color }}
          >
            {task.reminderTimes[0]}
          </div>
        )}
      </div>
    </div>
  );
}
