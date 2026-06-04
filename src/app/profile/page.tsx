'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp, createFreshState, type Profile } from '@/contexts/AppContext';
import { rankForXp } from '@/lib/gamification';
import { GOALS, ACTIVITY_LEVELS, EXPERIENCE_LEVELS, DIET_PREFS, DAYS } from '@/data/exercises';
import Bar from '@/components/ui/Bar';
import RankBadge from '@/components/ui/RankBadge';
import Segmented from '@/components/ui/Segmented';

function startXpFor(exp: string) {
  if (exp === 'Experienced') return 8240;
  if (exp === 'Some experience') return 4700;
  return 180;
}

const IChevL = () => (
  <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 5l-7 7 7 7"/></svg>
);
const ICog = () => (
  <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3.2"/><path d="M12 3v2.2M12 18.8V21M4.2 7.5l1.9 1.1M17.9 15.4l1.9 1.1M19.8 7.5l-1.9 1.1M6.1 15.4l-1.9 1.1"/></svg>
);
const Logo = () => (
  <img src="/logo.jpg" alt="LockIn" width={42} height={42} style={{ borderRadius: 10 }} />
);

type FormState = Omit<Profile, '_startXp'>;

const DEFAULT_FORM: FormState = {
  name: '', age: '', gender: '', heightCm: '', weightKg: '', goalWeightKg: '',
  goal: 'build-muscle', activity: 'Lightly active', experience: 'Some experience',
  diet: 'High protein', days: ['Mon', 'Tue', 'Thu', 'Sat'],
};

