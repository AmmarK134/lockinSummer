'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/contexts/AppContext';
import { EXERCISES, MUSCLE_LABELS, type Exercise } from '@/data/exercises';
import Sheet from '@/components/ui/Sheet';

// ── Icons ────────────────────────────────────────────────────
const IClose = () => <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 6l12 12M18 6L6 18"/></svg>;
const ICheck = () => <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 6.5"/></svg>;
const IPlus = () => <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>;
const IClock = () => <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/></svg>;
const IDumbbell = () => <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M6.5 8.5v7M3.5 10v4M17.5 8.5v7M20.5 10v4M6.5 12h11"/></svg>;
const ISearch = () => <svg width={17} height={17} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="6.5"/><path d="M20 20l-3.6-3.6"/></svg>;
const IFlame = () => <svg width={46} height={46} viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 2.5c.5 3-2 4.2-2 6.5 0 1.1.8 2 1.8 2 1.4 0 1.7-1.2 1.4-2.4 1.7 1 2.8 2.7 2.8 4.9A6 6 0 0 1 6 13.6c0-2.4 1.4-3.6 2.6-5C10 7.3 11 5.4 12 2.5z"/></svg>;
const IBolt = () => <svg width={20} height={20} viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M13 2L4.5 13.2H11l-1.6 8.8L20 10.4h-6.5z"/></svg>;

function fmtTime(s: number) {
  const m = Math.floor(s / 60), ss = s % 60;
  return `${m}:${String(ss).padStart(2, '0')}`;
}

interface SetRow { w: string; r: string; done: boolean; }
interface SessionItem { ex: Exercise; sets: SetRow[]; notes: string; cardio: Record<string, string>; }

const PUSH_SEED = [
  { id: 'chest-press', sets: [{ w: '45', r: '12', done: false }, { w: '50', r: '10', done: false }, { w: '50', r: '8', done: false }] },
  { id: 'ohp',         sets: [{ w: '18', r: '10', done: false }, { w: '18', r: '9',  done: false }, { w: '20', r: '7', done: false }] },
  { id: 'pushdown',    sets: [{ w: '25', r: '15', done: false }, { w: '27', r: '12', done: false }, { w: '27', r: '11', done: false }] },
];

