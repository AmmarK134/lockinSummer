'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp, type Meal } from '@/contexts/AppContext';
import Segmented from '@/components/ui/Segmented';

const IClose = () => <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 6l12 12M18 6L6 18"/></svg>;
const IChevL = () => <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 5l-7 7 7 7"/></svg>;
const IBolt = () => <svg width={20} height={20} viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M13 2L4.5 13.2H11l-1.6 8.8L20 10.4h-6.5z"/></svg>;
const ICamera = () => <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 8.5h3l1.5-2h7L17 8.5h3a1.5 1.5 0 0 1 1.5 1.5v8A1.5 1.5 0 0 1 20 19.5H4A1.5 1.5 0 0 1 2.5 18v-8A1.5 1.5 0 0 1 4 8.5z"/><circle cx="12" cy="13.5" r="3.2"/></svg>;
const ICheck = () => <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 6.5"/></svg>;

const MEAL_TYPES = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];
const FOOD_STEPS = ['Looking at your photo…', 'Identifying foods…', 'Estimating portions…', 'Crunching the macros…'];
const MEAL_PRESETS = [
  { key: ['chicken', 'rice'], name: 'Grilled Chicken & Rice', items: ['Grilled chicken breast', 'White rice', 'Broccoli'], kcal: 620, protein: 52, carbs: 68, fat: 14, portion: '1 plate' },
  { key: ['salmon', 'fish'],  name: 'Salmon & Veggies',       items: ['Baked salmon', 'Asparagus', 'Sweet potato'],        kcal: 540, protein: 42, carbs: 38, fat: 24, portion: '1 fillet + sides' },
  { key: ['egg', 'toast'],    name: 'Avocado Toast & Eggs',   items: ['Sourdough toast', 'Avocado', '2 fried eggs'],        kcal: 480, protein: 22, carbs: 42, fat: 26, portion: '2 slices' },
  { key: ['beef', 'burrito'], name: 'Beef Burrito Bowl',      items: ['Ground beef', 'Rice & beans', 'Cheese', 'Salsa'],    kcal: 780, protein: 48, carbs: 82, fat: 28, portion: '1 bowl' },
  { key: ['oat', 'berries'],  name: 'Oats & Berries',         items: ['Rolled oats', 'Blueberries', 'Honey'],               kcal: 390, protein: 14, carbs: 64, fat: 8,  portion: '1 bowl' },
];

function pickPreset(desc: string) {
  const d = desc.toLowerCase();
  return MEAL_PRESETS.find(p => p.key.some(k => d.includes(k))) || MEAL_PRESETS[Math.floor(Math.random() * MEAL_PRESETS.length)];
}

// Abstract food photo placeholder
function FoodPhoto({ h = 200 }: { h?: number }) {
  return (
    <div style={{ height: h, borderRadius: 18, position: 'relative', overflow: 'hidden', background: 'radial-gradient(80% 80% at 30% 20%, #2a2118, #14120f)', border: '1px solid var(--line)' }}>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: h * 0.6, height: h * 0.6, borderRadius: '50%', background: 'conic-gradient(from 20deg, #6b4a2a, #8a6a3a, #5a7a3a, #7a4a3a, #6b4a2a)', boxShadow: '0 6px 24px rgba(0,0,0,0.5), inset 0 0 0 6px rgba(255,255,255,0.06)', opacity: 0.9 }} />
      </div>
      <div style={{ position: 'absolute', bottom: 10, left: 12, display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(0,0,0,0.45)', padding: '5px 10px', borderRadius: 99, backdropFilter: 'blur(6px)' }}>
        <ICamera />
        <span style={{ fontSize: 11, fontWeight: 700, color: '#fff', fontFamily: 'var(--font-mono)' }}>meal.jpg</span>
      </div>
    </div>
  );
}

type MealDraft = { id: string; type: string; name: string; kcal: string; protein: string; carbs: string; fat: string; portion: string; items: string[]; };

