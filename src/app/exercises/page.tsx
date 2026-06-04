'use client';
import { useState } from 'react';
import { EXERCISES, CATEGORIES, MUSCLE_LABELS, type Exercise } from '@/data/exercises';
import MuscleDiagram from '@/components/ui/MuscleDiagram';

const ISearch = () => <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="6.5"/><path d="M20 20l-3.6-3.6"/></svg>;
const IChevR = () => <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 5l7 7-7 7"/></svg>;
const IChevL = () => <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 5l-7 7 7 7"/></svg>;
const IDumbbell = () => <svg width={17} height={17} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M6.5 8.5v7M3.5 10v4M17.5 8.5v7M20.5 10v4M6.5 12h11"/></svg>;
const ICog = () => <svg width={17} height={17} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3.2"/><path d="M12 3v2.2M12 18.8V21M4.2 7.5l1.9 1.1M17.9 15.4l1.9 1.1M19.8 7.5l-1.9 1.1M6.1 15.4l-1.9 1.1"/></svg>;
const IAlert = () => <svg width={17} height={17} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 4.5l8.5 14.5h-17z"/><path d="M12 10v4M12 16.6v.1"/></svg>;
const IShield = () => <svg width={17} height={17} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l7 2.5v5c0 5-3.2 8.3-7 9.5-3.8-1.2-7-4.5-7-9.5v-5z"/></svg>;
const IPlay = () => <svg width={15} height={15} viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M8 5.5v13l11-6.5z"/></svg>;

function difTone(d: string) {
  if (d === 'Beginner') return 'var(--good)';
  if (d === 'Intermediate') return 'var(--carbs)';
  return 'var(--ember-bright)';
}

