// ─── User Profile ────────────────────────────────────────────────────────────

export type FitnessGoal =
  | 'lose_fat'
  | 'build_muscle'
  | 'get_stronger'
  | 'improve_cardio'
  | 'general_fitness';

export type ActivityLevel =
  | 'sedentary'
  | 'light'
  | 'moderate'
  | 'very_active'
  | 'extra_active';

export type GymExperience = 'beginner' | 'intermediate' | 'advanced';
export type Equipment = 'full_gym' | 'home' | 'minimal';
export type Gender = 'male' | 'female' | 'other';

export interface UserProfile {
  name: string;
  age: number;
  gender: Gender;
  heightCm: number;
  weightLbs: number;
  goalWeightLbs: number;
  fitnessGoal: FitnessGoal;
  activityLevel: ActivityLevel;
  gymExperience: GymExperience;
  preferredDays: number;
  equipment: Equipment;
  injuries: string;
  dietPreference: string;
  dailyCalorieGoal: number;
  dailyProteinGoal: number;
  dailyCarbGoal: number;
  dailyFatGoal: number;
  dailyWaterOz: number;
  setupComplete: boolean;
  createdAt: string;
}

// ─── Gamification ─────────────────────────────────────────────────────────────

export interface GameStats {
  xp: number;
  streak: number;
  lastWorkoutDate: string;
  lastActiveDate: string;
  achievements: string[];
  totalWorkouts: number;
  totalMealsLogged: number;
  totalWeighIns: number;
}

export interface RankInfo {
  name: string;
  minXP: number;
  maxXP: number;
  cssClass: string;
  color: string;
  emoji: string;
}

// ─── Workout ──────────────────────────────────────────────────────────────────

export type ExerciseType = 'strength' | 'cardio' | 'flexibility';

export interface ExerciseSet {
  reps: number;
  weightLbs: number;
  restSec: number;
  completed: boolean;
}

export interface CardioLog {
  equipment: string;
  durationMin: number;
  distanceMi?: number;
  speedMph?: number;
  inclinePct?: number;
  caloriesBurned?: number;
}

export interface LoggedExercise {
  id: string;
  name: string;
  type: ExerciseType;
  sets?: ExerciseSet[];
  cardio?: CardioLog;
  notes: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  muscleGroups: string[];
}

export interface WorkoutSession {
  id: string;
  date: string;
  name: string;
  exercises: LoggedExercise[];
  durationMin: number;
  notes: string;
  xpEarned: number;
  completed: boolean;
}

// ─── Nutrition ────────────────────────────────────────────────────────────────

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface FoodItem {
  id: string;
  name: string;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  servingSize: string;
  quantity: number;
}

export interface Meal {
  id: string;
  name: string;
  type: MealType;
  time: string;
  items: FoodItem[];
}

export interface DailyNutrition {
  date: string;
  meals: Meal[];
  waterOz: number;
}

export interface NutritionTotals {
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
}

// ─── Weight Tracking ──────────────────────────────────────────────────────────

export interface WeightEntry {
  date: string;
  weightLbs: number;
  notes: string;
}

// ─── Exercise Library ─────────────────────────────────────────────────────────

export type MuscleGroup =
  | 'chest'
  | 'upper_chest'
  | 'lower_chest'
  | 'back'
  | 'lats'
  | 'traps'
  | 'rhomboids'
  | 'lower_back'
  | 'shoulders'
  | 'front_delt'
  | 'side_delt'
  | 'rear_delt'
  | 'biceps'
  | 'triceps'
  | 'forearms'
  | 'quads'
  | 'hamstrings'
  | 'glutes'
  | 'calves'
  | 'core'
  | 'abs'
  | 'obliques'
  | 'hip_flexors'
  | 'full_body';

export interface ExerciseData {
  id: string;
  name: string;
  category: string;
  type: ExerciseType;
  equipment: string;
  primaryMuscles: MuscleGroup[];
  secondaryMuscles: MuscleGroup[];
  instructions: string[];
  commonMistakes: string[];
  safetyTips: string[];
  machineSetup?: string[];
  recommendedSets: string;
  recommendedReps: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  description: string;
}

// ─── Storage Keys ─────────────────────────────────────────────────────────────

export const STORAGE_KEYS = {
  PROFILE: 'lockin_profile',
  GAME_STATS: 'lockin_game_stats',
  WORKOUTS: 'lockin_workouts',
  NUTRITION: 'lockin_nutrition',
  WEIGHTS: 'lockin_weights',
} as const;
