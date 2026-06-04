'use client';
import { useRouter } from 'next/navigation';
import { AppProvider, useApp } from '@/contexts/AppContext';
import BottomNav from './BottomNav';

// ── Icons ────────────────────────────────────────────────────
function IconDumbbell({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6.5 8.5v7M3.5 10v4M17.5 8.5v7M20.5 10v4M6.5 12h11"/>
    </svg>
  );
}
function IconCamera({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 8.5h3l1.5-2h7L17 8.5h3a1.5 1.5 0 0 1 1.5 1.5v8A1.5 1.5 0 0 1 20 19.5H4A1.5 1.5 0 0 1 2.5 18v-8A1.5 1.5 0 0 1 4 8.5z"/>
      <circle cx="12" cy="13.5" r="3.2"/>
    </svg>
  );
}
function IconScale({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3.5" y="4.5" width="17" height="15" rx="3"/>
      <path d="M12 8.5l2.2 3.5h-4.4z"/><path d="M8.5 16.5h7"/>
    </svg>
  );
}
function IconGuide({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 4h11a2 2 0 0 1 2 2v14H7a2 2 0 0 1-2-2z"/><path d="M9 4v14"/>
      <path d="M12.5 8.5h3M12.5 12h3"/>
    </svg>
  );
}
function IconChevR({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 5l7 7-7 7"/>
    </svg>
  );
}
function IconChevL({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 5l-7 7 7 7"/>
    </svg>
  );
}
function IconCheck({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12.5l4.5 4.5L19 6.5"/>
    </svg>
  );
}
function IconBolt({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" stroke="none">
      <path d="M13 2L4.5 13.2H11l-1.6 8.8L20 10.4h-6.5z"/>
    </svg>
  );
}

// ── Toast ────────────────────────────────────────────────────
function Toast({ msg }: { msg: string | null }) {
  if (!msg) return null;
  return (
    <div style={{ position: 'fixed', left: 18, right: 18, bottom: 96, zIndex: 90, display: 'flex', justifyContent: 'center', pointerEvents: 'none' }}>
      <div style={{
        background: 'var(--surface-3)', border: '1px solid var(--line-strong)', color: 'var(--text)',
        padding: '12px 18px', borderRadius: 14, fontWeight: 700, fontSize: 14,
        boxShadow: '0 12px 30px rgba(0,0,0,0.5)', animation: 'pop-in .26s ease',
        maxWidth: '88%', textAlign: 'center',
      }}>{msg}</div>
    </div>
  );
}

// ── Sheet ────────────────────────────────────────────────────
function Sheet({ open, onClose, children, title }: { open: boolean; onClose: () => void; children: React.ReactNode; title?: string }) {
  if (!open) return null;
  return (
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, zIndex: 80, display: 'flex', alignItems: 'flex-end', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(2px)', animation: 'screen-in .2s ease' }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ width: '100%', background: 'var(--surface)', borderTopLeftRadius: 28, borderTopRightRadius: 28, border: '1px solid var(--line)', borderBottom: 'none', padding: '12px 18px 30px', animation: 'sheet-up .3s cubic-bezier(.22,.61,.36,1)' }}
      >
        <div style={{ width: 40, height: 4, borderRadius: 99, background: 'var(--surface-3)', margin: '2px auto 14px' }} />
        {title && <div className="h-display" style={{ fontSize: 24, marginBottom: 14 }}>{title}</div>}
        {children}
      </div>
    </div>
  );
}

