import { supabase } from './supabase';
import type { DbTask, DbCompletion } from './supabase';

// Get all active (non-archived) tasks
export async function fetchTasks(): Promise<DbTask[]> {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('archived', false)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching tasks:', error);
    throw error;
  }

  return data || [];
}

// Get completions for a specific date
export async function fetchCompletionsForDate(date: Date): Promise<DbCompletion[]> {
  const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD

  const { data, error } = await supabase
    .from('completions')
    .select('*')
    .eq('scheduled_for', dateStr);

  if (error) {
    console.error('Error fetching completions:', error);
    throw error;
  }

  return data || [];
}

// Mark a task as complete for today
export async function completeTask(taskId: string, scheduledFor: Date): Promise<DbCompletion> {
  const dateStr = scheduledFor.toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('completions')
    .insert({
      task_id: taskId,
      scheduled_for: dateStr,
    })
    .select()
    .single();

  if (error) {
    console.error('Error completing task:', error);
    throw error;
  }

  return data;
}

// Uncomplete a task (delete the completion record)
export async function uncompleteTask(taskId: string, scheduledFor: Date): Promise<void> {
  const dateStr = scheduledFor.toISOString().split('T')[0];

  const { error } = await supabase
    .from('completions')
    .delete()
    .eq('task_id', taskId)
    .eq('scheduled_for', dateStr);

  if (error) {
    console.error('Error uncompleting task:', error);
    throw error;
  }
}

// Create a new task (for Lincoln's webhook later)
export async function createTask(task: Partial<DbTask>): Promise<DbTask> {
  const { data, error } = await supabase
    .from('tasks')
    .insert(task)
    .select()
    .single();

  if (error) {
    console.error('Error creating task:', error);
    throw error;
  }

  return data;
}

// Archive a task (soft delete)
export async function archiveTask(taskId: string): Promise<void> {
  const { error } = await supabase
    .from('tasks')
    .update({ archived: true })
    .eq('id', taskId);

  if (error) {
    console.error('Error archiving task:', error);
    throw error;
  }
}

// Hard delete a task
export async function deleteTask(taskId: string): Promise<void> {
  // First delete any completions for this task
  await supabase
    .from('completions')
    .delete()
    .eq('task_id', taskId);

  // Then delete the task itself
  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', taskId);

  if (error) {
    console.error('Error deleting task:', error);
    throw error;
  }
}

// Update an existing task
export async function updateTask(taskId: string, updates: Partial<DbTask>): Promise<DbTask> {
  const { data, error } = await supabase
    .from('tasks')
    .update(updates)
    .eq('id', taskId)
    .select()
    .single();

  if (error) {
    console.error('Error updating task:', error);
    throw error;
  }

  return data;
}

// Subscribe to real-time task changes
export function subscribeToTasks(callback: (tasks: DbTask[]) => void) {
  const channel = supabase
    .channel('tasks-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'tasks',
      },
      async () => {
        // Refetch all tasks when any change occurs
        const tasks = await fetchTasks();
        callback(tasks);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
