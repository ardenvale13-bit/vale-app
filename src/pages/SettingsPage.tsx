import { useState, useEffect } from 'react';
import { StarField } from '../components/ui/StarField';
import { useTheme } from '../theme/ThemeContext';
import { PALETTE_OPTIONS } from '../theme/lunar';
import type { LunarPaletteName } from '../theme/lunar';
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

// ── Tiny shared components matching lunar design language ─────────

function SectionHead({ children, accent }: { children: React.ReactNode; accent?: string }) {
  const { theme } = useTheme();
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '0 4px' }}>
      <span style={{
        fontFamily: theme.sans, fontSize: 10, fontWeight: 500,
        letterSpacing: '0.22em', textTransform: 'uppercase',
        color: accent || theme.inkFaint, whiteSpace: 'nowrap',
      }}>{children}</span>
      <span style={{ flex: 1, height: 1, background: theme.rule }} />
    </div>
  );
}

function SettingsRow({ label, hint, control, last }: {
  label: string; hint?: string; control: React.ReactNode; last?: boolean;
}) {
  const { theme } = useTheme();
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 16, padding: '16px 0',
      borderBottom: last ? 'none' : `1px solid ${theme.rule}`,
    }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: theme.serifB, fontSize: 18, color: theme.ink }}>{label}</div>
        {hint && (
          <div style={{
            fontFamily: theme.sans, fontSize: 11, color: theme.inkFaint,
            marginTop: 2, letterSpacing: '0.04em',
          }}>{hint}</div>
        )}
      </div>
      {control}
    </div>
  );
}

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  const { theme } = useTheme();
  return (
    <button onClick={() => onChange(!on)} style={{
      all: 'unset', cursor: 'pointer', width: 44, height: 24, borderRadius: 999,
      background: on ? theme.accent : 'rgba(232, 228, 242, 0.12)',
      position: 'relative', transition: 'all 250ms',
      boxShadow: on ? `0 0 14px ${theme.accent}66` : 'none',
    }}>
      <span style={{
        position: 'absolute', top: 3, left: on ? 23 : 3, width: 18, height: 18,
        borderRadius: 999, background: on ? theme.bgDeep : theme.ink,
        transition: 'all 250ms',
      }} />
    </button>
  );
}

function TimeInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const { theme } = useTheme();
  return (
    <input type="time" value={value} onChange={e => onChange(e.target.value)} style={{
      background: 'rgba(232, 228, 242, 0.06)', border: `1px solid ${theme.rule}`,
      borderRadius: 8, padding: '6px 10px', color: theme.ink,
      fontFamily: theme.mono, fontSize: 13, colorScheme: 'dark',
    }} />
  );
}