// ── WeighIn sheet content ────────────────────────────────────
function WeighInContent({ onClose }: { onClose: () => void }) {
  const { state, setState, toast } = useApp();
  const [val, setVal] = React.useState(() => {
    const last = state.weightSeries[state.weightSeries.length - 1];
    return (last - 0.4).toFixed(1);
  });
  const [done, setDone] = React.useState(false);
  const [res, setRes] = React.useState<{ w: number; diff: number; msg: string } | null>(null);

  const last = state.weightSeries[state.weightSeries.length - 1];

  const submit = () => {
    const w = parseFloat(val);
    if (!w) return;
    const diff = +(w - last).toFixed(1);
    let msg = '';
    if (Math.abs(diff) < 0.15) msg = 'Weight held steady this week — consistency still counts.';
    else if (diff < 0) msg = `You're down ${Math.abs(diff)} kg from last week. Momentum looks great.`;
    else msg = `Up ${diff} kg this week — could be muscle, water or a big weekend. Keep tracking.`;
    setRes({ w, diff, msg });
    setState(s => ({ ...s, weightSeries: [...s.weightSeries, w], xp: s.xp + 50 }));
    setDone(true);
    toast('⚖️ +50 XP · Weigh-in logged');
  };

  if (done && res) {
    return (
      <div style={{ textAlign: 'center' }}>
        <div className="kicker" style={{ marginBottom: 10 }}>Weekly weigh-in</div>
        <div className="num" style={{ fontSize: 52, lineHeight: 1 }}>{res.w}<span style={{ fontSize: 20, color: 'var(--muted)' }}> kg</span></div>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 10, padding: '7px 14px', borderRadius: 99, background: 'var(--surface-2)', border: '1px solid var(--line)' }}>
          <span style={{ fontWeight: 800, fontSize: 14, color: res.diff < 0 ? 'var(--good)' : res.diff > 0 ? 'var(--carbs)' : 'var(--muted)' }}>
            {res.diff > 0 ? '▲ +' : res.diff < 0 ? '▼ ' : ''}{res.diff === 0 ? 'No change' : Math.abs(res.diff) + ' kg'}
          </span>
          <span style={{ fontSize: 12, color: 'var(--faint)', fontWeight: 700 }}>vs last week</span>
        </div>
        <p style={{ fontSize: 15, color: 'var(--text)', fontWeight: 600, lineHeight: 1.5, margin: '18px 12px 4px' }}>{res.msg}</p>
        <p style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 600, margin: '0 12px 20px' }}>Charts and goal progress updated. See you next week. 💪</p>
        <button onClick={onClose} className="btn-primary tap" style={{ width: '100%', padding: 15, fontSize: 15 }}>Nice — done</button>
      </div>
    );
  }

  return (
    <div>
      <p style={{ margin: '0 0 18px', color: 'var(--muted)', fontSize: 14.5, fontWeight: 600, lineHeight: 1.5 }}>
        Same time, same scale, no stress. Enter today's weight and we'll do the math.</p>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
        <button onClick={() => setVal(v => (parseFloat(v) - 0.1).toFixed(1))} className="btn-ghost tap" style={{ width: 52, height: 60, fontSize: 24 }}>–</button>
        <div className="card" style={{ flex: 1, padding: '10px 0', textAlign: 'center' }}>
          <input
            value={val} onChange={e => setVal(e.target.value)} inputMode="decimal"
            style={{ width: '100%', background: 'transparent', border: 'none', outline: 'none', textAlign: 'center', color: 'var(--text)', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 40 }}
          />
          <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--faint)', letterSpacing: '0.1em' }}>KILOGRAMS</div>
        </div>
        <button onClick={() => setVal(v => (parseFloat(v) + 0.1).toFixed(1))} className="btn-ghost tap" style={{ width: 52, height: 60, fontSize: 24 }}>+</button>
      </div>
      <div style={{ fontSize: 13, color: 'var(--faint)', fontWeight: 700, textAlign: 'center', marginBottom: 18 }}>Last week · {last} kg</div>
      <button onClick={submit} className="btn-primary tap" style={{ width: '100%', padding: 15, fontSize: 15 }}>Log my weight</button>
    </div>
  );
}

// ── Add sheet content ────────────────────────────────────────
function AddSheetContent({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const { setWeighOpen } = useApp();

  const items = [
    { label: 'Log a workout', sub: 'Lifting or cardio', icon: <IconDumbbell size={22} />, on: () => { onClose(); router.push('/workout'); } },
    { label: 'Snap a meal', sub: 'Camera + AI estimate', icon: <IconCamera size={22} />, on: () => { onClose(); router.push('/nutrition/log'); } },
    { label: 'Weekly weigh-in', sub: 'Track body progress', icon: <IconScale size={22} />, on: () => { onClose(); setWeighOpen(true); } },
    { label: 'Browse exercises', sub: 'Guides & muscle maps', icon: <IconGuide size={22} />, on: () => { onClose(); router.push('/exercises'); } },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {items.map(it => (
        <div key={it.label} onClick={it.on} className="card tap" style={{ padding: 14, display: 'flex', alignItems: 'center', gap: 14 }}>
          <span style={{ width: 46, height: 46, borderRadius: 13, background: 'var(--ember-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ember)' }}>{it.icon}</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 800, fontSize: 15.5 }}>{it.label}</div>
            <div style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 600 }}>{it.sub}</div>
          </div>
          <span style={{ color: 'var(--faint)' }}><IconChevR size={18} /></span>
        </div>
      ))}
    </div>
  );
}

// ── Inner shell (needs context) ──────────────────────────────
import React from 'react';

function InnerShell({ children }: { children: React.ReactNode }) {
  const { toastMsg, weighOpen, setWeighOpen, addOpen, setAddOpen } = useApp();

  return (
    <div className="app-root">
      <div style={{ height: 'max(52px, env(safe-area-inset-top, 0px))' }} />
      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {children}
      </div>
      <BottomNav />
      <Toast msg={toastMsg} />

      <Sheet open={addOpen} onClose={() => setAddOpen(false)} title="Quick log">
        <AddSheetContent onClose={() => setAddOpen(false)} />
      </Sheet>

      <Sheet open={weighOpen} onClose={() => setWeighOpen(false)} title="Weekly weigh-in">
        <WeighInContent onClose={() => setWeighOpen(false)} />
      </Sheet>
    </div>
  );
}

// ── Public export ────────────────────────────────────────────
export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <AppProvider>
      <InnerShell>{children}</InnerShell>
    </AppProvider>
  );
}
