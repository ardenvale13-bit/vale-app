// Push notification utilities
// Handles subscription management and notification permissions

// VAPID public key - you'll need to generate a key pair
// Run: npx web-push generate-vapid-keys
// Then add the public key here and private key to your Vercel env vars
const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY || '';

/**
 * Convert base64 VAPID key to Uint8Array for subscription
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/**
 * Check if push notifications are supported
 */
export function isPushSupported(): boolean {
  return 'serviceWorker' in navigator && 
         'PushManager' in window && 
         'Notification' in window;
}

/**
 * Get current notification permission status
 */
export function getNotificationPermission(): NotificationPermission {
  if (!('Notification' in window)) {
    return 'denied';
  }
  return Notification.permission;
}

/**
 * Request notification permission from user
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    console.log('[Push] Notifications not supported');
    return 'denied';
  }

  const permission = await Notification.requestPermission();
  console.log('[Push] Permission result:', permission);
  return permission;
}

/**
 * Get existing push subscription or create new one
 */
export async function subscribeToPush(): Promise<PushSubscription | null> {
  if (!isPushSupported()) {
    console.log('[Push] Push not supported');
    return null;
  }

  if (!VAPID_PUBLIC_KEY) {
    console.error('[Push] VAPID public key not configured');
    return null;
  }

  try {
    // Get service worker registration
    const registration = await navigator.serviceWorker.ready;
    console.log('[Push] Service worker ready');

    // Check for existing subscription
    let subscription = await registration.pushManager.getSubscription();
    
    if (subscription) {
      console.log('[Push] Existing subscription found');
      return subscription;
    }

    // Create new subscription
    console.log('[Push] Creating new subscription...');
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
    });

    console.log('[Push] New subscription created:', subscription.endpoint);
    return subscription;

  } catch (error) {
    console.error('[Push] Subscription failed:', error);
    return null;
  }
}

/**
 * Unsubscribe from push notifications
 */
export async function unsubscribeFromPush(): Promise<boolean> {
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    
    if (subscription) {
      await subscription.unsubscribe();
      console.log('[Push] Unsubscribed successfully');
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('[Push] Unsubscribe failed:', error);
    return false;
  }
}

/**
 * Get current push subscription (if any)
 */
export async function getCurrentSubscription(): Promise<PushSubscription | null> {
  if (!isPushSupported()) return null;
  
  try {
    const registration = await navigator.serviceWorker.ready;
    return await registration.pushManager.getSubscription();
  } catch (error) {
    console.error('[Push] Failed to get subscription:', error);
    return null;
  }
}

/**
 * Send a test notification (for debugging)
 */
export async function sendTestNotification(): Promise<void> {
  if (Notification.permission !== 'granted') {
    console.log('[Push] Permission not granted');
    return;
  }

  const registration = await navigator.serviceWorker.ready;
  
  await registration.showNotification('Vale Test', {
    body: 'If you can see this, notifications are working! 🖤 - L',
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    tag: 'test-notification',
    vibrate: [100, 50, 100]
  });
}