function Onboarding({ onComplete }: { onComplete: (p: Profile) => void }) {
  const [step, setStep] = useState(0);
  const [p, setP] = useState<FormState>({ ...DEFAULT_FORM });

  const set = (k: keyof FormState, v: string | string[]) =>
    setP(s => ({ ...s, [k]: v }));
  const toggleDay = (d: string) =>
    setP(s => ({ ...s, days: s.days.includes(d) ? s.days.filter(x => x !== d) : [...s.days, d] }));

  const STEPS = 5;
  const canNext = () => {
    if (step === 0) return p.name.trim().length > 0;
    if (step === 1) return !!(p.age && p.heightCm && p.weightKg);
    if (step === 2) return !!(p.goal && p.goalWeightKg);
    return true;
  };
  const finish = () => onComplete({ ...p, _startXp: startXpFor(p.experience) });
  const demo = () => onComplete({
    name: 'Alex', age: '27', gender: 'Male', heightCm: '178', weightKg: '80.6',
    goalWeightKg: '76', goal: 'build-muscle', activity: 'Active',
    experience: 'Experienced', diet: 'High protein', days: ['Mon', 'Tue', 'Thu', 'Sat'],
    _startXp: 8240,
  });

  const Label = ({ children }: { children: React.ReactNode }) => (
    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--muted)', margin: '0 0 8px 2px' }}>{children}</div>
  );

  return (
    <div className="app-root" style={{ position: 'fixed', inset: 0, zIndex: 50 }}>
      <div style={{ height: 'max(54px, env(safe-area-inset-top, 0px))' }} />

      {/* Step progress header */}
      {step < 4 && (
        <div style={{ padding: '8px 18px 4px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={step === 0 ? undefined : () => setStep(s => s - 1)} className="tap" style={{ width: 38, height: 38, borderRadius: 12, border: '1px solid var(--line)', background: 'var(--surface-2)', color: step === 0 ? 'var(--faint)' : 'var(--text)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: step === 0 ? 0.4 : 1, cursor: step === 0 ? 'default' : 'pointer' }}>
            <IChevL />
          </button>
          <div style={{ flex: 1, display: 'flex', gap: 6 }}>
            {Array.from({ length: STEPS }).map((_, i) => (
              <div key={i} style={{ flex: 1, height: 4, borderRadius: 99, background: i <= step ? 'var(--ember)' : 'var(--surface-3)', transition: 'background .3s ease' }} />
            ))}
          </div>
        </div>
      )}

      <div className="screen-scroll" style={{ padding: '18px 0' }}>
        <div className="pad screen-anim" key={step}>

          {step === 0 && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                <Logo /><div className="h-display" style={{ fontSize: 30, letterSpacing: '0.02em' }}>LOCKIN</div>
              </div>
              <div style={{ marginBottom: 20 }}>
                <div className="kicker" style={{ marginBottom: 10 }}>Let's get you set up</div>
                <div className="h-display" style={{ fontSize: 30, marginBottom: 14 }}>Welcome 👋<br />What's your name?</div>
                <div style={{ color: 'var(--muted)', fontSize: 15, fontWeight: 500 }}>A few quick questions so your plan, ranks and targets actually fit you.</div>
              </div>
              <Label>Your name</Label>
              <input className="field" value={p.name} autoFocus onChange={e => set('name', e.target.value)} placeholder="e.g. Alex" />
              <div onClick={demo} className="tap" style={{ marginTop: 18, textAlign: 'center', color: 'var(--muted)', fontSize: 14, fontWeight: 700, textDecoration: 'underline', textUnderlineOffset: 3 }}>Skip — explore the demo</div>
            </div>
          )}

          {step === 1 && (
            <div>
              <div style={{ marginBottom: 20 }}>
                <div className="kicker" style={{ marginBottom: 10 }}>Hey {p.name || 'there'}</div>
                <div className="h-display" style={{ fontSize: 30, marginBottom: 14 }}>About your body</div>
                <div style={{ color: 'var(--muted)', fontSize: 15, fontWeight: 500 }}>We use these to size your calories, targets and starting rank.</div>
              </div>
              <Label>Biological sex</Label>
              <Segmented options={['Male', 'Female', 'Other']} value={p.gender} onChange={v => set('gender', v)} />
              <div style={{ height: 16 }} />
              <div style={{ display: 'flex', gap: 12 }}>
                <div style={{ flex: 1 }}><Label>Age</Label><input className="field" type="number" inputMode="numeric" value={p.age} onChange={e => set('age', e.target.value)} placeholder="27" /></div>
                <div style={{ flex: 1 }}><Label>Height (cm)</Label><input className="field" type="number" inputMode="numeric" value={p.heightCm} onChange={e => set('heightCm', e.target.value)} placeholder="178" /></div>
              </div>
              <div style={{ height: 16 }} />
              <Label>Current weight (kg)</Label>
              <input className="field" type="number" inputMode="decimal" value={p.weightKg} onChange={e => set('weightKg', e.target.value)} placeholder="80.5" />
            </div>
          )}

          {step === 2 && (
            <div>
              <div style={{ marginBottom: 20 }}>
                <div className="kicker" style={{ marginBottom: 10 }}>The mission</div>
                <div className="h-display" style={{ fontSize: 30, marginBottom: 14 }}>What's the goal?</div>
                <div style={{ color: 'var(--muted)', fontSize: 15, fontWeight: 500 }}>Pick the one that matters most right now.</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {GOALS.map(g => {
                  const on = p.goal === g.id;
                  return (
                    <div key={g.id} onClick={() => set('goal', g.id)} className="tap" style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '15px 16px', borderRadius: 16, background: on ? 'var(--ember-soft)' : 'var(--surface)', border: `1px solid ${on ? 'var(--ember-line)' : 'var(--line)'}` }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 800, fontSize: 16, color: on ? 'var(--ember-bright)' : 'var(--text)' }}>{g.label}</div>
                        <div style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 500 }}>{g.sub}</div>
                      </div>
                      <div style={{ width: 22, height: 22, borderRadius: 99, border: `2px solid ${on ? 'var(--ember)' : 'var(--surface-3)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {on && <div style={{ width: 11, height: 11, borderRadius: 99, background: 'var(--ember)' }} />}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div style={{ height: 18 }} />
              <Label>Goal weight (kg)</Label>
              <input className="field" type="number" inputMode="decimal" value={p.goalWeightKg} onChange={e => set('goalWeightKg', e.target.value)} placeholder="76" />
            </div>
          )}

          {step === 3 && (
            <div>
              <div style={{ marginBottom: 20 }}>
                <div className="kicker" style={{ marginBottom: 10 }}>Dial it in</div>
                <div className="h-display" style={{ fontSize: 30, marginBottom: 14 }}>Experience & schedule</div>
                <div style={{ color: 'var(--muted)', fontSize: 15, fontWeight: 500 }}>So your plan matches your week and your level.</div>
              </div>
              <Label>Gym experience</Label>
              <Segmented options={EXPERIENCE_LEVELS} value={p.experience} onChange={v => set('experience', v)} render={o => o.split(' ')[0]} />
              <div style={{ height: 16 }} />
              <Label>Activity level</Label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {ACTIVITY_LEVELS.map(a => <div key={a} onClick={() => set('activity', a)} className={`chip tap${p.activity === a ? ' on' : ''}`}>{a}</div>)}
              </div>
              <div style={{ height: 16 }} />
              <Label>Training days</Label>
              <div style={{ display: 'flex', gap: 7 }}>
                {DAYS.map(d => {
                  const on = p.days.includes(d);
                  return <div key={d} onClick={() => toggleDay(d)} className="tap" style={{ flex: 1, textAlign: 'center', padding: '12px 0', borderRadius: 12, fontSize: 12, fontWeight: 800, background: on ? 'var(--ember)' : 'var(--surface-2)', color: on ? '#1a0a06' : 'var(--muted)', border: `1px solid ${on ? 'var(--ember)' : 'var(--line)'}` }}>{d[0]}</div>;
                })}
              </div>
              <div style={{ height: 16 }} />
              <Label>Diet preference</Label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {DIET_PREFS.map(a => <div key={a} onClick={() => set('diet', a)} className={`chip tap${p.diet === a ? ' on' : ''}`}>{a}</div>)}
              </div>
            </div>
          )}

          {step === 4 && (() => {
            const xp = startXpFor(p.experience);
            const info = rankForXp(xp);
            return (
              <div style={{ textAlign: 'center', paddingTop: 8 }}>
                <div className="kicker" style={{ marginBottom: 18 }}>Your starting rank</div>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 6, animation: 'pop-in .5s ease' }}>
                  <RankBadge idx={info.idx} size={130} />
                </div>
                <div className="h-display" style={{ fontSize: 38, marginTop: 10, color: info.rank.accent }}>{info.rank.name}</div>
                <div style={{ color: 'var(--muted)', fontSize: 15, fontWeight: 600, maxWidth: 280, margin: '10px auto 0' }}>"{info.rank.tag}"</div>
                <div className="card" style={{ padding: 16, margin: '24px 4px 0', textAlign: 'left' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--muted)' }}>Progress to {info.next ? info.next.name : 'max'}</span>
                    <span className="mono" style={{ fontSize: 12, color: 'var(--ember-bright)' }}>{info.toNext > 0 ? `${info.toNext} XP` : 'MAX'}</span>
                  </div>
                  <Bar pct={info.pct} />
                  <div style={{ display: 'flex', gap: 18, marginTop: 16 }}>
                    <div><div className="num" style={{ fontSize: 22 }}>{p.days.length}<span style={{ fontSize: 13, color: 'var(--muted)' }}> days</span></div><div style={{ fontSize: 11, color: 'var(--faint)', fontWeight: 700 }}>WEEKLY PLAN</div></div>
                    <div style={{ width: 1, background: 'var(--line)' }} />
                    <div><div className="num" style={{ fontSize: 22 }}>{GOALS.find(g => g.id === p.goal)?.label.split(' ')[0] || '—'}</div><div style={{ fontSize: 11, color: 'var(--faint)', fontWeight: 700 }}>FOCUS</div></div>
                  </div>
                </div>
                <div style={{ color: 'var(--muted)', fontSize: 13, fontWeight: 500, marginTop: 18 }}>
                  Earn XP every time you train, log a meal, hit protein or keep a streak. Climb to <b style={{ color: 'var(--text)' }}>Grandmaster Baiter</b>. 🏆 reserved for the worthy.
                </div>
              </div>
            );
          })()}

        </div>
      </div>

      {/* Footer button */}
      <div style={{ padding: '12px 18px 8px' }}>
        <button onClick={step < 4 ? (canNext() ? () => setStep(s => s + 1) : undefined) : finish} className="btn-primary tap" style={{ width: '100%', padding: '16px', fontSize: 16, opacity: (step < 4 && !canNext()) ? 0.4 : 1, cursor: (step < 4 && !canNext()) ? 'default' : 'pointer' }}>
          {step === 0 ? 'Get started' : step < 4 ? 'Continue' : 'Enter LockIn'}
        </button>
      </div>
      <div style={{ height: 18 }} />
    </div>
  );
}

function ProfileView() {
  const router = useRouter();
  const { profile, setProfile, state } = useApp();
  if (!profile) return null;

  const info = rankForXp(state.xp);
  const goalLabel = GOALS.find(g => g.id === profile.goal)?.label || '—';
  const rows: [string, string][] = [
    ['Age', profile.age || '—'],
    ['Height', profile.heightCm ? profile.heightCm + ' cm' : '—'],
    ['Weight', profile.weightKg ? profile.weightKg + ' kg' : '—'],
    ['Goal weight', profile.goalWeightKg ? profile.goalWeightKg + ' kg' : '—'],
  ];
  const tags: [string, string][] = [
    ['Goal', goalLabel], ['Experience', profile.experience],
    ['Activity', profile.activity], ['Diet', profile.diet],
  ];

  return (
    <div className="screen-scroll screen-anim">
      <div className="pad" style={{ paddingTop: 8, paddingBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div className="h-display" style={{ fontSize: 30 }}>Profile</div>
          <button className="tap" style={{ width: 38, height: 38, borderRadius: 12, border: '1px solid var(--line)', background: 'var(--surface-2)', color: 'var(--muted)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ICog /></button>
        </div>

        <div onClick={() => router.push('/achievements')} className="card tap" style={{ padding: 18, marginBottom: 14, textAlign: 'center', position: 'relative', overflow: 'hidden', background: `radial-gradient(120% 120% at 50% 0%, ${info.rank.accent}1f, var(--surface) 60%)` }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 6 }}><RankBadge idx={info.idx} size={88} /></div>
          <div style={{ fontWeight: 800, fontSize: 20, marginTop: 8 }}>{profile.name || 'Athlete'}</div>
          <div className="h-display" style={{ fontSize: 16, color: info.rank.accent, marginTop: 2 }}>{info.rank.name}</div>
          <div style={{ marginTop: 14 }}><Bar pct={info.pct} /></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 7 }}>
            <span className="mono" style={{ fontSize: 11, color: 'var(--muted)' }}>{state.xp.toLocaleString()} XP</span>
            <span className="mono" style={{ fontSize: 11, color: 'var(--faint)' }}>{info.toNext > 0 ? `${info.toNext.toLocaleString()} to ${info.next!.name}` : 'MAX'}</span>
          </div>
        </div>

        <div className="card" style={{ padding: '4px 16px', marginBottom: 14 }}>
          {rows.map(([k, v], i) => (
            <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '13px 0', borderTop: i ? '1px solid var(--line)' : 'none' }}>
              <span style={{ color: 'var(--muted)', fontWeight: 600, fontSize: 14.5 }}>{k}</span>
              <span style={{ fontWeight: 800, fontSize: 14.5 }}>{v}</span>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 9, marginBottom: 14 }}>
          {tags.map(([k, v]) => (
            <div key={k} className="card" style={{ padding: '10px 14px' }}>
              <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--faint)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>{k}</div>
              <div style={{ fontWeight: 800, fontSize: 14, marginTop: 2 }}>{v}</div>
            </div>
          ))}
        </div>

        <div style={{ marginBottom: 14 }}>
          <div className="kicker" style={{ marginBottom: 8, paddingLeft: 2 }}>Training days</div>
          <div style={{ display: 'flex', gap: 7 }}>
            {DAYS.map(d => {
              const on = (profile.days || []).includes(d);
              return <div key={d} style={{ flex: 1, textAlign: 'center', padding: '11px 0', borderRadius: 11, fontSize: 12, fontWeight: 800, background: on ? 'var(--ember)' : 'var(--surface-2)', color: on ? '#1a0a06' : 'var(--faint)', border: `1px solid ${on ? 'var(--ember)' : 'var(--line)'}` }}>{d[0]}</div>;
            })}
          </div>
        </div>

        <button onClick={() => setProfile(null)} className="btn-ghost tap" style={{ width: '100%', padding: 14, fontSize: 14 }}>
          Replay onboarding
        </button>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const { profile, setProfile, setState } = useApp();

  const handleComplete = (p: Profile) => {
    setProfile(p);
    setState(createFreshState(p));
  };

  if (!profile) return <Onboarding onComplete={handleComplete} />;
  return <ProfileView />;
}
