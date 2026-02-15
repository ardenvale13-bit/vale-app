// EntryScreen.tsx
// Galaxy entry screen matching Vale Tracker aesthetic
// Place vale-bg.jpg and vale-logo.png in /public/

import { useEffect, useState, useRef } from 'react';

interface Particle {
  id: number;
  x: number;
  size: number;
  duration: number;
  delay: number;
}

interface EntryScreenProps {
  onEnter: () => void;
}

export function EntryScreen({ onEnter }: EntryScreenProps) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [hiding, setHiding] = useState(false);
  const [gone, setGone] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Generate particles on mount
  useEffect(() => {
    const newParticles: Particle[] = [];
    for (let i = 0; i < 25; i++) {
      newParticles.push({
        id: i,
        x: Math.random() * 100,
        size: Math.random() * 4 + 1,
        duration: Math.random() * 8 + 6,
        delay: Math.random() * 6,
      });
    }
    setParticles(newParticles);
  }, []);

  const handleEnter = () => {
    setHiding(true);
    setTimeout(() => {
      setGone(true);
      onEnter();
    }, 700);
  };

  if (gone) return null;

  return (
    <div
      ref={containerRef}
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center ${
        hiding ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      style={{
        backgroundImage: `url('/vale-bg.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundColor: '#0a0a10',
        transition: 'opacity 0.6s ease, transform 0.6s ease',
        transform: hiding ? 'scale(1.05)' : 'scale(1)',
      }}
    >
      {/* Gradient overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'linear-gradient(180deg, rgba(10,10,16,0.3) 0%, rgba(10,10,16,0.1) 40%, rgba(10,10,16,0.4) 100%)',
        }}
      />

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((p) => (
          <div
            key={p.id}
            className="absolute rounded-full"
            style={{
              width: p.size,
              height: p.size,
              left: `${p.x}%`,
              background: 'rgba(200, 170, 255, 0.6)',
              animation: `entryParticleDrift ${p.duration}s linear infinite`,
              animationDelay: `${p.delay}s`,
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Vale logo */}
        <img
          src="/vale-logo.png"
          alt="Vale"
          className="h-auto mb-12"
          style={{
            width: 'min(70vw, 320px)',
            filter:
              'drop-shadow(0 0 30px rgba(154, 123, 255, 0.5)) drop-shadow(0 0 60px rgba(200, 150, 255, 0.3))',
            animation: 'entryLogoFloat 3s ease-in-out infinite',
          }}
        />

        {/* Enter button */}
        <button
          onClick={handleEnter}
          className="cursor-pointer"
          style={{
            padding: '14px 48px',
            borderRadius: '30px',
            border: '1px solid rgba(154, 123, 255, 0.4)',
            background:
              'linear-gradient(135deg, rgba(154, 123, 255, 0.3), rgba(200, 150, 255, 0.15))',
            color: '#f0f0ff',
            fontSize: '16px',
            fontWeight: 500,
            letterSpacing: '2px',
            textTransform: 'uppercase' as const,
            backdropFilter: 'blur(12px)',
            boxShadow:
              '0 4px 24px rgba(154, 123, 255, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={(e) => {
            (e.target as HTMLElement).style.background =
              'linear-gradient(135deg, rgba(154, 123, 255, 0.5), rgba(200, 150, 255, 0.25))';
            (e.target as HTMLElement).style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            (e.target as HTMLElement).style.background =
              'linear-gradient(135deg, rgba(154, 123, 255, 0.3), rgba(200, 150, 255, 0.15))';
            (e.target as HTMLElement).style.transform = 'translateY(0)';
          }}
        >
          Enter
        </button>

        {/* Subtitle */}
        <p
          className="mt-6 text-xs"
          style={{
            color: 'rgba(240, 240, 255, 0.4)',
            letterSpacing: '1.5px',
          }}
        >
          your space · your rhythm · your data
        </p>
      </div>

      {/* Keyframe animations */}
      <style>{`
        @keyframes entryParticleDrift {
          0% {
            transform: translateY(100vh) scale(0);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateY(-10vh) scale(1);
            opacity: 0;
          }
        }

        @keyframes entryLogoFloat {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-8px);
          }
        }
      `}</style>
    </div>
  );
}
