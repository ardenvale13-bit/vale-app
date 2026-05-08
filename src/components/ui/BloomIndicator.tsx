import { useTheme } from '../../theme/ThemeContext';

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

  const getColor = () => {
    if (bloom.percentage > 75) return theme.accent;
    if (bloom.percentage > 50) return theme.inkSoft;
    if (bloom.percentage > 25) return theme.inkFaint;
    return theme.inkGhost;
  };

  return (
    <div className="text-center">
      <div style={{
        fontFamily: theme.sans, fontSize: 10, fontWeight: 500,
        letterSpacing: '0.22em', textTransform: 'uppercase',
        color: theme.inkFaint, marginBottom: 8,
      }}>
        Bloom Level
      </div>

      <div
        className="transition-colors duration-500"
        style={{
          fontFamily: theme.serifH, fontSize: 36, fontWeight: 400,
          fontStyle: 'italic', color: getColor(),
        }}
      >
        {bloom.percentage}%
      </div>

      {/* Progress bar */}
      <div style={{
        width: 256, height: 2, borderRadius: 999, margin: '16px auto 0',
        background: theme.rule, overflow: 'hidden',
      }}>
        <div
          className="transition-all duration-500"
          style={{
            height: '100%', borderRadius: 999,
            width: `${bloom.percentage}%`,
            background: `linear-gradient(90deg, ${theme.inkGhost} 0%, ${theme.accent} 100%)`,
            boxShadow: bloom.percentage > 50 ? `0 0 10px ${theme.accent}66` : 'none',
          }}
        />
      </div>

      {/* Task count */}
      <div style={{
        fontFamily: theme.mono, fontSize: 10, color: theme.inkFaint,
        letterSpacing: '0.18em', textTransform: 'uppercase', marginTop: 8,
      }}>
        {bloom.tasksCompleted} of {bloom.tasksTotal} complete
      </div>
    </div>
  );
}
