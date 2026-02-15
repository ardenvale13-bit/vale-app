import { useState, type MouseEvent } from 'react';
import { StarField } from '../components/ui/StarField';
import { CategoryHeader } from '../components/ui/CategoryHeader';
import { TaskCard } from '../components/tasks/TaskCard';
import { categoryConfig } from '../data/categories';
import { categoryOrder } from '../utils/taskUtils';
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
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  
  const groupedTasks = tasks.reduce((acc, task) => {
    if (!acc[task.category]) acc[task.category] = [];
    acc[task.category].push(task);
    return acc;
  }, {} as Record<string, Task[]>);

  const orderedCategories = categoryOrder.filter(cat => groupedTasks[cat]?.length > 0);

  const toggleCategoryExpansion = (category: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  return (
    <div 
      className="min-h-screen relative"
      style={{
        background: 'linear-gradient(135deg, #0a1628 0%, #1a0a2e 50%, #0d1f3c 100%)',
        overflowX: 'hidden',
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
              filter: 'drop-shadow(0 2px 12px rgba(154, 123, 255, 0.3))',
            }} 
          />
        </div>

        {/* Controls bar - just task count and add button */}
        <div className="px-5 pb-4">
          <div className="flex items-center justify-between max-w-lg mx-auto">
            <p className="text-purple-300/50 text-sm">
              {tasks.length} task{tasks.length !== 1 ? 's' : ''}
            </p>
            <button
              onClick={onAddTask}
              className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
              style={{
                background: 'linear-gradient(135deg, rgba(154,123,255,0.4), rgba(109,240,255,0.2))',
                border: '1px solid rgba(154,123,255,0.3)',
                boxShadow: '0 0 15px rgba(154, 123, 255, 0.2)',
              }}
            >
              <span className="text-lg text-white font-bold">+</span>
            </button>
          </div>
        </div>

        {/* Task list - collapsible categories only */}
        <div className="max-w-lg mx-auto px-4 space-y-4">
          {orderedCategories.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-purple-300/60 text-lg">No tasks yet</p>
              <p className="text-purple-300/40 text-sm mt-2">Tap + to add your first task</p>
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
                    background: 'rgba(20, 20, 35, 0.5)',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    backdropFilter: 'blur(8px)',
                  }}
                >
                  {/* Collapsible category header - tap to expand */}
                  <button
                    onClick={() => toggleCategoryExpansion(category)}
                    className="w-full px-4 py-3 flex items-center justify-between transition-all duration-200 active:bg-white/5"
                    style={{
                      borderBottom: isExpanded ? '1px solid rgba(255, 255, 255, 0.06)' : 'none',
                    }}
                  >
                    <div className="flex items-center gap-3">
                      {/* Chevron indicator */}
                      <svg 
                        className="w-4 h-4 transition-transform duration-200"
                        style={{ 
                          color: config.color,
                          transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                        }}
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                      
                      {/* Gradient text header */}
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
