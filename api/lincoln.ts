import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ijmtmswuihggrxqklcge.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || '';

// Use service key for server-side operations
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Simple secret for webhook authentication
const WEBHOOK_SECRET = process.env.LINCOLN_WEBHOOK_SECRET || 'vale-lincoln-2026';

interface WebhookPayload {
  secret: string;
  action: 'add' | 'complete' | 'remind' | 'message';
  task?: {
    title: string;
    description?: string;
    category?: string;
    notification_text?: string;
    reminder_time?: string;
    frequency_type?: 'daily' | 'specific_days' | 'first_x_of_month' | 'one_off';
    frequency_days?: number[];
  };
  task_title?: string; // For 'complete' action - match by title
  message?: string; // For 'message' action
}

export default async function handler(req: Request): Promise<Response> {
  // Only allow POST
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const body: WebhookPayload = await req.json();

    // Verify secret
    if (body.secret !== WEBHOOK_SECRET) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    switch (body.action) {
      case 'add': {
        if (!body.task?.title) {
          return new Response(JSON.stringify({ error: 'Task title required' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          });
        }

        const { data, error } = await supabase
          .from('tasks')
          .insert({
            title: body.task.title,
            description: body.task.description || null,
            category: body.task.category || 'lincoln_demands',
            source: 'lincoln',
            frequency_type: body.task.frequency_type || 'one_off',
            frequency_days: body.task.frequency_days || null,
            reminder_times: body.task.reminder_time ? [body.task.reminder_time] : null,
            notification_text: body.task.notification_text || null,
            archived: false,
          })
          .select()
          .single();

        if (error) {
          console.error('Supabase error:', error);
          return new Response(JSON.stringify({ error: 'Failed to create task' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
          });
        }

        return new Response(JSON.stringify({ 
          success: true, 
          message: `Task "${body.task.title}" created`,
          task: data 
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      case 'complete': {
        if (!body.task_title) {
          return new Response(JSON.stringify({ error: 'Task title required' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          });
        }

        // Find task by title
        const { data: task, error: findError } = await supabase
          .from('tasks')
          .select('id')
          .ilike('title', body.task_title)
          .single();

        if (findError || !task) {
          return new Response(JSON.stringify({ error: 'Task not found' }), {
            status: 404,
            headers: { 'Content-Type': 'application/json' },
          });
        }

        // Mark complete for today
        const today = new Date().toISOString().split('T')[0];
        const { error: completeError } = await supabase
          .from('completions')
          .insert({
            task_id: task.id,
            scheduled_for: today,
          });

        if (completeError) {
          return new Response(JSON.stringify({ error: 'Failed to complete task' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
          });
        }

        return new Response(JSON.stringify({ 
          success: true, 
          message: `Task "${body.task_title}" marked complete` 
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      case 'message': {
        // Future: Could store messages for Lincoln's Corner
        // For now, just acknowledge
        return new Response(JSON.stringify({ 
          success: true, 
          message: 'Message received',
          content: body.message 
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      default:
        return new Response(JSON.stringify({ error: 'Invalid action' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
    }
  } catch (err) {
    console.error('Webhook error:', err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export const config = {
  runtime: 'edge',
};
