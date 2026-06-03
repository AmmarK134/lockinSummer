'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Dumbbell, Apple, BookOpen, Flame, Droplets, Zap, ChevronRight, Trophy } from 'lucide-react';
import Card from '@/components/ui/Card';
import ProgressBar from '@/components/ui/ProgressBar';
import CircularProgress from '@/components/ui/CircularProgress';
import { getRankForXP, getProgressToNextRank, getNextRank, ACHIEVEMENTS } from '@/lib/gamification';
import {
  getProfile,
  getGameStats,
  getDayNutrition,
  getWorkouts,
  todayStr,
} from '@/lib/storage';
import { sumNutrition } from '@/lib/calculations';
import type { UserProfile, GameStats, NutritionTotals } from '@/types';

export default function DashboardPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<GameStats | null>(null);
  const [nutrition, setNutrition] = useState<NutritionTotals>({ calories: 0, proteinG: 0, carbsG: 0, fatG: 0 });
  const [waterOz, setWaterOz] = useState(0);
  const [todayWorkout, setTodayWorkout] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const p = getProfile();
    const s = getGameStats();
    const n = getDayNutrition(todayStr());
    const workouts = getWorkouts();
    const todayW = workouts.find((w) => w.date === todayStr() && w.completed);

    setProfile(p);
    setStats(s);
    setNutrition(sumNutrition(n));
    setWaterOz(n.waterOz);
    setTodayWorkout(todayW?.name ?? null);
  }, []);

  if (!mounted) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-cyan-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!profile?.setupComplete) {
    return <OnboardingPrompt />;
  }

  const xp = stats?.xp ?? 0;
  const rank = getRankForXP(xp);
  const nextRank = getNextRank(xp);
  const rankProgress = getProgressToNextRank(xp);
  const streak = stats?.streak ?? 0;

  const calorieGoal = profile.dailyCalorieGoal;
  const caloriePct = calorieGoal > 0 ? Math.min(100, (nutrition.calories / calorieGoal) * 100) : 0;
  const proteinPct = profile.dailyProteinGoal > 0
    ? Math.min(100, (nutrition.proteinG / profile.dailyProteinGoal) * 100)
    : 0;
  const waterGoal = profile.dailyWaterOz;
  const waterPct = waterGoal > 0 ? Math.min(100, (waterOz / waterGoal) * 100) : 0;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning,' : hour < 17 ? 'Good afternoon,' : 'Good evening,';
  const greetEmoji = hour < 12 ? '🌅' : hour < 17 ? '💪' : '🌙';

  return (
    <div className="fade-up px-4 pt-6 pb-4 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-slate-400 text-sm">{greeting} {greetEmoji}</p>
          <h1 className="text-2xl font-bold text-white mt-0.5">{profile.name}</h1>
        </div>
        <div
          className={`${rank.cssClass} px-3 py-1.5 rounded-full flex items-center gap-1.5`}
          style={{ boxShadow: `0 0 12px ${rank.color}40` }}
        >
          <span className="text-base">{rank.emoji}</span>
          <span className="text-xs font-bold text-white whitespace-nowrap">{rank.name}</span>
        </div>
      </div>

      {/* XP Bar */}
      <Card className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap size={16} className="text-amber-400" />
            <span className="text-sm font-semibold text-white">{xp.toLocaleString()} XP</span>
          </div>
          {nextRank && (
            <span className="text-xs text-slate-400">
              → {nextRank.name} at {nextRank.minXP.toLocaleString()}
            </span>
          )}
        </div>
        <ProgressBar value={rankProgress} color="amber" height="md" animated />
        <p className="text-[11px] text-slate-500 text-right">{rankProgress}% to next rank</p>
      </Card>

      {/* Streak + Today */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="flex flex-col items-center justify-center gap-1 py-4">
          <div className="text-3xl font-black text-amber-400">{streak}</div>
          <div className="flex items-center gap-1">
            <Flame size={14} className="text-amber-400" />
            <span className="text-xs text-slate-400">Day Streak</span>
          </div>
          {streak >= 3 && <span className="text-[10px] text-amber-400 font-medium">On fire 🔥</span>}
        </Card>

        <Card
          className="flex flex-col justify-between"
          style={{
            background: todayWorkout ? 'rgba(16,185,129,0.08)' : undefined,
            borderColor: todayWorkout ? 'rgba(16,185,129,0.2)' : undefined,
          }}
        >
          <div className="flex items-center gap-1.5 mb-1">
            <Dumbbell size={14} className={todayWorkout ? 'text-emerald-400' : 'text-slate-500'} />
            <span className="text-xs text-slate-400">Today</span>
          </div>
          {todayWorkout ? (
            <>
              <p className="text-sm font-semibold text-emerald-400 leading-tight">{todayWorkout}</p>
              <p className="text-[10px] text-emerald-600 mt-1">✓ Completed</p>
            </>
          ) : (
            <>
              <p className="text-sm font-medium text-slate-300 leading-tight">No workout yet</p>
              <Link href="/workout" className="text-[11px] text-cyan-400 mt-1 flex items-center gap-0.5">
                Log one <ChevronRight size={10} />
              </Link>
            </>
          )}
        </Card>
      </div>

      {/* Calorie Ring + Macros */}
      <Card className="flex items-center gap-4">
        <CircularProgress value={caloriePct} size={90} strokeWidth={8} color="#06b6d4">
          <div className="text-center">
            <div className="text-base font-black text-white leading-tight">{nutrition.calories}</div>
            <div className="text-[9px] text-slate-400">kcal</div>
          </div>
        </CircularProgress>

        <div className="flex-1 space-y-2">
          <div className="flex justify-between text-xs text-slate-400 mb-1">
            <span>Calories</span>
            <span className="text-white font-medium">{nutrition.calories} / {calorieGoal}</span>
          </div>
          <ProgressBar value={proteinPct} color="purple" height="xs" label="Protein" showLabel />
          <ProgressBar
            value={profile.dailyCarbGoal > 0 ? Math.min(100, (nutrition.carbsG / profile.dailyCarbGoal) * 100) : 0}
            color="amber"
            height="xs"
            label="Carbs"
            showLabel
          />
          <ProgressBar
            value={profile.dailyFatGoal > 0 ? Math.min(100, (nutrition.fatG / profile.dailyFatGoal) * 100) : 0}
            color="green"
            height="xs"
            label="Fat"
            showLabel
          />
        </div>
      </Card>

      {/* Water */}
      <Card className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Droplets size={16} className="text-cyan-400" />
            <span className="text-sm font-semibold text-white">Water</span>
          </div>
          <span className="text-sm text-slate-300">{waterOz} / {waterGoal} oz</span>
        </div>
        <ProgressBar value={waterPct} color="cyan" height="sm" animated />
        <div className="flex gap-2 pt-1">
          {[8, 16, 32].map((oz) => (
            <Link
              key={oz}
              href="/nutrition"
              className="flex-1 py-1.5 rounded-xl text-center text-xs font-medium bg-slate-800 text-slate-300 hover:bg-cyan-500/20 hover:text-cyan-400 transition-colors"
            >
              +{oz} oz
            </Link>
          ))}
        </div>
      </Card>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2.5">Quick Actions</h2>
        <div className="grid grid-cols-3 gap-3">
          <QuickAction href="/workout" icon={<Dumbbell size={22} className="text-cyan-400" />} label="Log Workout" bg="rgba(6,182,212,0.08)" border="rgba(6,182,212,0.15)" />
          <QuickAction href="/nutrition" icon={<Apple size={22} className="text-purple-400" />} label="Log Meal" bg="rgba(168,85,247,0.08)" border="rgba(168,85,247,0.15)" />
          <QuickAction href="/exercises" icon={<BookOpen size={22} className="text-emerald-400" />} label="Exercises" bg="rgba(16,185,129,0.08)" border="rgba(16,185,129,0.15)" />
        </div>
      </div>

      {/* Recent Achievements */}
      {(stats?.achievements?.length ?? 0) > 0 && (
        <Card>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Trophy size={16} className="text-amber-400" />
              <span className="text-sm font-semibold text-white">Achievements</span>
            </div>
            <Link href="/progress" className="text-xs text-cyan-400">View all</Link>
          </div>
          <div className="flex flex-wrap gap-2">
            {(stats?.achievements ?? []).slice(-4).map((id) => {
              const a = ACHIEVEMENTS.find((ac) => ac.id === id);
              if (!a) return null;
              return (
                <div key={id} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-800">
                  <span className="text-sm">{a.emoji}</span>
                  <span className="text-xs text-slate-300">{a.label}</span>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      <TipCard />
    </div>
  );
}

function QuickAction({ href, icon, label, bg, border }: {
  href: string; icon: React.ReactNode; label: string; bg: string; border: string;
}) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center justify-center gap-2 py-4 rounded-2xl transition-all active:scale-95"
      style={{ background: bg, border: `1px solid ${border}` }}
    >
      {icon}
      <span className="text-[11px] font-medium text-slate-300 text-center leading-tight">{label}</span>
    </Link>
  );
}

function OnboardingPrompt() {
  return (
    <div className="h-full flex flex-col items-center justify-center px-6 text-center gap-6">
      <div className="text-6xl">💪</div>
      <div>
        <h1 className="text-2xl font-black text-white mb-2">Welcome to LockIn</h1>
        <p className="text-slate-400 text-sm leading-relaxed">
          Your fitness journey starts here. Set up your profile to unlock your personal dashboard, XP, and tracking.
        </p>
      </div>
      <Link
        href="/profile"
        className="w-full bg-cyan-500 text-white font-bold text-base py-4 rounded-2xl text-center transition-all active:scale-95"
        style={{ boxShadow: '0 0 24px rgba(6,182,212,0.4)' }}
      >
        Set Up My Profile →
      </Link>
      <p className="text-xs text-slate-600">Takes about 2 minutes</p>
    </div>
  );
}

const TIPS = [
  'Progressive overload: add 2.5–5 lbs per week to compound lifts.',
  'Protein builds muscle. Aim for 0.7–1g per lb of bodyweight daily.',
  'Rest days are not lazy — your muscles grow when you rest.',
  '80% of fat loss is diet. You cannot out-train a bad kitchen.',
  'Sleep 7–9 hours. Growth hormone is released during deep sleep.',
  'Compound lifts (squat, bench, deadlift) give the most bang for your time.',
  'Consistency beats intensity. Show up, even on the bad days.',
  'Drink half your bodyweight in lbs as oz of water per day minimum.',
  'Pre-workout: carbs + protein 60–90 min before training.',
  'Post-workout: protein within 2 hours for optimal muscle synthesis.',
];

function TipCard() {
  const tip = TIPS[new Date().getDate() % TIPS.length];
  return (
    <Card
      className="flex items-start gap-3"
      style={{ background: 'rgba(6,182,212,0.04)', borderColor: 'rgba(6,182,212,0.12)' }}
    >
      <span className="text-xl flex-shrink-0 mt-0.5">💡</span>
      <div>
        <p className="text-[11px] text-cyan-400 font-semibold uppercase tracking-wider mb-1">Tip of the Day</p>
        <p className="text-sm text-slate-300 leading-relaxed">{tip}</p>
      </div>
    </Card>
  );
}
