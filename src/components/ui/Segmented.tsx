'use client';

interface SegmentedProps {
  options: string[];
  value: string;
  onChange: (v: string) => void;
  render?: (o: string) => React.ReactNode;
}

export default function Segmented({ options, value, onChange, render }: SegmentedProps) {
  return (
    <div style={{ display: 'flex', gap: 6, background: 'var(--surface-2)', borderRadius: 14, padding: 4, border: '1px solid var(--line)' }}>
      {options.map(o => {
        const on = o === value;
        return (
          <button
            key={o} onClick={() => onChange(o)} className="tap"
            style={{ flex: 1, border: 'none', borderRadius: 11, padding: '9px 6px', cursor: 'pointer', fontFamily: 'var(--font-ui)', fontSize: 13, fontWeight: 800, background: on ? 'var(--ember)' : 'transparent', color: on ? '#1a0a06' : 'var(--muted)', transition: 'all .16s ease' }}
          >
            {render ? render(o) : o}
          </button>
        );
      })}
    </div>
  );
}
