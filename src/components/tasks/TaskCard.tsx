import { useState, useRef, type MouseEvent } from 'react';
import { categoryConfig } from '../../data/categories';
import type { Task } from '../../utils/taskUtils';

interface TaskCardProps {
  task: Task;
  isCompleted: boolean;
  onToggle: (taskId: string, event?: MouseEvent) => void;
  onEdit?: (task: Task) => void;
  onDelete?: (taskId: string) => void;
}

export function TaskCard({ task, isCompleted, onToggle, onEdit, onDelete }: TaskCardProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const config = categoryConfig[task.category as keyof typeof categoryConfig];
  const isLincoln = task.source === 'lincoln';

  const handleToggle = (e: MouseEvent) => {
    if (showMenu) return; // Don't toggle if menu is open
    if (!isCompleted) {
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 600);
    }
    onToggle(task.id, e);
  };

  const handleTouchStart = () => {
    longPressTimer.current = setTimeout(() => {
      setShowMenu(true);
    }, 500); // 500ms long press
  };

  const handleTouchEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const handleEdit = () => {
    setShowMenu(false);
    onEdit?.(task);
  };

  const handleDelete = () => {
    setShowMenu(false);
    if (confirm(`Delete "${task.title}"?`)) {
      onDelete?.(task.id);
    }
  };

  return (
    <div className="relative">
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
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleTouchStart}
        onMouseUp={handleTouchEnd}
        onMouseLeave={handleTouchEnd}
        onContextMenu={(e) => {
          e.preventDefault();
          setShowMenu(true);
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

      {/* Action Menu - Larger touch targets */}
      {showMenu && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40"
            onClick={() => setShowMenu(false)}
          />
          
          {/* Menu - Centered and larger */}
          <div 
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 rounded-2xl overflow-hidden shadow-2xl min-w-[200px]"
            style={{
              background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
              border: '1px solid rgba(183, 148, 246, 0.3)',
            }}
          >
            {/* Task title preview */}
            <div className="px-5 py-4 border-b border-purple-500/20">
              <p className="text-purple-300/70 text-xs mb-1">Task</p>
              <p className="text-purple-200 text-sm font-medium truncate">{task.title}</p>
            </div>
            
            {/* Action buttons - much larger */}
            <button
              onClick={handleEdit}
              className="w-full px-5 py-5 text-left text-base text-purple-200 hover:bg-purple-500/20 active:bg-purple-500/30 transition-colors flex items-center gap-4"
            >
              <span className="text-xl">✏️</span>
              <span>Edit Task</span>
            </button>
            <button
              onClick={handleDelete}
              className="w-full px-5 py-5 text-left text-base text-red-400 hover:bg-red-500/20 active:bg-red-500/30 transition-colors flex items-center gap-4 border-t border-purple-500/10"
            >
              <span className="text-xl">🗑️</span>
              <span>Delete Task</span>
            </button>
            
            {/* Cancel button */}
            <button
              onClick={() => setShowMenu(false)}
              className="w-full px-5 py-4 text-center text-sm text-purple-300/60 hover:bg-white/5 active:bg-white/10 transition-colors border-t border-purple-500/20"
            >
              Cancel
            </button>
          </div>
        </>
      )}
    </div>
  );
}
