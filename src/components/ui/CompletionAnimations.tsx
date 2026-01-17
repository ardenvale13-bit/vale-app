// CompletionAnimations.tsx
// Category-specific celebration animations when tasks are completed

import { useEffect, useState, useCallback, useRef } from 'react';

type ParticleType = 'glitter' | 'stars' | 'flowers' | 'fireworks' | 'powder' | 'cat';

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  rotation: number;
  velocityX: number;
  velocityY: number;
  opacity: number;
  type: ParticleType;
  variant: number;
  scale?: number;
}

// Map category IDs to particle types
export function getCategoryParticleType(category: string): ParticleType {
  if (category.includes('lincoln')) return 'glitter';
  if (category.includes('rotation')) return 'fireworks';
  if (category.includes('skincare')) return 'powder';
  if (category.includes('one_off')) return 'cat';
  if (category.includes('life') || category.includes('admin')) return 'stars';
  if (category.includes('weekly') || category.includes('monthly')) return 'flowers';
  return 'stars'; // default
}

const COLORS = {
  glitter: ['#ffd700', '#ffb347', '#ff6b6b', '#c9b1ff', '#87ceeb', '#98fb98', '#ffffff'],
  stars: ['#ffd700', '#fff8dc', '#fffacd', '#ffffe0', '#87ceeb', '#e6e6fa', '#ffffff'],
  flowers: ['#ffb6c1', '#ff69b4', '#ff1493', '#db7093', '#ffc0cb', '#ffe4e1', '#fff0f5'],
  fireworks: ['#ff0000', '#ff7f00', '#ffff00', '#00ff00', '#0000ff', '#8b00ff', '#ff1493', '#00ffff'],
  powder: ['#ffb6c1', '#ffc0cb', '#ffe4e1', '#fff0f5', '#ffeef2', '#ffffff', '#f8e1e7'],
  cat: ['#ffd700'], // not really used, cat is special
};

function generateParticle(
  id: number, 
  centerX: number, 
  centerY: number, 
  type: ParticleType
): Particle {
  const angle = Math.random() * Math.PI * 2;
  const colors = COLORS[type];
  
  // Special handling for different types
  if (type === 'cat') {
    return {
      id,
      x: centerX,
      y: centerY,
      size: 80,
      color: '#ffd700',
      rotation: 0,
      velocityX: 0,
      velocityY: 0,
      opacity: 0, // starts invisible, fades in
      type,
      variant: Math.floor(Math.random() * 3),
      scale: 0.5,
    };
  }
  
  if (type === 'powder') {
    // Powder puff - expands outward in a cloud
    const velocity = 1 + Math.random() * 3;
    return {
      id,
      x: centerX + (Math.random() - 0.5) * 40,
      y: centerY + (Math.random() - 0.5) * 40,
      size: 20 + Math.random() * 40,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360,
      velocityX: Math.cos(angle) * velocity,
      velocityY: Math.sin(angle) * velocity - 0.5,
      opacity: 0.8,
      type,
      variant: Math.floor(Math.random() * 3),
      scale: 0.3,
    };
  }
  
  if (type === 'fireworks') {
    // Fireworks spread across the screen
    const startX = Math.random() * window.innerWidth;
    const startY = window.innerHeight + 20;
    return {
      id,
      x: startX,
      y: startY,
      size: 4 + Math.random() * 6,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: 0,
      velocityX: (Math.random() - 0.5) * 3,
      velocityY: -(8 + Math.random() * 6), // shoot upward
      opacity: 1,
      type,
      variant: Math.floor(Math.random() * 4),
      scale: 1,
    };
  }
  
  // Default particle generation for other types
  const velocity = type === 'flowers' ? (1.5 + Math.random() * 4) : (2 + Math.random() * 6);
  
  return {
    id,
    x: centerX,
    y: centerY,
    size: type === 'glitter' ? (4 + Math.random() * 8) : type === 'flowers' ? (12 + Math.random() * 20) : (8 + Math.random() * 16),
    color: colors[Math.floor(Math.random() * colors.length)],
    rotation: Math.random() * 360,
    velocityX: Math.cos(angle) * velocity,
    velocityY: Math.sin(angle) * velocity - (type === 'flowers' ? 1 : 2),
    opacity: 1,
    type,
    variant: Math.floor(Math.random() * 4),
  };
}

