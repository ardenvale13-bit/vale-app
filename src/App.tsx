import { useState, useEffect, useCallback } from 'react';
import './App.css';
import { BottomNav, type NavTab } from './components/navigation/BottomNav';
import { TodayPage } from './pages/TodayPage';
import { TasksPage } from './pages/TasksPage';
import { SettingsPage } from './pages/SettingsPage';
import { AddTaskModal } from './components/tasks/AddTaskModal';
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

function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('today');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [completions, setCompletions] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

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
      className="min-h-screen"
      style={{
        background: 'linear-gradient(135deg, #0a1628 0%, #1a0a2e 50%, #0d1f3c 100%)',
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
    </div>
  );
}

export default App;
