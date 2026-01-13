import { useState, useEffect, useCallback } from 'react';
import './App.css';
import { StarField } from './components/ui/StarField';
import { BloomIndicator } from './components/ui/BloomIndicator';
import { TaskCard } from './components/tasks/TaskCard';
import { categoryConfig } from './data/categories';
import { 
  fetchTasks, 
  fetchCompletionsForDate, 
  completeTask, 
  uncompleteTask,
  subscribeToTasks 
} from './lib/api';
import type { DbCompletion } from './lib/supabase';
import { 
  dbTaskToLocal,
  getTodaysTasks, 
  groupTasksByCategory, 
  calculateBloom,
  formatDate,
  categoryOrder 
} from './utils/taskUtils';
import type { Task } from './utils/taskUtils';

function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [completions, setCompletions] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load tasks and completions on mount
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError(null);

        // Fetch tasks from Supabase
        const dbTasks = await fetchTasks();
        const localTasks = dbTasks.map(dbTaskToLocal);
        setTasks(localTasks);

        // Fetch today's completions
        const today = new Date();
        const todayCompletions = await fetchCompletionsForDate(today);
        const completedTaskIds = new Set(todayCompletions.map((c: DbCompletion) => c.task_id));
        setCompletions(completedTaskIds);

      } catch (err) {
        console.error('Failed to load data:', err);
        setError('Failed to load tasks. Please refresh.');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  // Subscribe to real-time task changes (for when Lincoln adds tasks)
  useEffect(() => {
    const unsubscribe = subscribeToTasks((dbTasks) => {
      const localTasks = dbTasks.map(dbTaskToLocal);
      setTasks(localTasks);
    });

    return unsubscribe;
  }, []);

  // Handle task toggle
  const handleToggleTask = useCallback(async (taskId: string) => {
    const today = new Date();
    const wasCompleted = completions.has(taskId);

    // Optimistic update
    setCompletions(prev => {
      const next = new Set(prev);
      if (wasCompleted) {
        next.delete(taskId);
      } else {
        next.add(taskId);
      }
      return next;
    });

    try {
      if (wasCompleted) {
        await uncompleteTask(taskId, today);
      } else {
        await completeTask(taskId, today);
      }
    } catch (err) {
      // Revert on error
      console.error('Failed to toggle task:', err);
      setCompletions(prev => {
        const next = new Set(prev);
        if (wasCompleted) {
          next.add(taskId);
        } else {
          next.delete(taskId);
        }
        return next;
      });
    }
  }, [completions]);

  // Get today's tasks
  const todaysTasks = getTodaysTasks(tasks);
  const todaysTaskIds = new Set(todaysTasks.map(t => t.id));
  const groupedTasks = groupTasksByCategory(todaysTasks);
  
  // Only count completions for tasks that are actually due today
  const validCompletions = [...completions].filter(id => todaysTaskIds.has(id));
  
  // Calculate bloom with validated completions
  const bloom = calculateBloom(todaysTasks.length, validCompletions.length);
  
  // Star intensity based on bloom
  const starIntensity = bloom.percentage / 100;

  // Get ordered categories that have tasks today
  const orderedCategories = categoryOrder.filter(cat => groupedTasks[cat]?.length > 0);

  // Loading state
  if (loading) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center"
        style={{
          background: 'linear-gradient(135deg, #0a1628 0%, #1a0a2e 50%, #0d1f3c 100%)',
        }}
      >
        <div className="text-center">
          <h1 
            className="text-4xl font-bold mb-4"
            style={{
              fontFamily: 'Cormorant Garamond, serif',
              background: 'linear-gradient(135deg, #ff6b9d 0%, #b794f6 50%, #00fff7 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Vale
          </h1>
          <p className="text-purple-300/60 animate-pulse">Loading...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center p-6"
        style={{
          background: 'linear-gradient(135deg, #0a1628 0%, #1a0a2e 50%, #0d1f3c 100%)',
        }}
      >
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-400 mb-4">Oops</h1>
          <p className="text-purple-300/60 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-500 transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen relative overflow-hidden bloom-transition ${bloom.level}`}
      style={{
        background: 'linear-gradient(135deg, #0a1628 0%, #1a0a2e 50%, #0d1f3c 100%)',
      }}
    >
      {/* Floating stars - intensity based on bloom */}
      <StarField count={60} intensity={0.3 + (starIntensity * 0.7)} />

      {/* Gradient overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-purple-900/20 pointer-events-none" />

      {/* Main content */}
      <div className="relative z-10 min-h-screen p-6 pb-24">
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
          <p className="text-purple-300/60 text-sm">
            {formatDate(new Date())}
          </p>
        </header>

        {/* Bloom indicator */}
        <div className="mb-8">
          <BloomIndicator bloom={bloom} />
        </div>

        {/* Task list */}
        <div className="max-w-lg mx-auto space-y-6">
          {orderedCategories.map((category, categoryIndex) => {
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
                      onToggle={handleToggleTask}
                    />
                  </div>
                ))}
              </div>
            );
          })}
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

export default App;
