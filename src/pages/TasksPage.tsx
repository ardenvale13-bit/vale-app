import { useState } from 'react';
import { StarField } from '../components/ui/StarField';
import { TaskCard } from '../components/tasks/TaskCard';
import { categoryConfig } from '../data/categories';
import { categoryOrder } from '../utils/taskUtils';
import type { Task } from '../utils/taskUtils';

interface TasksPageProps {
  tasks: Task[];
  completions: Set<string>;
  onToggleTask: (taskId: string) => void;
  onAddTask?: () => void;
  onEditTask?: (task: Task) => void;
  onDeleteTask?: (taskId: string) => void;
}

export function TasksPage({ tasks, completions, onToggleTask, onAddTask, onEditTask, onDeleteTask }: TasksPageProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | 'all'>('all');
  
  // Filter tasks by category
  const filteredTasks = selectedCategory === 'all' 
    ? tasks 
    : tasks.filter(t => t.category === selectedCategory);
  
  // Group by category for display
  const groupedTasks = filteredTasks.reduce((acc, task) => {
    if (!acc[task.category]) acc[task.category] = [];
    acc[task.category].push(task);
    return acc;
  }, {} as Record<string, Task[]>);

  const orderedCategories = categoryOrder.filter(cat => groupedTasks[cat]?.length > 0);

  return (
    <div 
      className="min-h-screen relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #0a1628 0%, #1a0a2e 50%, #0d1f3c 100%)',
      }}
    >
      {/* Subtle stars */}
      <StarField count={30} intensity={0.3} />

      {/* Main content */}
      <div className="relative z-10 min-h-screen p-6 pb-32">
        {/* Header */}
        <header className="mb-6 pt-4">
          <div className="flex items-center justify-between">
            <h1
              className="text-3xl font-bold tracking-wide"
              style={{
                fontFamily: 'Cormorant Garamond, serif',
                color: '#f0f4ff',
              }}
            >
              All Tasks
            </h1>
            
            {/* Add button */}
            <button
              onClick={onAddTask}
              className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
              style={{
                background: 'linear-gradient(135deg, #b794f6 0%, #ff6b9d 100%)',
                boxShadow: '0 0 20px rgba(183, 148, 246, 0.4)',
              }}
            >
              <span className="text-xl text-gray-900 font-bold">+</span>
            </button>
          </div>
          
          {/* Category filter pills */}
          <div className="flex gap-2 mt-4 overflow-x-auto pb-2 scrollbar-hide">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-300 ${
                selectedCategory === 'all' 
                  ? 'bg-purple-500/30 text-purple-200 border border-purple-400/50' 
                  : 'bg-gray-800/50 text-purple-300/60 border border-transparent'
              }`}
            >
              All ({tasks.length})
            </button>
            {categoryOrder.map(cat => {
              const config = categoryConfig[cat as keyof typeof categoryConfig];
              const count = tasks.filter(t => t.category === cat).length;
              if (count === 0) return null;
              
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-300 flex items-center gap-1 ${
                    selectedCategory === cat 
                      ? 'border' 
                      : 'bg-gray-800/50 border border-transparent'
                  }`}
                  style={{
                    backgroundColor: selectedCategory === cat ? `${config.color}20` : undefined,
                    borderColor: selectedCategory === cat ? `${config.color}50` : undefined,
                    color: selectedCategory === cat ? config.color : 'rgba(183, 148, 246, 0.6)',
                  }}
                >
                  <span>{config.icon}</span>
                  <span>{config.label}</span>
                  <span className="opacity-60">({count})</span>
                </button>
              );
            })}
          </div>
        </header>

        {/* Task list */}
        <div className="max-w-lg mx-auto space-y-6">
          {orderedCategories.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-purple-300/60 text-lg">No tasks yet</p>
              <p className="text-purple-300/40 text-sm mt-2">Tap + to add your first task</p>
            </div>
          ) : (
            orderedCategories.map((category) => {
              const categoryTasks = groupedTasks[category];
              const config = categoryConfig[category as keyof typeof categoryConfig];

              return (
                <div key={category} className="space-y-3">
                  {/* Category header */}
                  <div 
                    className="text-sm uppercase tracking-wider flex items-center gap-2 px-1"
                    style={{ color: `${config.color}99` }}
                  >
                    <span>{config.icon}</span>
                    <span>{config.label}</span>
                    <span className="opacity-50">({categoryTasks.length})</span>
                  </div>

                  {/* Tasks */}
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
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
