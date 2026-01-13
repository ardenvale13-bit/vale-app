import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ijmtmswuihggrxqklcge.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || '';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const WEBHOOK_SECRET = process.env.LINCOLN_WEBHOOK_SECRET || 'vale-lincoln-1989';

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

// Parse body - handle Zapier's weird formatting
function parseBody(reqBody: any): WebhookPayload | null {
  // If it's already a proper object with 'secret', use it
  if (reqBody?.secret) {
    return reqBody as WebhookPayload;
  }
  
  // If Zapier sent it nested in 'data' as a string, parse it
  if (reqBody?.data && typeof reqBody.data === 'string') {
    try {
      return JSON.parse(reqBody.data) as WebhookPayload;
    } catch {
      // Maybe it's URL encoded, try to parse
      const params = new URLSearchParams(reqBody.data);
      const secret = params.get('secret');
      const action = params.get('action') as WebhookPayload['action'];
      const taskStr = params.get('task');
      
      if (secret && action) {
        let task: TaskPayload | undefined;
        if (taskStr) {
          try {
            task = JSON.parse(taskStr);
          } catch {
            // ignore
          }
        }
        return { secret, action, task };
      }
    }
  }
  
  // If Zapier sent it as nested 'data' object
  if (reqBody?.data && typeof reqBody.data === 'object') {
    return reqBody.data as WebhookPayload;
  }
  
  return null;
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
    const body = parseBody(req.body);

    // Debug logging
    console.log('Raw body:', JSON.stringify(req.body));
    console.log('Parsed body:', JSON.stringify(body));

    if (!body) {
      return res.status(400).json({ 
        error: 'Invalid request body',
        received: req.body 
      });
    }

    // Verify secret
    if (body.secret !== WEBHOOK_SECRET) {
      return res.status(401).json({ 
        error: 'Unauthorized',
        debug: {
          receivedSecret: body.secret ? 'present but wrong' : 'missing',
        }
      });
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
