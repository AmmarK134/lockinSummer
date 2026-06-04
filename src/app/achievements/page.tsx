'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/contexts/AppContext';
import { RANKS, rankForXp } from '@/lib/gamification';
import { lsGet, LS_PLAN } from '@/lib/storage';
import Bar from '@/components/ui/Bar';
import RankBadge from '@/components/ui/RankBadge';
import Sheet from '@/components/ui/Sheet';

const IChevL = () => <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 5l-7 7 7 7"/></svg>;
const ICheck = () => <svg width={17} height={17} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 6.5"/></svg>;
const ILock = () => <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>;
const IDumbbell = ({ size = 24 }: { size?: number }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M6.5 8.5v7M3.5 10v4M17.5 8.5v7M20.5 10v4M6.5 12h11"/></svg>;
const IBolt = ({ size = 24 }: { size?: number }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M13 2L4.5 13.2H11l-1.6 8.8L20 10.4h-6.5z"/></svg>;
const IFlame = ({ size = 24 }: { size?: number }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 2.5c.5 3-2 4.2-2 6.5 0 1.1.8 2 1.8 2 1.4 0 1.7-1.2 1.4-2.4 1.7 1 2.8 2.7 2.8 4.9A6 6 0 0 1 6 13.6c0-2.4 1.4-3.6 2.6-5C10 7.3 11 5.4 12 2.5z"/></svg>;
const IShield = ({ size = 24 }: { size?: number }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l7 2.5v5c0 5-3.2 8.3-7 9.5-3.8-1.2-7-4.5-7-9.5v-5z"/></svg>;
const IWater = ({ size = 24 }: { size?: number }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3.2C12 3.2 6 9.4 6 14a6 6 0 0 0 12 0c0-4.6-6-10.8-6-10.8z"/></svg>;
const ITarget = ({ size = 24 }: { size?: number }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r="0.6" fill="currentColor"/></svg>;
const IScale = ({ size = 24 }: { size?: number }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3.5" y="4.5" width="17" height="15" rx="3"/><path d="M12 8.5l2.2 3.5h-4.4z"/><path d="M8.5 16.5h7"/></svg>;
const IChart = ({ size = 24 }: { size?: number }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 20V4"/><path d="M4 20h16"/><path d="M8 16l3.5-4 3 2.5L20 8"/></svg>;
const ITrophy = ({ size = 24 }: { size?: number }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M7 4h10v3.5a5 5 0 0 1-10 0z"/><path d="M7 5H4.5v1.5A3 3 0 0 0 7 9.4M17 5h2.5v1.5A3 3 0 0 1 17 9.4"/><path d="M12 12.5V16M9 20h6M10 16h4l.5 4h-5z"/></svg>;

interface Achievement {
  id: string; name: string; desc: string; color: string;
  icon: (p: { size?: number }) => React.ReactElement;
  check: (s: typeof import('@/contexts/AppContext').DEMO_STATE, hasPlan: boolean) => { unlocked: boolean; prog: number; goal: string };
}

const ACHIEVEMENTS: Achievement[] = [
  { id: 'first',   name: 'First Blood',       desc: 'Log your very first workout.',           color: '#ff5c38', icon: IDumbbell, check: s => ({ unlocked: s.xp > 0,            prog: 1,                           goal: 'Logged' }) },
  { id: 'plan',    name: 'Plan Believer',      desc: 'Generate an AI workout plan.',           color: '#7a5cff', icon: IBolt,     check: (s, hp) => ({ unlocked: hp,             prog: hp ? 1 : 0,                  goal: hp ? 'Done' : 'Generate a plan' }) },
  { id: 'streak7', name: 'Streak Starter',     desc: 'Keep a 7-day streak alive.',             color: '#ff5c38', icon: IFlame,    check: s => ({ unlocked: s.streak >= 7,        prog: Math.min(1, s.streak / 7),   goal: `${Math.min(s.streak, 7)}/7 days` }) },
  { id: 'streak14',name: 'Two-Week Titan',     desc: 'Hold a 14-day streak.',                 color: '#ffb24a', icon: IFlame,    check: s => ({ unlocked: s.streak >= 14,       prog: Math.min(1, s.streak / 14),  goal: `${Math.min(s.streak, 14)}/14 days` }) },
  { id: 'streak30',name: 'Unbreakable',        desc: 'A full 30-day streak. Machine.',         color: '#54e08a', icon: IShield,   check: s => ({ unlocked: s.streak >= 30,       prog: Math.min(1, s.streak / 30),  goal: `${Math.min(s.streak, 30)}/30 days` }) },
  { id: 'hydro',   name: 'Hydro Homie',        desc: 'Hit your daily water goal.',             color: '#39c2ff', icon: IWater,    check: s => ({ unlocked: s.waterCups >= s.waterGoal, prog: Math.min(1, s.waterCups / s.waterGoal), goal: `${s.waterCups}/${s.waterGoal} cups` }) },
  { id: 'protein', name: 'Protein Pilgrim',    desc: 'Reach your protein target.',             color: '#ff5c38', icon: ITarget,   check: s => ({ unlocked: s.proteinEaten >= s.proteinGoal, prog: Math.min(1, s.proteinEaten / s.proteinGoal), goal: `${s.proteinEaten}/${s.proteinGoal} g` }) },
  { id: 'iron',    name: 'Iron Initiate',      desc: 'Bank 5,000 lifetime XP.',               color: '#ffb24a', icon: IBolt,     check: s => ({ unlocked: s.xp >= 5000,         prog: Math.min(1, s.xp / 5000),    goal: `${Math.min(s.xp, 5000).toLocaleString()}/5,000 XP` }) },
  { id: 'weigh',   name: 'Weigh Watcher',      desc: 'Log 4 weekly weigh-ins.',               color: '#c98bff', icon: IScale,    check: s => ({ unlocked: (s.weightSeries || []).length >= 8, prog: Math.min(1, (s.weightSeries || []).length / 8), goal: `${Math.min((s.weightSeries || []).length, 8)}/8 check-ins` }) },
  { id: 'mover',   name: 'Down & Driven',      desc: 'Drop 2 kg from your start weight.',     color: '#54e08a', icon: IChart,    check: s => { const ws = s.weightSeries || []; const d = ws.length ? ws[0] - ws[ws.length - 1] : 0; return { unlocked: d >= 2, prog: Math.min(1, Math.max(0, d) / 2), goal: `${d.toFixed(1)}/2.0 kg` }; } },
  { id: 'goblin',  name: 'Certified Goblin',   desc: 'Climb to Rep Goblin or higher.',        color: '#ffd24a', icon: ITrophy,   check: s => ({ unlocked: rankForXp(s.xp).idx >= 6, prog: Math.min(1, rankForXp(s.xp).idx / 6), goal: rankForXp(s.xp).idx >= 6 ? 'Unlocked' : 'Reach Rep Goblin' }) },
  { id: 'baiter',  name: 'Grandmaster Baiter', desc: 'Reach the final rank. Legendary.',      color: '#ffd24a', icon: ITrophy,   check: s => ({ unlocked: rankForXp(s.xp).idx >= 13, prog: Math.min(1, rankForXp(s.xp).idx / 13), goal: `Rank ${rankForXp(s.xp).idx + 1}/14` }) },
];

export default function AchievementsPage() {
  const router = useRouter();
  const { state } = useApp();
  const hasPlan = !!lsGet(LS_PLAN);
  const info = rankForXp(state.xp);
  const achs = ACHIEVEMENTS.map(a => { const r = a.check(state, hasPlan); return { ...a, ...r }; });
  const unlocked = achs.filter(a => a.unlocked).length;
  const [sel, setSel] = useState<(typeof achs)[0] | null>(null);

  return (
    <div className="screen-scroll screen-anim">
      <div style={{ padding: '6px 18px 0', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={() => router.back()} className="tap" style={{ width: 38, height: 38, borderRadius: 12, border: '1px solid var(--line)', background: 'var(--surface-2)', color: 'var(--text)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><IChevL /></button>
        <span className="kicker">Ranks & Achievements</span>
      </div>

      <div className="pad" style={{ paddingTop: 14, paddingBottom: 24 }}>
        {/* Hero rank card */}
        <div className="card" style={{ padding: '22px 18px', textAlign: 'center', marginBottom: 14, position: 'relative', overflow: 'hidden', background: `radial-gradient(130% 120% at 50% -10%, ${info.rank.accent}26, var(--surface) 62%)`, borderColor: info.rank.accent + '44' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}><RankBadge idx={info.idx} size={104} /></div>
          <div className="kicker" style={{ marginBottom: 4 }}>Rank {info.idx + 1} of {RANKS.length}</div>
          <div className="h-display" style={{ fontSize: 32, color: info.rank.accent }}>{info.rank.name}</div>
          <div style={{ color: 'var(--muted)', fontSize: 14, fontWeight: 600, maxWidth: 280, margin: '8px auto 0' }}>"{info.rank.tag}"</div>
          <div style={{ marginTop: 16 }}><Bar pct={info.pct} /></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 7 }}>
            <span className="mono" style={{ fontSize: 11, color: 'var(--muted)' }}>{state.xp.toLocaleString()} XP</span>
            <span className="mono" style={{ fontSize: 11, color: 'var(--faint)' }}>{info.toNext > 0 ? `${info.toNext.toLocaleString()} to ${info.next!.name}` : 'MAX RANK'}</span>
          </div>
        </div>

        {/* Stat tiles */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 18 }}>
          {[['Total XP', state.xp.toLocaleString()], ['Streak', state.streak + 'd'], ['Badges', `${unlocked}/${achs.length}`]].map(([l, v]) => (
            <div key={l} className="card" style={{ flex: 1, padding: '13px 8px', textAlign: 'center' }}>
              <div className="num" style={{ fontSize: 20 }}>{v}</div>
              <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--faint)', letterSpacing: '0.05em', marginTop: 2, textTransform: 'uppercase' }}>{l}</div>
            </div>
          ))}
        </div>

        {/* Achievements grid */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '0 2px 10px' }}>
          <span className="kicker">Achievements</span>
          <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--ember-bright)' }}>{unlocked} unlocked</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 22 }}>
          {achs.map(a => (
            <div key={a.id} onClick={() => setSel(a)} className="card tap" style={{ padding: '14px 10px', textAlign: 'center', position: 'relative', borderColor: a.unlocked ? a.color + '55' : 'var(--line)', background: a.unlocked ? `radial-gradient(120% 120% at 50% 0%, ${a.color}1f, var(--surface) 70%)` : 'var(--surface)', opacity: a.unlocked ? 1 : 0.72 }}>
              <div style={{ width: 46, height: 46, borderRadius: 13, margin: '0 auto 9px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: a.unlocked ? a.color + '24' : 'var(--surface-2)', color: a.unlocked ? a.color : 'var(--faint)', boxShadow: a.unlocked ? `0 0 14px ${a.color}40` : 'none' }}>
                <a.icon size={24} />
              </div>
              <div style={{ fontSize: 12, fontWeight: 800, lineHeight: 1.15, color: a.unlocked ? 'var(--text)' : 'var(--muted)' }}>{a.name}</div>
              {!a.unlocked && <div style={{ position: 'absolute', top: 10, right: 10, color: 'var(--faint)' }}><ILock /></div>}
            </div>
          ))}
        </div>

        {/* Rank ladder */}
        <div className="kicker" style={{ margin: '0 2px 12px' }}>The Rank Ladder</div>
        <div style={{ position: 'relative' }}>
          <div style={{ position: 'absolute', left: 31, top: 10, bottom: 10, width: 2, background: 'var(--line)' }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {RANKS.map((r, i) => {
              const passed = i < info.idx, current = i === info.idx;
              return (
                <div key={r.name} style={{ display: 'flex', alignItems: 'center', gap: 13, position: 'relative', padding: '8px 12px 8px 0', borderRadius: 16, background: current ? `linear-gradient(100deg, ${r.accent}1f, transparent 70%)` : 'transparent' }}>
                  <div style={{ position: 'relative', zIndex: 1, background: 'var(--bg)', borderRadius: '50%', padding: 2 }}>
                    <RankBadge idx={i} size={44} glow={current} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0, opacity: (passed || current) ? 1 : 0.55 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontWeight: 800, fontSize: 15, color: current ? r.accent : 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.name}</span>
                      {current && <span style={{ fontSize: 10, fontWeight: 800, color: '#1a0a06', background: r.accent, padding: '2px 7px', borderRadius: 99, flexShrink: 0 }}>YOU</span>}
                    </div>
                    <div className="mono" style={{ fontSize: 11, color: 'var(--faint)', marginTop: 2 }}>{r.min.toLocaleString()} XP{passed ? ' · cleared' : ''}</div>
                  </div>
                  {passed && <span style={{ color: 'var(--good)', flexShrink: 0 }}><ICheck /></span>}
                  {!passed && !current && <span style={{ color: 'var(--faint)', flexShrink: 0 }}><ILock /></span>}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Achievement detail sheet */}
      <Sheet open={!!sel} onClose={() => setSel(null)}>
        {sel && (
          <div style={{ textAlign: 'center', paddingBottom: 4 }}>
            <div style={{ width: 74, height: 74, borderRadius: 20, margin: '4px auto 14px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: sel.unlocked ? sel.color + '24' : 'var(--surface-2)', color: sel.unlocked ? sel.color : 'var(--faint)', boxShadow: sel.unlocked ? `0 0 22px ${sel.color}45` : 'none' }}>
              <sel.icon size={38} />
            </div>
            <div className="h-display" style={{ fontSize: 24 }}>{sel.name}</div>
            <div style={{ display: 'inline-flex', marginTop: 8, padding: '5px 13px', borderRadius: 99, fontSize: 12, fontWeight: 800, background: sel.unlocked ? 'var(--ember-soft)' : 'var(--surface-2)', color: sel.unlocked ? 'var(--good)' : 'var(--muted)', border: `1px solid ${sel.unlocked ? 'var(--ember-line)' : 'var(--line)'}` }}>
              {sel.unlocked ? '✓ UNLOCKED' : 'LOCKED'}
            </div>
            <p style={{ fontSize: 15, color: 'var(--text)', fontWeight: 500, lineHeight: 1.5, margin: '16px 14px 18px' }}>{sel.desc}</p>
            <div style={{ padding: '0 6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 7 }}>
                <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--muted)' }}>Progress</span>
                <span className="mono" style={{ fontSize: 12, color: 'var(--ember-bright)' }}>{sel.goal}</span>
              </div>
              <Bar pct={sel.prog} color={sel.unlocked ? 'var(--good)' : 'var(--ember)'} />
            </div>
          </div>
        )}
      </Sheet>
    </div>
  );
}
