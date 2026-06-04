'use client';
import { useApp } from '@/contexts/AppContext';
import { rankForXp } from '@/lib/gamification';
import Bar from '@/components/ui/Bar';
import RankBadge from '@/components/ui/RankBadge';

const IScale = () => <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3.5" y="4.5" width="17" height="15" rx="3"/><path d="M12 8.5l2.2 3.5h-4.4z"/><path d="M8.5 16.5h7"/></svg>;

function WeightChart({ series, goal, height = 130 }: { series: number[]; goal: number | null; height?: number }) {
  const W = 300, H = height, pad = 14;
  if (series.length < 2) return null;
  const vals = goal ? [...series, goal] : series;
  let lo = Math.min(...vals), hi = Math.max(...vals);
  const range = hi - lo || 1; lo -= range * 0.25; hi += range * 0.25;
  const x = (i: number) => pad + (i / (series.length - 1)) * (W - pad * 2);
  const y = (v: number) => pad + (1 - (v - lo) / (hi - lo)) * (H - pad * 2);
  const pts = series.map((v, i) => [x(i), y(v)]);
  const line = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ');
  const area = line + ` L${x(series.length - 1)} ${H - pad} L${pad} ${H - pad} Z`;
  const gy = goal ? y(goal) : null;
  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: 'block' }}>
      <defs>
        <linearGradient id="wfill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="var(--ember)" stopOpacity="0.28" />
          <stop offset="1" stopColor="var(--ember)" stopOpacity="0" />
        </linearGradient>
      </defs>
      {gy != null && (
        <g>
          <line x1={pad} y1={gy} x2={W - pad} y2={gy} stroke="var(--good)" strokeWidth="1.2" strokeDasharray="4 4" opacity="0.7" />
          <text x={W - pad} y={gy - 5} textAnchor="end" fontSize="10" fontFamily="var(--font-mono)" fill="var(--good)">goal {goal}</text>
        </g>
      )}
      <path d={area} fill="url(#wfill)" />
      <path d={line} fill="none" stroke="var(--ember)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ filter: 'drop-shadow(0 2px 6px rgba(255,92,56,0.4))' }} />
      {pts.map((p, i) => (
        <circle key={i} cx={p[0]} cy={p[1]} r={i === pts.length - 1 ? 4 : 2.5} fill={i === pts.length - 1 ? 'var(--ember)' : 'var(--surface)'} stroke="var(--ember)" strokeWidth="2" />
      ))}
    </svg>
  );
}

export default function ProgressPage() {
  const { state, profile, setWeighOpen } = useApp();
  const series = state.weightSeries;
  const cur = series[series.length - 1];
  const start = series[0];
  const goal = profile ? (parseFloat(profile.goalWeightKg) || null) : null;
  const delta = cur != null && start != null ? (cur - start).toFixed(1) : '0';
  const toGoal = goal ? (cur - goal).toFixed(1) : null;
  const info = rankForXp(state.xp);

  const strength = [
    { n: 'Bench Press', v: '72.5 kg', up: '+5 kg', p: 0.7 },
    { n: 'Squat', v: '110 kg', up: '+10 kg', p: 0.85 },
    { n: 'Lat Pulldown', v: '64 kg', up: '+4 kg', p: 0.6 },
  ];

  return (
    <div className="screen-scroll screen-anim">
      <div className="pad" style={{ paddingTop: 8, paddingBottom: 24 }}>
        <div className="kicker" style={{ marginBottom: 6 }}>Your journey</div>
        <div className="h-display" style={{ fontSize: 30, marginBottom: 16 }}>Progress</div>

        {/* Weight chart */}
        <div className="card" style={{ padding: 16, marginBottom: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 10 }}>
            <div>
              <div className="kicker">Body weight · {series.length} wk</div>
              <div className="num" style={{ fontSize: 30, marginTop: 4 }}>{cur}<span style={{ fontSize: 14, color: 'var(--muted)' }}> kg</span></div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: parseFloat(delta) < 0 ? 'var(--good)' : 'var(--carbs)' }}>{parseFloat(delta) > 0 ? '+' : ''}{delta} kg</div>
              <div style={{ fontSize: 11, color: 'var(--faint)', fontWeight: 700 }}>since start</div>
            </div>
          </div>
          <WeightChart series={series} goal={goal} />
        </div>

        {/* Stat tiles */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
          <div className="card" style={{ padding: 14, flex: 1 }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--faint)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>To goal</div>
            <div className="num" style={{ fontSize: 26, marginTop: 4, color: 'var(--ember)' }}>{toGoal != null ? Math.abs(parseFloat(toGoal)) : '—'}<span style={{ fontSize: 13, color: 'var(--muted)', marginLeft: 2 }}>{toGoal != null ? 'kg' : ''}</span></div>
            <div style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600, marginTop: 2 }}>{toGoal != null ? (parseFloat(toGoal) > 0 ? 'to lose' : 'reached!') : 'set a goal'}</div>
          </div>
          <div className="card" style={{ padding: 14, flex: 1 }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--faint)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Streak</div>
            <div className="num" style={{ fontSize: 26, marginTop: 4 }}>{state.streak}<span style={{ fontSize: 13, color: 'var(--muted)', marginLeft: 2 }}>d</span></div>
            <div style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600, marginTop: 2 }}>keep it lit 🔥</div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
          <div className="card" style={{ padding: 14, flex: 1 }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--faint)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Rank</div>
            <div className="num" style={{ fontSize: 26, marginTop: 4, color: info.rank.accent }}>{info.idx + 1}</div>
            <div style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600, marginTop: 2 }}>{info.rank.name}</div>
          </div>
          <div className="card" style={{ padding: 14, flex: 1 }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--faint)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Protein avg</div>
            <div className="num" style={{ fontSize: 26, marginTop: 4, color: 'var(--protein)' }}>87<span style={{ fontSize: 13, color: 'var(--muted)', marginLeft: 2 }}>%</span></div>
            <div style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600, marginTop: 2 }}>last 7 days</div>
          </div>
        </div>

        {/* Strength progress */}
        <div className="card" style={{ padding: 16, marginBottom: 8 }}>
          <div className="h-display" style={{ fontSize: 18, marginBottom: 13 }}>Strength progress</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
            {strength.map(s => (
              <div key={s.n}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 7 }}>
                  <span style={{ fontWeight: 700, fontSize: 14 }}>{s.n}</span>
                  <span style={{ fontSize: 13 }}><b className="num" style={{ fontSize: 15 }}>{s.v}</b><span style={{ color: 'var(--good)', fontWeight: 800, fontSize: 12, marginLeft: 6 }}>{s.up}</span></span>
                </div>
                <Bar pct={s.p} />
              </div>
            ))}
          </div>
        </div>

        <button onClick={() => setWeighOpen(true)} className="btn-primary tap" style={{ width: '100%', padding: 15, fontSize: 15, marginTop: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <IScale /> Log weekly weigh-in
        </button>
      </div>
    </div>
  );
}
