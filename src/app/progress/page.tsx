'use client';

import { useState, useEffect } from 'react';
import { Scale, TrendingUp, TrendingDown, Minus, Trophy, Flame, Dumbbell, Check } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import {
  getWeightEntries,
  saveWeightEntry,
  getProfile,
  getGameStats,
  saveGameStats,
  getWorkouts,
  todayStr,
} from '@/lib/storage';
import { calcWeightTrend } from '@/lib/calculations';
import { ACHIEVEMENTS, XP, checkAchievements, getRankForXP, RANKS } from '@/lib/gamification';
import type { WeightEntry, UserProfile, GameStats } from '@/types';

export default function ProgressPage() {
  const [weights, setWeights] = useState<WeightEntry[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<GameStats | null>(null);
  const [workoutCount, setWorkoutCount] = useState(0);
  const [showWeighIn, setShowWeighIn] = useState(false);
  const [weighInValue, setWeighInValue] = useState('');
  const [weighInNote, setWeighInNote] = useState('');
  const [weighInDone, setWeighInDone] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setWeights(getWeightEntries());
    setProfile(getProfile());
    setStats(getGameStats());
    setWorkoutCount(getWorkouts().filter((w) => w.completed).length);
  }, []);

  if (!mounted) return <div className="h-full flex items-center justify-center"><div className="w-8 h-8 rounded-full border-2 border-cyan-500 border-t-transparent animate-spin" /></div>;

  const latest = weights[weights.length - 1];
  const previous = weights[weights.length - 2];
  const trend = latest && previous ? calcWeightTrend(latest.weightLbs, previous.weightLbs) : null;

  const goalWeight = profile?.goalWeightLbs ?? 0;
  const startWeight = weights[0]?.weightLbs ?? profile?.weightLbs ?? 0;
  const currentWeight = latest?.weightLbs ?? profile?.weightLbs ?? 0;
  const totalChange = startWeight - currentWeight;
  const goalDistance = Math.abs(currentWeight - goalWeight);
  const goalProgress = startWeight !== goalWeight
    ? Math.min(100, Math.max(0, (Math.abs(startWeight - currentWeight) / Math.abs(startWeight - goalWeight)) * 100))
    : 100;

  function submitWeighIn() {
    const w = parseFloat(weighInValue);
    if (!w || w < 50 || w > 700) return;

    const entry: WeightEntry = { date: todayStr(), weightLbs: w, notes: weighInNote };
    saveWeightEntry(entry);
    setWeights(getWeightEntries());

    // XP
    const gs = getGameStats();
    const newGs = {
      ...gs,
      xp: gs.xp + XP.WEEKLY_WEIGH_IN,
      totalWeighIns: gs.totalWeighIns + 1,
      achievements: checkAchievements(gs.achievements, gs.totalWorkouts, gs.streak, gs.xp + XP.WEEKLY_WEIGH_IN, gs.totalMealsLogged, gs.totalWeighIns + 1),
    };
    saveGameStats(newGs);
    setStats(newGs);
    setWeighInDone(true);
  }

  const chartData = weights.slice(-12).map((w) => ({
    date: new Date(w.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    weight: w.weightLbs,
  }));

  const xp = stats?.xp ?? 0;
  const rank = getRankForXP(xp);
  const streak = stats?.streak ?? 0;

  const weeklyCheckInDue = (() => {
    if (!latest) return true;
    const lastDate = new Date(latest.date);
    const diffDays = Math.floor((Date.now() - lastDate.getTime()) / 86400000);
    return diffDays >= 7;
  })();

  return (
    <div className="fade-up px-4 pt-6 pb-4 space-y-4">
      <h1 className="text-2xl font-bold text-white">Progress</h1>

      {/* Weekly weigh-in prompt */}
      {weeklyCheckInDue && !weighInDone && (
        <button
          onClick={() => setShowWeighIn(true)}
          className="w-full py-4 rounded-2xl flex items-center gap-3 px-4 transition-all active:scale-95"
          style={{
            background: 'linear-gradient(135deg, rgba(6,182,212,0.12), rgba(168,85,247,0.12))',
            border: '1px solid rgba(6,182,212,0.3)',
          }}
        >
          <Scale size={24} className="text-cyan-400 flex-shrink-0" />
          <div className="text-left flex-1">
            <p className="text-sm font-bold text-white">Weekly Weigh-In Time!</p>
            <p className="text-xs text-slate-400 mt-0.5">Let&apos;s see the progress. Earn +{XP.WEEKLY_WEIGH_IN} XP.</p>
          </div>
          <span className="text-cyan-400 text-lg">→</span>
        </button>
      )}

      {weighInDone && (
        <Card className="flex items-center gap-3 py-3" style={{ background: 'rgba(16,185,129,0.08)', borderColor: 'rgba(16,185,129,0.2)' }}>
          <Check size={20} className="text-emerald-400" />
          <div>
            <p className="text-sm font-semibold text-emerald-400">Weigh-in logged!</p>
            <p className="text-xs text-slate-400">+{XP.WEEKLY_WEIGH_IN} XP earned</p>
          </div>
        </Card>
      )}

      {/* Weight stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="text-center py-3">
          <div className="text-lg font-black text-white">{currentWeight}</div>
          <div className="text-[11px] text-slate-400">lbs now</div>
        </Card>
        <Card className="text-center py-3">
          <div className={`text-lg font-black flex items-center justify-center gap-1 ${totalChange > 0 ? 'text-emerald-400' : totalChange < 0 ? 'text-red-400' : 'text-slate-400'}`}>
            {totalChange > 0 ? <TrendingDown size={16} /> : totalChange < 0 ? <TrendingUp size={16} /> : <Minus size={16} />}
            {Math.abs(totalChange).toFixed(1)}
          </div>
          <div className="text-[11px] text-slate-400">lbs total</div>
        </Card>
        <Card className="text-center py-3">
          <div className="text-lg font-black text-cyan-400">{goalWeight}</div>
          <div className="text-[11px] text-slate-400">lbs goal</div>
        </Card>
      </div>

      {/* Week over week */}
      {trend && (
        <Card className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${trend.direction === 'down' ? 'bg-emerald-500/20' : trend.direction === 'up' ? 'bg-red-500/20' : 'bg-slate-800'}`}>
            {trend.direction === 'down' ? <TrendingDown size={20} className="text-emerald-400" /> :
             trend.direction === 'up'   ? <TrendingUp size={20} className="text-red-400" /> :
             <Minus size={20} className="text-slate-400" />}
          </div>
          <div>
            <p className="text-sm font-semibold text-white">
              {trend.direction === 'down' ? `Down ${trend.diff} lbs from last weigh-in` :
               trend.direction === 'up'   ? `Up ${trend.diff} lbs from last weigh-in` :
               'Same as last weigh-in'}
            </p>
            <p className="text-xs text-slate-400 mt-0.5">
              {trend.direction === 'same'
                ? 'Consistency still counts. Keep going!'
                : profile?.fitnessGoal === 'lose_fat' && trend.direction === 'down'
                ? "You're on the right track! Keep it up."
                : profile?.fitnessGoal === 'build_muscle' && trend.direction === 'up'
                ? 'Growing! Good work.'
                : 'Keep tracking consistently.'}
            </p>
          </div>
        </Card>
      )}

      {/* Goal progress */}
      {goalWeight > 0 && (
        <Card className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-white">Goal Progress</span>
            <span className="text-xs text-slate-400">{goalDistance.toFixed(1)} lbs to go</span>
          </div>
          <div className="h-3 rounded-full bg-slate-800 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${goalProgress}%`, background: 'linear-gradient(90deg, #a855f7, #06b6d4)' }}
            />
          </div>
          <p className="text-xs text-slate-500 text-right">{Math.round(goalProgress)}% of the way there</p>
        </Card>
      )}

      {/* Weight chart */}
      {chartData.length >= 2 && (
        <Card>
          <h3 className="text-sm font-semibold text-white mb-3">Weight Over Time</h3>
          <ResponsiveContainer width="100%" height={140}>
            <LineChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
              <XAxis
                dataKey="date"
                tick={{ fill: '#64748b', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                domain={['auto', 'auto']}
                tick={{ fill: '#64748b', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{ background: '#0d1422', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, color: '#f8fafc', fontSize: 12 }}
                labelStyle={{ color: '#64748b' }}
              />
              <Line
                type="monotone"
                dataKey="weight"
                stroke="#06b6d4"
                strokeWidth={2.5}
                dot={{ fill: '#06b6d4', strokeWidth: 0, r: 4 }}
                activeDot={{ r: 6, fill: '#06b6d4' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* Stats */}
      <div>
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2.5">Your Stats</h2>
        <div className="grid grid-cols-2 gap-3">
          <Card className="flex items-center gap-3 py-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/15 flex items-center justify-center">
              <Dumbbell size={18} className="text-cyan-400" />
            </div>
            <div>
              <div className="text-lg font-black text-white">{workoutCount}</div>
              <div className="text-[11px] text-slate-400">Workouts</div>
            </div>
          </Card>
          <Card className="flex items-center gap-3 py-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 flex items-center justify-center">
              <Flame size={18} className="text-amber-400" />
            </div>
            <div>
              <div className="text-lg font-black text-amber-400">{streak}</div>
              <div className="text-[11px] text-slate-400">Day Streak</div>
            </div>
          </Card>
        </div>
      </div>

      {/* Rank progression */}
      <Card>
        <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
          <Trophy size={15} className="text-amber-400" /> Rank Journey
        </h3>
        <div className="space-y-2">
          {RANKS.slice(0, 8).map((r) => {
            const unlocked = xp >= r.minXP;
            const current = r.name === rank.name;
            return (
              <div
                key={r.name}
                className="flex items-center gap-3 py-2 px-3 rounded-xl transition-all"
                style={{
                  background: current ? 'rgba(255,255,255,0.05)' : 'transparent',
                  border: current ? '1px solid rgba(255,255,255,0.08)' : '1px solid transparent',
                  opacity: unlocked ? 1 : 0.4,
                }}
              >
                <span className="text-lg w-6 text-center">{unlocked ? r.emoji : '🔒'}</span>
                <div className="flex-1">
                  <p className="text-xs font-semibold" style={{ color: unlocked ? r.color : '#475569' }}>{r.name}</p>
                  <p className="text-[10px] text-slate-500">{r.minXP.toLocaleString()} XP</p>
                </div>
                {current && <span className="text-[10px] bg-cyan-500/20 text-cyan-400 px-2 py-0.5 rounded-full font-medium">Current</span>}
              </div>
            );
          })}
        </div>
      </Card>

      {/* Achievements */}
      {(stats?.achievements?.length ?? 0) > 0 && (
        <Card>
          <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
            <Trophy size={15} className="text-amber-400" /> Achievements
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {ACHIEVEMENTS.map((a) => {
              const earned = stats?.achievements.includes(a.id);
              return (
                <div
                  key={a.id}
                  className="flex items-center gap-2 p-2.5 rounded-xl"
                  style={{
                    background: earned ? 'rgba(245,158,11,0.08)' : '#111827',
                    border: `1px solid ${earned ? 'rgba(245,158,11,0.2)' : 'rgba(255,255,255,0.04)'}`,
                    opacity: earned ? 1 : 0.4,
                  }}
                >
                  <span className="text-lg">{a.emoji}</span>
                  <div>
                    <p className="text-xs font-semibold text-white leading-tight">{a.label}</p>
                    <p className="text-[10px] text-slate-500 leading-tight mt-0.5">{a.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Weigh-in modal */}
      <Modal open={showWeighIn} onClose={() => setShowWeighIn(false)} title="Weekly Weigh-In">
        <div className="space-y-4">
          <div
            className="p-4 rounded-2xl text-center"
            style={{ background: 'rgba(6,182,212,0.06)', border: '1px solid rgba(6,182,212,0.15)' }}
          >
            <Scale size={28} className="text-cyan-400 mx-auto mb-2" />
            <p className="text-sm text-slate-300 leading-relaxed">
              Weekly weigh-in time. Let&apos;s see the progress.<br />
              {latest ? `Last weigh-in: ${latest.weightLbs} lbs` : 'First weigh-in — let\'s set the baseline!'}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Current Weight (lbs)</label>
            <input
              type="number"
              placeholder={`e.g. ${profile?.weightLbs ?? 175}`}
              value={weighInValue}
              onChange={(e) => setWeighInValue(e.target.value)}
              inputMode="decimal"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Notes <span className="text-slate-500">(optional)</span></label>
            <input
              type="text"
              placeholder="e.g. morning, after gym..."
              value={weighInNote}
              onChange={(e) => setWeighInNote(e.target.value)}
            />
          </div>

          {weighInValue && previous && (
            <Card style={{ background: 'rgba(168,85,247,0.06)', borderColor: 'rgba(168,85,247,0.15)' }}>
              {(() => {
                const newW = parseFloat(weighInValue);
                const diff = Math.abs(newW - previous.weightLbs).toFixed(1);
                const dir = newW < previous.weightLbs ? 'down' : newW > previous.weightLbs ? 'up' : 'same';
                return (
                  <p className="text-sm text-slate-300 text-center">
                    {dir === 'down' ? `🎉 You're down ${diff} lbs from last time!` :
                     dir === 'up'   ? `📈 Up ${diff} lbs — adjust your plan if needed.` :
                     '⚖️ Same weight. Consistency still counts!'}
                  </p>
                );
              })()}
            </Card>
          )}

          <Button
            variant="primary"
            fullWidth
            size="lg"
            onClick={submitWeighIn}
            disabled={!weighInValue || parseFloat(weighInValue) < 50}
            className="flex items-center justify-center gap-2"
          >
            <Check size={18} /> Log Weigh-In (+{XP.WEEKLY_WEIGH_IN} XP)
          </Button>
        </div>
      </Modal>
    </div>
  );
}
