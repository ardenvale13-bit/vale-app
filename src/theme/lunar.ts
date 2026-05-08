// lunar.ts — Vale palette system
// Ported from vale-lunar.jsx design spec

export type LunarPaletteName = 'twilight' | 'amethyst' | 'rose' | 'aubergine';

interface PaletteBase {
  bg: string;
  bgDeep: string;
  bgGrad: string;
  accent: string;
  moonDark: string;
}

export interface LunarTheme {
  // backgrounds
  bg: string;
  bgDeep: string;
  bgGrad: string;
  // ink hierarchy
  ink: string;
  inkSoft: string;
  inkFaint: string;
  inkGhost: string;
  // structural
  rule: string;
  // accent
  accent: string;
  accentSoft: string;
  // moon
  moonDark: string;
  // typography
  serifH: string;
  serifB: string;
  sans: string;
  mono: string;
}

const LUNAR_PALETTES: Record<LunarPaletteName, PaletteBase> = {
  twilight:  { bg: '#0A0E1F', bgDeep: '#070A18', bgGrad: '#1a1230', accent: '#E8C97A', moonDark: '#1a1f3a' },
  amethyst:  { bg: '#1A0E2D', bgDeep: '#0E0720', bgGrad: '#2D1248', accent: '#E8A8FF', moonDark: '#2a1845' },
  rose:      { bg: '#241024', bgDeep: '#180A1A', bgGrad: '#3A1635', accent: '#FFB0CF', moonDark: '#38182F' },
  aubergine: { bg: '#180A28', bgDeep: '#0A0418', bgGrad: '#3F1846', accent: '#D9A4FF', moonDark: '#321840' },
};

export function computeLunarTheme(name: LunarPaletteName): LunarTheme {
  const p = LUNAR_PALETTES[name] || LUNAR_PALETTES.amethyst;
  return {
    bg: p.bg,
    bgDeep: p.bgDeep,
    bgGrad: p.bgGrad,
    ink:       '#F0EAF8',
    inkSoft:   'rgba(240, 234, 248, 0.62)',
    inkFaint:  'rgba(240, 234, 248, 0.40)',
    inkGhost:  'rgba(240, 234, 248, 0.18)',
    rule:      'rgba(240, 234, 248, 0.10)',
    accent:    p.accent,
    accentSoft: `${p.accent}33`,
    moonDark:  p.moonDark,
    serifH: "'Cormorant Garamond', Georgia, serif",
    serifB: "'Cormorant Garamond', Georgia, serif",
    sans:   "'Inter Tight', -apple-system, system-ui, sans-serif",
    mono:   "'JetBrains Mono', ui-monospace, monospace",
  };
}

export const PALETTE_OPTIONS: { id: LunarPaletteName; label: string; swatch: [string, string] }[] = [
  { id: 'amethyst',  label: 'Amethyst',  swatch: ['#2D1248', '#E8A8FF'] },
  { id: 'rose',      label: 'Rose',      swatch: ['#3A1635', '#FFB0CF'] },
  { id: 'aubergine', label: 'Aubergine', swatch: ['#3F1846', '#D9A4FF'] },
  { id: 'twilight',  label: 'Twilight',  swatch: ['#1a1230', '#E8C97A'] },
];

// Page-level background radials per palette (for App.tsx wrapping)
export const LUNAR_PAGE_BGS: Record<LunarPaletteName, string> = {
  twilight:  'radial-gradient(ellipse at 50% 30%, #1a1530 0%, #0a0a14 65%, #050508 100%)',
  amethyst:  'radial-gradient(ellipse at 50% 30%, #2a1145 0%, #14082a 60%, #06030f 100%)',
  rose:      'radial-gradient(ellipse at 50% 30%, #3a1538 0%, #1a0a1a 60%, #0a040a 100%)',
  aubergine: 'radial-gradient(ellipse at 50% 30%, #3f1846 0%, #14082a 60%, #050208 100%)',
};

export const DEFAULT_PALETTE: LunarPaletteName = 'amethyst';
