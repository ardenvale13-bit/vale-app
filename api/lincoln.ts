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

// Extract payload from various formats
function extractPayload(body: any): WebhookPayload | null {
  if (!body) return null;
  
  // Direct object with secret
  if (body.secret) return body;
  
  // Nested in data as object
  if (body.data?.secret) return body.data;
  
  // Nested in data as string
  if (typeof body.data === 'string') {
    let str = body.data;
    if (str.startsWith('data')) str = str.substring(4);
    try { return JSON.parse(str); } catch {}
  }
  
  // Check keys for JSON
  for (const key of Object.keys(body)) {
    let str = key;
    if (str.startsWith('data')) str = str.substring(4);
    if (str.startsWith('{')) {
      try { return JSON.parse(str); } catch {}
    }
  }
  
  return null;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const payload = extractPayload(req.body);
    
    if (!payload) {
      return res.status(400).json({ 
        error: 'Could not parse body',
        received: JSON.stringify(req.body).substring(0, 500)
      });
    }

    if (payload.secret !== WEBHOOK_SECRET) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    switch (payload.action) {
      case 'add': {
        if (!payload.task?.title) {
          return res.status(400).json({ error: 'Task title required' });
        }

        const { data, error } = await supabase
          .from('tasks')
          .insert({
            title: payload.task.title,
            description: payload.task.description || null,
            category: payload.task.category || 'lincoln_demands',
            source: 'lincoln',
            frequency_type: payload.task.frequency_type || 'one_off',
            frequency_days: payload.task.frequency_days || null,
            reminder_times: payload.task.reminder_time ? [payload.task.reminder_time] : null,
            notification_text: payload.task.notification_text || null,
            archived: false,
          })
          .select()
          .single();

        if (error) {
          return res.status(500).json({ error: 'Failed to create task', details: error.message });
        }

        return res.status(200).json({ 
          success: true, 
          message: `Task "${payload.task.title}" created`,
          task: data 
        });
      }

      case 'complete': {
        if (!payload.task_title) {
          return res.status(400).json({ error: 'Task title required' });
        }

        const { data: task } = await supabase
          .from('tasks')
          .select('id')
          .ilike('title', payload.task_title)
          .single();

        if (!task) return res.status(404).json({ error: 'Task not found' });

        await supabase.from('completions').insert({
          task_id: task.id,
          scheduled_for: new Date().toISOString().split('T')[0],
        });

        return res.status(200).json({ success: true, message: `Task completed` });
      }

      case 'message':
        return res.status(200).json({ success: true, message: 'Message received' });

      default:
        return res.status(400).json({ error: 'Invalid action' });
    }
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error', details: String(err) });
  }
}
