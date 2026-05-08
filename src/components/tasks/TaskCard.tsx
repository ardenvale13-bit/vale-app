import { useState, useRef, type MouseEvent } from 'react';
import { categoryConfig } from '../../data/categories';
import { useTheme } from '../../theme/ThemeContext';
import type { Task } from '../../utils/taskUtils';

interface TaskCardProps {
  task: Task;
  isCompleted: boolean;
  onToggle: (taskId: string, event?: MouseEvent) => void;
  onEdit?: (task: Task) => void;
  onDelete?: (taskId: string) => void;
}

export function TaskCard({ task, isCompleted, onToggle, onEdit, onDelete }: TaskCardProps) {
  const { theme } = useTheme();
  const [isAnimating, setIsAnimating] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const config = categoryConfig[task.category as keyof typeof categoryConfig];
  const isLincoln = task.source === 'lincoln';

  const handleToggle = (e: MouseEvent) => {
    if (showMenu) return;
    if (!isCompleted) {
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 600);
    }
    onToggle(task.id, e);
  };

  const handleTouchStart = () => {
    longPressTimer.current = setTimeout(() => setShowMenu(true), 500);
  };

  const handleTouchEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const handleEdit = () => { setShowMenu(false); onEdit?.(task); };
  const handleDelete = () => {
    setShowMenu(false);
    if (confirm(`Delete "${task.title}"?`)) onDelete?.(task.id);
  };

  return (
    <div className="relative">
      <div
        className={`relative rounded-xl p-4 backdrop-blur-sm transition-all duration-300
          ${isCompleted ? 'opacity-60' : 'opacity-100'}
          ${isAnimating ? 'scale-[1.02]' : 'scale-100'}
        `}
        style={{
          background: isLincoln ? `${theme.bg}cc` : `${theme.bg}66`,
          borderWidth: 1, borderStyle: 'solid',
          borderColor: isLincoln ? config.borderColor : theme.rule,
          boxShadow: isLincoln ? `0 0 20px ${config.glowColor}` : 'none',
        }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleTouchStart}
        onMouseUp={handleTouchEnd}
        onMouseLeave={handleTouchEnd}
        onContextMenu={(e) => { e.preventDefault(); setShowMenu(true); }}
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
            className={`w-7 h-7 rounded-full border-2 flex items-center justify-center
              transition-all duration-300 flex-shrink-0
              ${isAnimating ? 'animate-pulse' : ''}
            `}
            style={{
              borderColor: config.color,
              backgroundColor: isCompleted ? config.color : 'transparent',
            }}
          >
            {isCompleted && (
              <svg className="w-4 h-4" style={{ color: theme.bgDeep }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            )}
          </button>

          {/* Task content */}
          <div className="flex-1 min-w-0">
            <div
              className={`font-medium transition-all duration-300 ${isCompleted ? 'line-through' : ''}`}
              style={{
                color: isLincoln ? config.color : theme.ink,
                opacity: isCompleted ? 0.7 : 1,
                fontFamily: theme.serifB, fontSize: 18,
                textDecorationColor: theme.inkGhost,
              }}
            >
              {task.title}
            </div>

            {isLincoln && task.notificationText && !isCompleted && (
              <div className="text-sm mt-1 italic" style={{ color: config.color, opacity: 0.7 }}>
                "{task.notificationText}"
              </div>
            )}

            {!isLincoln && task.description && (
              <div className="text-sm mt-1" style={{ color: theme.inkFaint }}>
                {task.description}
              </div>
            )}
          </div>

          {/* Time badge */}
          {task.reminderTimes && task.reminderTimes.length > 0 && (
            <div
              style={{
                fontFamily: theme.mono, fontSize: 10, letterSpacing: '0.04em',
                padding: '4px 8px', borderRadius: 999,
                background: `${config.color}15`, color: config.color,
              }}
            >
              {task.reminderTimes[0]}
            </div>
          )}
        </div>
      </div>

      {/* Action Menu */}
      {showMenu && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
          <div
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 rounded-2xl overflow-hidden shadow-2xl min-w-[200px]"
            style={{
              background: `linear-gradient(135deg, ${theme.bg} 0%, ${theme.bgDeep} 100%)`,
              border: `1px solid ${theme.accent}50`,
            }}
          >
            <div style={{ padding: '16px 20px', borderBottom: `1px solid ${theme.rule}` }}>
              <p style={{ fontFamily: theme.sans, fontSize: 11, color: theme.inkFaint }}>Task</p>
              <p style={{ fontFamily: theme.serifB, fontSize: 16, color: theme.ink, marginTop: 4 }}>{task.title}</p>
            </div>
            <button
              onClick={handleEdit}
              className="w-full px-5 py-5 text-left transition-colors flex items-center gap-4"
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: theme.ink, fontFamily: theme.sans, fontSize: 16 }}
            >
              <span>✏️</span><span>Edit Task</span>
            </button>
            <button
              onClick={handleDelete}
              className="w-full px-5 py-5 text-left transition-colors flex items-center gap-4"
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#f87171', fontFamily: theme.sans, fontSize: 16, borderTop: `1px solid ${theme.rule}` }}
            >
              <span>🗑️</span><span>Delete Task</span>
            </button>
            <button
              onClick={() => setShowMenu(false)}
              className="w-full px-5 py-4 text-center transition-colors"
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: theme.inkFaint, fontFamily: theme.sans, fontSize: 14, borderTop: `1px solid ${theme.rule}` }}
            >
              Cancel
            </button>
          </div>
        </>
      )}
    </div>
  );
}
