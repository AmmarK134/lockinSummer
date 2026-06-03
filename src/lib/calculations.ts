import type { FitnessGoal, ActivityLevel, Gender, NutritionTotals, DailyNutrition } from '@/types';

// ─── TDEE / BMR ───────────────────────────────────────────────────────────────

const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary:    1.2,
  light:        1.375,
  moderate:     1.55,
  very_active:  1.725,
  extra_active: 1.9,
};

export function calcBMR(weightLbs: number, heightCm: number, age: number, gender: Gender): number {
  const weightKg = weightLbs * 0.453592;
  if (gender === 'male') {
    return 88.362 + 13.397 * weightKg + 4.799 * heightCm - 5.677 * age;
  }
  return 447.593 + 9.247 * weightKg + 3.098 * heightCm - 4.33 * age;
}

export function calcTDEE(bmr: number, activityLevel: ActivityLevel): number {
  return Math.round(bmr * ACTIVITY_MULTIPLIERS[activityLevel]);
}

export function calcCalorieGoal(tdee: number, goal: FitnessGoal): number {
  switch (goal) {
    case 'lose_fat':       return Math.round(tdee * 0.8);
    case 'build_muscle':   return Math.round(tdee * 1.1);
    case 'get_stronger':   return Math.round(tdee * 1.05);
    case 'improve_cardio': return Math.round(tdee * 0.95);
    default:               return tdee;
  }
}

export function calcMacroGoals(calories: number, goal: FitnessGoal, weightLbs: number) {
  const weightKg = weightLbs * 0.453592;

  let proteinG: number;
  let fatPct: number;

  switch (goal) {
    case 'build_muscle':
      proteinG = Math.round(weightKg * 2.2);
      fatPct = 0.25;
      break;
    case 'lose_fat':
      proteinG = Math.round(weightKg * 2.0);
      fatPct = 0.3;
      break;
    case 'get_stronger':
      proteinG = Math.round(weightKg * 2.0);
      fatPct = 0.3;
      break;
    default:
      proteinG = Math.round(weightKg * 1.6);
      fatPct = 0.3;
  }

  const proteinCal = proteinG * 4;
  const fatCal     = Math.round(calories * fatPct);
  const fatG       = Math.round(fatCal / 9);
  const carbCal    = calories - proteinCal - fatCal;
  const carbsG     = Math.round(Math.max(0, carbCal) / 4);

  return { proteinG, carbsG, fatG };
}

// ─── Nutrition Totals ─────────────────────────────────────────────────────────

export function sumNutrition(nutrition: DailyNutrition): NutritionTotals {
  const totals: NutritionTotals = { calories: 0, proteinG: 0, carbsG: 0, fatG: 0 };

  for (const meal of nutrition.meals) {
    for (const item of meal.items) {
      totals.calories  += item.calories  * item.quantity;
      totals.proteinG  += item.proteinG  * item.quantity;
      totals.carbsG    += item.carbsG    * item.quantity;
      totals.fatG      += item.fatG      * item.quantity;
    }
  }

  return {
    calories: Math.round(totals.calories),
    proteinG: Math.round(totals.proteinG),
    carbsG:   Math.round(totals.carbsG),
    fatG:     Math.round(totals.fatG),
  };
}

// ─── Unit conversions ─────────────────────────────────────────────────────────

export function lbsToKg(lbs: number): number {
  return Math.round(lbs * 0.453592 * 10) / 10;
}

export function kgToLbs(kg: number): number {
  return Math.round(kg * 2.20462 * 10) / 10;
}

export function cmToFtIn(cm: number): string {
  const totalIn = cm / 2.54;
  const ft = Math.floor(totalIn / 12);
  const inches = Math.round(totalIn % 12);
  return `${ft}'${inches}"`;
}

// ─── Weight trend ─────────────────────────────────────────────────────────────

export function calcWeightTrend(
  currentWeight: number,
  previousWeight: number,
): { diff: number; direction: 'up' | 'down' | 'same' } {
  const diff = Math.round((currentWeight - previousWeight) * 10) / 10;
  return {
    diff: Math.abs(diff),
    direction: diff > 0.1 ? 'up' : diff < -0.1 ? 'down' : 'same',
  };
}

// ─── Hydration ────────────────────────────────────────────────────────────────

export function calcWaterGoal(weightLbs: number, activityLevel: ActivityLevel): number {
  const base = weightLbs * 0.5; // half oz per lb
  const activityBonus = activityLevel === 'very_active' || activityLevel === 'extra_active' ? 16 : 0;
  return Math.round(base + activityBonus);
}

// ─── Formatting ───────────────────────────────────────────────────────────────

export function fmtCalories(n: number): string {
  return n.toLocaleString();
}

export function fmtWeight(lbs: number): string {
  return `${lbs} lbs`;
}
