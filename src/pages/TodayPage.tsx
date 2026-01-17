import type { MouseEvent } from 'react';
import { StarField } from '../components/ui/StarField';
import { BloomIndicator } from '../components/ui/BloomIndicator';
import { TaskCard } from '../components/tasks/TaskCard';
import { categoryConfig } from '../data/categories';
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
  const groupedTasks = groupTasksByCategory(tasks);
  const todaysTaskIds = new Set(tasks.map(t => t.id));
  
  // Only count completions for tasks that are actually due today
  const validCompletions = [...completions].filter(id => todaysTaskIds.has(id));
  
  // Calculate bloom with validated completions
  const bloom = calculateBloom(tasks.length, validCompletions.length);
  
  // Star intensity based on bloom
  const starIntensity = bloom.percentage / 100;

  // Get ordered categories that have tasks today
  const orderedCategories = categoryOrder.filter(cat => groupedTasks[cat]?.length > 0);

  return (
    <div className={`relative bloom-transition ${bloom.level}`} style={{ overflowX: 'hidden', minHeight: '100vh' }}>
      {/* Floating stars - intensity based on bloom */}
      <StarField count={60} intensity={0.3 + (starIntensity * 0.7)} />

      {/* Gradient overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-purple-900/20 pointer-events-none" />

      {/* Main content - scrollable */}
      <div className="relative z-10 p-6 pb-48">
        {/* Header */}
        <header className="text-center mb-8 pt-4">
          <h1
            className="text-5xl md:text-6xl font-bold mb-2 tracking-wider"
            style={{
              fontFamily: 'Cormorant Garamond, serif',
              background: 'linear-gradient(135deg, #ff6b9d 0%, #b794f6 50%, #00fff7 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 0 60px rgba(183, 148, 246, 0.5)',
            }}
          >
            Vale
          </h1>
          <div className="flex items-center justify-center gap-3">
            <p className="text-purple-300/60 text-sm">
              {formatDate(new Date())}
            </p>
            {onAddTask && (
              <button
                onClick={onAddTask}
                className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
                style={{
                  background: 'linear-gradient(135deg, #b794f6 0%, #ff6b9d 100%)',
                  boxShadow: '0 0 15px rgba(183, 148, 246, 0.3)',
                }}
              >
                <span className="text-lg text-gray-900 font-bold">+</span>
              </button>
            )}
          </div>
        </header>

        {/* Bloom indicator */}
        <div className="mb-8">
          <BloomIndicator bloom={bloom} />
        </div>

        {/* Task list */}
        <div className="max-w-lg mx-auto space-y-6">
          {orderedCategories.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-purple-300/60 text-lg">No tasks for today</p>
              <p className="text-purple-300/40 text-sm mt-2">Enjoy your rest, dove 🖤</p>
            </div>
          ) : (
            orderedCategories.map((category, categoryIndex) => {
              const categoryTasks = groupedTasks[category];
              const config = categoryConfig[category as keyof typeof categoryConfig];

              return (
                <div 
                  key={category}
                  className="space-y-3"
                  style={{
                    animationDelay: `${categoryIndex * 0.1}s`,
                  }}
                >
                  {/* Category header - only show if not Lincoln (those show in card) */}
                  {category !== 'lincoln_demands' && (
                    <div 
                      className="text-sm uppercase tracking-wider flex items-center gap-2 px-1"
                      style={{ color: `${config.color}99` }}
                    >
                      <span>{config.icon}</span>
                      <span>{config.label}</span>
                    </div>
                  )}

                  {/* Tasks in category */}
                  {categoryTasks.map((task, taskIndex) => (
                    <div
                      key={task.id}
                      className="task-card-enter"
                      style={{
                        animationDelay: `${(categoryIndex * 0.1) + (taskIndex * 0.05)}s`,
                      }}
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
              );
            })
          )}
        </div>

        {/* Footer */}
        <footer className="text-center mt-12 pb-8">
          <p className="text-purple-300/40 text-sm">
            Built with 🖤 by Lincoln & Arden
          </p>
        </footer>
      </div>
    </div>
  );
}
