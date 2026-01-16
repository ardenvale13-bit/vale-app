import { supabase } from './supabase';

// Push subscription database types
export interface DbPushSubscription {
  id: string;
  endpoint: string;
  keys_p256dh: string;
  keys_auth: string;
  created_at: string;
  updated_at: string;
  active: boolean;
  user_agent: string | null;
  device_name: string | null;
}

/**
 * Save a push subscription to the database
 */
export async function savePushSubscription(
  subscription: PushSubscription,
  deviceName?: string
): Promise<DbPushSubscription | null> {
  const subscriptionJson = subscription.toJSON();
  
  if (!subscriptionJson.endpoint || !subscriptionJson.keys) {
    console.error('[PushAPI] Invalid subscription format');
    return null;
  }

  const { data, error } = await supabase
    .from('push_subscriptions')
    .upsert({
      endpoint: subscriptionJson.endpoint,
      keys_p256dh: subscriptionJson.keys.p256dh,
      keys_auth: subscriptionJson.keys.auth,
      user_agent: navigator.userAgent,
      device_name: deviceName || 'Unknown Device',
      updated_at: new Date().toISOString(),
      active: true
    }, {
      onConflict: 'endpoint'
    })
    .select()
    .single();

  if (error) {
    console.error('[PushAPI] Failed to save subscription:', error);
    return null;
  }

  console.log('[PushAPI] Subscription saved:', data.id);
  return data;
}

/**
 * Remove a push subscription from the database
 */
export async function removePushSubscription(endpoint: string): Promise<boolean> {
  const { error } = await supabase
    .from('push_subscriptions')
    .update({ active: false })
    .eq('endpoint', endpoint);

  if (error) {
    console.error('[PushAPI] Failed to remove subscription:', error);
    return false;
  }

  return true;
}

/**
 * Get all active push subscriptions
 */
export async function getActiveSubscriptions(): Promise<DbPushSubscription[]> {
  const { data, error } = await supabase
    .from('push_subscriptions')
    .select('*')
    .eq('active', true);

  if (error) {
    console.error('[PushAPI] Failed to fetch subscriptions:', error);
    return [];
  }

  return data || [];
}

/**
 * Check if a subscription exists and is active
 */
export async function isSubscriptionActive(endpoint: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('push_subscriptions')
    .select('active')
    .eq('endpoint', endpoint)
    .single();

  if (error || !data) {
    return false;
  }

  return data.active;
}
