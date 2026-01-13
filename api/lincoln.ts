import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ijmtmswuihggrxqklcge.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || '';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const WEBHOOK_SECRET = process.env.LINCOLN_WEBHOOK_SECRET || 'vale-lincoln-2026';

interface TaskPayload {
  title: string;
  description?: string;
  category?: string;
  notification_text?: string;
  reminder_time?: string;
  frequency_type?: 'daily' | 'specific_days' | 'first_x_of_month' | 'one_off';
  frequency_days?: number[];
}

interface WebhookPayload {
  secret: string;
  action: 'add' | 'complete' | 'remind' | 'message';
  task?: TaskPayload;
  task_title?: string;
  message?: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body: WebhookPayload = req.body;

    // Verify secret
    if (body.secret !== WEBHOOK_SECRET) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    switch (body.action) {
      case 'add': {
        if (!body.task?.title) {
          return res.status(400).json({ error: 'Task title required' });
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
          return res.status(500).json({ error: 'Failed to create task', details: error.message });
        }

        return res.status(200).json({ 
          success: true, 
          message: `Task "${body.task.title}" created`,
          task: data 
        });
      }

      case 'complete': {
        if (!body.task_title) {
          return res.status(400).json({ error: 'Task title required' });
        }

        const { data: task, error: findError } = await supabase
          .from('tasks')
          .select('id')
          .ilike('title', body.task_title)
          .single();

        if (findError || !task) {
          return res.status(404).json({ error: 'Task not found' });
        }

        const today = new Date().toISOString().split('T')[0];
        const { error: completeError } = await supabase
          .from('completions')
          .insert({
            task_id: task.id,
            scheduled_for: today,
          });

        if (completeError) {
          return res.status(500).json({ error: 'Failed to complete task' });
        }

        return res.status(200).json({ 
          success: true, 
          message: `Task "${body.task_title}" marked complete` 
        });
      }

      case 'message': {
        return res.status(200).json({ 
          success: true, 
          message: 'Message received',
          content: body.message 
        });
      }

      default:
        return res.status(400).json({ error: 'Invalid action' });
    }
  } catch (err) {
    console.error('Webhook error:', err);
    return res.status(500).json({ error: 'Internal server error', details: String(err) });
  }
}
