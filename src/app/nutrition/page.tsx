'use client';
import { useRouter } from 'next/navigation';
import { useApp } from '@/contexts/AppContext';
import ProgressRing from '@/components/ui/ProgressRing';
import Bar from '@/components/ui/Bar';

const IChevL = () => <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 5l-7 7 7 7"/></svg>;
const IClose = () => <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 6l12 12M18 6L6 18"/></svg>;
const ICamera = () => <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 8.5h3l1.5-2h7L17 8.5h3a1.5 1.5 0 0 1 1.5 1.5v8A1.5 1.5 0 0 1 20 19.5H4A1.5 1.5 0 0 1 2.5 18v-8A1.5 1.5 0 0 1 4 8.5z"/><circle cx="12" cy="13.5" r="3.2"/></svg>;

export default function NutritionPage() {
  const router = useRouter();
  const { state, setState, toast } = useApp();

  const meals = state.meals || [];
  const eaten = state.caloriesEaten, goal = state.caloriesGoal;
  const left = Math.max(0, goal - eaten);
  const macros = [
    { k: 'Protein', v: state.proteinEaten, g: state.proteinGoal, c: 'var(--protein)' },
    { k: 'Carbs',   v: state.carbsEaten,   g: state.carbsGoal,   c: 'var(--carbs)' },
    { k: 'Fat',     v: state.fatEaten,      g: state.fatGoal,     c: 'var(--fat)' },
  ];

  const remove = (id: string) => {
    const m = meals.find(x => x.id === id);
    if (!m) return;
    setState(s => ({
      ...s,
      meals: s.meals.filter(x => x.id !== id),
      caloriesEaten: Math.max(0, s.caloriesEaten - m.kcal),
      proteinEaten: Math.max(0, s.proteinEaten - m.protein),
      carbsEaten: Math.max(0, s.carbsEaten - m.carbs),
      fatEaten: Math.max(0, s.fatEaten - m.fat),
    }));
    toast('Meal removed');
  };

  return (
    <div className="screen-scroll screen-anim">
      <div style={{ padding: '6px 18px 0', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={() => router.push('/')} className="tap" style={{ width: 38, height: 38, borderRadius: 12, border: '1px solid var(--line)', background: 'var(--surface-2)', color: 'var(--text)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><IChevL /></button>
        <span className="kicker">Today's nutrition</span>
      </div>

      <div className="pad" style={{ paddingTop: 14, paddingBottom: 24 }}>
        {/* Calorie ring + macro rings */}
        <div className="card" style={{ padding: '22px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 14 }}>
          <ProgressRing size={168} stroke={14} pct={eaten / goal} color="var(--ember)">
            <div className="num" style={{ fontSize: 42, lineHeight: 0.9 }}>{left.toLocaleString()}</div>
            <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--muted)', letterSpacing: '0.06em' }}>KCAL LEFT</div>
            <div style={{ fontSize: 11, color: 'var(--faint)', fontWeight: 700, marginTop: 2 }}>{eaten.toLocaleString()} / {goal.toLocaleString()}</div>
          </ProgressRing>
          <div style={{ display: 'flex', gap: 10, marginTop: 20, width: '100%' }}>
            {macros.map(m => (
              <div key={m.k} style={{ flex: 1, textAlign: 'center' }}>
                <ProgressRing size={60} stroke={6} pct={m.v / m.g} color={m.c} glow={false}>
                  <div className="num" style={{ fontSize: 14 }}>{Math.round(m.v / m.g * 100)}<span style={{ fontSize: 9 }}>%</span></div>
                </ProgressRing>
                <div style={{ fontSize: 11.5, fontWeight: 800, marginTop: 6 }}>{m.k}</div>
                <div className="mono" style={{ fontSize: 10, color: 'var(--muted)' }}>{m.v}/{m.g}g</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '2px 2px 10px' }}>
          <span className="kicker">Meals logged</span>
          <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--muted)' }}>{meals.length} · {eaten.toLocaleString()} kcal</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
          {meals.length === 0 && (
            <div style={{ textAlign: 'center', color: 'var(--faint)', padding: '30px 0', fontWeight: 600 }}>No meals yet — snap your first one.</div>
          )}
          {meals.map(m => (
            <div key={m.id} className="card" style={{ padding: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 48, height: 48, borderRadius: 13, flexShrink: 0, position: 'relative', overflow: 'hidden', background: 'radial-gradient(80% 80% at 30% 20%, #2a2118, #14120f)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'conic-gradient(from 20deg, #6b4a2a, #8a6a3a, #5a7a3a, #7a4a3a, #6b4a2a)' }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <span style={{ fontSize: 10, fontWeight: 800, color: 'var(--ember-bright)', letterSpacing: '0.05em' }}>{m.type.toUpperCase()}</span>
                </div>
                <div style={{ fontWeight: 800, fontSize: 14.5, lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.name}</div>
                <div className="mono" style={{ fontSize: 11, color: 'var(--faint)', marginTop: 2 }}>P{m.protein} · C{m.carbs} · F{m.fat}</div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div className="num" style={{ fontSize: 18 }}>{m.kcal}</div>
                <div style={{ fontSize: 9, fontWeight: 800, color: 'var(--faint)' }}>KCAL</div>
              </div>
              <button onClick={() => remove(m.id)} className="tap" style={{ width: 30, height: 30, borderRadius: 9, flexShrink: 0, border: '1px solid var(--line)', background: 'transparent', color: 'var(--faint)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><IClose /></button>
            </div>
          ))}
        </div>

        <button onClick={() => router.push('/nutrition/log')} className="btn-primary tap" style={{ width: '100%', padding: 16, fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9 }}>
          <ICamera /> Snap a meal
        </button>
      </div>
    </div>
  );
}
