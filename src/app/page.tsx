'use client';
import { useRouter } from 'next/navigation';
import { useApp } from '@/contexts/AppContext';
import { rankForXp } from '@/lib/gamification';
import ProgressRing from '@/components/ui/ProgressRing';
import Bar from '@/components/ui/Bar';
import RankBadge from '@/components/ui/RankBadge';
import { lsGet } from '@/lib/storage';

// ── Icons ────────────────────────────────────────────────────
const IFlame = () => (
  <svg width={22} height={22} viewBox="0 0 24 24" fill="currentColor" stroke="none">
    <path d="M12 2.5c.5 3-2 4.2-2 6.5 0 1.1.8 2 1.8 2 1.4 0 1.7-1.2 1.4-2.4 1.7 1 2.8 2.7 2.8 4.9A6 6 0 0 1 6 13.6c0-2.4 1.4-3.6 2.6-5C10 7.3 11 5.4 12 2.5z"/>
  </svg>
);
const IWater = () => (
  <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3.2C12 3.2 6 9.4 6 14a6 6 0 0 0 12 0c0-4.6-6-10.8-6-10.8z"/>
  </svg>
);
const IDumbbell = () => (
  <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6.5 8.5v7M3.5 10v4M17.5 8.5v7M20.5 10v4M6.5 12h11"/>
  </svg>
);
const IClock = () => (
  <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>
  </svg>
);
const IPlay = () => (
  <svg width={16} height={16} viewBox="0 0 24 24" fill="currentColor" stroke="none">
    <path d="M8 5.5v13l11-6.5z"/>
  </svg>
);
const ICheck = () => (
  <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12.5l4.5 4.5L19 6.5"/>
  </svg>
);
const IScale = () => (
  <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3.5" y="4.5" width="17" height="15" rx="3"/>
    <path d="M12 8.5l2.2 3.5h-4.4z"/><path d="M8.5 16.5h7"/>
  </svg>
);
const IChevR = () => (
  <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 5l7 7-7 7"/>
  </svg>
);
const IBolt = () => (
  <svg width={20} height={20} viewBox="0 0 24 24" fill="currentColor" stroke="none">
    <path d="M13 2L4.5 13.2H11l-1.6 8.8L20 10.4h-6.5z"/>
  </svg>
);
const ICamera = () => (
  <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 8.5h3l1.5-2h7L17 8.5h3a1.5 1.5 0 0 1 1.5 1.5v8A1.5 1.5 0 0 1 20 19.5H4A1.5 1.5 0 0 1 2.5 18v-8A1.5 1.5 0 0 1 4 8.5z"/>
    <circle cx="12" cy="13.5" r="3.2"/>
  </svg>
);
const IBell = ({ badge }: { badge?: number }) => (
  <div style={{ position: 'relative' }}>
    <svg width={21} height={21} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6z"/><path d="M10 19a2 2 0 0 0 4 0"/>
    </svg>
    {badge != null && badge > 0 && (
      <span style={{ position: 'absolute', top: -5, right: -5, minWidth: 19, height: 19, padding: '0 5px', borderRadius: 99, background: 'var(--ember)', color: '#1a0a06', fontSize: 11, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid var(--bg)' }}>{badge}</span>
    )}
  </div>
);
const IPlus = () => (
  <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 5v14M5 12h14"/>
  </svg>
);

// ── Dashboard ────────────────────────────────────────────────
export default function DashboardPage() {
  const router = useRouter();
  const { profile, state, setState, setWeighOpen, toast } = useApp();

  // Redirect to onboarding if no profile
  if (!profile) {
    if (typeof window !== 'undefined') router.replace('/profile');
    return null;
  }

  const info = rankForXp(state.xp);
  const calLeft = Math.max(0, state.caloriesGoal - state.caloriesEaten);
  const calPct = state.caloriesEaten / state.caloriesGoal;
  const hour = new Date().getHours();
  const greet = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const first = (profile.name || 'Athlete').split(' ')[0];

  const [dashStyle] = (() => {
    try { const t = lsGet<{ dashStyle?: string }>('lockin_tweaks_v1'); return [t?.dashStyle || 'Command']; } catch { return ['Command']; }
  })();
  const variant = dashStyle.toLowerCase();

  const addWater = () => {
    setState(s => ({ ...s, waterCups: Math.min(s.waterGoal + 4, s.waterCups + 1) }));
    toast('💧 +15 XP · Hydration logged');
  };

  const macros = [
    { k: 'Protein', v: state.proteinEaten, g: state.proteinGoal, c: 'var(--protein)', u: 'g' },
    { k: 'Carbs',   v: state.carbsEaten,   g: state.carbsGoal,   c: 'var(--carbs)',   u: 'g' },
    { k: 'Fat',     v: state.fatEaten,      g: state.fatGoal,     c: 'var(--fat)',     u: 'g' },
  ];

  // ── Shared sub-components ──
  const RankHero = ({ compact = false }) => (
    <div onClick={() => router.push('/achievements')} className="card tap" style={{ position: 'relative', overflow: 'hidden', padding: compact ? '14px 16px' : '18px', background: `radial-gradient(120% 130% at 100% 0%, ${info.rank.accent}22, transparent 55%), var(--surface)`, borderColor: 'var(--line)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <RankBadge idx={info.idx} size={compact ? 52 : 64} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="kicker" style={{ marginBottom: 3 }}>Rank {info.idx + 1} · {info.toNext > 0 ? `${info.toNext.toLocaleString()} XP to go` : 'MAX RANK'}</div>
          <div className="h-display" style={{ fontSize: compact ? 22 : 25, color: info.rank.accent, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{info.rank.name}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div className="num" style={{ fontSize: compact ? 20 : 24 }}>{state.xp.toLocaleString()}</div>
          <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--faint)', letterSpacing: '0.1em' }}>XP</div>
        </div>
      </div>
      <div style={{ marginTop: 13, position: 'relative' }}>
        <Bar pct={info.pct} />
        {info.next && (
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--faint)' }}>{info.rank.name}</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)' }}>{info.next.name}</span>
          </div>
        )}
      </div>
    </div>
  );

  const TodayWorkout = () => (
    <div className="card" style={{ padding: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
        <span className="kicker">Today · {(profile.days && profile.days[0]) || 'Push'} Day</span>
        {state.todayWorkout.done && <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--good)', fontSize: 12, fontWeight: 800 }}><ICheck /> DONE</span>}
      </div>
      <div className="h-display" style={{ fontSize: 22, lineHeight: 1.14, margin: '6px 0 18px' }}>{state.todayWorkout.name}</div>
      <div style={{ display: 'flex', gap: 16, marginBottom: 14 }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--muted)', fontWeight: 700 }}><IDumbbell /> {state.todayWorkout.exercises} exercises</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--muted)', fontWeight: 700 }}><IClock /> ~{state.todayWorkout.mins} min</span>
      </div>
      <button onClick={() => router.push('/workout')} className={(state.todayWorkout.done ? 'btn-ghost' : 'btn-primary') + ' tap'} style={{ width: '100%', padding: 14, fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
        {state.todayWorkout.done ? <><ICheck /> Workout logged · log again</> : <><IPlay /> Start workout</>}
      </button>
    </div>
  );

  const CalorieBlock = ({ big = false }) => (
    <div onClick={() => router.push('/nutrition')} className="card tap" style={{ padding: 16, display: 'flex', gap: 16, alignItems: 'center' }}>
      <ProgressRing size={big ? 112 : 96} stroke={big ? 11 : 9} pct={calPct} color="var(--ember)">
        <div className="num" style={{ fontSize: big ? 28 : 24, lineHeight: 1 }}>{calLeft.toLocaleString()}</div>
        <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--faint)', letterSpacing: '0.06em' }}>KCAL LEFT</div>
      </ProgressRing>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 11 }}>
        {macros.map(m => (
          <div key={m.k}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
              <span style={{ fontSize: 12.5, fontWeight: 800, color: 'var(--text)' }}>{m.k}</span>
              <span className="mono" style={{ fontSize: 11, color: 'var(--muted)' }}>{m.v}/{m.g}{m.u}</span>
            </div>
            <Bar pct={m.v / m.g} color={m.c} height={6} />
          </div>
        ))}
      </div>
    </div>
  );

  const WaterCard = ({ stretch = false }) => (
    <div className="card" style={{ padding: 16, flex: stretch ? 1 : undefined }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <span style={{ color: 'var(--water)' }}><IWater /></span>
          <span style={{ fontWeight: 800, fontSize: 14 }}>Water</span>
        </span>
        <span className="mono" style={{ fontSize: 12, color: 'var(--muted)' }}>{state.waterCups}/{state.waterGoal}</span>
      </div>
      <div style={{ display: 'flex', gap: 5, marginBottom: 13 }}>
        {Array.from({ length: state.waterGoal }).map((_, i) => (
          <div key={i} style={{ flex: 1, height: 26, borderRadius: 6, background: i < state.waterCups ? 'var(--water)' : 'var(--surface-3)', boxShadow: i < state.waterCups ? '0 0 8px rgba(57,194,255,0.4)' : 'none', transition: 'all .3s ease' }} />
        ))}
      </div>
      <button onClick={addWater} className="btn-ghost tap" style={{ width: '100%', padding: 11, fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
        <IPlus /> Add a glass
      </button>
    </div>
  );

  const WeighInNudge = () => (
    <div onClick={() => setWeighOpen(true)} className="card tap" style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 13, background: 'linear-gradient(100deg, rgba(255,92,56,0.10), var(--surface) 60%)', borderColor: 'var(--ember-line)' }}>
      <span style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--ember-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ember)' }}><IScale /></span>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 800, fontSize: 14.5 }}>Weekly weigh-in time</div>
        <div style={{ fontSize: 12.5, color: 'var(--muted)', fontWeight: 600 }}>Let's see the progress 📈</div>
      </div>
      <span style={{ color: 'var(--ember)' }}><IChevR /></span>
    </div>
  );

  const QuickActions = () => (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
      {[
        { label: 'Log Workout', icon: <IDumbbell />, on: () => router.push('/workout') },
        { label: 'Snap Food',   icon: <ICamera />,   on: () => router.push('/nutrition/log') },
        { label: 'My Plan',     icon: <IBolt />,     on: () => router.push('/plan') },
      ].map(a => (
        <div key={a.label} onClick={a.on} className="card tap" style={{ padding: '14px 8px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, textAlign: 'center' }}>
          <span style={{ color: 'var(--ember)' }}>{a.icon}</span>
          <span style={{ fontSize: 11.5, fontWeight: 800, color: 'var(--text)', lineHeight: 1.15 }}>{a.label}</span>
        </div>
      ))}
    </div>
  );

  const Greeting = () => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div>
        <div style={{ fontSize: 14, color: 'var(--muted)', fontWeight: 600 }}>{greet},</div>
        <div className="h-display" style={{ fontSize: 30 }}>{first} 👋</div>
      </div>
      <button onClick={() => router.push('/reminders')} className="tap" style={{ width: 44, height: 44, borderRadius: 14, position: 'relative', border: '1px solid var(--line)', background: 'var(--surface)', color: 'var(--text)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <IBell />
      </button>
    </div>
  );

  const Stack = ({ children }: { children: React.ReactNode }) => (
    <div className="stagger" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>{children}</div>
  );

  return (
    <div className="screen-scroll screen-anim" style={{ paddingBottom: 20 }}>
      <div className="pad" style={{ paddingTop: 8 }}>
        <Greeting />
        <div style={{ height: 18 }} />

        {variant === 'command' && (
          <Stack>
            <RankHero />
            <TodayWorkout />
            <CalorieBlock />
            <div style={{ display: 'flex', gap: 14 }}>
              <WaterCard stretch />
              <div className="card" style={{ padding: 16, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 6 }}>
                <span className="flame" style={{ color: 'var(--ember)' }}><IFlame /></span>
                <div className="num" style={{ fontSize: 34, lineHeight: 1 }}>{state.streak}</div>
                <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--faint)', letterSpacing: '0.08em' }}>DAY STREAK</div>
              </div>
            </div>
            <WeighInNudge />
            <QuickActions />
          </Stack>
        )}

        {variant === 'rings' && (
          <Stack>
            <RankHero compact />
            <div onClick={() => router.push('/nutrition')} className="card tap" style={{ padding: '22px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <span className="kicker" style={{ marginBottom: 14 }}>Today's Fuel</span>
              <ProgressRing size={168} stroke={14} pct={calPct} color="var(--ember)">
                <div className="num" style={{ fontSize: 44, lineHeight: 0.9 }}>{calLeft.toLocaleString()}</div>
                <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--muted)', letterSpacing: '0.08em' }}>KCAL LEFT</div>
                <div style={{ fontSize: 11, color: 'var(--faint)', fontWeight: 700, marginTop: 2 }}>{state.caloriesEaten} / {state.caloriesGoal}</div>
              </ProgressRing>
              <div style={{ display: 'flex', gap: 10, marginTop: 20, width: '100%' }}>
                {macros.map(m => (
                  <div key={m.k} style={{ flex: 1, textAlign: 'center' }}>
                    <ProgressRing size={62} stroke={6} pct={m.v / m.g} color={m.c} glow={false}>
                      <div className="num" style={{ fontSize: 15 }}>{Math.round(m.v / m.g * 100)}<span style={{ fontSize: 9 }}>%</span></div>
                    </ProgressRing>
                    <div style={{ fontSize: 11, fontWeight: 800, marginTop: 6 }}>{m.k}</div>
                    <div className="mono" style={{ fontSize: 10, color: 'var(--muted)' }}>{m.v}/{m.g}g</div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 14 }}>
              <WaterCard stretch />
              <div className="card" style={{ padding: 16, flex: 1 }}>
                <span className="kicker">Streak</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 10 }}>
                  <span className="flame" style={{ color: 'var(--ember)' }}><IFlame /></span>
                  <div className="num" style={{ fontSize: 38 }}>{state.streak}</div>
                </div>
                <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 700, marginTop: 4 }}>days locked in 🔒</div>
              </div>
            </div>
            <TodayWorkout />
            <WeighInNudge />
            <QuickActions />
          </Stack>
        )}

        {variant === 'minimal' && (
          <Stack>
            <div onClick={() => router.push('/achievements')} className="tap" style={{ display: 'flex', alignItems: 'center', gap: 13, padding: '2px 2px 2px' }}>
              <RankBadge idx={info.idx} size={46} glow={false} />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ fontWeight: 800, fontSize: 16, color: info.rank.accent }}>{info.rank.name}</span>
                  <span className="mono" style={{ fontSize: 12, color: 'var(--muted)' }}>{state.xp.toLocaleString()} XP</span>
                </div>
                <div style={{ marginTop: 7 }}><Bar pct={info.pct} height={6} /></div>
              </div>
            </div>
            <div onClick={() => router.push('/nutrition')} className="card tap" style={{ padding: 18 }}>
              {[
                { k: 'Calories', v: `${state.caloriesEaten}`, g: `${state.caloriesGoal}`, p: calPct, c: 'var(--ember)' },
                { k: 'Protein', v: `${state.proteinEaten}g`, g: `${state.proteinGoal}g`, p: state.proteinEaten / state.proteinGoal, c: 'var(--protein)' },
                { k: 'Water', v: `${state.waterCups}`, g: `${state.waterGoal} cups`, p: state.waterCups / state.waterGoal, c: 'var(--water)' },
              ].map((r, i) => (
                <div key={r.k} style={{ padding: '12px 0', borderTop: i ? '1px solid var(--line)' : 'none' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontWeight: 800, fontSize: 14 }}>{r.k}</span>
                    <span className="mono" style={{ fontSize: 12, color: 'var(--muted)' }}>{r.v} <span style={{ color: 'var(--faint)' }}>/ {r.g}</span></span>
                  </div>
                  <Bar pct={r.p} color={r.c} height={7} />
                </div>
              ))}
            </div>
            <div className="card" style={{ padding: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div className="kicker">Today</div>
                <div style={{ fontWeight: 800, fontSize: 15, marginTop: 3 }}>{state.todayWorkout.name}</div>
              </div>
              <button onClick={() => router.push('/workout')} className={(state.todayWorkout.done ? 'btn-ghost' : 'btn-primary') + ' tap'} style={{ padding: '10px 16px', fontSize: 13 }}>{state.todayWorkout.done ? 'Done ✓' : 'Start'}</button>
            </div>
            <div style={{ display: 'flex', gap: 14 }}>
              <div className="card" style={{ padding: 16, flex: 1, display: 'flex', alignItems: 'center', gap: 10 }}>
                <span className="flame" style={{ color: 'var(--ember)' }}><IFlame /></span>
                <div><div className="num" style={{ fontSize: 24, lineHeight: 1 }}>{state.streak}</div>
                  <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--faint)' }}>STREAK</div></div>
              </div>
              <div onClick={() => setWeighOpen(true)} className="card tap" style={{ padding: 16, flex: 1, display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ color: 'var(--ember)' }}><IScale /></span>
                <div><div style={{ fontWeight: 800, fontSize: 13 }}>Weigh-in</div>
                  <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600 }}>due now</div></div>
              </div>
            </div>
            <QuickActions />
          </Stack>
        )}
      </div>
    </div>
  );
}
