import { useState, useEffect, useCallback } from 'react';
import './App.css';
import { ThemeProvider, useTheme } from './theme/ThemeContext';
import { LUNAR_PAGE_BGS } from './theme/lunar';
import { BottomNav, type NavTab } from './components/navigation/BottomNav';
import { TodayPage } from './pages/TodayPage';
import { TasksPage } from './pages/TasksPage';
import { SettingsPage } from './pages/SettingsPage';
import { AddTaskModal } from './components/tasks/AddTaskModal';
import { LoadingScreen } from './components/ui/LoadingScreen';
import { EntryScreen } from './components/ui/EntryScreen';
import { CompletionAnimation, useCompletionAnimation } from './components/ui/CompletionAnimations';
import {
  fetchTasks,
  fetchCompletionsForDate,
  completeTask,
  uncompleteTask,
  deleteTask,
  subscribeToTasks
} from './lib/api';
import type { DbCompletion } from './lib/supabase';
import {
  dbTaskToLocal,
  getTodaysTasks,
} from './utils/taskUtils';
import type { Task } from './utils/taskUtils';

function AppInner() {
  const { theme, palette } = useTheme();
  const [entryDismissed, setEntryDismissed] = useState(false);
  const [activeTab, setActiveTab] = useState<NavTab>('today');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [completions, setCompletions] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showLoadingScreen, setShowLoadingScreen] = useState(true);
  
  // Completion animation hook
  const { state: animationState, triggerAnimation, resetAnimation } = useCompletionAnimation();

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

  // Handle task toggle with celebration animation
  const handleToggleTask = useCallback(async (taskId: string, event?: React.MouseEvent) => {
    const today = new Date();
    const wasCompleted = completions.has(taskId);
    
    // Find the task to get its category
    const task = tasks.find(t => t.id === taskId);

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

    // Trigger celebration animation if completing (not uncompleting)
    if (!wasCompleted && task) {
      const originX = event?.clientX;
      const originY = event?.clientY;
      triggerAnimation(task.category, originX, originY);
    }

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
  }, [completions, tasks, triggerAnimation]);

  // Handle add task
  const handleAddTask = () => {
    setEditingTask(null);
    setShowTaskModal(true);
  };

  // Handle edit task
  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setShowTaskModal(true);
  };

  // Handle delete task
  const handleDeleteTask = async (taskId: string) => {
    try {
      await deleteTask(taskId);
      // Real-time subscription will update the list
    } catch (err) {
      console.error('Failed to delete task:', err);
    }
  };

  // Handle modal close
  const handleModalClose = () => {
    setShowTaskModal(false);
    setEditingTask(null);
  };

  // Handle task saved (refresh happens automatically via subscription)
  const handleTaskSaved = () => {
    // Real-time subscription will update the task list automatically
  };

  // Get today's tasks for the Today view
  const todaysTasks = getTodaysTasks(tasks);

  // Error state (show after loading screen)
  if (error && !showLoadingScreen && entryDismissed) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-6"
        style={{ background: LUNAR_PAGE_BGS[palette] }}
      >
        <div className="text-center">
          <h1 style={{ fontFamily: theme.serifH, fontSize: 28, fontStyle: 'italic', color: '#f87171', marginBottom: 16 }}>Oops</h1>
          <p style={{ color: theme.inkSoft, marginBottom: 16 }}>{error}</p>
          <button
            onClick={() => window.location.reload()}
            style={{
              all: 'unset', cursor: 'pointer',
              padding: '10px 20px', borderRadius: 10,
              background: theme.accentSoft, border: `1px solid ${theme.accent}`,
              color: theme.accent, fontFamily: theme.sans,
            }}
          >
            Refresh
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Galaxy entry screen - shows first */}
      {!entryDismissed && (
        <EntryScreen onEnter={() => setEntryDismissed(true)} />
      )}

      {/* Ethereal loading screen - after entry dismissed */}
      {entryDismissed && (
        <LoadingScreen 
          isLoading={loading} 
          onLoadComplete={() => setShowLoadingScreen(false)}
          minDisplayTime={1400}
        />
      )}
      
      {/* Main app content */}
      {entryDismissed && !showLoadingScreen && (
        <div
          style={{
            background: LUNAR_PAGE_BGS[palette],
            minHeight: '100vh',
            transition: 'background 600ms',
          }}
        >
          {/* Page content based on active tab */}
          {activeTab === 'today' && (
            <TodayPage 
              tasks={todaysTasks}
              completions={completions}
              onToggleTask={handleToggleTask}
              onAddTask={handleAddTask}
              onEditTask={handleEditTask}
              onDeleteTask={handleDeleteTask}
            />
          )}
          
          {activeTab === 'tasks' && (
            <TasksPage 
              tasks={tasks}
              completions={completions}
              onToggleTask={handleToggleTask}
              onAddTask={handleAddTask}
              onEditTask={handleEditTask}
              onDeleteTask={handleDeleteTask}
            />
          )}
          
          {activeTab === 'settings' && (
            <SettingsPage />
          )}

          {/* Bottom navigation */}
          <BottomNav 
            activeTab={activeTab} 
            onTabChange={setActiveTab} 
          />

          {/* Task Modal (Add/Edit) */}
          <AddTaskModal
            isOpen={showTaskModal}
            onClose={handleModalClose}
            onTaskSaved={handleTaskSaved}
            editingTask={editingTask}
          />
          
          {/* Completion celebration animation */}
          <CompletionAnimation
            trigger={animationState.trigger}
            category={animationState.category}
            originX={animationState.originX}
            originY={animationState.originY}
            onComplete={resetAnimation}
          />
        </div>
      )}
    </>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AppInner />
    </ThemeProvider>
  );
}

export default App;
