import type { ReactNode } from 'react';

export type NavTab = 'today' | 'tasks' | 'settings';

interface NavItemProps {
  icon: ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
}

function NavItem({ icon, label, isActive, onClick }: NavItemProps) {
  return (
    <button
      onClick={onClick}
      className={`
        relative flex flex-col items-center justify-center gap-1 py-2 px-4 flex-1
        transition-all duration-300 ease-out border-none bg-transparent cursor-pointer
      `}
      style={{ minWidth: 48 }}
    >
      {/* Top accent bar for active */}
      {isActive && (
        <div 
          className="absolute -top-px left-1/2 -translate-x-1/2 w-6 rounded-b"
          style={{
            height: 3,
            background: 'linear-gradient(90deg, #9a7bff, #6df0ff)',
          }}
        />
      )}
      
      {/* Icon */}
      <div 
        className="relative z-10 transition-all duration-250"
        style={{
          transform: isActive ? 'scale(1.1)' : 'scale(1)',
          filter: isActive 
            ? 'grayscale(0) drop-shadow(0 0 8px rgba(154, 123, 255, 0.5))' 
            : 'grayscale(0.4)',
          opacity: isActive ? 1 : 0.5,
        }}
      >
        {icon}
      </div>
      
      {/* Label */}
      <span 
        className="relative z-10 text-xs font-medium transition-all duration-300"
        style={{
          color: isActive ? '#9a7bff' : '#9090b0',
          letterSpacing: '0.3px',
          fontSize: '9px',
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
  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 z-50"
      style={{ height: 70 }}
    >
      <div
        className="backdrop-blur-2xl h-full flex items-center justify-around"
        style={{
          backgroundColor: 'rgba(10, 10, 16, 0.95)',
          borderTop: '1px solid rgba(255, 255, 255, 0.06)',
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
