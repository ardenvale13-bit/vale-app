import { useTheme } from '../../theme/ThemeContext';
import { MoonPhase, moonPhaseLabel } from './MoonPhase';

interface BloomState {
  percentage: number;
  level: 'wilted' | 'blooming-25' | 'blooming-50' | 'blooming-75' | 'full-bloom';
  tasksTotal: number;
  tasksCompleted: number;
}

interface BloomIndicatorProps {
  bloom: BloomState;
}

export function BloomIndicator({ bloom }: BloomIndicatorProps) {
  const { theme } = useTheme();
  const pct = bloom.tasksTotal ? bloom.tasksCompleted / bloom.tasksTotal : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, padding: '20px 0 8px' }}>
      <div style={{
        filter: pct > 0 ? `drop-shadow(0 0 24px ${theme.accent}55)` : 'none',
        transition: 'filter 800ms',
      }}>
        <MoonPhase
          size={140}
          phase={pct}
          litColor="#F4ECD0"
          darkColor={theme.moonDark}
          haloColor={pct > 0 ? theme.accent : null}
          craters
        />
      </div>
      <div style={{ textAlign: 'center', marginTop: 6 }}>
        <div style={{
          fontFamily: theme.serifH, fontSize: 22, fontStyle: 'italic',
          color: theme.ink, letterSpacing: 0.2, whiteSpace: 'nowrap',
        }}>
          {moonPhaseLabel(pct)}
        </div>
        <div style={{
          fontFamily: theme.mono, fontSize: 10, color: theme.inkFaint,
          letterSpacing: '0.18em', textTransform: 'uppercase', marginTop: 4,
        }}>
          {bloom.tasksCompleted} of {bloom.tasksTotal} &middot; {bloom.percentage}%
        </div>
      </div>
    </div>
  );
}
