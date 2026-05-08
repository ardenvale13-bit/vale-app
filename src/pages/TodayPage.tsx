import { useState, useRef, type MouseEvent } from 'react';
import { StarField } from '../components/ui/StarField';
import { BloomIndicator } from '../components/ui/BloomIndicator';
import { categoryConfig } from '../data/categories';
import { useTheme } from '../theme/ThemeContext';
import {
  groupTasksByCategory,
  calculateBloom,
  categoryOrder
} from '../utils/taskUtils';
import type { Task } from '../utils/taskUtils';

// ── Helpers ──────────────────────────────────────────────────────

function prettyDate(): string {
  return new Date().toLocaleDateString('en-NZ', {
    weekday: 'long', day: 'numeric', month: 'long',
  });
}

function greetingTime(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

// ── Section header — small caps with hairline rule ───────────────

function SectionHead({ children, accent, count }: {
  children: React.ReactNode; accent?: string; count?: string;
}) {
  const { theme } = useTheme();
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '0 4px' }}>
      <span style={{
        fontFamily: theme.sans, fontSize: 10, fontWeight: 500,
        letterSpacing: '0.22em', textTransform: 'uppercase',
        color: accent || theme.inkFaint, whiteSpace: 'nowrap',
      }}>{children}</span>
      <span style={{ flex: 1, height: 1, background: theme.rule }} />
      {count != null && (
        <span style={{
          fontFamily: theme.mono, fontSize: 10,
          color: theme.inkFaint, letterSpacing: '0.05em',
        }}>{count}</span>
      )}
    </div>
  );
}

// ── Task row — star toggle + serif title + hairline border ───────

function TaskRow({ task, isCompleted, onToggle, onEdit, onDelete }: {
  task: Task; isCompleted: boolean;
  onToggle: (id: string, e?: MouseEvent) => void;
  onEdit?: (task: Task) => void;
  onDelete?: (taskId: string) => void;
}) {
  const { theme } = useTheme();
  const cat = categoryConfig[task.category as keyof typeof categoryConfig];
  const [showMenu, setShowMenu] = useState(false);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleTouchStart = () => {
    longPressTimer.current = setTimeout(() => setShowMenu(true), 500);
  };
  const handleTouchEnd = () => {
    if (longPressTimer.current) { clearTimeout(longPressTimer.current); longPressTimer.current = null; }
  };

  return (
    <>
      <div
        onClick={(e) => { if (!showMenu) onToggle(task.id, e); }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleTouchStart}
        onMouseUp={handleTouchEnd}
        onMouseLeave={handleTouchEnd}
        onContextMenu={(e) => { e.preventDefault(); setShowMenu(true); }}
        style={{
          cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 14,
          padding: '14px 2px', width: '100%', boxSizing: 'border-box',
          borderBottom: `1px solid ${theme.rule}`,
        }}
      >
        {/* Star / dot toggle */}
        <span style={{
          width: 18, height: 18, flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {isCompleted ? (
            <svg width="18" height="18" viewBox="-10 -10 20 20">
              <path
                d="M0,-9 L2.1,-2.8 L8.5,-2.8 L3.4,1.1 L5.4,7.3 L0,3.5 L-5.4,7.3 L-3.4,1.1 L-8.5,-2.8 L-2.1,-2.8 Z"
                fill={theme.accent}
                style={{ filter: `drop-shadow(0 0 6px ${theme.accent}88)` }}
              />
            </svg>
          ) : (
            <span style={{
              width: 12, height: 12, borderRadius: 999,
              border: `1px solid ${theme.inkGhost}`,
            }} />
          )}
        </span>

        {/* Title */}
        <span style={{
          flex: 1, fontFamily: theme.serifB, fontSize: 18,
          color: isCompleted ? theme.inkFaint : theme.ink,
          textDecoration: isCompleted ? 'line-through' : 'none',
          textDecorationColor: theme.inkGhost,
          letterSpacing: 0.1,
        }}>{task.title}</span>

        {/* Time */}
        {task.reminderTimes && task.reminderTimes.length > 0 && (
          <span style={{
            fontFamily: theme.mono, fontSize: 10,
            color: theme.inkFaint, letterSpacing: '0.04em',
          }}>{task.reminderTimes[0]}</span>
        )}

        {/* Category color dot */}
        <span style={{
          width: 6, height: 6, borderRadius: 999,
          background: cat?.color || theme.inkFaint,
          opacity: 0.85, flexShrink: 0,
        }} />
      </div>

      {/* Long-press action menu */}
      {showMenu && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 40 }} onClick={() => setShowMenu(false)} />
          <div style={{
            position: 'fixed', left: '50%', top: '50%', transform: 'translate(-50%, -50%)',
            zIndex: 50, borderRadius: 16, overflow: 'hidden', minWidth: 200,
            background: `linear-gradient(135deg, ${theme.bg} 0%, ${theme.bgDeep} 100%)`,
            border: `1px solid ${theme.accent}40`,
            boxShadow: `0 25px 50px rgba(0,0,0,0.5), 0 0 40px ${theme.accent}22`,
          }}>
            <div style={{ padding: '16px 20px', borderBottom: `1px solid ${theme.rule}` }}>
              <div style={{ fontFamily: theme.sans, fontSize: 10, color: theme.inkFaint, letterSpacing: '0.22em', textTransform: 'uppercase' }}>Task</div>
              <div style={{ fontFamily: theme.serifB, fontSize: 16, color: theme.ink, marginTop: 4 }}>{task.title}</div>
            </div>
            <button onClick={() => { setShowMenu(false); onEdit?.(task); }}
              style={{ all: 'unset', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, width: '100%', boxSizing: 'border-box', padding: '16px 20px', fontFamily: theme.sans, fontSize: 16, color: theme.ink }}>
              <span>✏️</span><span>Edit</span>
            </button>
            <button onClick={() => { setShowMenu(false); if (confirm(`Delete "${task.title}"?`)) onDelete?.(task.id); }}
              style={{ all: 'unset', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, width: '100%', boxSizing: 'border-box', padding: '16px 20px', fontFamily: theme.sans, fontSize: 16, color: '#f87171', borderTop: `1px solid ${theme.rule}` }}>
              <span>🗑️</span><span>Delete</span>
            </button>
            <button onClick={() => setShowMenu(false)}
              style={{ all: 'unset', cursor: 'pointer', width: '100%', boxSizing: 'border-box', padding: '14px 20px', textAlign: 'center', fontFamily: theme.sans, fontSize: 14, color: theme.inkFaint, borderTop: `1px solid ${theme.rule}` }}>
              Cancel
            </button>
          </div>
        </>
      )}
    </>
  );
}