export default function WorkoutPage() {
  const router = useRouter();
  const { state, setState, toast } = useApp();

  const [session, setSession] = useState<SessionItem[]>(() =>
    PUSH_SEED.map(s => {
      const ex = EXERCISES.find(e => e.id === s.id)!;
      return { ex, sets: s.sets.map(x => ({ ...x })), notes: '', cardio: {} };
    })
  );
  const [elapsed, setElapsed] = useState(0);
  const [rest, setRest] = useState(0);
  const [pickOpen, setPickOpen] = useState(false);
  const [pickQ, setPickQ] = useState('');
  const [finishOpen, setFinishOpen] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (rest <= 0) return;
    const t = setInterval(() => setRest(r => r <= 1 ? 0 : r - 1), 1000);
    return () => clearInterval(t);
  }, [rest > 0]); // eslint-disable-line react-hooks/exhaustive-deps

  const update = (fn: (n: SessionItem[]) => void) =>
    setSession(s => {
      const n = s.map(e => ({ ...e, sets: e.sets.map(x => ({ ...x })), cardio: { ...e.cardio } }));
      fn(n); return n;
    });

  const setField = (ei: number, si: number, k: 'w' | 'r', v: string) =>
    update(n => { n[ei].sets[si][k] = v; });
  const toggleDone = (ei: number, si: number) =>
    update(n => { const cur = n[ei].sets[si].done; n[ei].sets[si].done = !cur; if (!cur) setRest(90); });
  const addSet = (ei: number) =>
    update(n => { const last = n[ei].sets[n[ei].sets.length - 1] || { w: '0', r: '10' }; n[ei].sets.push({ w: last.w, r: last.r, done: false }); });
  const setCardio = (ei: number, k: string, v: string) =>
    update(n => { n[ei].cardio[k] = v; });
  const setNotes = (ei: number, v: string) =>
    update(n => { n[ei].notes = v; });
  const addExercise = (ex: Exercise) => {
    setSession(s => [...s, { ex, sets: ex.type === 'cardio' ? [] : [{ w: '0', r: '10', done: false }], notes: '', cardio: {} }]);
    setPickOpen(false); setPickQ('');
  };
  const removeExercise = (ei: number) => setSession(s => s.filter((_, i) => i !== ei));

  const doneSets = session.reduce((a, e) => a + e.sets.filter(x => x.done).length, 0);
  const totalSets = session.reduce((a, e) => a + e.sets.length, 0);
  const volume = session.reduce((a, e) => a + e.sets.filter(x => x.done).reduce((b, x) => b + (parseFloat(x.w) || 0) * (parseInt(x.r) || 0), 0), 0);
  const xpEarned = 180 + doneSets * 15;

  const finish = () => {
    setState(st => ({ ...st, xp: st.xp + xpEarned, todayWorkout: { ...st.todayWorkout, done: true } }));
    setFinishOpen(true);
  };
  const closeFinish = () => { router.back(); toast(`🔥 +${xpEarned} XP · Workout logged`); };

  const picks = EXERCISES.filter(e => !pickQ || e.name.toLowerCase().includes(pickQ.toLowerCase()));
  const title = state.todayWorkout.name;

  return (
    <div className="app-root" style={{ position: 'fixed', inset: 0, zIndex: 50 }}>
      <div style={{ height: 52 }} />

      {/* Top bar */}
      <div style={{ padding: '6px 16px 12px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid var(--line)' }}>
        <button onClick={() => router.back()} className="tap" style={{ width: 38, height: 38, borderRadius: 12, border: '1px solid var(--line)', background: 'var(--surface-2)', color: 'var(--text)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><IClose /></button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 800, fontSize: 15, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{title}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: 1 }}>
            <span style={{ width: 7, height: 7, borderRadius: 99, background: 'var(--ember)', boxShadow: '0 0 6px var(--ember)' }} />
            <span className="mono" style={{ fontSize: 13, color: 'var(--ember-bright)', fontWeight: 700 }}>{fmtTime(elapsed)}</span>
            <span style={{ fontSize: 12, color: 'var(--faint)', fontWeight: 700 }}>· {doneSets}/{totalSets} sets</span>
          </div>
        </div>
        <button onClick={finish} className="btn-primary tap" style={{ padding: '10px 16px', fontSize: 14, flexShrink: 0 }}>Finish</button>
      </div>

      <div className="screen-scroll" style={{ paddingTop: 14, paddingBottom: rest > 0 ? 92 : 24 }}>
        <div className="pad" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {session.map((item, ei) => {
            const ex = item.ex;
            const isCardio = ex.type === 'cardio';
            return (
              <div key={ei + ex.id} className="card" style={{ padding: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                  <div style={{ width: 42, height: 42, borderRadius: 12, flexShrink: 0, background: 'var(--ember-soft)', color: 'var(--ember)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {isCardio ? <IClock /> : <IDumbbell />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 800, fontSize: 15.5, lineHeight: 1.15 }}>{ex.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 700, marginTop: 2 }}>{ex.targets.map(m => MUSCLE_LABELS[m]).join(' · ')}</div>
                  </div>
                  <button onClick={() => removeExercise(ei)} className="tap" style={{ width: 30, height: 30, borderRadius: 9, border: '1px solid var(--line)', background: 'transparent', color: 'var(--faint)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><IClose /></button>
                </div>

                {isCardio ? (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    {[['incline', 'Incline', '%'], ['speed', 'Speed', 'km/h'], ['mins', 'Duration', 'min'], ['distance', 'Distance', 'km'], ['kcal', 'Calories', 'kcal']].map(([k, l, u]) => (
                      <div key={k}>
                        <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--faint)', letterSpacing: '0.04em', marginBottom: 6, textTransform: 'uppercase' }}>{l}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <input value={item.cardio[k] || ''} inputMode="decimal" placeholder="—" onChange={e => setCardio(ei, k, e.target.value)} style={{ flex: 1, minWidth: 0, background: 'var(--surface-2)', border: '1px solid var(--line)', borderRadius: 10, color: 'var(--text)', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 17, padding: '9px 10px', outline: 'none' }} />
                          <span style={{ fontSize: 11, color: 'var(--faint)', fontWeight: 700, flexShrink: 0 }}>{u}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div>
                    <div style={{ display: 'grid', gridTemplateColumns: '30px 1fr 1fr 44px', gap: 8, alignItems: 'center', fontSize: 10, fontWeight: 800, color: 'var(--faint)', letterSpacing: '0.06em', marginBottom: 8, paddingLeft: 2 }}>
                      <span>SET</span><span style={{ textAlign: 'center' }}>KG</span><span style={{ textAlign: 'center' }}>REPS</span><span />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {item.sets.map((st, si) => (
                        <div key={si} style={{ display: 'grid', gridTemplateColumns: '30px 1fr 1fr 44px', gap: 8, alignItems: 'center', opacity: st.done ? 0.96 : 1 }}>
                          <span className="num" style={{ fontSize: 15, color: st.done ? 'var(--ember-bright)' : 'var(--muted)', paddingLeft: 4 }}>{si + 1}</span>
                          <div style={{ display: 'flex', justifyContent: 'center' }}>
                            <input value={st.w} inputMode="decimal" onChange={e => setField(ei, si, 'w', e.target.value)} style={{ width: '100%', textAlign: 'center', background: st.done ? 'var(--ember-soft)' : 'var(--surface-2)', border: `1px solid ${st.done ? 'var(--ember-line)' : 'var(--line)'}`, borderRadius: 10, color: 'var(--text)', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 17, padding: '9px 4px', outline: 'none' }} />
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'center' }}>
                            <input value={st.r} inputMode="numeric" onChange={e => setField(ei, si, 'r', e.target.value)} style={{ width: '100%', textAlign: 'center', background: st.done ? 'var(--ember-soft)' : 'var(--surface-2)', border: `1px solid ${st.done ? 'var(--ember-line)' : 'var(--line)'}`, borderRadius: 10, color: 'var(--text)', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 17, padding: '9px 4px', outline: 'none' }} />
                          </div>
                          <button onClick={() => toggleDone(ei, si)} className="tap" style={{ width: 40, height: 40, borderRadius: 11, justifySelf: 'center', border: st.done ? 'none' : '1px solid var(--line)', background: st.done ? 'var(--ember)' : 'var(--surface-2)', color: st.done ? '#1a0a06' : 'var(--faint)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ICheck /></button>
                        </div>
                      ))}
                    </div>
                    <button onClick={() => addSet(ei)} className="tap" style={{ marginTop: 10, width: '100%', padding: 10, borderRadius: 11, border: '1px dashed var(--line-strong)', background: 'transparent', color: 'var(--muted)', fontWeight: 800, fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}><IPlus /> Add set</button>
                  </div>
                )}

                <input value={item.notes} onChange={e => setNotes(ei, e.target.value)} placeholder="Notes — felt strong, bump weight next time…" style={{ width: '100%', marginTop: 12, background: 'transparent', border: 'none', borderTop: '1px solid var(--line)', color: 'var(--text)', fontFamily: 'var(--font-ui)', fontSize: 13, fontWeight: 500, padding: '12px 2px 0', outline: 'none' }} />
              </div>
            );
          })}

          <button onClick={() => setPickOpen(true)} className="btn-ghost tap" style={{ width: '100%', padding: 15, fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <IPlus /> Add exercise
          </button>
        </div>
      </div>

      {/* Rest timer */}
      {rest > 0 && (
        <div style={{ position: 'absolute', left: 14, right: 14, bottom: 24, zIndex: 40, background: 'var(--surface-3)', border: '1px solid var(--ember-line)', borderRadius: 16, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12, boxShadow: '0 12px 30px rgba(0,0,0,0.5)' }}>
          <span style={{ color: 'var(--ember)' }}><IClock /></span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--faint)', letterSpacing: '0.06em' }}>REST</div>
            <div className="num" style={{ fontSize: 22, lineHeight: 1, color: 'var(--ember-bright)' }}>{fmtTime(rest)}</div>
          </div>
          <button onClick={() => setRest(r => r + 15)} className="btn-ghost tap" style={{ padding: '8px 12px', fontSize: 13 }}>+15s</button>
          <button onClick={() => setRest(0)} className="btn-primary tap" style={{ padding: '8px 14px', fontSize: 13 }}>Skip</button>
        </div>
      )}

      {/* Exercise picker */}
      <Sheet open={pickOpen} onClose={() => setPickOpen(false)} title="Add exercise">
        <div style={{ position: 'relative', marginBottom: 12 }}>
          <span style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--faint)' }}><ISearch /></span>
          <input className="field" autoFocus value={pickQ} onChange={e => setPickQ(e.target.value)} placeholder="Search exercises…" style={{ paddingLeft: 40 }} />
        </div>
        <div style={{ maxHeight: 300, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {picks.map(ex => (
            <div key={ex.id} onClick={() => addExercise(ex)} className="card tap" style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ color: 'var(--ember)' }}>{ex.type === 'cardio' ? <IClock /> : <IDumbbell />}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 800, fontSize: 14.5 }}>{ex.name}</div>
                <div style={{ fontSize: 11.5, color: 'var(--muted)', fontWeight: 700 }}>{ex.category} · {ex.equipment}</div>
              </div>
              <span style={{ color: 'var(--ember)' }}><IPlus /></span>
            </div>
          ))}
        </div>
      </Sheet>

      {/* Finish summary overlay */}
      {finishOpen && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 85, background: 'rgba(5,6,8,0.78)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div className="card" style={{ width: '100%', padding: '26px 20px', textAlign: 'center', background: 'radial-gradient(120% 100% at 50% 0%, rgba(255,92,56,0.16), var(--surface) 60%)', borderColor: 'var(--ember-line)', animation: 'pop-in .3s ease' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 6 }}>
              <span className="flame" style={{ color: 'var(--ember)' }}><IFlame /></span>
            </div>
            <div className="h-display" style={{ fontSize: 30 }}>Workout done</div>
            <div style={{ color: 'var(--muted)', fontWeight: 600, fontSize: 14, marginTop: 4 }}>Logged & locked in. 💪</div>
            <div style={{ display: 'flex', gap: 10, margin: '20px 0' }}>
              {[['Time', fmtTime(elapsed)], ['Sets', String(doneSets)], ['Volume', `${Math.round(volume).toLocaleString()} kg`]].map(([l, v]) => (
                <div key={l} className="card" style={{ flex: 1, padding: '12px 6px', background: 'var(--surface-2)' }}>
                  <div className="num" style={{ fontSize: 19 }}>{v}</div>
                  <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--faint)', letterSpacing: '0.06em', marginTop: 2 }}>{l}</div>
                </div>
              ))}
            </div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 18px', borderRadius: 99, background: 'var(--ember-soft)', border: '1px solid var(--ember-line)', marginBottom: 20 }}>
              <span style={{ color: 'var(--ember)' }}><IBolt /></span>
              <span className="num" style={{ fontSize: 22, color: 'var(--ember-bright)' }}>+{xpEarned} XP</span>
            </div>
            <button onClick={closeFinish} className="btn-primary tap" style={{ width: '100%', padding: 15, fontSize: 15 }}>Back to home</button>
          </div>
        </div>
      )}
    </div>
  );
}
