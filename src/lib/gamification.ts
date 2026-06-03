import type { RankInfo } from '@/types';

// ─── Ranks ────────────────────────────────────────────────────────────────────

export const RANKS: RankInfo[] = [
  { name: 'Protein Peasant',   minXP: 0,      maxXP: 499,   cssClass: 'rank-peasant',     color: '#94a3b8', emoji: '🥔' },
  { name: 'Cardio Goblin',     minXP: 500,    maxXP: 1499,  cssClass: 'rank-goblin-cardio', color: '#22c55e', emoji: '🏃' },
  { name: 'Bench Baby',        minXP: 1500,   maxXP: 2999,  cssClass: 'rank-bench',        color: '#3b82f6', emoji: '👶' },
  { name: 'Treadmill Menace',  minXP: 3000,   maxXP: 4999,  cssClass: 'rank-menace',       color: '#06b6d4', emoji: '😤' },
  { name: 'Creatine Gremlin',  minXP: 5000,   maxXP: 7499,  cssClass: 'rank-gremlin',      color: '#14b8a6', emoji: '🧪' },
  { name: 'Pump Apprentice',   minXP: 7500,   maxXP: 9999,  cssClass: 'rank-apprentice',   color: '#a855f7', emoji: '💪' },
  { name: 'Gym Goblin',        minXP: 10000,  maxXP: 14999, cssClass: 'rank-gym-goblin',   color: '#6366f1', emoji: '👺' },
  { name: 'Rep Goblin',        minXP: 15000,  maxXP: 19999, cssClass: 'rank-rep-goblin',   color: '#8b5cf6', emoji: '🔁' },
  { name: 'Bulk Bandit',       minXP: 20000,  maxXP: 29999, cssClass: 'rank-bandit',       color: '#f97316', emoji: '🍗' },
  { name: 'Cutting Creature',  minXP: 30000,  maxXP: 39999, cssClass: 'rank-creature',     color: '#eab308', emoji: '⚔️' },
  { name: 'Sweat Baron',       minXP: 40000,  maxXP: 54999, cssClass: 'rank-baron',        color: '#ef4444', emoji: '👑' },
  { name: 'Iron Wizard',       minXP: 55000,  maxXP: 69999, cssClass: 'rank-wizard',       color: '#ec4899', emoji: '🧙' },
  { name: 'Swole Sage',        minXP: 70000,  maxXP: 84999, cssClass: 'rank-sage',         color: '#f59e0b', emoji: '🧘' },
  { name: 'Pump Lord',         minXP: 85000,  maxXP: 99999, cssClass: 'rank-lord',         color: '#e2e8f0', emoji: '🏋️' },
  { name: 'Grandmaster Baiter',minXP: 100000, maxXP: Infinity, cssClass: 'rank-grandmaster', color: '#fbbf24', emoji: '🎣' },
];

export function getRankForXP(xp: number): RankInfo {
  return (
    [...RANKS].reverse().find((r) => xp >= r.minXP) ?? RANKS[0]
  );
}

export function getNextRank(xp: number): RankInfo | null {
  const currentRankIdx = RANKS.findIndex((r) => xp >= r.minXP && xp <= r.maxXP);
  return currentRankIdx >= 0 && currentRankIdx < RANKS.length - 1
    ? RANKS[currentRankIdx + 1]
    : null;
}

export function getProgressToNextRank(xp: number): number {
  const current = getRankForXP(xp);
  if (current.maxXP === Infinity) return 100;
  const range = current.maxXP - current.minXP + 1;
  const progress = xp - current.minXP;
  return Math.min(100, Math.round((progress / range) * 100));
}

// ─── XP Values ────────────────────────────────────────────────────────────────

