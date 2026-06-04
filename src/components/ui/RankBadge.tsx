'use client';
import { RANKS } from '@/lib/gamification';

interface RankBadgeProps {
  idx?: number;
  size?: number;
  glow?: boolean;
}

export default function RankBadge({ idx = 0, size = 64, glow = true }: RankBadgeProps) {
  const rank = RANKS[idx] || RANKS[0];
  const a = rank.accent;
  const id = `rg${idx}-${size}`;

  const hex = (cx: number, cy: number, R: number) => {
    const pts: [number, number][] = [];
    for (let i = 0; i < 6; i++) {
      const ang = (Math.PI / 180) * (60 * i - 90);
      pts.push([cx + R * Math.cos(ang), cy + R * Math.sin(ang)]);
    }
    return pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ') + ' Z';
  };

  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{ filter: glow ? `drop-shadow(0 4px 14px ${a}55)` : 'none' }}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={a} stopOpacity="0.95" />
          <stop offset="1" stopColor={a} stopOpacity="0.5" />
        </linearGradient>
      </defs>
      <path d={hex(50, 50, 46)} fill="none" stroke={`url(#${id})`} strokeWidth="5" />
      <path d={hex(50, 50, 38)} fill="#16181f" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
      <path d={hex(50, 50, 38)} fill={a} fillOpacity="0.10" />
      <text x="50" y="58" textAnchor="middle" fontFamily="var(--font-display)" fontWeight="800" fontSize="34" fill={a}>
        {idx + 1}
      </text>
    </svg>
  );
}