export default function FoodLogPage() {
  const router = useRouter();
  const { setState, toast } = useApp();

  const [step, setStep] = useState<'camera' | 'describe' | 'analyzing' | 'result'>('camera');
  const [desc, setDesc] = useState('');
  const [type, setType] = useState('Lunch');
  const [genStep, setGenStep] = useState(0);
  const [meal, setMeal] = useState<MealDraft | null>(null);

  const analyze = () => {
    setStep('analyzing'); setGenStep(0);
    let i = 0;
    const t = setInterval(() => {
      i++; setGenStep(i);
      if (i >= FOOD_STEPS.length - 1) {
        clearInterval(t);
        setTimeout(() => {
          const p = pickPreset(desc);
          setMeal({ id: 'm' + Date.now(), type, name: p.name, items: p.items, kcal: String(p.kcal), protein: String(p.protein), carbs: String(p.carbs), fat: String(p.fat), portion: p.portion });
          setStep('result');
        }, 460);
      }
    }, 340);
  };

  const setM = (k: keyof MealDraft, v: string) => setMeal(m => m ? { ...m, [k]: v } : m);

  const save = () => {
    if (!meal) return;
    const m: Meal = { id: meal.id, type: meal.type, name: meal.name, items: meal.items, kcal: parseInt(meal.kcal) || 0, protein: parseInt(meal.protein) || 0, carbs: parseInt(meal.carbs) || 0, fat: parseInt(meal.fat) || 0, portion: meal.portion };
    setState(s => ({ ...s, meals: [...s.meals, m], caloriesEaten: s.caloriesEaten + m.kcal, proteinEaten: s.proteinEaten + m.protein, carbsEaten: s.carbsEaten + m.carbs, fatEaten: s.fatEaten + m.fat }));
    toast('🍽️ +60 XP · Meal logged');
    router.push('/nutrition');
  };

  const Header = ({ title, onBack }: { title: string; onBack?: () => void }) => (
    <div style={{ padding: '6px 16px 12px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid var(--line)' }}>
      <button onClick={onBack || (() => router.back())} className="tap" style={{ width: 38, height: 38, borderRadius: 12, border: '1px solid var(--line)', background: 'var(--surface-2)', color: 'var(--text)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {onBack ? <IChevL /> : <IClose />}
      </button>
      <span style={{ fontWeight: 800, fontSize: 16 }}>{title}</span>
    </div>
  );

  return (
    <div className="app-root" style={{ position: 'fixed', inset: 0, zIndex: 50 }}>
      <div style={{ height: 52 }} />

      {step === 'camera' && (
        <>
          <Header title="Snap your meal" />
          <div className="screen-scroll" style={{ display: 'flex', flexDirection: 'column' }}>
            <div className="pad" style={{ paddingTop: 18, flex: 1, display: 'flex', flexDirection: 'column' }}>
              {/* Viewfinder */}
              <div style={{ flex: 1, borderRadius: 24, position: 'relative', overflow: 'hidden', minHeight: 340, background: 'radial-gradient(80% 80% at 50% 35%, #20180f, #0c0b0a)', border: '1px solid var(--line)' }}>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ width: 170, height: 170, borderRadius: '50%', opacity: 0.85, background: 'conic-gradient(from 20deg, #6b4a2a, #8a6a3a, #5a7a3a, #7a4a3a, #6b4a2a)', boxShadow: 'inset 0 0 0 6px rgba(255,255,255,0.06)' }} />
                </div>
                {/* Corner brackets */}
                {(['tl', 'tr', 'bl', 'br'] as const).map(pos => {
                  const st: React.CSSProperties = { position: 'absolute', width: 34, height: 34, borderColor: 'rgba(255,255,255,0.5)' };
                  if (pos[0] === 't') st.top = 16; else st.bottom = 16;
                  if (pos[1] === 'l') { st.left = 16; st.borderLeft = '2.5px solid'; } else { st.right = 16; st.borderRight = '2.5px solid'; }
                  if (pos[0] === 't') st.borderTop = '2.5px solid'; else st.borderBottom = '2.5px solid';
                  st.borderTopLeftRadius = pos === 'tl' ? 8 : 0; st.borderTopRightRadius = pos === 'tr' ? 8 : 0;
                  st.borderBottomLeftRadius = pos === 'bl' ? 8 : 0; st.borderBottomRightRadius = pos === 'br' ? 8 : 0;
                  return <div key={pos} style={st} />;
                })}
                <div style={{ position: 'absolute', top: 18, left: 0, right: 0, textAlign: 'center', fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.7)', fontFamily: 'var(--font-mono)' }}>point at your food</div>
              </div>
              {/* Shutter */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 30, padding: '22px 0 8px' }}>
                <div style={{ width: 60 }} />
                <div onClick={() => setStep('describe')} className="tap" style={{ width: 74, height: 74, borderRadius: '50%', border: '4px solid var(--ember)', background: 'var(--ember)', cursor: 'pointer', boxShadow: '0 0 0 4px var(--bg), 0 0 22px var(--ember-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ width: 58, height: 58, borderRadius: '50%', background: 'var(--ember)', border: '2px solid #1a0a06' }} />
                </div>
                <div style={{ width: 60 }} />
              </div>
            </div>
          </div>
        </>
      )}

      {step === 'describe' && (
        <>
          <Header title="Describe it" onBack={() => setStep('camera')} />
          <div className="screen-scroll">
            <div className="pad" style={{ paddingTop: 16 }}>
              <FoodPhoto />
              <div style={{ height: 18 }} />
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--muted)', marginBottom: 8, paddingLeft: 2 }}>What is it? (helps the estimate)</div>
              <input className="field" autoFocus value={desc} onChange={e => setDesc(e.target.value)} placeholder="e.g. chicken, rice & broccoli" />
              <div style={{ height: 16 }} />
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--muted)', marginBottom: 8, paddingLeft: 2 }}>Meal</div>
              <Segmented options={MEAL_TYPES} value={type} onChange={setType} />
              <div style={{ height: 24 }} />
              <button onClick={analyze} className="btn-primary tap" style={{ width: '100%', padding: 16, fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9 }}>
                <IBolt /> Estimate with AI
              </button>
            </div>
          </div>
        </>
      )}

      {step === 'analyzing' && (
        <div className="screen-scroll" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="pad" style={{ textAlign: 'center', width: '100%' }}>
            <div style={{ width: 150, margin: '0 auto 22px' }}><FoodPhoto h={150} /></div>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
              <div style={{ position: 'relative', width: 54, height: 54 }}>
                <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '3px solid var(--surface-3)' }} />
                <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '3px solid transparent', borderTopColor: 'var(--ember)', animation: 'spin 0.9s linear infinite' }} />
              </div>
            </div>
            <div className="h-display" style={{ fontSize: 22, marginBottom: 8 }}>Analyzing</div>
            <div key={genStep} style={{ color: 'var(--muted)', fontWeight: 600, fontSize: 14, animation: 'pop-in .3s ease' }}>{FOOD_STEPS[genStep]}</div>
          </div>
        </div>
      )}

      {step === 'result' && meal && (
        <>
          <Header title="Estimated — edit if needed" onBack={() => setStep('describe')} />
          <div className="screen-scroll" style={{ paddingBottom: 20 }}>
            <div className="pad" style={{ paddingTop: 14 }}>
              <FoodPhoto h={150} />
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 12, padding: '5px 11px', borderRadius: 99, background: 'var(--ember-soft)', border: '1px solid var(--ember-line)' }}>
                <span style={{ color: 'var(--ember)' }}><IBolt /></span>
                <span style={{ fontSize: 11.5, fontWeight: 800, color: 'var(--ember-bright)' }}>AI ESTIMATE · tap to adjust</span>
              </div>
              <div style={{ height: 14 }} />
              <input value={meal.name} onChange={e => setM('name', e.target.value)} style={{ width: '100%', background: 'transparent', border: 'none', borderBottom: '1px solid var(--line)', color: 'var(--text)', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 24, padding: '2px 0 10px', outline: 'none' }} />
              {meal.items && <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginTop: 12 }}>
                {meal.items.map((it, i) => <span key={i} className="chip" style={{ fontSize: 12, padding: '6px 11px' }}>{it}</span>)}
              </div>}
              <div style={{ height: 16 }} />
              <Segmented options={MEAL_TYPES} value={meal.type} onChange={v => setM('type', v)} />
              <div className="card" style={{ padding: 16, margin: '16px 0 12px', display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--faint)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Calories</div>
                  <input value={meal.kcal} inputMode="numeric" onChange={e => setM('kcal', e.target.value)} style={{ width: '100%', background: 'transparent', border: 'none', color: 'var(--ember)', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 38, padding: '2px 0 0', outline: 'none' }} />
                </div>
                <span style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 700 }}>kcal</span>
              </div>
              <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
                {[['protein', 'Protein', 'var(--protein)'], ['carbs', 'Carbs', 'var(--carbs)'], ['fat', 'Fat', 'var(--fat)']].map(([k, l, c]) => (
                  <div key={k} className="card" style={{ flex: 1, padding: '12px 8px', textAlign: 'center' }}>
                    <div style={{ width: 6, height: 6, borderRadius: 99, background: c, margin: '0 auto 7px' }} />
                    <input value={meal[k as keyof MealDraft]} inputMode="numeric" onChange={e => setM(k as keyof MealDraft, e.target.value)} style={{ width: '100%', textAlign: 'center', background: 'transparent', border: 'none', color: 'var(--text)', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 22, outline: 'none' }} />
                    <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--faint)', letterSpacing: '0.05em', marginTop: 2 }}>{l.toUpperCase()} · G</div>
                  </div>
                ))}
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--muted)', marginBottom: 8, paddingLeft: 2 }}>Portion</div>
              <input className="field" value={meal.portion} onChange={e => setM('portion', e.target.value)} />
              <div style={{ height: 20 }} />
              <button onClick={save} className="btn-primary tap" style={{ width: '100%', padding: 16, fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9 }}>
                <ICheck /> Save meal
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
