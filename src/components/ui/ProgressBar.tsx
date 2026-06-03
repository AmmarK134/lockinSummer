'use client';

interface ProgressBarProps {
  value: number;       // 0–100
  max?: number;
  color?: 'cyan' | 'purple' | 'green' | 'amber' | 'red';
  height?: 'xs' | 'sm' | 'md';
  showLabel?: boolean;
  label?: string;
  className?: string;
  animated?: boolean;
}

const COLORS = {
  cyan:   'bg-cyan-500',
  purple: 'bg-purple-500',
  green:  'bg-emerald-500',
  amber:  'bg-amber-500',
  red:    'bg-red-500',
};

const HEIGHTS = {
  xs: 'h-1.5',
  sm: 'h-2',
  md: 'h-3',
};

export default function ProgressBar({
  value,
  max = 100,
  color = 'cyan',
  height = 'sm',
  showLabel,
  label,
  className = '',
  animated = true,
}: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className={className}>
      {(showLabel || label) && (
        <div className="flex justify-between mb-1.5">
          <span className="text-xs text-slate-400">{label}</span>
          <span className="text-xs text-slate-300 font-medium">
            {Math.round(value)}{max !== 100 ? `/${max}` : '%'}
          </span>
        </div>
      )}
      <div className={`w-full ${HEIGHTS[height]} bg-slate-800 rounded-full overflow-hidden`}>
        <div
          className={`${HEIGHTS[height]} ${COLORS[color]} rounded-full ${animated ? 'transition-all duration-700 ease-out' : ''}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
