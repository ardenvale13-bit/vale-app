import type { ReactNode } from 'react';

export type NavTab = 'today' | 'tasks' | 'settings';

// Clean SVG icons instead of emojis
const icons = {
  today: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>
      <path d="M19 3v4"/>
      <path d="M21 5h-4"/>
    </svg>
  ),
  tasks: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/>
      <line x1="16" x2="16" y1="2" y2="6"/>
      <line x1="8" x2="8" y1="2" y2="6"/>
      <line x1="3" x2="21" y1="10" y2="10"/>
      <path d="m9 16 2 2 4-4"/>
    </svg>
  ),
  settings: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  ),
};

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
        relative flex flex-col items-center justify-center gap-1.5 py-3 px-5 flex-1
        transition-all duration-300 ease-out
        ${isActive ? 'text-cyan-300' : 'text-slate-400'}
      `}
    >
      {/* Glow effect for active tab */}
      {isActive && (
        <>
          {/* Outer glow */}
          <div 
            className="absolute inset-0 rounded-xl pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse at center, rgba(34, 211, 238, 0.12) 0%, transparent 70%)',
            }}
          />
          {/* Bottom accent bar */}
          <div 
            className="absolute bottom-2 left-1/2 -translate-x-1/2 w-8 h-1 rounded-full"
            style={{
              background: 'linear-gradient(90deg, #22d3ee, #14b8a6)',
              boxShadow: '0 0 12px rgba(34, 211, 238, 0.6)',
            }}
          />
        </>
      )}
      
      {/* Icon */}
      <div 
        className={`
          relative z-10 transition-all duration-300
          ${isActive ? 'scale-110' : 'scale-100'}
        `}
        style={{
          filter: isActive ? 'drop-shadow(0 0 6px rgba(34, 211, 238, 0.5))' : 'none',
        }}
      >
        {icon}
      </div>
      
      {/* Label */}
      <span 
        className={`
          relative z-10 text-xs font-medium tracking-wide transition-all duration-300
          ${isActive ? 'opacity-100' : 'opacity-60'}
        `}
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
    >
      {/* Top gradient border */}
      <div 
        className="h-px"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(34, 211, 238, 0.3), transparent)',
        }}
      />
      
      {/* Main nav - thicker, more substantial */}
      <div
        className="backdrop-blur-xl border-t"
        style={{
          backgroundColor: 'rgba(10, 22, 40, 0.95)',
          borderColor: 'rgba(71, 85, 105, 0.3)',
        }}
      >
        <div className="flex items-center justify-around max-w-lg mx-auto">
          <NavItem
            icon={icons.today}
            label="Today"
            isActive={activeTab === 'today'}
            onClick={() => onTabChange('today')}
          />
          <NavItem
            icon={icons.tasks}
            label="Tasks"
            isActive={activeTab === 'tasks'}
            onClick={() => onTabChange('tasks')}
          />
          <NavItem
            icon={icons.settings}
            label="Settings"
            isActive={activeTab === 'settings'}
            onClick={() => onTabChange('settings')}
          />
        </div>
        
        {/* Safe area padding for phones with gesture bars */}
        <div style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }} />
      </div>
    </nav>
  );
}
