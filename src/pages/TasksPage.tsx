import { useState, type MouseEvent } from 'react';
import { StarField } from '../components/ui/StarField';
import { categoryConfig } from '../data/categories';
import { useTheme } from '../theme/ThemeContext';
import { categoryOrder, groupTasksByCategory } from '../utils/taskUtils';
import type { Task } from '../utils/taskUtils';

// ── Task row (same pattern as TodayPage) ─────────────────────────

function TaskRow({ task, isCompleted, onToggle }: {
  task: Task; isCompleted: boolean; onToggle: (id: string, e?: MouseEvent) => void;
}) {
  const { theme } = useTheme();
  const cat = categoryConfig[task.category as keyof typeof categoryConfig];

  return (
    <button
      onClick={(e) => onToggle(task.id, e)}
      style={{
        all: 'unset', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 14,
        padding: '14px 2px', width: '100%', boxSizing: 'border-box',
        borderBottom: `1px solid ${theme.rule}`,
      }}
    >
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
      <span style={{
        flex: 1, fontFamily: theme.serifB, fontSize: 18,
        color: isCompleted ? theme.inkFaint : theme.ink,
        textDecoration: isCompleted ? 'line-through' : 'none',
        textDecorationColor: theme.inkGhost, letterSpacing: 0.1,
      }}>{task.title}</span>
      {task.description && (
        <span style={{
          fontFamily: theme.mono, fontSize: 10,
          color: theme.inkFaint, letterSpacing: '0.04em',
        }}>{task.description}</span>
      )}
      <span style={{
        width: 6, height: 6, borderRadius: 999,
        background: cat?.color || theme.inkFaint,
        opacity: 0.85, flexShrink: 0,
      }} />
    </button>
  );
}

// ── Main page ────────────────────────────────────────────────────

interface TasksPageProps {
  tasks: Task[];
  completions: Set<string>;
  onToggleTask: (taskId: string, event?: MouseEvent) => void;
  onAddTask?: () => void;
  onEditTask?: (task: Task) => void;
  onDeleteTask?: (taskId: string) => void;
}

export function TasksPage({ tasks, completions, onToggleTask }: TasksPageProps) {
  const { theme } = useTheme();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const groupedTasks = groupTasksByCategory(tasks);
  const orderedCategories = categoryOrder.filter(cat => groupedTasks[cat]?.length > 0);

  return (
    <div style={{
      minHeight: '100vh', position: 'relative',
      background: `linear-gradient(180deg, ${theme.bgDeep} 0%, ${theme.bg} 100%)`,
      color: theme.ink, fontFamily: theme.sans, paddingBottom: 96,
    }}>
      <StarField count={40} intensity={0.3} />

      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <div style={{ padding: '54px 24px 24px' }}>
          <div style={{
            fontFamily: theme.sans, fontSize: 10, fontWeight: 500,
            letterSpacing: '0.22em', textTransform: 'uppercase', color: theme.inkFaint,
          }}>
            All rituals
          </div>
          <h1 style={{
            fontFamily: theme.serifH, fontSize: 44, fontWeight: 400,
            fontStyle: 'italic', letterSpacing: -0.5, margin: '6px 0 0', lineHeight: 1,
          }}>
            The library
          </h1>
          <p style={{
            fontFamily: theme.serifB, fontSize: 16, color: theme.inkSoft,
            margin: '10px 0 0', lineHeight: 1.5, fontStyle: 'italic',
          }}>
            {tasks.length} habits, sorted by light.
          </p>
        </div>

        {/* Collapsible category groups */}
        <div style={{ padding: '0 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {orderedCategories.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 0' }}>
              <div style={{ fontFamily: theme.serifH, fontSize: 22, fontStyle: 'italic', color: theme.inkSoft }}>
                No tasks yet
              </div>
              <div style={{ fontFamily: theme.mono, fontSize: 10, color: theme.inkFaint, marginTop: 8, letterSpacing: '0.18em', textTransform: 'uppercase' }}>
                tap + to add your first task
              </div>
            </div>
          ) : (
            orderedCategories.map(c => {
              const cat = categoryConfig[c as keyof typeof categoryConfig];
              const list = groupedTasks[c];
              const isOpen = expanded[c] ?? false;
              const dn = list.filter(t => completions.has(t.id)).length;

              return (
                <div key={c} style={{ borderTop: `1px solid ${theme.rule}`, paddingTop: 14 }}>
                  <button
                    onClick={() => setExpanded(s => ({ ...s, [c]: !s[c] }))}
                    style={{
                      all: 'unset', cursor: 'pointer', width: '100%',
                      display: 'flex', alignItems: 'center', gap: 12,
                    }}
                  >
                    <span style={{
                      width: 8, height: 8, borderRadius: 999,
                      background: cat?.color || theme.inkFaint,
                      boxShadow: `0 0 10px ${(cat?.color || theme.inkFaint)}88`,
                    }} />
                    <span style={{
                      fontFamily: theme.serifH, fontSize: 24, fontStyle: 'italic',
                      color: theme.ink, flex: 1,
                    }}>{cat?.label || c}</span>
                    <span style={{
                      fontFamily: theme.mono, fontSize: 10,
                      color: theme.inkFaint, letterSpacing: '0.1em',
                    }}>
                      {dn} / {list.length}
                    </span>
                    <span style={{
                      color: theme.inkFaint, fontSize: 18,
                      transform: `rotate(${isOpen ? 90 : 0}deg)`,
                      transition: 'transform 250ms', display: 'inline-block',
                    }}>›</span>
                  </button>
                  {isOpen && (
                    <div style={{ marginTop: 6 }}>
                      {list.map(task => (
                        <TaskRow
                          key={task.id}
                          task={task}
                          isCompleted={completions.has(task.id)}
                          onToggle={onToggleTask}
                        />
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
