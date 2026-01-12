import { useMemo } from 'react';

interface Star {
  id: number;
  delay: number;
  duration: number;
  left: string;
  top: string;
  size: number;
}

function generateStars(count: number): Star[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    delay: Math.random() * 5,
    duration: 2 + Math.random() * 3,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    size: 1 + Math.random() * 3,
  }));
}

interface StarFieldProps {
  count?: number;
  intensity?: number; // 0-1, affects opacity
}

export function StarField({ count = 50, intensity = 1 }: StarFieldProps) {
  const stars = useMemo(() => generateStars(count), [count]);

  return (
    <div 
      className="absolute inset-0 overflow-hidden pointer-events-none transition-opacity duration-1000"
      style={{ opacity: intensity }}
    >
      {stars.map((star) => (
        <div
          key={star.id}
          className="absolute rounded-full bg-white"
          style={{
            left: star.left,
            top: star.top,
            width: `${star.size}px`,
            height: `${star.size}px`,
            animation: `twinkle ${star.duration}s ease-in-out infinite`,
            animationDelay: `${star.delay}s`,
            boxShadow: '0 0 6px rgba(255, 255, 255, 0.8)',
          }}
        />
      ))}
    </div>
  );
}
