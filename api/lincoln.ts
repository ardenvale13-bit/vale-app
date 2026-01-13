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

// Extract payload from raw body string
function extractPayload(rawBody: string): WebhookPayload | null {
  if (!rawBody) return null;
  
  let str = rawBody.trim();
  
  // Strip 'data' prefix if present (Zapier MCP bug)
  if (str.startsWith('data{')) {
    str = str.substring(4);
  }
  
  // Try to parse as JSON
  if (str.startsWith('{')) {
    try {
      return JSON.parse(str);
    } catch {
      return null;
    }
  }
  
  return null;
}

export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request): Promise<Response> {
  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    // Get raw body text - no automatic parsing!
    const rawBody = await req.text();
    
    const payload = extractPayload(rawBody);

    if (!payload) {
      return new Response(JSON.stringify({ 
        error: 'Could not parse body',
        received: rawBody.substring(0, 200)
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (payload.secret !== WEBHOOK_SECRET) {
      return new Response(JSON.stringify({ 
        error: 'Unauthorized',
        debug: {
          receivedSecret: payload.secret,
          expectedSecret: WEBHOOK_SECRET,
          rawBodyPreview: rawBody.substring(0, 100)
        }
      }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    switch (payload.action) {
      case 'add': {
        if (!payload.task?.title) {
          return new Response(JSON.stringify({ error: 'Task title required' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
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
          return new Response(JSON.stringify({ error: 'Failed to create task', details: error.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        return new Response(JSON.stringify({ 
          success: true, 
          message: `Task "${payload.task.title}" created`,
          task: data 
        }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'complete': {
        if (!payload.task_title) {
          return new Response(JSON.stringify({ error: 'Task title required' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        const { data: task } = await supabase
          .from('tasks')
          .select('id')
          .ilike('title', payload.task_title)
          .single();

        if (!task) {
          return new Response(JSON.stringify({ error: 'Task not found' }), {
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        await supabase.from('completions').insert({
          task_id: task.id,
          scheduled_for: new Date().toISOString().split('T')[0],
        });

        return new Response(JSON.stringify({ success: true, message: 'Task completed' }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'message':
        return new Response(JSON.stringify({ success: true, message: 'Message received' }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      default:
        return new Response(JSON.stringify({ error: 'Invalid action' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Internal server error', details: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}
