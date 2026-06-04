'use client';
import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { EXERCISES, GOALS, DAYS, type Exercise } from '@/data/exercises';
import Bar from '@/components/ui/Bar';
import { lsGet, lsSet, LS_PLAN } from '@/lib/storage';

const IBolt = () => <svg width={20} height={20} viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M13 2L4.5 13.2H11l-1.6 8.8L20 10.4h-6.5z"/></svg>;
const ITarget = () => <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r="0.6" fill="currentColor"/></svg>;
const IChart = () => <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 20V4"/><path d="M4 20h16"/><path d="M8 16l3.5-4 3 2.5L20 8"/></svg>;
const IClock = () => <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/></svg>;
const ICheck = () => <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 6.5"/></svg>;
const IChevDown = () => <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6"/></svg>;

// ── Plan engine ───────────────────────────────────────────────
interface DayPlan { day: string; rest: boolean; focus?: string; exercises?: { name: string; sets: number; reps: string; rest: string }[]; }
interface Plan { splitName: string; days: number; goal: string; tag: string; why: string; week: DayPlan[]; cardio: string; progression: string[]; }

function chooseSplit(n: number): string[] {
  if (n <= 2) return Array(Math.max(n, 1)).fill('Full Body');
  if (n === 3) return ['Full Body', 'Full Body', 'Full Body'];
  if (n === 4) return ['Upper', 'Lower', 'Upper', 'Lower'];
  if (n === 5) return ['Push', 'Pull', 'Legs', 'Upper', 'Lower'];
  return ['Push', 'Pull', 'Legs', 'Push', 'Pull', 'Legs'].slice(0, n);
}
function splitName(n: number) {
  if (n <= 3) return 'Full-Body';
  if (n === 4) return 'Upper / Lower';
  return 'Push / Pull / Legs';
}
function getScheme(goal: string, exp: string) {
  let s;
  if (goal === 'get-stronger')  s = { sets: 5, reps: '4–6',   rest: '2–3 min', tag: 'Strength' };
  else if (goal === 'build-muscle') s = { sets: 4, reps: '8–12',  rest: '60–90s',  tag: 'Hypertrophy' };
  else if (goal === 'lose-fat') s = { sets: 3, reps: '12–15', rest: '45s',      tag: 'Metabolic' };
  else if (goal === 'cardio')   s = { sets: 3, reps: '12–15', rest: '45s',      tag: 'Conditioning' };
  else                          s = { sets: 3, reps: '10–12', rest: '60s',      tag: 'Balanced' };
  if (exp === 'Brand new')    s = { ...s, sets: Math.max(2, s.sets - 1) };
  if (exp === 'Experienced')  s = { ...s, sets: s.sets + 1 };
  return s;
}
function focusExercises(focus: string): Exercise[] {
  const push = EXERCISES.filter(e => e.category === 'Push');
  const pull = EXERCISES.filter(e => e.category === 'Pull');
  const legs = EXERCISES.filter(e => e.category === 'Legs');
  const core = EXERCISES.filter(e => e.category === 'Core');
  switch (focus) {
    case 'Push':  return push.slice(0, 4);
    case 'Pull':  return [...pull.slice(0, 3), ...push.slice(3, 4)].filter(Boolean);
    case 'Legs':  return [...legs.slice(0, 3), ...core.slice(0, 1)].filter(Boolean);
    case 'Upper': return [push[0], push[2], pull[0], pull[2]].filter(Boolean);
    case 'Lower': return [legs[0], legs[1], legs[2], core[0]].filter(Boolean);
    default:      return [push[0], pull[0], legs[0], core[0]].filter(Boolean);
  }
}
function cardioRec(goal: string) {
  if (goal === 'lose-fat')     return '3–4× per week · 25–35 min incline treadmill or intervals — after lifting or on off days.';
  if (goal === 'cardio')       return '4–5× per week · 30–40 min mixing steady-state and intervals.';
  if (goal === 'build-muscle') return '1–2× per week · 20 min easy zone-2 to aid recovery, not burn hard-won calories.';
  if (goal === 'get-stronger') return 'Optional 1× per week · 20 min low-intensity to keep your engine ticking.';
  return '2–3× per week · 25 min of anything you enjoy — keep the heart happy.';
}
function generatePlan(profile: { goal: string; experience: string; days: string[] }): Plan {
  const trainingDays = DAYS.filter(d => profile.days.includes(d));
  const tDays = trainingDays.length ? trainingDays : ['Mon', 'Tue', 'Thu', 'Sat'];
  const n = tDays.length;
  const seq = chooseSplit(n);
  const sch = getScheme(profile.goal, profile.experience);
  let ti = 0;
  const week = DAYS.map(d => {
    if (tDays.includes(d)) {
      const focus = seq[ti % seq.length]; ti++;
      const exs = focusExercises(focus).map(ex => ({
        name: ex.name,
        sets: ex.category === 'Core' ? 3 : sch.sets,
        reps: ex.category === 'Core' ? 'hold 30–60s' : sch.reps,
        rest: ex.category === 'Core' ? '30s' : sch.rest,
      }));
      return { day: d, rest: false, focus, exercises: exs };
    }
    return { day: d, rest: true };
  });
  const goalLabel = GOALS.find(g => g.id === profile.goal)?.label || 'General Fitness';
  const n_str = n <= 3 ? `With ${n} day${n > 1 ? 's' : ''} a week, a full-body layout hits every muscle each session.` : n === 4 ? 'Four days splits cleanly into Upper/Lower.' : `Across ${n} days a PPL rotation lets you train hard and recover.`;
  return {
    splitName: splitName(n), days: n, goal: goalLabel, tag: sch.tag,
    why: `${n_str} ${goalLabel} focus — ${sch.reps} reps, ${sch.rest} rest.`,
    week,
    cardio: cardioRec(profile.goal),
    progression: [
      'Add 2.5 kg (upper) or 5 kg (lower) once you hit the top of the rep range on every set.',
      'Keep 1–2 reps in reserve early in the week; push closer to failure on your last sets.',
      'Every 4th week, cut volume ~40% for a deload so your joints and CNS catch up.',
      'Re-check your weekly weigh-in — if progress stalls 2+ weeks, adjust calories or volume.',
    ],
  };
}