// ── Main page ────────────────────────────────────────────────────

interface TodayPageProps {
  tasks: Task[];
  completions: Set<string>;
  onToggleTask: (taskId: string, event?: MouseEvent) => void;
  onAddTask?: () => void;
  onEditTask?: (task: Task) => void;
  onDeleteTask?: (taskId: string) => void;
}

export function TodayPage({ tasks, completions, onToggleTask, onAddTask, onEditTask, onDeleteTask }: TodayPageProps) {
  const { theme } = useTheme();
  const groupedTasks = groupTasksByCategory(tasks);
  const todaysTaskIds = new Set(tasks.map(t => t.id));
  const validCompletions = [...completions].filter(id => todaysTaskIds.has(id));
  const bloom = calculateBloom(tasks.length, validCompletions.length);
  const starIntensity = bloom.percentage / 100;
  const orderedCategories = categoryOrder.filter(cat => groupedTasks[cat]?.length > 0);

  return (
    <div style={{
      minHeight: '100vh', position: 'relative',
      background: `linear-gradient(180deg, ${theme.bgDeep} 0%, ${theme.bg} 60%, ${theme.bgGrad} 100%)`,
      color: theme.ink, fontFamily: theme.sans, paddingBottom: 96,
    }}>
      <StarField count={80} intensity={0.3 + (starIntensity * 0.5)} />

      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <div style={{ padding: '54px 24px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{
              fontFamily: theme.sans, fontSize: 10, fontWeight: 500,
              letterSpacing: '0.22em', textTransform: 'uppercase', color: theme.inkFaint,
            }}>
              {prettyDate()}
            </div>
            <h1 style={{
              fontFamily: theme.serifH, fontSize: 38, fontWeight: 400,
              fontStyle: 'italic', letterSpacing: -0.5, margin: '8px 0 0', lineHeight: 1,
            }}>
              {greetingTime()},<br />
              <span style={{ color: theme.accent }}>Arden</span>
            </h1>
          </div>
          {onAddTask && (
            <button onClick={onAddTask} style={{
              all: 'unset', cursor: 'pointer', width: 36, height: 36, borderRadius: 999,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: `1px solid ${theme.rule}`, color: theme.accent,
              fontFamily: theme.serifH, fontSize: 24, fontStyle: 'italic',
              marginTop: 8, transition: 'all 200ms',
            }}>+</button>
          )}
        </div>

        {/* Moon bloom indicator */}
        <div className="px-5 mb-2 max-w-lg mx-auto">
          <BloomIndicator bloom={bloom} />
        </div>

        {/* Task groups */}
        <div style={{ padding: '0 24px', display: 'flex', flexDirection: 'column', gap: 28 }}>
          {orderedCategories.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 0' }}>
              <div style={{ fontFamily: theme.serifH, fontSize: 22, fontStyle: 'italic', color: theme.inkSoft }}>
                No tasks for today
              </div>
              <div style={{ fontFamily: theme.mono, fontSize: 10, color: theme.inkFaint, marginTop: 8, letterSpacing: '0.18em', textTransform: 'uppercase' }}>
                enjoy your rest, dove
              </div>
            </div>
          ) : (
            orderedCategories.map(c => {
              const cat = categoryConfig[c as keyof typeof categoryConfig];
              const list = groupedTasks[c];
              const dn = list.filter(t => completions.has(t.id)).length;
              return (
                <div key={c}>
                  <SectionHead accent={cat?.color} count={`${dn}/${list.length}`}>
                    {cat?.label || c}
                  </SectionHead>
                  <div style={{ marginTop: 8 }}>
                    {list.map(task => (
                      <TaskRow
                        key={task.id}
                        task={task}
                        isCompleted={completions.has(task.id)}
                        onToggle={onToggleTask}
                        onEdit={onEditTask}
                        onDelete={onDeleteTask}
                      />
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div style={{
          textAlign: 'center', padding: '40px 0 24px',
          fontFamily: theme.serifB, fontStyle: 'italic', fontSize: 13, color: theme.inkFaint,
        }}>
          built with &hearts; by Lincoln & Arden
        </div>
      </div>
    </div>
  );
}
