// Inline type to avoid import issues
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
  const getColor = () => {
    if (bloom.percentage > 75) return '#00fff7'; // Cyan
    if (bloom.percentage > 50) return '#b794f6'; // Lavender
    if (bloom.percentage > 25) return '#ff6b9d'; // Pink
    return '#6a6a6a'; // Grey
  };

  return (
    <div className="text-center">
      <div className="text-sm text-purple-300/60 mb-2 uppercase tracking-widest">
        Bloom Level
      </div>
      
      <div
        className="text-4xl font-bold transition-colors duration-500"
        style={{
          fontFamily: 'Quicksand, sans-serif',
          color: getColor(),
        }}
      >
        {bloom.percentage}%
      </div>

      {/* Progress bar */}
      <div className="w-64 h-2 bg-gray-800 rounded-full mt-4 overflow-hidden mx-auto">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${bloom.percentage}%`,
            background: 'linear-gradient(90deg, #ff6b9d 0%, #b794f6 50%, #00fff7 100%)',
            boxShadow: bloom.percentage > 50 ? '0 0 10px rgba(183, 148, 246, 0.6)' : 'none',
          }}
        />
      </div>

      {/* Task count */}
      <div className="text-sm text-purple-300/50 mt-2">
        {bloom.tasksCompleted} / {bloom.tasksTotal} tasks complete
      </div>
    </div>
  );
}