const EQUIP = ['Full gym', 'Home rack', 'Dumbbells only', 'Bodyweight'];
const INJURIES = ['None', 'Shoulder', 'Lower back', 'Knee', 'Wrist'];
const GEN_STEPS = ['Reading your goal & stats…', 'Choosing the right split…', 'Balancing volume & recovery…', 'Picking your exercises…', 'Writing your plan…'];

export default function PlanPage() {
  const { profile, toast } = useApp();

  const [mode, setMode] = useState<'config' | 'generating' | 'result'>(() =>
    lsGet<Plan>(LS_PLAN) ? 'result' : 'config'
  );
  const [plan, setPlan] = useState<Plan | null>(() => lsGet<Plan>(LS_PLAN));
  const [equip, setEquip] = useState('Full gym');
  const [length, setLength] = useState(50);
  const [injuries, setInjuries] = useState(['None']);
  const [genStep, setGenStep] = useState(0);
  const [open, setOpen] = useState<number | null>(0);

  const toggleInjury = (x: string) => setInjuries(s => {
    if (x === 'None') return ['None'];
    const base = s.filter(i => i !== 'None');
    return base.includes(x) ? (base.filter(i => i !== x).length ? base.filter(i => i !== x) : ['None']) : [...base, x];
  });

  const runGenerate = () => {
    setMode('generating'); setGenStep(0);
    let i = 0;
    const tick = setInterval(() => {
      i++; setGenStep(i);
      if (i >= GEN_STEPS.length - 1) {
        clearInterval(tick);
        setTimeout(() => {
          const p = generatePlan(profile ? { goal: profile.goal, experience: profile.experience, days: profile.days } : { goal: 'build-muscle', experience: 'Some experience', days: ['Mon', 'Tue', 'Thu', 'Sat'] });
          setPlan(p);
          lsSet(LS_PLAN, p);
          setMode('result'); setOpen(0);
          toast('⚡ +120 XP · Plan generated');
        }, 480);
      }
    }, 360);
  };

  const goalLabel = profile ? (GOALS.find(g => g.id === profile.goal)?.label || 'General Fitness') : 'General Fitness';
  const Pill = ({ on, children, onClick }: { on: boolean; children: React.ReactNode; onClick: () => void }) => (
    <div onClick={onClick} className={`chip tap${on ? ' on' : ''}`} style={{ fontSize: 13 }}>{children}</div>
  );

  if (mode === 'config') return (
    <div className="screen-scroll screen-anim">
      <div className="pad" style={{ paddingTop: 8 }}>
        <div className="kicker" style={{ marginBottom: 6 }}>Built around you</div>
        <div className="h-display" style={{ fontSize: 30, marginBottom: 16 }}>AI Plan Generator</div>

        {profile && (
          <div className="card" style={{ padding: 16, marginBottom: 14 }}>
            <div className="kicker" style={{ marginBottom: 12 }}>From your profile</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 9 }}>
              {[['Goal', goalLabel], ['Level', profile.experience], ['Days/wk', String(profile.days.length)], ['Diet', profile.diet]].map(([k, v]) => (
                <div key={k} style={{ flex: '1 0 44%', background: 'var(--surface-2)', border: '1px solid var(--line)', borderRadius: 12, padding: '10px 12px' }}>
                  <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--faint)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>{k}</div>
                  <div style={{ fontWeight: 800, fontSize: 14.5, marginTop: 2 }}>{v}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--muted)', marginBottom: 8, paddingLeft: 2 }}>Equipment access</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {EQUIP.map(e => <Pill key={e} on={equip === e} onClick={() => setEquip(e)}>{e}</Pill>)}
          </div>
        </div>

        <div className="card" style={{ padding: '14px 16px', marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--muted)' }}>Session length</span>
            <span className="mono" style={{ fontSize: 13, color: 'var(--ember-bright)' }}>{length} min</span>
          </div>
          <input type="range" min="30" max="90" step="5" value={length} onChange={e => setLength(+e.target.value)} style={{ width: '100%', accentColor: 'var(--ember)' }} />
        </div>

        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--muted)', marginBottom: 8, paddingLeft: 2 }}>Injuries / limitations</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {INJURIES.map(e => <Pill key={e} on={injuries.includes(e)} onClick={() => toggleInjury(e)}>{e}</Pill>)}
          </div>
        </div>

        <button onClick={runGenerate} className="btn-primary tap" style={{ width: '100%', padding: 16, fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9 }}>
          <IBolt /> Generate my plan
        </button>
        <div style={{ height: 10 }} />
      </div>
    </div>
  );

  if (mode === 'generating') return (
    <div className="screen-scroll" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="pad" style={{ textAlign: 'center', width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
          <div style={{ position: 'relative', width: 96, height: 96 }}>
            <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '3px solid var(--surface-3)' }} />
            <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '3px solid transparent', borderTopColor: 'var(--ember)', animation: 'spin 0.9s linear infinite', filter: 'drop-shadow(0 0 6px var(--ember-glow))' }} />
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: 'var(--ember)' }}><svg width={34} height={34} viewBox="0 0 24 24" fill="currentColor"><path d="M13 2L4.5 13.2H11l-1.6 8.8L20 10.4h-6.5z"/></svg></span>
            </div>
          </div>
        </div>
        <div className="h-display" style={{ fontSize: 26, marginBottom: 10 }}>Building your plan</div>
        <div style={{ height: 24 }}>
          <div key={genStep} style={{ color: 'var(--muted)', fontWeight: 600, fontSize: 15, animation: 'pop-in .3s ease' }}>{GEN_STEPS[genStep]}</div>
        </div>
        <div style={{ maxWidth: 220, margin: '22px auto 0' }}>
          <Bar pct={(genStep + 1) / GEN_STEPS.length} />
        </div>
      </div>
    </div>
  );

  if (!plan) { setMode('config'); return null; }
  return (
    <div className="screen-scroll screen-anim">
      <div className="pad" style={{ paddingTop: 8 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 14 }}>
          <div>
            <div className="kicker" style={{ marginBottom: 6 }}>Your plan · {plan.tag}</div>
            <div className="h-display" style={{ fontSize: 26 }}>{plan.splitName}</div>
            <div style={{ color: 'var(--muted)', fontWeight: 600, fontSize: 13.5, marginTop: 3 }}>{plan.days} days / week · {plan.goal}</div>
          </div>
          <button onClick={() => setMode('config')} className="tap" style={{ flexShrink: 0, padding: '9px 13px', borderRadius: 12, border: '1px solid var(--line)', background: 'var(--surface-2)', color: 'var(--muted)', fontWeight: 800, fontSize: 12.5, display: 'flex', alignItems: 'center', gap: 6 }}>
            <IBolt /> Redo
          </button>
        </div>

        <div className="card" style={{ padding: 16, marginBottom: 14, background: 'radial-gradient(120% 120% at 100% 0%, rgba(255,92,56,0.12), var(--surface) 55%)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 9 }}>
            <span style={{ color: 'var(--ember)' }}><ITarget /></span>
            <span className="h-display" style={{ fontSize: 17 }}>Why this plan</span>
          </div>
          <p style={{ margin: 0, fontSize: 14, lineHeight: 1.55, color: 'var(--text)', fontWeight: 500 }}>{plan.why}</p>
        </div>

        <div className="kicker" style={{ margin: '4px 0 10px 2px' }}>Weekly schedule</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
          {plan.week.map((d, i) => {
            if (d.rest) return (
              <div key={d.day} className="card" style={{ padding: '13px 16px', display: 'flex', alignItems: 'center', gap: 13, opacity: 0.62 }}>
                <span className="num" style={{ width: 38, fontSize: 14, color: 'var(--faint)' }}>{d.day}</span>
                <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--muted)' }}>Rest & recover</span>
                <span style={{ marginLeft: 'auto', fontSize: 11, fontWeight: 800, color: 'var(--faint)' }}>OFF</span>
              </div>
            );
            const isOpen = open === i;
            return (
              <div key={d.day} className="card" style={{ overflow: 'hidden' }}>
                <div onClick={() => setOpen(isOpen ? null : i)} className="tap" style={{ padding: '13px 16px', display: 'flex', alignItems: 'center', gap: 13 }}>
                  <span className="num" style={{ width: 38, fontSize: 14, color: 'var(--ember-bright)' }}>{d.day}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 800, fontSize: 15 }}>{d.focus}</div>
                    <div style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600 }}>{d.exercises?.length} exercises</div>
                  </div>
                  <span style={{ color: 'var(--faint)', transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }}><IChevDown /></span>
                </div>
                {isOpen && d.exercises && (
                  <div style={{ padding: '0 16px 14px' }}>
                    <div style={{ borderTop: '1px solid var(--line)', paddingTop: 10, display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {d.exercises.map((ex, xi) => (
                        <div key={xi} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 0', borderBottom: xi < d.exercises!.length - 1 ? '1px solid var(--line)' : 'none' }}>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontWeight: 700, fontSize: 14 }}>{ex.name}</div>
                            <div className="mono" style={{ fontSize: 11, color: 'var(--faint)', marginTop: 2 }}>rest {ex.rest}</div>
                          </div>
                          <div style={{ textAlign: 'right', flexShrink: 0 }}>
                            <span className="num" style={{ fontSize: 16, color: 'var(--ember-bright)' }}>{ex.sets}<span style={{ fontSize: 11, color: 'var(--muted)' }}>×</span>{ex.reps}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="card" style={{ padding: 16, marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 9 }}>
            <span style={{ color: 'var(--water)' }}><IClock /></span>
            <span className="h-display" style={{ fontSize: 17 }}>Cardio</span>
          </div>
          <p style={{ margin: 0, fontSize: 14, lineHeight: 1.5, color: 'var(--text)', fontWeight: 500 }}>{plan.cardio}</p>
        </div>

        <div className="card" style={{ padding: 16, marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <span style={{ color: 'var(--good)' }}><IChart /></span>
            <span className="h-display" style={{ fontSize: 17 }}>Progression</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
            {plan.progression.map((p, i) => (
              <div key={i} style={{ display: 'flex', gap: 11 }}>
                <span style={{ width: 7, height: 7, borderRadius: 99, background: 'var(--good)', flexShrink: 0, marginTop: 7 }} />
                <span style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.5, fontWeight: 500 }}>{p}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, color: 'var(--good)', fontSize: 13, fontWeight: 800, padding: '4px 0 14px' }}>
          <ICheck /> Plan saved · synced to your week
        </div>
      </div>
    </div>
  );
}
