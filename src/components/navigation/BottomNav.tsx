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
        flex flex-col items-center justify-center gap-1 py-2 px-4 
        transition-all duration-300 relative flex-1
        ${isActive ? 'text-purple-300' : 'text-purple-300/40'}
      `}
    >
      {/* Active indicator glow */}
      {isActive && (
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at center bottom, rgba(183, 148, 246, 0.15) 0%, transparent 70%)',
          }}
        />
      )}
      
      {/* Icon */}
      <div className={`text-xl transition-transform duration-300 ${isActive ? 'scale-110' : 'scale-100'}`}>
        {icon}
      </div>
      
      {/* Label */}
      <span className={`text-xs font-medium tracking-wide ${isActive ? 'opacity-100' : 'opacity-60'}`}>
        {label}
      </span>
      
      {/* Active dot */}
      {isActive && (
        <div 
          className="absolute bottom-1 w-1 h-1 rounded-full"
          style={{
            backgroundColor: '#b794f6',
            boxShadow: '0 0 8px rgba(183, 148, 246, 0.8)',
          }}
        />
      )}
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
      className="fixed bottom-0 left-0 right-0 z-50 backdrop-blur-xl border-t"
      style={{
        backgroundColor: 'rgba(10, 22, 40, 0.9)',
        borderColor: 'rgba(183, 148, 246, 0.2)',
      }}
    >
      <div className="flex items-center justify-around max-w-lg mx-auto">
        <NavItem
          icon={<span>✨</span>}
          label="Today"
          isActive={activeTab === 'today'}
          onClick={() => onTabChange('today')}
        />
        <NavItem
          icon={<span>📋</span>}
          label="Tasks"
          isActive={activeTab === 'tasks'}
          onClick={() => onTabChange('tasks')}
        />
        <NavItem
          icon={<span>⚙️</span>}
          label="Settings"
          isActive={activeTab === 'settings'}
          onClick={() => onTabChange('settings')}
        />
      </div>
      
      {/* Safe area padding for phones with gesture bars */}
      <div className="h-safe-area-inset-bottom" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }} />
    </nav>
  );
}
