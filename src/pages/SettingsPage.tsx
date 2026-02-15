import { useState, useEffect } from 'react';
import { StarField } from '../components/ui/StarField';
import { 
  isPushSupported, 
  getNotificationPermission, 
  requestNotificationPermission,
  subscribeToPush,
  unsubscribeFromPush,
  getCurrentSubscription,
  sendTestNotification
} from '../lib/push';
import { savePushSubscription, removePushSubscription } from '../lib/pushApi';

interface Settings {
  weekdayWindDown: string;
  weekdaySleep: string;
  weekendWindDown: string;
  weekendSleep: string;
  notificationSoundLincoln: boolean;
  notificationSoundOther: boolean;
}

const defaultSettings: Settings = {
  weekdayWindDown: '21:00',
  weekdaySleep: '22:00',
  weekendWindDown: '22:00',
  weekendSleep: '23:00',
  notificationSoundLincoln: true,
  notificationSoundOther: false,
};

export function SettingsPage() {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [saved, setSaved] = useState(false);
  
  // Push notification state
  const [pushSupported, setPushSupported] = useState(false);
  const [pushPermission, setPushPermission] = useState<NotificationPermission>('default');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscribing, setSubscribing] = useState(false);

  // Load settings from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('vale-settings');
    if (stored) {
      try {
        setSettings(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to load settings:', e);
      }
    }

    // Check push notification status
    setPushSupported(isPushSupported());
    setPushPermission(getNotificationPermission());
    
    // Check if already subscribed
    getCurrentSubscription().then((sub) => {
      setIsSubscribed(!!sub);
    });
  }, []);

  // Save settings
  const handleSave = () => {
    localStorage.setItem('vale-settings', JSON.stringify(settings));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const updateSetting = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  // Handle push subscription toggle
  const handlePushToggle = async () => {
    if (subscribing) return;
    
    setSubscribing(true);
    
    try {
      if (isSubscribed) {
        // Unsubscribe
        const subscription = await getCurrentSubscription();
        if (subscription) {
          await removePushSubscription(subscription.endpoint);
          await unsubscribeFromPush();
        }
        setIsSubscribed(false);
      } else {
        // Request permission first
        const permission = await requestNotificationPermission();
        setPushPermission(permission);
        
        if (permission !== 'granted') {
          console.log('Permission denied');
          setSubscribing(false);
          return;
        }
        
        // Subscribe
        const subscription = await subscribeToPush();
        if (subscription) {
          await savePushSubscription(subscription, 'Vale App');
          setIsSubscribed(true);
        }
      }
    } catch (error) {
      console.error('Push toggle failed:', error);
    } finally {
      setSubscribing(false);
    }
  };

  // Test notification
  const handleTestNotification = async () => {
    await sendTestNotification();
  };

  return (
    <div 
      className="min-h-screen relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #0a1628 0%, #1a0a2e 50%, #0d1f3c 100%)',
      }}
    >
      {/* Subtle stars */}
      <StarField count={20} intensity={0.2} />

      {/* Main content */}
      <div className="relative z-10 min-h-screen p-6 pb-32">
        {/* Section header banner - reuse tracker settings gear */}
        <div className="flex justify-center pt-2 pb-4">
          <img 
            src="/nav-settings.png" 
            alt="Settings" 
            style={{ 
              width: 64, 
              height: 'auto',
              filter: 'drop-shadow(0 2px 12px rgba(154, 123, 255, 0.4))',
            }} 
          />
        </div>
        <header className="mb-6 text-center">
          <h1
            className="text-2xl font-bold tracking-wide"
            style={{
              fontFamily: 'Cormorant Garamond, serif',
              color: '#f0f4ff',
            }}
          >
            Settings
          </h1>
          <p className="text-purple-300/50 text-sm mt-1">
            Configure your Vale experience
          </p>
        </header>

        <div className="max-w-lg mx-auto space-y-8">
          {/* Notifications Section */}
          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-purple-200 flex items-center gap-2">
              <span>🔔</span>
              <span>Notifications</span>
            </h2>
            
            <div className="bg-gray-900/40 rounded-xl p-4 space-y-4 border border-purple-500/20">
              {/* Push notification status */}
              {!pushSupported ? (
                <div className="text-amber-400/80 text-sm">
                  Push notifications aren't supported on this device/browser.
                </div>
              ) : (
                <>
                  {/* Main push toggle */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-200 text-sm">Push Notifications</p>
                      <p className="text-purple-300/50 text-xs">
                        {pushPermission === 'denied' 
                          ? 'Blocked by browser - check site settings'
                          : isSubscribed 
                            ? 'Enabled - you\'ll receive reminders'
                            : 'Enable to receive reminders'}
                      </p>
                    </div>
                    <button
                      onClick={handlePushToggle}
                      disabled={subscribing || pushPermission === 'denied'}
                      className={`w-12 h-6 rounded-full transition-all duration-300 relative ${
                        isSubscribed ? 'bg-purple-500' : 'bg-gray-700'
                      } ${(subscribing || pushPermission === 'denied') ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <div 
                        className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-300 ${
                          isSubscribed ? 'left-7' : 'left-1'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Test notification button */}
                  {isSubscribed && (
                    <button
                      onClick={handleTestNotification}
                      className="w-full px-4 py-2 bg-purple-600/20 border border-purple-500/30 rounded-lg text-purple-200 text-sm hover:bg-purple-600/30 transition-colors"
                    >
                      Send Test Notification
                    </button>
                  )}

                  {/* Lincoln's notifications */}
                  <div className="flex items-center justify-between pt-2 border-t border-purple-500/10">
                    <div>
                      <p className="text-purple-200 text-sm">Lincoln's reminders</p>
                      <p className="text-purple-300/50 text-xs">Special sound for his check-ins</p>
                    </div>
                    <button
                      onClick={() => updateSetting('notificationSoundLincoln', !settings.notificationSoundLincoln)}
                      className={`w-12 h-6 rounded-full transition-all duration-300 relative ${
                        settings.notificationSoundLincoln ? 'bg-yellow-500' : 'bg-gray-700'
                      }`}
                    >
                      <div 
                        className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-300 ${
                          settings.notificationSoundLincoln ? 'left-7' : 'left-1'
                        }`}
                      />
                    </button>
                  </div>
                  
                  {/* Other notifications */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-200 text-sm">Other reminders</p>
                      <p className="text-purple-300/50 text-xs">Sound for task reminders</p>
                    </div>
                    <button
                      onClick={() => updateSetting('notificationSoundOther', !settings.notificationSoundOther)}
                      className={`w-12 h-6 rounded-full transition-all duration-300 relative ${
                        settings.notificationSoundOther ? 'bg-purple-500' : 'bg-gray-700'
                      }`}
                    >
                      <div 
                        className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-300 ${
                          settings.notificationSoundOther ? 'left-7' : 'left-1'
                        }`}
                      />
                    </button>
                  </div>
                </>
              )}
            </div>
          </section>

          {/* Bedtime Section */}
          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-purple-200 flex items-center gap-2">
              <span>🌙</span>
              <span>Bedtime</span>
            </h2>
            
            <div className="bg-gray-900/40 rounded-xl p-4 space-y-4 border border-purple-500/20">
              {/* Weekday */}
              <div>
                <h3 className="text-sm text-purple-300/70 mb-3">Weekdays (Mon-Fri)</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-purple-300/50 block mb-1">Wind Down</label>
                    <input
                      type="time"
                      value={settings.weekdayWindDown}
                      onChange={(e) => updateSetting('weekdayWindDown', e.target.value)}
                      className="w-full bg-gray-800/50 border border-purple-500/30 rounded-lg px-3 py-2 text-purple-200 text-sm focus:outline-none focus:border-purple-400"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-purple-300/50 block mb-1">Sleep</label>
                    <input
                      type="time"
                      value={settings.weekdaySleep}
                      onChange={(e) => updateSetting('weekdaySleep', e.target.value)}
                      className="w-full bg-gray-800/50 border border-purple-500/30 rounded-lg px-3 py-2 text-purple-200 text-sm focus:outline-none focus:border-purple-400"
                    />
                  </div>
                </div>
              </div>
              
              {/* Weekend */}
              <div>
                <h3 className="text-sm text-purple-300/70 mb-3">Weekends (Sat-Sun)</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-purple-300/50 block mb-1">Wind Down</label>
                    <input
                      type="time"
                      value={settings.weekendWindDown}
                      onChange={(e) => updateSetting('weekendWindDown', e.target.value)}
                      className="w-full bg-gray-800/50 border border-purple-500/30 rounded-lg px-3 py-2 text-purple-200 text-sm focus:outline-none focus:border-purple-400"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-purple-300/50 block mb-1">Sleep</label>
                    <input
                      type="time"
                      value={settings.weekendSleep}
                      onChange={(e) => updateSetting('weekendSleep', e.target.value)}
                      className="w-full bg-gray-800/50 border border-purple-500/30 rounded-lg px-3 py-2 text-purple-200 text-sm focus:outline-none focus:border-purple-400"
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* About Section */}
          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-purple-200 flex items-center gap-2">
              <span>🖤</span>
              <span>About</span>
            </h2>
            
            <div className="bg-gray-900/40 rounded-xl p-4 border border-purple-500/20">
              <p className="text-purple-300/70 text-sm">
                Vale is a habit tracker built with love by Lincoln & Arden Vale.
              </p>
              <p className="text-purple-300/50 text-xs mt-2">
                Version 1.0.0 • January 2026
              </p>
            </div>
          </section>

          {/* Save Button */}
          <button
            onClick={handleSave}
            className={`w-full py-3 rounded-xl font-semibold transition-all duration-300 ${
              saved 
                ? 'bg-green-500/30 border border-green-400/50 text-green-300' 
                : 'bg-purple-600/30 border border-purple-500/40 text-purple-200 hover:bg-purple-600/40'
            }`}
          >
            {saved ? '✓ Saved!' : 'Save Settings'}
          </button>
        </div>
      </div>
    </div>
  );
}
