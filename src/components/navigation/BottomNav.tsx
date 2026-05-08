import type { ReactNode } from 'react';
import { useTheme } from '../../theme/ThemeContext';

export type NavTab = 'today' | 'tasks' | 'settings';

interface NavItemProps {
  icon: ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
}

function NavItem({ icon, label, isActive, onClick }: NavItemProps) {
  const { theme } = useTheme();
  return (
    <button
      onClick={onClick}
      className="relative flex flex-col items-center justify-center gap-1 py-2 px-4 flex-1 transition-all duration-300 ease-out border-none bg-transparent cursor-pointer"
      style={{ minWidth: 48 }}
    >
      {/* Top accent bar for active */}
      {isActive && (
        <div
          className="absolute -top-px left-1/2 -translate-x-1/2 w-6 rounded-b"
          style={{
            height: 3,
            background: theme.accent,
            boxShadow: `0 0 8px ${theme.accent}66`,
          }}
        />
      )}

      {/* Icon */}
      <div
        className="relative z-10 transition-all"
        style={{
          transform: isActive ? 'scale(1.1)' : 'scale(1)',
          filter: isActive
            ? `grayscale(0) drop-shadow(0 0 8px ${theme.accent}80)`
            : 'grayscale(0.4)',
          opacity: isActive ? 1 : 0.5,
          transition: 'all 250ms',
        }}
      >
        {icon}
      </div>

      {/* Label */}
      <span
        className="relative z-10 font-medium transition-all duration-300"
        style={{
          color: isActive ? theme.accent : theme.inkFaint,
          letterSpacing: '0.16em',
          fontSize: 9,
          textTransform: 'uppercase',
          fontFamily: theme.sans,
        }}
      >
        {label}
      </span>
    </button>
  );
}

interface BottomNavProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
}

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  const { theme } = useTheme();
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50"
      style={{ height: 70 }}
    >
      <div
        className="h-full flex items-center justify-around"
        style={{
          backgroundColor: `${theme.bgDeep}f2`,
          backdropFilter: 'blur(12px)',
          borderTop: `1px solid ${theme.rule}`,
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        }}
      >
        <NavItem
          icon={<img src="/nav-today.png" alt="" style={{ height: 28, width: 'auto' }} />}
          label="Today"
          isActive={activeTab === 'today'}
          onClick={() => onTabChange('today')}
        />
        <NavItem
          icon={<img src="/nav-tasks.png" alt="" style={{ height: 28, width: 'auto' }} />}
          label="Tasks"
          isActive={activeTab === 'tasks'}
          onClick={() => onTabChange('tasks')}
        />
        <NavItem
          icon={<img src="/nav-settings.png" alt="" style={{ height: 28, width: 'auto' }} />}
          label="Settings"
          isActive={activeTab === 'settings'}
          onClick={() => onTabChange('settings')}
        />
      </div>
    </nav>
  );
}
