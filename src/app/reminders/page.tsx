'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/contexts/AppContext';
import { lsGet, lsSet, LS_REMINDERS } from '@/lib/storage';

const IChevL = () => <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 5l-7 7 7 7"/></svg>;
const IBell = () => <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6z"/><path d="M10 19a2 2 0 0 0 4 0"/></svg>;
const IWater = ({ size = 20 }: { size?: number }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3.2C12 3.2 6 9.4 6 14a6 6 0 0 0 12 0c0-4.6-6-10.8-6-10.8z"/></svg>;
const ICamera = ({ size = 20 }: { size?: number }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 8.5h3l1.5-2h7L17 8.5h3a1.5 1.5 0 0 1 1.5 1.5v8A1.5 1.5 0 0 1 20 19.5H4A1.5 1.5 0 0 1 2.5 18v-8A1.5 1.5 0 0 1 4 8.5z"/><circle cx="12" cy="13.5" r="3.2"/></svg>;
const IDumbbell = ({ size = 20 }: { size?: number }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M6.5 8.5v7M3.5 10v4M17.5 8.5v7M20.5 10v4M6.5 12h11"/></svg>;
const ITarget = ({ size = 20 }: { size?: number }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r="0.6" fill="currentColor"/></svg>;
const IMoon = ({ size = 20 }: { size?: number }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/></svg>;
const IScale = ({ size = 20 }: { size?: number }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3.5" y="4.5" width="17" height="15" rx="3"/><path d="M12 8.5l2.2 3.5h-4.4z"/><path d="M8.5 16.5h7"/></svg>;

interface Reminder {
  id: string; label: string; body: string; time: string; enabled: boolean;
  action?: string; color: string; icon: React.ReactNode; recurring?: boolean; weekly?: boolean;
}

const DEFAULT_REMINDERS: Reminder[] = [
  { id: 'water',   label: 'Hydration check', body: 'Time for a glass of water 💧',              time: 'every 2h', enabled: true, action: 'water',   color: 'var(--water)',   icon: <IWater />,    recurring: true },
  { id: 'meal',    label: 'Log your meals',  body: 'Snap lunch so the macros stay honest',        time: '12:30',    enabled: true, action: 'food',    color: 'var(--carbs)',   icon: <ICamera /> },
  { id: 'gym',     label: 'Gym time',        body: "Don't skip — today is Push Day",              time: '17:30',    enabled: true, action: 'workout', color: 'var(--ember)',   icon: <IDumbbell /> },
  { id: 'protein', label: 'Protein check',   body: 'Close the gap on your protein goal',          time: '20:00',    enabled: true, action: 'food',    color: 'var(--protein)', icon: <ITarget /> },
  { id: 'sleep',   label: 'Wind down',       body: 'Lights out soon — recovery is where you grow 😴', time: '22:30', enabled: true, color: '#9d86ff',  icon: <IMoon /> },
  { id: 'weigh',   label: 'Weekly weigh-in', body: 'Monday morning check-in',                    time: '08:00',    enabled: true, action: 'weigh',   color: 'var(--good)',    icon: <IScale />, weekly: true },
];

function toMin(t: string) { const m = /^(\d{1,2}):(\d{2})$/.exec(t); return m ? +m[1] * 60 + +m[2] : null; }
function nowMin() { const d = new Date(); return d.getHours() * 60 + d.getMinutes(); }

function getStatus(r: Reminder): 'done' | 'next' | 'soon' | 'recurring' {
  if (r.recurring) return 'recurring';
  const min = toMin(r.time);
  const now = nowMin();
  if (min == null) return 'soon';
  if (min < now) return 'done';
  return 'soon';
}

function actionLabel(a?: string) {
  if (a === 'water') return 'Log water';
  if (a === 'workout') return 'Start';
  if (a === 'weigh') return 'Weigh in';
  if (a === 'food') return 'Snap meal';
  return null;
}

export default function RemindersPage() {
  const router = useRouter();
  const { setState, setWeighOpen, toast } = useApp();

  const [reminders, setReminders] = useState<Reminder[]>(() =>
    lsGet<Reminder[]>(LS_REMINDERS) || DEFAULT_REMINDERS
  );

  const save = (rs: Reminder[]) => { setReminders(rs); lsSet(LS_REMINDERS, rs); };
  const toggle = (id: string) => save(reminders.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r));
  const setTime = (id: string, v: string) => save(reminders.map(r => r.id === id ? { ...r, time: v } : r));

  const onAction = (action: string) => {
    if (action === 'water') {
      setState(s => ({ ...s, waterCups: Math.min(s.waterGoal + 4, s.waterCups + 1) }));
      toast('💧 +15 XP · Hydration logged');
    } else if (action === 'workout') {
      router.push('/workout');
    } else if (action === 'weigh') {
      setWeighOpen(true);
    } else if (action === 'food') {
      router.push('/nutrition/log');
    }
  };

  const statusPill = (s: ReturnType<typeof getStatus>) => {
    const map = {
      next:      ['Due now',   'var(--ember-bright)', 'var(--ember-soft)',  'var(--ember-line)'],
      soon:      ['Scheduled', 'var(--muted)',         'var(--surface-2)',   'var(--line)'],
      done:      ['Done',      'var(--good)',           'var(--surface-2)',   'var(--line)'],
      recurring: ['Recurring', 'var(--water)',          'var(--surface-2)',   'var(--line)'],
    } as const;
    const [text, c, bg, bd] = map[s];
    return <span style={{ fontSize: 10.5, fontWeight: 800, color: c, background: bg, border: `1px solid ${bd}`, padding: '3px 9px', borderRadius: 99, letterSpacing: '0.03em', flexShrink: 0, whiteSpace: 'nowrap' }}>{s === 'done' ? '✓ ' + text : text}</span>;
  };

  const enabled = reminders.filter(r => r.enabled);
  const timed = enabled.filter(r => !r.recurring);
  const recurring = enabled.filter(r => r.recurring);
  const feed = [...recurring, ...timed];

  return (
    <div className="screen-scroll screen-anim">
      <div style={{ padding: '6px 18px 0', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={() => router.push('/')} className="tap" style={{ width: 38, height: 38, borderRadius: 12, border: '1px solid var(--line)', background: 'var(--surface-2)', color: 'var(--text)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><IChevL /></button>
        <span className="kicker">Reminders</span>
      </div>

      <div className="pad" style={{ paddingTop: 14, paddingBottom: 24 }}>
        <div className="h-display" style={{ fontSize: 30, marginBottom: 6 }}>Today's nudges</div>
        <div style={{ display: 'flex', gap: 9, alignItems: 'flex-start', background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 14, padding: '12px 14px', marginBottom: 18 }}>
          <span style={{ color: 'var(--muted)', marginTop: 1, flexShrink: 0 }}><IBell /></span>
          <span style={{ fontSize: 12.5, color: 'var(--muted)', fontWeight: 500, lineHeight: 1.45 }}>
            iOS limits web push, so LockIn keeps nudges <b style={{ color: 'var(--text)' }}>in-app</b> — open it daily and we surface what's due. Add to your Home Screen for the most app-like reminders.
          </span>
        </div>

        {/* Feed */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 22 }}>
          {feed.map(r => {
            const status = getStatus(r);
            const isNext = status === 'next';
            const act = r.action && actionLabel(r.action);
            return (
              <div key={r.id} className="card" style={{ padding: 14, display: 'flex', alignItems: 'center', gap: 13, opacity: status === 'done' ? 0.6 : 1, borderColor: isNext ? 'var(--ember-line)' : 'var(--line)', background: isNext ? 'linear-gradient(100deg, rgba(255,92,56,0.08), var(--surface) 65%)' : 'var(--surface)' }}>
                <span style={{ width: 44, height: 44, borderRadius: 13, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--surface-2)', color: r.color }}>{r.icon}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                    <span style={{ fontWeight: 800, fontSize: 14.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', minWidth: 0 }}>{r.label}</span>
                    {statusPill(status)}
                  </div>
                  <div style={{ fontSize: 12.5, color: 'var(--muted)', fontWeight: 500, lineHeight: 1.35 }}>{r.body}</div>
                  <div className="mono" style={{ fontSize: 11, color: 'var(--faint)', marginTop: 4 }}>{r.recurring ? 'every 2 hours' : r.time}</div>
                </div>
                {act && status !== 'done' && (
                  <button onClick={() => onAction(r.action!)} className={(isNext ? 'btn-primary' : 'btn-ghost') + ' tap'} style={{ padding: '9px 13px', fontSize: 12.5, flexShrink: 0 }}>{act}</button>
                )}
              </div>
            );
          })}
        </div>

        {/* Settings */}
        <div className="kicker" style={{ margin: '0 2px 12px' }}>Reminder settings</div>
        <div className="card" style={{ padding: '4px 16px' }}>
          {reminders.map((r, i) => (
            <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 0', borderTop: i ? '1px solid var(--line)' : 'none' }}>
              <span style={{ color: r.enabled ? r.color : 'var(--faint)', flexShrink: 0 }}>{r.icon}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 14.5, color: r.enabled ? 'var(--text)' : 'var(--muted)' }}>{r.label}</div>
              </div>
              {r.recurring
                ? <span className="mono" style={{ fontSize: 12, color: 'var(--faint)' }}>2h</span>
                : <input type="time" value={r.time} onChange={e => setTime(r.id, e.target.value)} disabled={!r.enabled} style={{ background: 'var(--surface-2)', border: '1px solid var(--line)', borderRadius: 9, color: r.enabled ? 'var(--text)' : 'var(--faint)', fontFamily: 'var(--font-mono)', fontSize: 12.5, padding: '6px 8px', outline: 'none', colorScheme: 'dark' }} />
              }
              <button onClick={() => toggle(r.id)} className="tap" style={{ width: 46, height: 28, borderRadius: 99, flexShrink: 0, border: 'none', cursor: 'pointer', position: 'relative', transition: 'background .2s', background: r.enabled ? 'var(--ember)' : 'var(--surface-3)' }}>
                <span style={{ position: 'absolute', top: 3, left: r.enabled ? 21 : 3, width: 22, height: 22, borderRadius: '50%', background: '#fff', transition: 'left .2s', boxShadow: '0 1px 3px rgba(0,0,0,0.4)' }} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