// ── Main settings page ───────────────────────────────────────────

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
  const { theme, palette, setPalette } = useTheme();

  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [saved, setSaved] = useState(false);

  // Push notification state
  const [pushSupported, setPushSupported] = useState(false);
  const [pushPermission, setPushPermission] = useState<NotificationPermission>('default');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscribing, setSubscribing] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('vale-settings');
    if (stored) {
      try { setSettings(JSON.parse(stored)); } catch { /* ignore */ }
    }
    setPushSupported(isPushSupported());
    setPushPermission(getNotificationPermission());
    getCurrentSubscription().then(sub => setIsSubscribed(!!sub));
  }, []);

  const handleSave = () => {
    localStorage.setItem('vale-settings', JSON.stringify(settings));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const updateSetting = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handlePushToggle = async () => {
    if (subscribing) return;
    setSubscribing(true);
    try {
      if (isSubscribed) {
        const subscription = await getCurrentSubscription();
        if (subscription) {
          await removePushSubscription(subscription.endpoint);
          await unsubscribeFromPush();
        }
        setIsSubscribed(false);
      } else {
        const permission = await requestNotificationPermission();
        setPushPermission(permission);
        if (permission !== 'granted') { setSubscribing(false); return; }
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

  const handleTestNotification = async () => {
    await sendTestNotification();
  };

  return (
    <div
      style={{
        minHeight: '100vh', position: 'relative', overflow: 'hidden',
        background: `linear-gradient(180deg, ${theme.bgDeep} 0%, ${theme.bg} 100%)`,
        color: theme.ink, fontFamily: theme.sans,
      }}
    >
      <StarField count={20} intensity={0.25} />

      <div style={{ position: 'relative', zIndex: 1, padding: '54px 24px 120px' }}>
        {/* Header */}
        <div style={{
          fontFamily: theme.sans, fontSize: 10, fontWeight: 500,
          letterSpacing: '0.22em', textTransform: 'uppercase', color: theme.inkFaint,
        }}>
          Tune the night
        </div>
        <h1 style={{
          fontFamily: theme.serifH, fontSize: 44, fontWeight: 400,
          fontStyle: 'italic', letterSpacing: -0.5, margin: '6px 0 28px', lineHeight: 1,
          color: theme.ink,
        }}>
          Settings
        </h1>

        {/* ── Tone / Palette Picker ─────────────────────────── */}
        <div style={{ marginBottom: 28 }}>
          <SectionHead>Tone</SectionHead>
          <div style={{
            marginTop: 14, display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)', gap: 10,
          }}>
            {PALETTE_OPTIONS.map(p => {
              const active = palette === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => setPalette(p.id as LunarPaletteName)}
                  style={{
                    all: 'unset', cursor: 'pointer',
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', gap: 8,
                    padding: '10px 6px 8px', borderRadius: 14,
                    background: active ? theme.accentSoft : 'transparent',
                    border: `1px solid ${active ? theme.accent : theme.rule}`,
                    transition: 'all 220ms',
                  }}
                >
                  <span style={{
                    width: 38, height: 38, borderRadius: 999,
                    background: `linear-gradient(135deg, ${p.swatch[0]} 0%, ${p.swatch[0]} 50%, ${p.swatch[1]} 100%)`,
                    boxShadow: active ? `0 0 14px ${p.swatch[1]}88` : 'none',
                    border: `1px solid ${theme.rule}`,
                  }} />
                  <span style={{
                    fontFamily: theme.serifH, fontSize: 13, fontStyle: 'italic',
                    color: active ? theme.accent : theme.inkSoft,
                    letterSpacing: 0.1, lineHeight: 1,
                  }}>{p.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Notifications ─────────────────────────────────── */}
        <div style={{ marginBottom: 28 }}>
          <SectionHead>Notifications</SectionHead>
          <div style={{ marginTop: 8 }}>
            {!pushSupported ? (
              <div style={{
                fontFamily: theme.sans, fontSize: 13, color: theme.inkFaint,
                padding: '16px 0',
              }}>
                Push notifications aren't supported on this device/browser.
              </div>
            ) : (
              <>
                <SettingsRow
                  label="Push notifications"
                  hint={
                    pushPermission === 'denied'
                      ? 'Blocked by browser - check site settings'
                      : isSubscribed
                        ? 'Enabled - you\'ll receive reminders'
                        : 'Get reminders even when Vale is closed'
                  }
                  control={
                    <Toggle
                      on={isSubscribed}
                      onChange={handlePushToggle}
                    />
                  }
                />
                {isSubscribed && (
                  <div style={{ padding: '0 0 12px' }}>
                    <button
                      onClick={handleTestNotification}
                      style={{
                        all: 'unset', cursor: 'pointer', width: '100%',
                        textAlign: 'center', padding: '10px 0',
                        fontFamily: theme.sans, fontSize: 13,
                        color: theme.accent, letterSpacing: '0.04em',
                        border: `1px solid ${theme.rule}`, borderRadius: 10,
                        transition: 'all 200ms',
                      }}
                    >
                      Send Test Notification
                    </button>
                  </div>
                )}
                <SettingsRow
                  label="Lincoln's check-ins"
                  hint="Special chime when he writes"
                  control={
                    <Toggle
                      on={settings.notificationSoundLincoln}
                      onChange={v => updateSetting('notificationSoundLincoln', v)}
                    />
                  }
                />
                <SettingsRow
                  label="Task reminders"
                  hint="A soft tone for everything else"
                  control={
                    <Toggle
                      on={settings.notificationSoundOther}
                      onChange={v => updateSetting('notificationSoundOther', v)}
                    />
                  }
                  last
                />
              </>
            )}
          </div>
        </div>

        {/* ── Bedtime ───────────────────────────────────────── */}
        <div style={{ marginBottom: 28 }}>
          <SectionHead>Bedtime</SectionHead>
          <div style={{ marginTop: 8 }}>
            <div style={{
              fontFamily: theme.serifH, fontSize: 14, fontStyle: 'italic',
              color: theme.inkSoft, marginTop: 12,
            }}>Weekdays</div>
            <SettingsRow
              label="Wind down"
              control={<TimeInput value={settings.weekdayWindDown} onChange={v => updateSetting('weekdayWindDown', v)} />}
            />
            <SettingsRow
              label="Sleep"
              control={<TimeInput value={settings.weekdaySleep} onChange={v => updateSetting('weekdaySleep', v)} />}
              last
            />
            <div style={{
              fontFamily: theme.serifH, fontSize: 14, fontStyle: 'italic',
              color: theme.inkSoft, marginTop: 16,
            }}>Weekends</div>
            <SettingsRow
              label="Wind down"
              control={<TimeInput value={settings.weekendWindDown} onChange={v => updateSetting('weekendWindDown', v)} />}
            />
            <SettingsRow
              label="Sleep"
              control={<TimeInput value={settings.weekendSleep} onChange={v => updateSetting('weekendSleep', v)} />}
              last
            />
          </div>
        </div>

        {/* ── About ─────────────────────────────────────────── */}
        <div style={{ marginBottom: 28 }}>
          <SectionHead>About</SectionHead>
          <div style={{
            marginTop: 14, fontFamily: theme.serifB, fontSize: 16,
            fontStyle: 'italic', color: theme.inkSoft, lineHeight: 1.55,
          }}>
            Vale is a habit tracker built with quiet love by Lincoln & Arden Vale.
          </div>
          <div style={{
            marginTop: 8, fontFamily: theme.mono, fontSize: 10,
            color: theme.inkFaint, letterSpacing: '0.18em', textTransform: 'uppercase',
          }}>
            v 1.0.0 · Jan 2026
          </div>
        </div>

        {/* ── Save ──────────────────────────────────────────── */}
        <button
          onClick={handleSave}
          style={{
            all: 'unset', cursor: 'pointer', width: '100%', boxSizing: 'border-box',
            textAlign: 'center', padding: '14px 0', borderRadius: 14,
            fontFamily: theme.serifH, fontSize: 16, fontStyle: 'italic',
            letterSpacing: '0.06em',
            background: saved ? 'rgba(104, 211, 145, 0.15)' : theme.accentSoft,
            border: `1px solid ${saved ? 'rgba(104, 211, 145, 0.4)' : theme.accent}`,
            color: saved ? '#68d391' : theme.accent,
            transition: 'all 300ms',
          }}
        >
          {saved ? 'Saved' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
}