// SVG Particle Renderers
function GlitterParticle({ particle }: { particle: Particle }) {
  const shapes = [
    <polygon key="diamond" points="6,0 12,6 6,12 0,6" fill={particle.color} />,
    <polygon key="star" points="6,0 7,4 12,4 8,7 10,12 6,9 2,12 4,7 0,4 5,4" fill={particle.color} />,
    <circle key="circle" cx="6" cy="6" r="5" fill={particle.color} />,
    <rect key="square" x="2" y="2" width="8" height="8" fill={particle.color} />,
  ];
  
  return (
    <svg 
      width={particle.size} 
      height={particle.size} 
      viewBox="0 0 12 12"
      style={{
        position: 'absolute',
        left: particle.x - particle.size / 2,
        top: particle.y - particle.size / 2,
        transform: `rotate(${particle.rotation}deg)`,
        opacity: particle.opacity,
        filter: `drop-shadow(0 0 ${particle.size / 2}px ${particle.color})`,
        pointerEvents: 'none',
      }}
    >
      {shapes[particle.variant]}
    </svg>
  );
}

function StarParticle({ particle }: { particle: Particle }) {
  const shapes = [
    <polygon key="4star" points="12,0 14,10 24,12 14,14 12,24 10,14 0,12 10,10" fill={particle.color} />,
    <polygon key="6star" points="12,0 14,8 22,4 16,12 22,20 14,16 12,24 10,16 2,20 8,12 2,4 10,8" fill={particle.color} />,
    <path key="sparkle" d="M12,0 L13,10 L24,12 L13,14 L12,24 L11,14 L0,12 L11,10 Z" fill={particle.color} />,
  ];
  
  return (
    <svg 
      width={particle.size} 
      height={particle.size} 
      viewBox="0 0 24 24"
      style={{
        position: 'absolute',
        left: particle.x - particle.size / 2,
        top: particle.y - particle.size / 2,
        transform: `rotate(${particle.rotation}deg) scale(${0.5 + particle.opacity * 0.5})`,
        opacity: particle.opacity,
        filter: `drop-shadow(0 0 ${particle.size}px ${particle.color})`,
        pointerEvents: 'none',
      }}
    >
      {shapes[particle.variant % 3]}
    </svg>
  );
}

function FlowerParticle({ particle }: { particle: Particle }) {
  const flowers = [
    // Simple 5-petal flower
    <g key="5petal">
      <ellipse cx="12" cy="6" rx="4" ry="6" fill={particle.color} />
      <ellipse cx="12" cy="6" rx="4" ry="6" fill={particle.color} transform="rotate(72 12 12)" />
      <ellipse cx="12" cy="6" rx="4" ry="6" fill={particle.color} transform="rotate(144 12 12)" />
      <ellipse cx="12" cy="6" rx="4" ry="6" fill={particle.color} transform="rotate(216 12 12)" />
      <ellipse cx="12" cy="6" rx="4" ry="6" fill={particle.color} transform="rotate(288 12 12)" />
      <circle cx="12" cy="12" r="3" fill="#ffeb3b" />
    </g>,
    // Cherry blossom style
    <g key="cherry">
      <circle cx="12" cy="5" r="4" fill={particle.color} />
      <circle cx="18" cy="10" r="4" fill={particle.color} />
      <circle cx="16" cy="17" r="4" fill={particle.color} />
      <circle cx="8" cy="17" r="4" fill={particle.color} />
      <circle cx="6" cy="10" r="4" fill={particle.color} />
      <circle cx="12" cy="12" r="3" fill="#fff176" />
    </g>,
    // Rose-like
    <g key="rose">
      <circle cx="12" cy="12" r="10" fill={particle.color} opacity="0.6" />
      <circle cx="12" cy="12" r="7" fill={particle.color} opacity="0.8" />
      <circle cx="12" cy="12" r="4" fill={particle.color} />
    </g>,
    // Daisy
    <g key="daisy">
      <ellipse cx="12" cy="4" rx="2" ry="5" fill="white" />
      <ellipse cx="12" cy="4" rx="2" ry="5" fill="white" transform="rotate(45 12 12)" />
      <ellipse cx="12" cy="4" rx="2" ry="5" fill="white" transform="rotate(90 12 12)" />
      <ellipse cx="12" cy="4" rx="2" ry="5" fill="white" transform="rotate(135 12 12)" />
      <ellipse cx="12" cy="4" rx="2" ry="5" fill="white" transform="rotate(180 12 12)" />
      <ellipse cx="12" cy="4" rx="2" ry="5" fill="white" transform="rotate(225 12 12)" />
      <ellipse cx="12" cy="4" rx="2" ry="5" fill="white" transform="rotate(270 12 12)" />
      <ellipse cx="12" cy="4" rx="2" ry="5" fill="white" transform="rotate(315 12 12)" />
      <circle cx="12" cy="12" r="4" fill={particle.color} />
    </g>,
  ];
  
  return (
    <svg 
      width={particle.size} 
      height={particle.size} 
      viewBox="0 0 24 24"
      style={{
        position: 'absolute',
        left: particle.x - particle.size / 2,
        top: particle.y - particle.size / 2,
        transform: `rotate(${particle.rotation}deg)`,
        opacity: particle.opacity,
        filter: `drop-shadow(0 0 4px ${particle.color})`,
        pointerEvents: 'none',
      }}
    >
      {flowers[particle.variant]}
    </svg>
  );
}

