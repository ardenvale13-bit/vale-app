// LoadingScreen.tsx — Ethereal loading with floating stars

import { useEffect, useState } from 'react';
import { useTheme } from '../../theme/ThemeContext';

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
  const { theme } = useTheme();
  const [stars, setStars] = useState<Star[]>([]);
  const [visible, setVisible] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);
  const [showTime, setShowTime] = useState<number>(Date.now());

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

  useEffect(() => {
    if (!isLoading) {
      const elapsed = Date.now() - showTime;
      const remaining = Math.max(0, minDisplayTime - elapsed);
      const timer = setTimeout(() => {
        setFadeOut(true);
        setTimeout(() => { setVisible(false); onLoadComplete?.(); }, 400);
      }, remaining);
      return () => clearTimeout(timer);
    }
  }, [isLoading, minDisplayTime, onLoadComplete, showTime]);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-[200] flex flex-col items-center justify-center transition-opacity duration-400 ${fadeOut ? 'opacity-0' : 'opacity-100'}`}
      style={{
        background: `linear-gradient(135deg, ${theme.bgDeep} 0%, ${theme.bg} 50%, ${theme.bgGrad} 100%)`,
      }}
    >
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
              backgroundColor: '#E8E4F2',
              opacity: star.opacity * (0.5 + 0.5 * Math.sin(star.twinklePhase)),
              boxShadow: `0 0 ${star.size * 2}px rgba(232, 228, 242, 0.4)`,
            }}
          />
        ))}
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center">
        <h1
          className="tracking-[0.25em] mb-8"
          style={{
            fontFamily: theme.serifH,
            fontSize: 48, fontWeight: 400, fontStyle: 'italic',
            color: theme.ink,
            textShadow: `0 0 40px ${theme.accent}33`,
          }}
        >
          Vale
        </h1>

        {/* Loading dots */}
        <div className="flex items-center gap-2 mb-6">
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className="w-1.5 h-1.5 rounded-full"
              style={{
                backgroundColor: theme.accent,
                opacity: 0.6,
                animation: `pulse-dot 1.4s ease-in-out infinite`,
                animationDelay: `${i * 0.2}s`,
              }}
            />
          ))}
        </div>

        <p style={{
          fontFamily: theme.serifB, fontStyle: 'italic', fontSize: 13,
          color: theme.inkFaint, letterSpacing: '0.1em',
        }}>
          bloom where you're planted
        </p>
      </div>

      <style>{`
        @keyframes pulse-dot {
          0%, 80%, 100% { transform: scale(1); opacity: 0.4; }
          40% { transform: scale(1.4); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