export const XP = {
  COMPLETE_WORKOUT: 100,
  PER_EXERCISE: 10,
  PER_SET: 2,
  LOG_MEAL: 25,
  HIT_CALORIE_GOAL: 50,
  HIT_PROTEIN_GOAL: 50,
  HIT_WATER_GOAL: 30,
  COMPLETE_CARDIO: 50,
  WEEKLY_WEIGH_IN: 20,
  STREAK_DAY: 5,   // multiplied by streak count
} as const;

export function calcWorkoutXP(exerciseCount: number, totalSets: number, hasCardio: boolean): number {
  return (
    XP.COMPLETE_WORKOUT +
    exerciseCount * XP.PER_EXERCISE +
    totalSets * XP.PER_SET +
    (hasCardio ? XP.COMPLETE_CARDIO : 0)
  );
}

// ─── Streak logic ─────────────────────────────────────────────────────────────

export function computeStreak(lastWorkoutDate: string, currentStreak: number): number {
  if (!lastWorkoutDate) return 0;
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  if (lastWorkoutDate === today) return currentStreak;
  if (lastWorkoutDate === yesterday) return currentStreak;
  return 0; // streak broken
}

// ─── Achievement definitions ──────────────────────────────────────────────────

export const ACHIEVEMENTS = [
  { id: 'first_workout',    label: 'First Blood',         desc: 'Logged your first workout',             emoji: '🩸' },
  { id: 'workout_3',        label: 'Hat Trick',            desc: '3 workouts logged',                     emoji: '🎩' },
  { id: 'workout_10',       label: 'Double Digits',        desc: '10 workouts logged',                    emoji: '🔟' },
  { id: 'workout_50',       label: 'Gym Rat',              desc: '50 workouts logged',                    emoji: '🐀' },
  { id: 'streak_3',         label: 'On a Roll',            desc: '3-day workout streak',                  emoji: '🎲' },
  { id: 'streak_7',         label: 'Week Warrior',         desc: '7-day streak',                          emoji: '⚔️' },
  { id: 'streak_30',        label: 'Unbreakable',          desc: '30-day streak',                         emoji: '💎' },
  { id: 'first_meal',       label: 'Fuel Up',              desc: 'Logged your first meal',                emoji: '🍽️' },
  { id: 'protein_goal',     label: 'Protein King',         desc: 'Hit protein goal 7 days in a row',      emoji: '👑' },
  { id: 'first_weigh_in',   label: 'Face the Scale',       desc: 'First weekly weigh-in',                 emoji: '⚖️' },
  { id: 'rank_up_1',        label: 'Ascending',            desc: 'Reached Cardio Goblin rank',            emoji: '📈' },
  { id: 'xp_1000',          label: 'Four Figures',         desc: 'Earned 1,000 total XP',                 emoji: '💯' },
  { id: 'xp_10000',         label: 'Five Figures',         desc: 'Earned 10,000 total XP',                emoji: '🏆' },
] as const;

export type AchievementId = (typeof ACHIEVEMENTS)[number]['id'];

export function checkAchievements(
  currentAchievements: string[],
  totalWorkouts: number,
  streak: number,
  xp: number,
  totalMeals: number,
  totalWeighIns: number,
): string[] {
  const earned: string[] = [...currentAchievements];

  const grant = (id: string) => {
    if (!earned.includes(id)) earned.push(id);
  };

  if (totalWorkouts >= 1)  grant('first_workout');
  if (totalWorkouts >= 3)  grant('workout_3');
  if (totalWorkouts >= 10) grant('workout_10');
  if (totalWorkouts >= 50) grant('workout_50');
  if (streak >= 3)  grant('streak_3');
  if (streak >= 7)  grant('streak_7');
  if (streak >= 30) grant('streak_30');
  if (totalMeals >= 1)    grant('first_meal');
  if (totalWeighIns >= 1) grant('first_weigh_in');
  if (xp >= 500)   grant('rank_up_1');
  if (xp >= 1000)  grant('xp_1000');
  if (xp >= 10000) grant('xp_10000');

  return earned;
}
