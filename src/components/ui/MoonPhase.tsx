// MoonPhase.tsx — SVG moon that fills from new → full based on completion percentage

interface MoonPhaseProps {
  size?: number;
  phase: number;          // 0 = new moon, 1 = full moon
  litColor?: string;      // illuminated side
  darkColor?: string;     // shadow side
  haloColor?: string | null; // glow around the moon when phase > 0
  craters?: boolean;
}

export function MoonPhase({
  size = 140,
  phase,
  litColor = '#F4ECD0',
  darkColor = '#1a1f3a',
  haloColor = null,
  craters = true,
}: MoonPhaseProps) {
  const r = size / 2;
  const p = Math.max(0, Math.min(1, phase));

  // The terminator curve — maps phase 0→1 to a waxing moon.
  // At phase=0 the lit crescent is invisible, at phase=1 it's a full circle.
  // We draw two arcs: the outer circle edge and the inner terminator.
  const sweep = p * Math.PI; // 0 → π
  const tx = r * Math.cos(sweep); // terminator x offset from center

  // Path for the illuminated portion
  const litPath = p <= 0
    ? '' // no lit area at phase 0
    : p >= 1
      ? `M ${r},0 A ${r},${r} 0 1,1 ${r},${size} A ${r},${r} 0 1,1 ${r},0 Z`
      : `M ${r},0 A ${r},${r} 0 0,1 ${r},${size} A ${Math.abs(tx)},${r} 0 0,${tx >= 0 ? 1 : 0} ${r},0 Z`;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {/* Halo glow */}
      {haloColor && p > 0 && (
        <defs>
          <radialGradient id="moonHalo">
            <stop offset="60%" stopColor={haloColor} stopOpacity={0.25 * p} />
            <stop offset="100%" stopColor={haloColor} stopOpacity={0} />
          </radialGradient>
        </defs>
      )}
      {haloColor && p > 0 && (
        <circle cx={r} cy={r} r={r} fill="url(#moonHalo)" />
      )}

      {/* Dark base (shadow side) */}
      <circle cx={r} cy={r} r={r * 0.92} fill={darkColor} />

      {/* Lit portion */}
      {litPath && (
        <g transform={`translate(${r * 0.08}, ${r * 0.08}) scale(0.92)`}>
          <path d={litPath} fill={litColor} />
        </g>
      )}

      {/* Craters — subtle circles on the lit side */}
      {craters && p > 0.1 && (
        <g opacity={0.12 * Math.min(1, p * 2)}>
          <circle cx={r * 0.65} cy={r * 0.45} r={r * 0.08} fill={darkColor} />
          <circle cx={r * 1.1} cy={r * 0.7} r={r * 0.12} fill={darkColor} />
          <circle cx={r * 0.85} cy={r * 1.25} r={r * 0.06} fill={darkColor} />
          <circle cx={r * 1.2} cy={r * 1.1} r={r * 0.05} fill={darkColor} />
          <circle cx={r * 0.5} cy={r * 1.05} r={r * 0.09} fill={darkColor} />
        </g>
      )}
    </svg>
  );
}

// Label for the current phase
export function moonPhaseLabel(pct: number): string {
  if (pct <= 0) return 'New moon';
  if (pct < 0.25) return 'Waxing crescent';
  if (pct < 0.5) return 'First quarter';
  if (pct < 0.75) return 'Waxing gibbous';
  if (pct < 1) return 'Almost full';
  return 'Full moon';
}
