import { useState, type MouseEvent } from 'react';
import { StarField } from '../components/ui/StarField';
import { CategoryHeader } from '../components/ui/CategoryHeader';
import { TaskCard } from '../components/tasks/TaskCard';
import { categoryConfig } from '../data/categories';
import { useTheme } from '../theme/ThemeContext';
import { categoryOrder, groupTasksByCategory } from '../utils/taskUtils';
import type { Task } from '../utils/taskUtils';

interface TasksPageProps {
  tasks: Task[];
  completions: Set<string>;
  onToggleTask: (taskId: string, event?: MouseEvent) => void;
  onAddTask?: () => void;
  onEditTask?: (task: Task) => void;
  onDeleteTask?: (taskId: string) => void;
}

export function TasksPage({ tasks, completions, onToggleTask, onAddTask, onEditTask, onDeleteTask }: TasksPageProps) {
  const { theme } = useTheme();
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  const groupedTasks = groupTasksByCategory(tasks);
  const orderedCategories = categoryOrder.filter(cat => groupedTasks[cat]?.length > 0);

  const toggleCategoryExpansion = (category: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(category)) next.delete(category);
      else next.add(category);
      return next;
    });
  };

  return (
    <div
      style={{
        minHeight: '100vh', position: 'relative', overflowX: 'hidden',
        background: `linear-gradient(180deg, ${theme.bgDeep} 0%, ${theme.bg} 100%)`,
        color: theme.ink, fontFamily: theme.sans,
      }}
    >
      <StarField count={30} intensity={0.3} />

      <div className="relative z-10" style={{ paddingBottom: '100px' }}>
        {/* Section header banner */}
        <div className="flex justify-center pt-2 pb-2">
          <img
            src="/header-tasks.png"
            alt="Tasks"
            style={{
              maxWidth: 260,
              height: 'auto',
              filter: `drop-shadow(0 2px 12px ${theme.accent}50)`,
            }}
          />
        </div>

        {/* Controls bar */}
        <div className="px-5 pb-4">
          <div className="flex items-center justify-between max-w-lg mx-auto">
            <p style={{ color: theme.inkFaint, fontSize: 14 }}>
              {tasks.length} task{tasks.length !== 1 ? 's' : ''}
            </p>
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
          </div>
        </div>

        {/* Task list - collapsible categories */}
        <div className="max-w-lg mx-auto px-4 space-y-4">
          {orderedCategories.length === 0 ? (
            <div className="text-center py-12">
              <p style={{ color: theme.inkSoft, fontSize: 18 }}>No tasks yet</p>
              <p style={{ color: theme.inkFaint, fontSize: 14, marginTop: 8 }}>Tap + to add your first task</p>
            </div>
          ) : (
            orderedCategories.map((category) => {
              const categoryTasks = groupedTasks[category];
              const config = categoryConfig[category as keyof typeof categoryConfig];
              const completedCount = categoryTasks.filter(t => completions.has(t.id)).length;
              const isExpanded = expandedCategories.has(category);

              return (
                <div
                  key={category}
                  className="rounded-2xl overflow-hidden"
                  style={{
                    background: `${theme.bg}88`,
                    border: `1px solid ${theme.rule}`,
                    backdropFilter: 'blur(8px)',
                  }}
                >
                  {/* Collapsible category header */}
                  <button
                    onClick={() => toggleCategoryExpansion(category)}
                    className="w-full px-4 py-3 flex items-center justify-between transition-all duration-200"
                    style={{
                      background: 'transparent', border: 'none', cursor: 'pointer',
                      borderBottom: isExpanded ? `1px solid ${theme.rule}` : 'none',
                    }}
                  >
                    <div className="flex items-center gap-3">
                      {/* Chevron */}
                      <span style={{
                        color: config.color,
                        transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                        transition: 'transform 250ms', display: 'inline-block',
                        fontSize: 16,
                      }}>›</span>
                      <CategoryHeader label={config.label} size="sm" />
                    </div>

                    <span
                      className="text-xs px-2 py-0.5 rounded-full"
                      style={{
                        background: `${config.color}15`,
                        color: `${config.color}99`,
                      }}
                    >
                      {completedCount}/{categoryTasks.length}
                    </span>
                  </button>

                  {/* Tasks - only shown when expanded */}
                  {isExpanded && (
                    <div className="p-2 space-y-2">
                      {categoryTasks.map((task) => (
                        <TaskCard
                          key={task.id}
                          task={task}
                          isCompleted={completions.has(task.id)}
                          onToggle={onToggleTask}
                          onEdit={onEditTask}
                          onDelete={onDeleteTask}
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
