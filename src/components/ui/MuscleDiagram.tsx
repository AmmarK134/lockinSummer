'use client';

const MD_BASE = '#2c313b';
const MD_DARK = '#222730';
const MD_TARGET = '#ff5c38';
const MD_SECOND = 'rgba(255,92,56,0.34)';
const MD_STROKE = 'rgba(0,0,0,0.28)';

interface MuscleDiagramProps {
  targets?: string[];
  secondary?: string[];
  width?: number;
}

export default function MuscleDiagram({ targets = [], secondary = [], width = 116 }: MuscleDiagramProps) {
  const t = new Set(targets);
  const s = new Set(secondary);
  const paint = (id: string) => t.has(id) ? MD_TARGET : s.has(id) ? MD_SECOND : MD_BASE;
  const glow = (id: string): React.CSSProperties | undefined =>
    t.has(id) ? { filter: 'drop-shadow(0 0 4px rgba(255,92,56,0.7))' } : undefined;

  type PType = 'e' | 'p';
  interface PAttrs { d?: string; cx?: number; cy?: number; rx?: number; ry?: number; }
  const P = (id: string, type: PType, attrs: PAttrs) => {
    const common = { fill: paint(id), stroke: MD_STROKE, strokeWidth: 0.6, style: glow(id) };
    if (type === 'e') {
      return <ellipse cx={attrs.cx} cy={attrs.cy} rx={attrs.rx} ry={attrs.ry} {...common} />;
    }
    return <path d={attrs.d} {...common} />;
  };
  const Base = ({ d, dark = false }: { d: string; dark?: boolean }) => (
    <path d={d} fill={dark ? MD_DARK : MD_BASE} stroke={MD_STROKE} strokeWidth={0.6} />
  );

  const Front = () => (
    <svg width={width} viewBox="0 0 120 320" style={{ overflow: 'visible' }}>
      <Base d="M40 56 Q60 50 80 56 L77 120 Q60 130 43 120 Z" />
      <Base d="M46 120 L74 120 L73 214 L67 300 L60 300 L60 150 L53 300 L53 214 Z" />
      <ellipse cx="60" cy="22" rx="13" ry="15" fill={MD_DARK} stroke={MD_STROKE} strokeWidth="0.6" />
      <rect x="53" y="33" width="14" height="11" rx="4" fill={MD_DARK} stroke={MD_STROKE} strokeWidth="0.6" />
      {P('traps', 'p', { d: 'M44 46 Q60 41 76 46 L72 57 Q60 52 48 57 Z' })}
      {P('shoulders', 'e', { cx: 33, cy: 60, rx: 12, ry: 11 })}
      {P('shoulders', 'e', { cx: 87, cy: 60, rx: 12, ry: 11 })}
      {P('chest', 'p', { d: 'M59 57 L59 79 Q51 82 45 76 Q42 66 47 58 Q53 56 59 57 Z' })}
      {P('chest', 'p', { d: 'M61 57 L61 79 Q69 82 75 76 Q78 66 73 58 Q67 56 61 57 Z' })}
      {P('biceps', 'e', { cx: 26, cy: 89, rx: 7, ry: 17 })}
      {P('biceps', 'e', { cx: 94, cy: 89, rx: 7, ry: 17 })}
      {P('forearms', 'e', { cx: 21, cy: 125, rx: 6, ry: 18 })}
      {P('forearms', 'e', { cx: 99, cy: 125, rx: 6, ry: 18 })}
      <circle cx="18" cy="148" r="5" fill={MD_DARK} stroke={MD_STROKE} strokeWidth="0.6" />
      <circle cx="102" cy="148" r="5" fill={MD_DARK} stroke={MD_STROKE} strokeWidth="0.6" />
      {P('obliques', 'p', { d: 'M47 84 L46 116 Q50 120 51 116 L51 86 Z' })}
      {P('obliques', 'p', { d: 'M73 84 L74 116 Q70 120 69 116 L69 86 Z' })}
      {P('abs', 'p', { d: 'M52 82 L68 82 Q70 100 67 118 Q60 124 53 118 Q50 100 52 82 Z' })}
      <g stroke="rgba(0,0,0,0.22)" strokeWidth="0.7">
        <path d="M60 84 L60 118" /><path d="M53 95 L67 95" /><path d="M53 105 L67 105" />
      </g>
      <Base d="M47 118 Q60 126 73 118 L71 134 Q60 140 49 134 Z" dark />
      {P('quads', 'e', { cx: 51, cy: 172, rx: 11, ry: 35 })}
      {P('quads', 'e', { cx: 69, cy: 172, rx: 11, ry: 35 })}
      <ellipse cx="51" cy="212" rx="8" ry="7" fill={MD_DARK} stroke={MD_STROKE} strokeWidth="0.6" />
      <ellipse cx="69" cy="212" rx="8" ry="7" fill={MD_DARK} stroke={MD_STROKE} strokeWidth="0.6" />
      {P('calves', 'e', { cx: 50, cy: 248, rx: 8, ry: 27 })}
      {P('calves', 'e', { cx: 70, cy: 248, rx: 8, ry: 27 })}
      <path d="M44 296 Q50 290 54 296 L54 302 L44 302 Z" fill={MD_DARK} stroke={MD_STROKE} strokeWidth="0.6" />
      <path d="M66 296 Q70 290 76 296 L76 302 L66 302 Z" fill={MD_DARK} stroke={MD_STROKE} strokeWidth="0.6" />
    </svg>
  );

  const Back = () => (
    <svg width={width} viewBox="0 0 120 320" style={{ overflow: 'visible' }}>
      <Base d="M40 56 Q60 50 80 56 L77 120 Q60 130 43 120 Z" />
      <Base d="M46 120 L74 120 L73 214 L67 300 L60 300 L60 150 L53 300 L53 214 Z" />
      <ellipse cx="60" cy="22" rx="13" ry="15" fill={MD_DARK} stroke={MD_STROKE} strokeWidth="0.6" />
      <rect x="53" y="33" width="14" height="11" rx="4" fill={MD_DARK} stroke={MD_STROKE} strokeWidth="0.6" />
      {P('traps', 'p', { d: 'M45 45 Q60 40 75 45 L70 76 Q60 82 50 76 Z' })}
      {P('shoulders', 'e', { cx: 33, cy: 60, rx: 12, ry: 11 })}
      {P('shoulders', 'e', { cx: 87, cy: 60, rx: 12, ry: 11 })}
      {P('triceps', 'e', { cx: 26, cy: 89, rx: 7, ry: 17 })}
      {P('triceps', 'e', { cx: 94, cy: 89, rx: 7, ry: 17 })}
      {P('forearms', 'e', { cx: 21, cy: 125, rx: 6, ry: 18 })}
      {P('forearms', 'e', { cx: 99, cy: 125, rx: 6, ry: 18 })}
      <circle cx="18" cy="148" r="5" fill={MD_DARK} stroke={MD_STROKE} strokeWidth="0.6" />
      <circle cx="102" cy="148" r="5" fill={MD_DARK} stroke={MD_STROKE} strokeWidth="0.6" />
      {P('lats', 'p', { d: 'M51 73 Q44 90 48 112 L58 106 L58 77 Q55 73 51 73 Z' })}
      {P('lats', 'p', { d: 'M69 73 Q76 90 72 112 L62 106 L62 77 Q65 73 69 73 Z' })}
      {P('lowerBack', 'p', { d: 'M52 106 L68 106 Q70 116 67 124 Q60 128 53 124 Q50 116 52 106 Z' })}
      <Base d="M48 122 Q60 128 72 122 L71 132 Q60 137 49 132 Z" dark />
      {P('glutes', 'e', { cx: 51, cy: 143, rx: 12, ry: 14 })}
      {P('glutes', 'e', { cx: 69, cy: 143, rx: 12, ry: 14 })}
      {P('hamstrings', 'e', { cx: 51, cy: 184, rx: 11, ry: 31 })}
      {P('hamstrings', 'e', { cx: 69, cy: 184, rx: 11, ry: 31 })}
      <ellipse cx="51" cy="218" rx="8" ry="6" fill={MD_DARK} stroke={MD_STROKE} strokeWidth="0.6" />
      <ellipse cx="69" cy="218" rx="8" ry="6" fill={MD_DARK} stroke={MD_STROKE} strokeWidth="0.6" />
      {P('calves', 'e', { cx: 50, cy: 250, rx: 8.5, ry: 27 })}
      {P('calves', 'e', { cx: 70, cy: 250, rx: 8.5, ry: 27 })}
      <path d="M44 296 Q50 290 54 296 L54 302 L44 302 Z" fill={MD_DARK} stroke={MD_STROKE} strokeWidth="0.6" />
      <path d="M66 296 Q70 290 76 296 L76 302 L66 302 Z" fill={MD_DARK} stroke={MD_STROKE} strokeWidth="0.6" />
    </svg>
  );

  return (
    <div style={{ display: 'flex', justifyContent: 'center', gap: 18 }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Front />
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.16em', color: 'var(--faint)', textTransform: 'uppercase', marginTop: 6 }}>Front</div>
      </div>
      <div style={{ width: 1, background: 'var(--line)', alignSelf: 'stretch', margin: '4px 0 22px' }} />
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Back />
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.16em', color: 'var(--faint)', textTransform: 'uppercase', marginTop: 6 }}>Back</div>
      </div>
    </div>
  );
}