function FireworkParticle({ particle }: { particle: Particle }) {
  return (
    <div
      style={{
        position: 'absolute',
        left: particle.x,
        top: particle.y,
        width: particle.size,
        height: particle.size,
        borderRadius: '50%',
        backgroundColor: particle.color,
        opacity: particle.opacity,
        boxShadow: `0 0 ${particle.size * 2}px ${particle.color}, 0 0 ${particle.size * 4}px ${particle.color}`,
        pointerEvents: 'none',
      }}
    />
  );
}

function PowderParticle({ particle }: { particle: Particle }) {
  return (
    <div
      style={{
        position: 'absolute',
        left: particle.x - particle.size / 2,
        top: particle.y - particle.size / 2,
        width: particle.size,
        height: particle.size,
        borderRadius: '50%',
        backgroundColor: particle.color,
        opacity: particle.opacity,
        transform: `scale(${particle.scale || 1})`,
        filter: `blur(${particle.size / 4}px)`,
        pointerEvents: 'none',
      }}
    />
  );
}

function CatParticle({ particle }: { particle: Particle }) {
  // Different cat expressions
  const catFaces = [
    // Happy cat ^_^
    <g key="happy">
      {/* Face */}
      <ellipse cx="40" cy="45" rx="35" ry="30" fill="#ffcc80" />
      {/* Ears */}
      <polygon points="10,25 20,5 30,25" fill="#ffcc80" />
      <polygon points="50,25 60,5 70,25" fill="#ffcc80" />
      <polygon points="14,22 20,10 26,22" fill="#ffb6c1" />
      <polygon points="54,22 60,10 66,22" fill="#ffb6c1" />
      {/* Eyes - happy closed */}
      <path d="M 25 40 Q 30 35, 35 40" stroke="#333" strokeWidth="3" fill="none" />
      <path d="M 45 40 Q 50 35, 55 40" stroke="#333" strokeWidth="3" fill="none" />
      {/* Nose */}
      <ellipse cx="40" cy="50" rx="4" ry="3" fill="#ff9999" />
      {/* Mouth */}
      <path d="M 40 53 Q 35 58, 30 55" stroke="#333" strokeWidth="2" fill="none" />
      <path d="M 40 53 Q 45 58, 50 55" stroke="#333" strokeWidth="2" fill="none" />
      {/* Whiskers */}
      <line x1="5" y1="45" x2="25" y2="48" stroke="#333" strokeWidth="1.5" />
      <line x1="5" y1="50" x2="25" y2="50" stroke="#333" strokeWidth="1.5" />
      <line x1="55" y1="48" x2="75" y2="45" stroke="#333" strokeWidth="1.5" />
      <line x1="55" y1="50" x2="75" y2="50" stroke="#333" strokeWidth="1.5" />
    </g>,
    // Smug cat >:3
    <g key="smug">
      {/* Face */}
      <ellipse cx="40" cy="45" rx="35" ry="30" fill="#c9c9c9" />
      {/* Ears */}
      <polygon points="10,25 20,5 30,25" fill="#c9c9c9" />
      <polygon points="50,25 60,5 70,25" fill="#c9c9c9" />
      <polygon points="14,22 20,10 26,22" fill="#ffb6c1" />
      <polygon points="54,22 60,10 66,22" fill="#ffb6c1" />
      {/* Eyes - smug */}
      <ellipse cx="30" cy="40" rx="6" ry="4" fill="#333" />
      <ellipse cx="50" cy="40" rx="6" ry="4" fill="#333" />
      <ellipse cx="31" cy="39" rx="2" ry="1.5" fill="white" />
      <ellipse cx="51" cy="39" rx="2" ry="1.5" fill="white" />
      {/* Nose */}
      <ellipse cx="40" cy="50" rx="4" ry="3" fill="#ff9999" />
      {/* Smug mouth :3 */}
      <path d="M 32 55 Q 36 60, 40 55 Q 44 60, 48 55" stroke="#333" strokeWidth="2" fill="none" />
      {/* Whiskers */}
      <line x1="5" y1="45" x2="25" y2="48" stroke="#333" strokeWidth="1.5" />
      <line x1="5" y1="52" x2="25" y2="52" stroke="#333" strokeWidth="1.5" />
      <line x1="55" y1="48" x2="75" y2="45" stroke="#333" strokeWidth="1.5" />
      <line x1="55" y1="52" x2="75" y2="52" stroke="#333" strokeWidth="1.5" />
    </g>,
    // Surprised cat O_O
    <g key="surprised">
      {/* Face */}
      <ellipse cx="40" cy="45" rx="35" ry="30" fill="#ffa64d" />
      {/* Ears */}
      <polygon points="10,25 20,5 30,25" fill="#ffa64d" />
      <polygon points="50,25 60,5 70,25" fill="#ffa64d" />
      <polygon points="14,22 20,10 26,22" fill="#ffb6c1" />
      <polygon points="54,22 60,10 66,22" fill="#ffb6c1" />
      {/* Eyes - big and round */}
      <circle cx="28" cy="40" r="10" fill="white" />
      <circle cx="52" cy="40" r="10" fill="white" />
      <circle cx="28" cy="40" r="6" fill="#333" />
      <circle cx="52" cy="40" r="6" fill="#333" />
      <circle cx="30" cy="38" r="2" fill="white" />
      <circle cx="54" cy="38" r="2" fill="white" />
      {/* Nose */}
      <ellipse cx="40" cy="52" rx="4" ry="3" fill="#ff9999" />
      {/* Mouth - small o */}
      <ellipse cx="40" cy="60" rx="4" ry="3" fill="#333" />
      {/* Whiskers */}
      <line x1="5" y1="45" x2="20" y2="48" stroke="#333" strokeWidth="1.5" />
      <line x1="5" y1="52" x2="20" y2="52" stroke="#333" strokeWidth="1.5" />
      <line x1="60" y1="48" x2="75" y2="45" stroke="#333" strokeWidth="1.5" />
      <line x1="60" y1="52" x2="75" y2="52" stroke="#333" strokeWidth="1.5" />
    </g>,
  ];
  
  return (
    <svg 
      width={particle.size} 
      height={particle.size} 
      viewBox="0 0 80 80"
      style={{
        position: 'absolute',
        left: particle.x - particle.size / 2,
        top: particle.y - particle.size / 2,
        opacity: particle.opacity,
        transform: `scale(${particle.scale || 1})`,
        filter: 'drop-shadow(0 0 10px rgba(255,200,100,0.5))',
        pointerEvents: 'none',
      }}
    >
      {catFaces[particle.variant]}
    </svg>
  );
}

