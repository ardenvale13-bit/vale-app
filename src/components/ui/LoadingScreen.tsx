// LoadingScreen.tsx
// Ethereal loading screen with floating stars and Vale branding

import { useEffect, useState } from 'react';

interface Star {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
  speed: number;
  twinkleSpeed: number;
  twinklePhase: number;
}

interface LoadingScreenProps {
  isLoading: boolean;
  onLoadComplete?: () => void;
  minDisplayTime?: number;
}

export function LoadingScreen({ 
  isLoading, 
  onLoadComplete, 
  minDisplayTime = 1200 
}: LoadingScreenProps) {
  const [stars, setStars] = useState<Star[]>([]);
  const [visible, setVisible] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);
  const [showTime, setShowTime] = useState<number>(Date.now());

  // Generate initial stars
  useEffect(() => {
    const newStars: Star[] = [];
    for (let i = 0; i < 50; i++) {
      newStars.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: 1.5 + Math.random() * 3.5,
        opacity: 0.3 + Math.random() * 0.7,
        speed: 0.015 + Math.random() * 0.04,
        twinkleSpeed: 0.5 + Math.random() * 2,
        twinklePhase: Math.random() * Math.PI * 2,
      });
    }
    setStars(newStars);
    setShowTime(Date.now());
  }, []);

  // Animate stars
  useEffect(() => {
    if (!visible) return;

    const interval = setInterval(() => {
      setStars(prev => prev.map(star => ({
        ...star,
        y: star.y - star.speed,
        x: star.x + Math.sin(Date.now() / 2500 + star.id) * 0.015,
        twinklePhase: star.twinklePhase + 0.04,
        ...(star.y < -3 ? { y: 103, x: Math.random() * 100 } : {}),
      })));
    }, 50);

    return () => clearInterval(interval);
  }, [visible]);

  // Handle fade out when loading complete
  useEffect(() => {
    if (!isLoading) {
      const elapsed = Date.now() - showTime;
      const remaining = Math.max(0, minDisplayTime - elapsed);
      
      const timer = setTimeout(() => {
        setFadeOut(true);
        setTimeout(() => {
          setVisible(false);
          onLoadComplete?.();
        }, 400);
      }, remaining);

      return () => clearTimeout(timer);
    }
  }, [isLoading, minDisplayTime, onLoadComplete, showTime]);

  if (!visible) return null;

  return (
    <div 
      className={`
        fixed inset-0 z-[200] flex flex-col items-center justify-center
        transition-opacity duration-400
        ${fadeOut ? 'opacity-0' : 'opacity-100'}
      `}
      style={{
        background: 'linear-gradient(135deg, #0a1628 0%, #1a0a2e 50%, #0d1f3c 100%)',
      }}
    >
      {/* Ambient glow spots */}
      <div 
        className="absolute inset-0 opacity-30 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse at 25% 25%, rgba(6, 182, 212, 0.12) 0%, transparent 50%),
            radial-gradient(ellipse at 75% 75%, rgba(168, 85, 247, 0.12) 0%, transparent 50%),
            radial-gradient(ellipse at 50% 50%, rgba(20, 184, 166, 0.08) 0%, transparent 65%)
          `,
        }}
      />

      {/* Floating stars */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {stars.map(star => (
          <div
            key={star.id}
            className="absolute rounded-full"
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: star.size,
              height: star.size,
              backgroundColor: 'white',
              opacity: star.opacity * (0.5 + 0.5 * Math.sin(star.twinklePhase)),
              boxShadow: `
                0 0 ${star.size * 2}px rgba(255, 255, 255, 0.4),
                0 0 ${star.size * 3}px rgba(6, 182, 212, 0.25)
              `,
            }}
          />
        ))}
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Vale logo/text */}
        <h1 
          className="text-5xl tracking-[0.25em] mb-8"
          style={{
            fontFamily: '"Cormorant Garamond", Georgia, serif',
            fontWeight: 400,
            background: 'linear-gradient(135deg, #e2e8f0 0%, #94a3b8 40%, #cbd5e1 70%, #94a3b8 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textShadow: '0 0 40px rgba(148, 163, 184, 0.2)',
          }}
        >
          VALE
        </h1>

        {/* Subtle loading dots */}
        <div className="flex items-center gap-2 mb-6">
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className="w-1.5 h-1.5 rounded-full"
              style={{
                backgroundColor: 'rgba(34, 211, 238, 0.6)',
                animation: `pulse-dot 1.4s ease-in-out infinite`,
                animationDelay: `${i * 0.2}s`,
              }}
            />
          ))}
        </div>

        {/* Tagline */}
        <p 
          className="text-sm tracking-[0.2em] opacity-50"
          style={{
            fontFamily: '"Quicksand", system-ui, sans-serif',
            color: '#94a3b8',
          }}
        >
          bloom where you're planted
        </p>
      </div>

      {/* CSS animations */}
      <style>{`
        @keyframes pulse-dot {
          0%, 80%, 100% {
            transform: scale(1);
            opacity: 0.4;
          }
          40% {
            transform: scale(1.4);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
