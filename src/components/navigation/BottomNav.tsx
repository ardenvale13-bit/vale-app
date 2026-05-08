import { useTheme } from '../../theme/ThemeContext';
import { MoonPhase } from '../ui/MoonPhase';

export type NavTab = 'today' | 'tasks' | 'settings';

interface BottomNavProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
}

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  const { theme } = useTheme();

  const items: { id: NavTab; label: string; icon: 'moon' | 'list' | 'gear' }[] = [
    { id: 'today',    label: 'Today',   icon: 'moon' },
    { id: 'tasks',    label: 'Library', icon: 'list' },
    { id: 'settings', label: 'Tune',    icon: 'gear' },
  ];

  return (
    <nav style={{
      position: 'fixed', left: 0, right: 0, bottom: 0,
      padding: '12px 16px calc(12px + env(safe-area-inset-bottom, 0px))',
      display: 'flex', justifyContent: 'space-around',
      background: `linear-gradient(180deg, transparent 0%, ${theme.bgDeep}d9 50%)`,
      backdropFilter: 'blur(12px)',
      borderTop: `1px solid ${theme.rule}`,
      zIndex: 50,
    }}>
      {items.map(i => {
        const active = activeTab === i.id;
        return (
          <button
            key={i.id}
            onClick={() => onTabChange(i.id)}
            style={{
              all: 'unset', cursor: 'pointer',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', gap: 4, padding: '4px 14px',
            }}
          >
            <span style={{
              width: 22, height: 22,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {i.icon === 'moon' && (
                <MoonPhase
                  size={18}
                  phase={active ? 1 : 0.35}
                  litColor={active ? theme.accent : theme.inkSoft}
                  darkColor="rgba(232,228,242,0.12)"
                />
              )}
              {i.icon === 'list' && (
                <svg width="18" height="18" viewBox="0 0 18 18">
                  <line x1="3" y1="5"  x2="15" y2="5"  stroke={active ? theme.accent : theme.inkSoft} strokeWidth="1.5" strokeLinecap="round" />
                  <line x1="3" y1="9"  x2="15" y2="9"  stroke={active ? theme.accent : theme.inkSoft} strokeWidth="1.5" strokeLinecap="round" />
                  <line x1="3" y1="13" x2="11" y2="13" stroke={active ? theme.accent : theme.inkSoft} strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              )}
              {i.icon === 'gear' && (
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <circle cx="9" cy="9" r="2.5" stroke={active ? theme.accent : theme.inkSoft} strokeWidth="1.5" />
                  <path
                    d="M9 1v2M9 15v2M1 9h2M15 9h2M3 3l1.5 1.5M13.5 13.5L15 15M3 15l1.5-1.5M13.5 4.5L15 3"
                    stroke={active ? theme.accent : theme.inkSoft}
                    strokeWidth="1.5" strokeLinecap="round"
                  />
                </svg>
              )}
            </span>
            <span style={{
              fontFamily: theme.sans, fontSize: 9,
              letterSpacing: '0.16em', textTransform: 'uppercase',
              color: active ? theme.accent : theme.inkFaint,
            }}>{i.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