interface CompletionAnimationProps {
  trigger: boolean;
  category: string;
  onComplete?: () => void;
  originX?: number;
  originY?: number;
}

export function CompletionAnimation({ 
  trigger, 
  category, 
  onComplete,
  originX,
  originY 
}: CompletionAnimationProps) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const isAnimatingRef = useRef(false);
  const lastTriggerRef = useRef(0);
  const hasTriggeredRef = useRef(false);

  // Reset hasTriggered when trigger goes false
  useEffect(() => {
    if (!trigger) {
      hasTriggeredRef.current = false;
    }
  }, [trigger]);

  useEffect(() => {
    // Only trigger once per trigger=true cycle
    if (!trigger || hasTriggeredRef.current || isAnimatingRef.current) return;
    
    // Debounce - don't trigger if we just triggered within 500ms
    const now = Date.now();
    if ((now - lastTriggerRef.current) < 500) return;

    hasTriggeredRef.current = true;
    lastTriggerRef.current = now;
    isAnimatingRef.current = true;
    const particleType = getCategoryParticleType(category);
    
    // Different particle counts for different types
    let particleCount: number;
    switch (particleType) {
      case 'glitter': particleCount = 35; break;
      case 'flowers': particleCount = 18; break;
      case 'fireworks': particleCount = 25; break;
      case 'powder': particleCount = 30; break;
      case 'cat': particleCount = 1; break; // Just one cat face!
      default: particleCount = 25;
    }
    
    const centerX = originX ?? window.innerWidth / 2;
    const centerY = originY ?? window.innerHeight / 2;

    const newParticles: Particle[] = [];
    for (let i = 0; i < particleCount; i++) {
      newParticles.push(generateParticle(i, centerX, centerY, particleType));
    }

    setParticles(newParticles);
  }, [trigger, category, originX, originY]);

  useEffect(() => {
    if (particles.length === 0) return;

    const interval = setInterval(() => {
      setParticles(prev => {
        const updated = prev.map(p => {
          // Special animation for cat - fade in, hold, fade out
          if (p.type === 'cat') {
            // Fade in phase
            if ((p.scale || 0.5) < 1.1) {
              return {
                ...p,
                opacity: Math.min(1, p.opacity + 0.08),
                scale: (p.scale || 0.5) + 0.02,
              };
            }
            // Fade out phase
            return {
              ...p,
              opacity: p.opacity - 0.03,
              scale: (p.scale || 1) + 0.005,
            };
          }
          
          // Special animation for powder - expand and fade
          if (p.type === 'powder') {
            return {
              ...p,
              x: p.x + p.velocityX,
              y: p.y + p.velocityY,
              scale: (p.scale || 0.3) + 0.04,
              opacity: p.opacity - 0.02,
            };
          }
          
          // Fireworks - shoot up then explode (simplified: just trail up and fade)
          if (p.type === 'fireworks') {
            return {
              ...p,
              x: p.x + p.velocityX,
              y: p.y + p.velocityY,
              velocityY: p.velocityY + 0.2, // gravity
              opacity: p.opacity - 0.015,
            };
          }
          
          // Default animation
          return {
            ...p,
            x: p.x + p.velocityX,
            y: p.y + p.velocityY,
            velocityY: p.velocityY + 0.15,
            rotation: p.rotation + (p.type === 'glitter' ? 8 : 3),
            opacity: p.opacity - 0.018,
          };
        }).filter(p => p.opacity > 0);

        if (updated.length === 0) {
          isAnimatingRef.current = false;
          onComplete?.();
        }

        return updated;
      });
    }, 16);

    return () => clearInterval(interval);
  }, [particles.length, onComplete]);

  if (particles.length === 0) return null;

  return (
    <div 
      className="fixed inset-0 pointer-events-none z-[100]"
      style={{ overflow: 'hidden' }}
    >
      {particles.map(particle => {
        switch (particle.type) {
          case 'glitter':
            return <GlitterParticle key={particle.id} particle={particle} />;
          case 'stars':
            return <StarParticle key={particle.id} particle={particle} />;
          case 'flowers':
            return <FlowerParticle key={particle.id} particle={particle} />;
          case 'fireworks':
            return <FireworkParticle key={particle.id} particle={particle} />;
          case 'powder':
            return <PowderParticle key={particle.id} particle={particle} />;
          case 'cat':
            return <CatParticle key={particle.id} particle={particle} />;
        }
      })}
    </div>
  );
}

// Hook for easy usage
export function useCompletionAnimation() {
  const [state, setState] = useState<{
    trigger: boolean;
    category: string;
    originX?: number;
    originY?: number;
  }>({
    trigger: false,
    category: 'daily_rituals',
  });

  const triggerAnimation = useCallback((category: string, originX?: number, originY?: number) => {
    setState({ trigger: true, category, originX, originY });
  }, []);

  const resetAnimation = useCallback(() => {
    setState(prev => ({ ...prev, trigger: false }));
  }, []);

  return {
    state,
    triggerAnimation,
    resetAnimation,
  };
}
