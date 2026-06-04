'use client';

interface BarProps {
  pct?: number;
  color?: string;
  height?: number;
  track?: string;
}

export default function Bar({ pct = 0, color = 'var(--ember)', height = 8, track = 'var(--surface-3)' }: BarProps) {
  return (
    <div className="track" style={{ height, background: track }}>
      <div style={{
        height: '100%',
        width: `${Math.max(0, Math.min(100, pct * 100))}%`,
        borderRadius: 99,
        background: color,
        transition: 'width 1s cubic-bezier(.22,.61,.36,1)',
      }} />
    </div>
  );
}
