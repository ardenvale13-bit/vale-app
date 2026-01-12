import { useState, useEffect } from 'react';
import './App.css';
import { StarField } from './components/ui/StarField';
import { BloomIndicator } from './components/ui/BloomIndicator';
import { TaskCard } from './components/tasks/TaskCard';
import { defaultTasks } from './data/tasks';
import { categoryConfig } from './data/categories';
import { 
  getTodaysTasks, 
  groupTasksByCategory, 
  calculateBloom,
  formatDate,
  categoryOrder 
} from './utils/taskUtils';

// Get today's date as a string key for storage
function getTodayKey(): string {
  const today = new Date();
  return `vale-completions-${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
}

// Load completions from localStorage
function loadCompletions(): Set<string> {
  try {
    const key = getTodayKey();
    const stored = localStorage.getItem(key);
    if (stored) {
      return new Set(JSON.parse(stored));
    }
  } catch (e) {
    console.error('Failed to load completions:', e);
  }
  return new Set();
}

// Save completions to localStorage
function saveCompletions(completions: Set<string>): void {
  try {
    const key = getTodayKey();
    localStorage.setItem(key, JSON.stringify([...completions]));
  } catch (e) {
    console.error('Failed to save completions:', e);
  }
}

// Clean up old completion data (keep last 7 days)
function cleanupOldCompletions(): void {
  try {
    const keys = Object.keys(localStorage);
    const today = new Date();
    
    keys.forEach(key => {
      if (key.startsWith('vale-completions-')) {
        const datePart = key.replace('vale-completions-', '');
        const [year, month, day] = datePart.split('-').map(Number);
        const keyDate = new Date(year, month - 1, day);
        const diffDays = (today.getTime() - keyDate.getTime()) / (1000 * 60 * 60 * 24);
        
        if (diffDays > 7) {
          localStorage.removeItem(key);
        }
      }
    });
  } catch (e) {
    console.error('Failed to cleanup old completions:', e);
  }
}

function App() {
  const [tasks] = useState(defaultTasks);
  const [completions, setCompletions] = useState<Set<string>>(() => loadCompletions());
  
  // Clean up old data on mount
  useEffect(() => {
    cleanupOldCompletions();
  }, []);

  // Save completions whenever they change
  useEffect(() => {
    saveCompletions(completions);
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

  const handleToggleTask = (taskId: string) => {
    setCompletions(prev => {
      const next = new Set(prev);
      if (next.has(taskId)) {
        next.delete(taskId);
      } else {
        next.add(taskId);
      }
      return next;
    });
  };

  // Get ordered categories that have tasks today
  const orderedCategories = categoryOrder.filter(cat => groupedTasks[cat]?.length > 0);

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
