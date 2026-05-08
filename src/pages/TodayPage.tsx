import type { MouseEvent } from 'react';
import { StarField } from '../components/ui/StarField';
import { BloomIndicator } from '../components/ui/BloomIndicator';
import { CategoryHeader } from '../components/ui/CategoryHeader';
import { TaskCard } from '../components/tasks/TaskCard';
import { categoryConfig } from '../data/categories';
import { useTheme } from '../theme/ThemeContext';
import {
  groupTasksByCategory,
  calculateBloom,
  formatDate,
  categoryOrder
} from '../utils/taskUtils';
import type { Task } from '../utils/taskUtils';

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
    <div
      className={`relative bloom-transition ${bloom.level}`}
      style={{
        overflowX: 'hidden', minHeight: '100vh',
        background: `linear-gradient(180deg, ${theme.bgDeep} 0%, ${theme.bg} 60%, ${theme.bgGrad} 100%)`,
        color: theme.ink, fontFamily: theme.sans,
      }}
    >
      <StarField count={60} intensity={0.3 + (starIntensity * 0.7)} />

      <div className="relative z-10" style={{ paddingBottom: '100px' }}>
        {/* Section header banner */}
        <div className="flex justify-center pt-2 pb-2">
          <img
            src="/header-today.png"
            alt="Today"
            style={{
              maxWidth: 280,
              height: 'auto',
              filter: `drop-shadow(0 2px 12px ${theme.accent}50)`,
            }}
          />
        </div>

        {/* Header bar */}
        <header className="px-5 pb-4">
          <div className="flex items-center justify-between max-w-lg mx-auto">
            <div>
              <p style={{ color: theme.inkFaint, fontSize: 14 }}>{formatDate(new Date())}</p>
            </div>
            {onAddTask && (
              <button
                onClick={onAddTask}
                className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
                style={{
                  background: `linear-gradient(135deg, ${theme.accent}66, ${theme.accent}33)`,
                  border: `1px solid ${theme.accent}50`,
                  boxShadow: `0 0 15px ${theme.accent}33`,
                }}
              >
                <span style={{ fontSize: 18, color: theme.ink, fontWeight: 'bold' }}>+</span>
              </button>
            )}
          </div>
        </header>

        {/* Bloom indicator */}
        <div className="px-5 mb-6 max-w-lg mx-auto">
          <BloomIndicator bloom={bloom} />
        </div>

        {/* Task list */}
        <div className="max-w-lg mx-auto px-4 space-y-6">
          {orderedCategories.length === 0 ? (
            <div className="text-center py-12">
              <p style={{ color: theme.inkSoft, fontSize: 18 }}>No tasks for today</p>
              <p style={{ color: theme.inkFaint, fontSize: 14, marginTop: 8 }}>Enjoy your rest, dove</p>
            </div>
          ) : (
            orderedCategories.map((category, categoryIndex) => {
              const categoryTasks = groupedTasks[category];
              const config = categoryConfig[category as keyof typeof categoryConfig];
              const completedCount = categoryTasks.filter(t => completions.has(t.id)).length;

              return (
                <div
                  key={category}
                  className="space-y-3"
                  style={{ animationDelay: `${categoryIndex * 0.1}s` }}
                >
                  {/* Category header */}
                  <div className="flex items-center justify-between px-2">
                    <CategoryHeader label={config.label} size="sm" />
                    <span
                      className="text-xs px-2 py-0.5 rounded-full"
                      style={{
                        background: `${config.color}15`,
                        color: `${config.color}99`,
                      }}
                    >
                      {completedCount}/{categoryTasks.length}
                    </span>
                  </div>

                  {/* Tasks container */}
                  <div
                    className="rounded-2xl overflow-hidden"
                    style={{
                      background: `${theme.bg}88`,
                      border: `1px solid ${theme.rule}`,
                      backdropFilter: 'blur(8px)',
                    }}
                  >
                    <div className="p-2 space-y-2">
                      {categoryTasks.map((task, taskIndex) => (
                        <div
                          key={task.id}
                          className="task-card-enter"
                          style={{ animationDelay: `${(categoryIndex * 0.1) + (taskIndex * 0.05)}s` }}
                        >
                          <TaskCard
                            task={task}
                            isCompleted={completions.has(task.id)}
                            onToggle={onToggleTask}
                            onEdit={onEditTask}
                            onDelete={onDeleteTask}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <footer className="text-center mt-10 pb-6">
          <p style={{
            fontFamily: theme.serifB, fontStyle: 'italic', fontSize: 13,
            color: theme.inkFaint,
          }}>
            built with &hearts; by Lincoln & Arden
          </p>
        </footer>
      </div>
    </div>
  );
}
