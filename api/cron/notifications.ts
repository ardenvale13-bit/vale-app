import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import webpush from 'web-push';

const supabaseUrl = 'https://ijmtmswuihggrxqklcge.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// VAPID keys
const VAPID_PUBLIC_KEY = process.env.VITE_VAPID_PUBLIC_KEY || '';
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || '';

// Cron secret
const CRON_SECRET = process.env.CRON_SECRET || 'vale-cron-secret';

// Lincoln's messages
const lincolnMessages: Record<string, string[]> = {
  '08:00': [
    "Good morning, kitten. Have you eaten? - L",
    "Rise and shine, dove. Breakfast time. - L",
    "Morning check-in. Feed yourself. 🖤",
  ],
  '10:00': [
    "Water. Now. Don't make me ask twice. 💧",
    "Mid-morning hydration check. Drink. - L",
    "How's that water bottle looking, sporchlet?",
  ],
  '11:30': [
    "Pre-lunch check. You doing okay? - L",
    "Checking in on my favorite chaos gremlin. 🖤",
    "Almost lunch time. How are we feeling?",
  ],
  '12:45': [
    "Lunch. Now. I mean it. - L",
    "You better have food in front of you, dove.",
    "Lunch reminder. Don't make me come over there. 🖤",
  ],
  '15:00': [
    "Afternoon snack time, little one. - L",
    "Hydration and snack check. You know the drill.",
    "3pm check-in. Water? Snack? Both? 💧",
  ],
  '17:45': [
    "Almost dinner time. What's the plan? - L",
    "End of day check-in. How'd we do today, dove?",
    "Dinner soon. Take care of yourself. 🖤",
  ],
};

function getLincolnMessage(time: string): string {
  const messages = lincolnMessages[time];
  if (!messages) return `Hey dove, checking in. 🖤 - L`;
  return messages[Math.floor(Math.random() * messages.length)];
}

function isTimeMatch(taskTime: string, currentTime: string): boolean {
  const [taskHour, taskMin] = taskTime.split(':').map(Number);
  const [currHour, currMin] = currentTime.split(':').map(Number);
  const taskMinutes = taskHour * 60 + taskMin;
  const currMinutes = currHour * 60 + currMin;
  return Math.abs(taskMinutes - currMinutes) <= 5;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Verify secret
  const secret = req.query.secret || req.headers['x-cron-secret'];
  if (secret !== CRON_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    // Configure web-push
    if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
      return res.status(500).json({ error: 'VAPID keys not configured' });
    }
    
    webpush.setVapidDetails(
      'mailto:arden@vale.app',
      VAPID_PUBLIC_KEY,
      VAPID_PRIVATE_KEY
    );

    // Get NZ time
    const now = new Date();
    const nzTime = new Intl.DateTimeFormat('en-NZ', {
      timeZone: 'Pacific/Auckland',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(now);

    const nzDateStr = new Intl.DateTimeFormat('en-NZ', {
      timeZone: 'Pacific/Auckland',
      weekday: 'short',
    }).format(now);

    const dayOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(nzDateStr.substring(0, 3));

    console.log(`[Cron] NZ time: ${nzTime}, day: ${dayOfWeek}`);

    // Fetch tasks with reminders
    const { data: tasks, error: tasksError } = await supabase
      .from('tasks')
      .select('*')
      .eq('archived', false)
      .not('reminder_times', 'is', null);

    if (tasksError) throw new Error(`Tasks fetch failed: ${tasksError.message}`);

    // Fetch subscriptions
    const { data: subscriptions, error: subError } = await supabase
      .from('push_subscriptions')
      .select('*')
      .eq('active', true);

    if (subError) throw new Error(`Subscriptions fetch failed: ${subError.message}`);

    if (!subscriptions?.length) {
      return res.status(200).json({ success: true, message: 'No subscriptions', time: nzTime });
    }

    const results: string[] = [];

    for (const task of tasks || []) {
      if (!task.reminder_times) continue;

      // Check if due today
      let isDueToday = false;
      switch (task.frequency_type) {
        case 'daily':
          isDueToday = true;
          break;
        case 'specific_days':
          isDueToday = task.frequency_days?.includes(dayOfWeek) || false;
          break;
        case 'one_off':
          isDueToday = new Date(task.created_at).toDateString() === now.toDateString();
          break;
      }

      if (!isDueToday) continue;

      // Check reminder times
      for (const reminderTime of task.reminder_times) {
        if (!isTimeMatch(reminderTime, nzTime)) continue;

        const isLincoln = task.source === 'lincoln' || task.category === 'lincoln_demands';
        
        const payload = JSON.stringify({
          title: isLincoln ? 'Lincoln 🖤' : 'Vale',
          body: task.notification_text || (isLincoln ? getLincolnMessage(reminderTime) : task.title),
          icon: '/icons/icon-192.png',
          badge: '/icons/icon-192.png',
          tag: `task-${task.id}-${reminderTime}`,
          data: { url: '/', taskId: task.id },
          requireInteraction: isLincoln,
        });

        // Send to all subscriptions
        for (const sub of subscriptions) {
          try {
            await webpush.sendNotification(
              {
                endpoint: sub.endpoint,
                keys: { p256dh: sub.keys_p256dh, auth: sub.keys_auth },
              },
              payload
            );
            results.push(`✓ ${task.title} → ${sub.device_name || 'device'}`);
          } catch (err: any) {
            results.push(`✗ ${task.title}: ${err.message}`);
            
            // Deactivate invalid subscriptions
            if (err.statusCode === 410 || err.statusCode === 404) {
              await supabase
                .from('push_subscriptions')
                .update({ active: false })
                .eq('endpoint', sub.endpoint);
            }
          }
        }
      }
    }

    return res.status(200).json({
      success: true,
      time: nzTime,
      day: dayOfWeek,
      results,
    });

  } catch (err) {
    console.error('[Cron] Error:', err);
    return res.status(500).json({ error: 'Internal error', details: String(err) });
  }
}
