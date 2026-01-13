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

// Parse the body from various cursed formats
function extractPayload(body: any, rawBodyStr?: string): WebhookPayload | null {
  // 1. Already a proper object with secret
  if (body?.secret) {
    return body as WebhookPayload;
  }
  
  // 2. Nested in 'data' field as object
  if (body?.data && typeof body.data === 'object' && body.data.secret) {
    return body.data as WebhookPayload;
  }
  
  // 3. Nested in 'data' field as string (might have 'data' prefix from Zapier bug)
  if (body?.data && typeof body.data === 'string') {
    let str = body.data;
    if (str.startsWith('data')) str = str.substring(4);
    try {
      return JSON.parse(str) as WebhookPayload;
    } catch {}
  }
  
  // 4. Body is a string itself
  if (typeof body === 'string') {
    let str = body;
    if (str.startsWith('data')) str = str.substring(4);
    try {
      return JSON.parse(str) as WebhookPayload;
    } catch {}
  }
  
  // 5. Raw body string provided separately
  if (rawBodyStr) {
    let str = rawBodyStr;
    if (str.startsWith('data')) str = str.substring(4);
    try {
      return JSON.parse(str) as WebhookPayload;
    } catch {}
  }
  
  // 6. Check object keys (Zapier might send 'data{"secret":...' as a KEY)
  if (body && typeof body === 'object') {
    for (const key of Object.keys(body)) {
      let str = key;
      if (str.startsWith('data')) str = str.substring(4);
      if (str.startsWith('{')) {
        try {
          return JSON.parse(str) as WebhookPayload;
        } catch {}
      }
    }
  }
  
  return null;
}

// Collect raw body chunks
async function collectBody(req: VercelRequest): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks).toString('utf8');
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    // Collect raw body since bodyParser is disabled
    const rawBodyStr = await collectBody(req);
    
    // Try to parse it
    let parsedBody: any = null;
    
    // First try direct JSON parse
    try {
      parsedBody = JSON.parse(rawBodyStr);
    } catch {
      // If starts with 'data', strip it and try again
      if (rawBodyStr.startsWith('data{')) {
        try {
          parsedBody = JSON.parse(rawBodyStr.substring(4));
        } catch {
          // Still failed
        }
      }
    }
    
    // Try to get payload
    const payload = extractPayload(parsedBody, rawBodyStr);
    
    console.log('req.body:', JSON.stringify(req.body));
    console.log('rawBodyStr:', rawBodyStr);
    console.log('payload:', JSON.stringify(payload));

    if (!payload) {
      return res.status(400).json({ 
        error: 'Could not parse request body',
        receivedBody: req.body,
        receivedRaw: rawBodyStr.substring(0, 200)
      });
    }

    // Verify secret
    if (payload.secret !== WEBHOOK_SECRET) {
      return res.status(401).json({ 
        error: 'Unauthorized',
        hint: payload.secret ? 'wrong secret' : 'no secret found'
      });
    }

    // Handle actions
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

        if (!task) {
          return res.status(404).json({ error: 'Task not found' });
        }

        const today = new Date().toISOString().split('T')[0];
        await supabase.from('completions').insert({
          task_id: task.id,
          scheduled_for: today,
        });

        return res.status(200).json({ 
          success: true, 
          message: `Task "${payload.task_title}" marked complete` 
        });
      }

      case 'message': {
        return res.status(200).json({ 
          success: true, 
          message: 'Message received',
          content: payload.message 
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

export const config = {
  api: {
    bodyParser: false,
  },
};