function ExerciseDetail({ ex, onBack }: { ex: Exercise; onBack: () => void }) {
  const allMuscles = [...ex.targets, ...ex.secondary];
  return (
    <div className="screen-scroll screen-anim">
      <div style={{ padding: '6px 18px 0', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={onBack} className="tap" style={{ width: 38, height: 38, borderRadius: 12, border: '1px solid var(--line)', background: 'var(--surface-2)', color: 'var(--text)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><IChevL /></button>
        <span className="kicker">{ex.category} · {ex.equipment}</span>
      </div>

      <div className="pad" style={{ paddingTop: 14, paddingBottom: 24 }}>
        <div className="h-display" style={{ fontSize: 30, marginBottom: 14 }}>{ex.name}</div>

        {/* Stats */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
          {[{ l: 'SETS', v: ex.sets }, { l: 'REPS', v: ex.reps }, { l: 'LEVEL', v: ex.difficulty, c: difTone(ex.difficulty) }].map(s => (
            <div key={s.l} className="card" style={{ flex: 1, padding: '12px 8px', textAlign: 'center' }}>
              <div className="num" style={{ fontSize: 19, color: s.c || 'var(--text)' }}>{s.v}</div>
              <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--faint)', letterSpacing: '0.08em', marginTop: 2 }}>{s.l}</div>
            </div>
          ))}
        </div>

        {/* Muscle map */}
        <div className="card" style={{ padding: '18px 12px 14px', marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 6px 8px' }}>
            <span className="h-display" style={{ fontSize: 18 }}>Muscles worked</span>
            <span style={{ display: 'flex', gap: 12 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 800, color: 'var(--muted)' }}><span style={{ width: 10, height: 10, borderRadius: 3, background: 'var(--ember)', display: 'inline-block' }} />Target</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 800, color: 'var(--muted)' }}><span style={{ width: 10, height: 10, borderRadius: 3, background: 'rgba(255,92,56,0.34)', display: 'inline-block' }} />Assist</span>
            </span>
          </div>
          <MuscleDiagram targets={ex.targets} secondary={ex.secondary} width={108} />
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, justifyContent: 'center', marginTop: 6 }}>
            {allMuscles.map(m => (
              <span key={m} className="chip" style={{ background: ex.targets.includes(m) ? 'var(--ember-soft)' : 'var(--surface-2)', borderColor: ex.targets.includes(m) ? 'var(--ember-line)' : 'var(--line)', color: ex.targets.includes(m) ? 'var(--ember-bright)' : 'var(--muted)', fontSize: 12, padding: '6px 11px' }}>{MUSCLE_LABELS[m]}</span>
            ))}
          </div>
        </div>

        {/* Demo placeholder */}
        <div style={{ height: 120, borderRadius: 16, position: 'relative', overflow: 'hidden', background: 'repeating-linear-gradient(135deg, #181b22 0 11px, #14171d 11px 22px)', border: '1px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--faint)' }}>
            <span style={{ width: 34, height: 34, borderRadius: 99, border: '1.5px solid var(--surface-3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)' }}><IPlay /></span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase' }}>exercise demo loop</span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="card" style={{ padding: 16 }}>
            <p style={{ margin: 0, fontSize: 15, lineHeight: 1.55, color: 'var(--text)', fontWeight: 500 }}>{ex.howto}</p>
          </div>

          <Section icon={<IDumbbell />} title="How to perform">
            <NumberedList items={ex.steps} />
          </Section>

          {ex.machineSetup && (
            <Section icon={<ICog />} title="Machine setup">
              <BulletList items={ex.machineSetup} dot="var(--water)" />
            </Section>
          )}

          <Section icon={<IAlert />} title="Common mistakes" accent="var(--carbs)">
            <BulletList items={ex.mistakes} dot="var(--carbs)" />
          </Section>

          <Section icon={<IShield />} title="Safety tips" accent="var(--good)">
            <BulletList items={ex.safety} dot="var(--good)" />
          </Section>
        </div>
      </div>
    </div>
  );
}

function Section({ icon, title, accent = 'var(--ember)', children }: { icon: React.ReactNode; title: string; accent?: string; children: React.ReactNode }) {
  return (
    <div className="card" style={{ padding: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 12 }}>
        <span style={{ width: 30, height: 30, borderRadius: 9, background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: accent }}>{icon}</span>
        <span className="h-display" style={{ fontSize: 18 }}>{title}</span>
      </div>
      {children}
    </div>
  );
}

function NumberedList({ items }: { items: string[] }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
      {items.map((s, i) => (
        <div key={i} style={{ display: 'flex', gap: 11 }}>
          <span className="num" style={{ width: 24, height: 24, borderRadius: 8, flexShrink: 0, background: 'var(--ember-soft)', color: 'var(--ember-bright)', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{i + 1}</span>
          <span style={{ fontSize: 14.5, color: 'var(--text)', lineHeight: 1.5, fontWeight: 500, paddingTop: 1 }}>{s}</span>
        </div>
      ))}
    </div>
  );
}

function BulletList({ items, dot = 'var(--ember)' }: { items: string[]; dot?: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {items.map((s, i) => (
        <div key={i} style={{ display: 'flex', gap: 11 }}>
          <span style={{ width: 7, height: 7, borderRadius: 99, background: dot, flexShrink: 0, marginTop: 7 }} />
          <span style={{ fontSize: 14.5, color: 'var(--text)', lineHeight: 1.5, fontWeight: 500 }}>{s}</span>
        </div>
      ))}
    </div>
  );
}

export default function GuidePage() {
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('All');
  const [sel, setSel] = useState<Exercise | null>(null);

  if (sel) return <ExerciseDetail ex={sel} onBack={() => setSel(null)} />;

  const list = EXERCISES.filter(e => {
    const okC = cat === 'All' || e.category === cat;
    const okQ = !q || e.name.toLowerCase().includes(q.toLowerCase()) || [...e.targets, ...e.secondary].some(m => MUSCLE_LABELS[m]?.toLowerCase().includes(q.toLowerCase()));
    return okC && okQ;
  });

  return (
    <div className="screen-scroll screen-anim">
      <div className="pad" style={{ paddingTop: 8 }}>
        <div className="kicker" style={{ marginBottom: 6 }}>{EXERCISES.length} exercises · machines & free weights</div>
        <div className="h-display" style={{ fontSize: 30, marginBottom: 14 }}>Exercise Guide</div>

        <div style={{ position: 'relative', marginBottom: 14 }}>
          <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--faint)' }}><ISearch /></span>
          <input className="field" value={q} onChange={e => setQ(e.target.value)} placeholder="Search exercise or muscle…" style={{ paddingLeft: 42 }} />
        </div>

        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4, marginBottom: 14, scrollbarWidth: 'none' }}>
          {CATEGORIES.map(c => (
            <div key={c} onClick={() => setCat(c)} className={`chip tap${cat === c ? ' on' : ''}`} style={{ flexShrink: 0 }}>{c}</div>
          ))}
        </div>
      </div>

      <div className="pad" style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingBottom: 20 }}>
        {list.length === 0 && <div style={{ textAlign: 'center', color: 'var(--faint)', padding: '40px 0', fontWeight: 600 }}>No exercises match "{q}"</div>}
        {list.map(ex => (
          <div key={ex.id} onClick={() => setSel(ex)} className="card tap" style={{ padding: 12, display: 'flex', gap: 13, alignItems: 'center' }}>
            <div style={{ width: 58, height: 58, borderRadius: 14, flexShrink: 0, background: 'repeating-linear-gradient(135deg,#1b1e26 0 8px,#15181f 8px 16px)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ember)' }}>
              <IDumbbell />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 800, fontSize: 15.5, lineHeight: 1.15 }}>{ex.name}</div>
              <div style={{ display: 'flex', gap: 6, marginTop: 7, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--muted)' }}>{ex.category}</span>
                <span style={{ color: 'var(--faint)', fontSize: 11 }}>·</span>
                <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--muted)' }}>{ex.equipment}</span>
                <span style={{ color: 'var(--faint)', fontSize: 11 }}>·</span>
                <span style={{ fontSize: 11, fontWeight: 800, color: difTone(ex.difficulty) }}>{ex.difficulty}</span>
              </div>
            </div>
            <span style={{ color: 'var(--faint)' }}><IChevR /></span>
          </div>
        ))}
      </div>
    </div>
  );
}
