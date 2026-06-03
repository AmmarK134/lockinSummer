import type {
  UserProfile,
  GameStats,
  WorkoutSession,
  DailyNutrition,
  WeightEntry,
} from '@/types';
import { STORAGE_KEYS } from '@/types';

// ─── Generic helpers ──────────────────────────────────────────────────────────

function get<T>(key: string): T | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function set<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    console.error('Storage write failed for key:', key);
  }
}

// ─── Profile ──────────────────────────────────────────────────────────────────

export function getProfile(): UserProfile | null {
  return get<UserProfile>(STORAGE_KEYS.PROFILE);
}

export function saveProfile(profile: UserProfile): void {
  set(STORAGE_KEYS.PROFILE, profile);
}

// ─── Game Stats ───────────────────────────────────────────────────────────────

const defaultGameStats: GameStats = {
  xp: 0,
  streak: 0,
  lastWorkoutDate: '',
  lastActiveDate: '',
  achievements: [],
  totalWorkouts: 0,
  totalMealsLogged: 0,
  totalWeighIns: 0,
};

export function getGameStats(): GameStats {
  return get<GameStats>(STORAGE_KEYS.GAME_STATS) ?? defaultGameStats;
}

export function saveGameStats(stats: GameStats): void {
  set(STORAGE_KEYS.GAME_STATS, stats);
}

export function addXP(amount: number): GameStats {
  const stats = getGameStats();
  const updated = { ...stats, xp: stats.xp + amount };
  saveGameStats(updated);
  return updated;
}

// ─── Workouts ─────────────────────────────────────────────────────────────────

export function getWorkouts(): WorkoutSession[] {
  return get<WorkoutSession[]>(STORAGE_KEYS.WORKOUTS) ?? [];
}

export function saveWorkout(session: WorkoutSession): void {
  const workouts = getWorkouts();
  const idx = workouts.findIndex((w) => w.id === session.id);
  if (idx >= 0) {
    workouts[idx] = session;
  } else {
    workouts.unshift(session);
  }
  set(STORAGE_KEYS.WORKOUTS, workouts);
}

export function deleteWorkout(id: string): void {
  const workouts = getWorkouts().filter((w) => w.id !== id);
  set(STORAGE_KEYS.WORKOUTS, workouts);
}

export function getWorkoutsForDateRange(startDate: string, endDate: string): WorkoutSession[] {
  return getWorkouts().filter((w) => w.date >= startDate && w.date <= endDate);
}

// ─── Nutrition ────────────────────────────────────────────────────────────────

export function getNutritionMap(): Record<string, DailyNutrition> {
  return get<Record<string, DailyNutrition>>(STORAGE_KEYS.NUTRITION) ?? {};
}

export function getDayNutrition(date: string): DailyNutrition {
  const map = getNutritionMap();
  return map[date] ?? { date, meals: [], waterOz: 0 };
}

export function saveDayNutrition(nutrition: DailyNutrition): void {
  const map = getNutritionMap();
  map[nutrition.date] = nutrition;
  set(STORAGE_KEYS.NUTRITION, map);
}

// ─── Weights ──────────────────────────────────────────────────────────────────

export function getWeightEntries(): WeightEntry[] {
  const entries = get<WeightEntry[]>(STORAGE_KEYS.WEIGHTS) ?? [];
  return entries.sort((a, b) => a.date.localeCompare(b.date));
}

export function saveWeightEntry(entry: WeightEntry): void {
  const entries = getWeightEntries().filter((e) => e.date !== entry.date);
  entries.push(entry);
  set(STORAGE_KEYS.WEIGHTS, entries.sort((a, b) => a.date.localeCompare(b.date)));
}

export function getLatestWeight(): WeightEntry | null {
  const entries = getWeightEntries();
  return entries.length > 0 ? entries[entries.length - 1] : null;
}

// ─── Utilities ────────────────────────────────────────────────────────────────

export function clearAll(): void {
  if (typeof window === 'undefined') return;
  Object.values(STORAGE_KEYS).forEach((key) => localStorage.removeItem(key));
}

export function todayStr(): string {
  return new Date().toISOString().split('T')[0];
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}
