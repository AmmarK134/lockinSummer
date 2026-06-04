'use client';

interface ProgressRingProps {
  size?: number;
  stroke?: number;
  pct?: number;
  color?: string;
  track?: string;
  children?: React.ReactNode;
  glow?: boolean;
}

export default function ProgressRing({
  size = 96, stroke = 9, pct = 0,
  color = 'var(--ember)', track = 'var(--surface-3)',
  children, glow = true,
}: ProgressRingProps) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const off = c * (1 - Math.max(0, Math.min(1, pct)));
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={stroke} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeLinecap="round" strokeDasharray={c} strokeDashoffset={off}
          style={{
            transition: 'stroke-dashoffset 1s cubic-bezier(.22,.61,.36,1)',
            filter: glow ? `drop-shadow(0 0 5px ${color}66)` : 'none',
          }}
        />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        {children}
      </div>
    </div>
  );
}
