'use client';

import { useState, useEffect } from 'react';
import { Plus, Droplets, Apple, Trash2, X, Check } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import CircularProgress from '@/components/ui/CircularProgress';
import ProgressBar from '@/components/ui/ProgressBar';
import {
  getDayNutrition,
  saveDayNutrition,
  getProfile,
  getGameStats,
  saveGameStats,
  todayStr,
  generateId,
} from '@/lib/storage';
import { sumNutrition } from '@/lib/calculations';
import { XP, checkAchievements } from '@/lib/gamification';
import type { DailyNutrition, Meal, FoodItem, MealType, UserProfile } from '@/types';

const MEAL_TYPES: { value: MealType; label: string; emoji: string }[] = [
  { value: 'breakfast', label: 'Breakfast', emoji: '🌅' },
  { value: 'lunch',     label: 'Lunch',     emoji: '☀️' },
  { value: 'dinner',    label: 'Dinner',    emoji: '🌙' },
  { value: 'snack',     label: 'Snack',     emoji: '🍎' },
];

const COMMON_FOODS: FoodItem[] = [
  { id: 'egg',         name: 'Egg (large)',              calories: 70,  proteinG: 6,  carbsG: 0.5, fatG: 5,  servingSize: '1 egg',   quantity: 1 },
  { id: 'rice',        name: 'White Rice (cooked)',       calories: 206, proteinG: 4,  carbsG: 45,  fatG: 0.4,servingSize: '1 cup',   quantity: 1 },
  { id: 'chicken',     name: 'Chicken Breast (grilled)', calories: 165, proteinG: 31, carbsG: 0,   fatG: 3.6,servingSize: '100g',    quantity: 1 },
  { id: 'oats',        name: 'Rolled Oats (dry)',        calories: 150, proteinG: 5,  carbsG: 27,  fatG: 3,  servingSize: '½ cup',   quantity: 1 },
  { id: 'banana',      name: 'Banana',                   calories: 105, proteinG: 1.3,carbsG: 27,  fatG: 0.4,servingSize: '1 medium', quantity: 1 },
  { id: 'greek-yogurt',name: 'Greek Yogurt (plain)',     calories: 100, proteinG: 17, carbsG: 6,   fatG: 0.7,servingSize: '170g',    quantity: 1 },
  { id: 'protein-shake',name: 'Protein Shake',           calories: 130, proteinG: 25, carbsG: 5,   fatG: 2,  servingSize: '1 scoop', quantity: 1 },
  { id: 'broccoli',    name: 'Broccoli',                 calories: 55,  proteinG: 4,  carbsG: 11,  fatG: 0.6,servingSize: '1 cup',   quantity: 1 },
  { id: 'sweet-potato',name: 'Sweet Potato',             calories: 103, proteinG: 2,  carbsG: 24,  fatG: 0.1,servingSize: '1 medium', quantity: 1 },
  { id: 'salmon',      name: 'Salmon (fillet)',           calories: 208, proteinG: 29, carbsG: 0,   fatG: 10, servingSize: '100g',    quantity: 1 },
  { id: 'almonds',     name: 'Almonds',                  calories: 164, proteinG: 6,  carbsG: 6,   fatG: 14, servingSize: '1 oz',    quantity: 1 },
  { id: 'whole-milk',  name: 'Whole Milk',               calories: 149, proteinG: 8,  carbsG: 11,  fatG: 8,  servingSize: '1 cup',   quantity: 1 },
];

export default function NutritionPage() {
  const [nutrition, setNutrition] = useState<DailyNutrition>({ date: todayStr(), meals: [], waterOz: 0 });
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [showMealModal, setShowMealModal] = useState(false);
  const [showFoodModal, setShowFoodModal] = useState(false);
  const [activeMealId, setActiveMealId] = useState<string | null>(null);
  const [newMealType, setNewMealType] = useState<MealType>('breakfast');
  const [foodSearch, setFoodSearch] = useState('');
  const [customFood, setCustomFood] = useState({ name: '', calories: '', proteinG: '', carbsG: '', fatG: '', servingSize: '1 serving', quantity: '1' });
  const [showCustom, setShowCustom] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setNutrition(getDayNutrition(todayStr()));
    setProfile(getProfile());
  }, []);

  if (!mounted) return <div className="h-full flex items-center justify-center"><div className="w-8 h-8 rounded-full border-2 border-cyan-500 border-t-transparent animate-spin" /></div>;

  const totals = sumNutrition(nutrition);
  const cal = profile?.dailyCalorieGoal ?? 2000;
  const pro = profile?.dailyProteinGoal ?? 150;
  const carb = profile?.dailyCarbGoal ?? 200;
  const fat = profile?.dailyFatGoal ?? 65;
  const waterGoal = profile?.dailyWaterOz ?? 80;

  function save(updated: DailyNutrition) {
    setNutrition(updated);
    saveDayNutrition(updated);
  }

  function addMeal() {
    const meal: Meal = {
      id: generateId(),
      name: MEAL_TYPES.find((m) => m.value === newMealType)?.label ?? 'Meal',
      type: newMealType,
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      items: [],
    };
    const updated = { ...nutrition, meals: [...nutrition.meals, meal] };
    save(updated);

    // Grant meal XP
    const gs = getGameStats();
    if (gs.totalMealsLogged === 0) {
      const newGs = {
        ...gs,
        xp: gs.xp + XP.LOG_MEAL,
        totalMealsLogged: gs.totalMealsLogged + 1,
        achievements: checkAchievements(gs.achievements, gs.totalWorkouts, gs.streak, gs.xp + XP.LOG_MEAL, 1, gs.totalWeighIns),
      };
      saveGameStats(newGs);
    } else {
      saveGameStats({ ...gs, xp: gs.xp + XP.LOG_MEAL, totalMealsLogged: gs.totalMealsLogged + 1 });
    }

    setActiveMealId(meal.id);
    setShowMealModal(false);
    setShowFoodModal(true);
  }

  function addFoodToMeal(food: FoodItem) {
    if (!activeMealId) return;
    const updated = {
      ...nutrition,
      meals: nutrition.meals.map((m) =>
        m.id === activeMealId ? { ...m, items: [...m.items, { ...food, id: generateId() }] } : m
      ),
    };
    save(updated);
  }

  function removeFoodFromMeal(mealId: string, foodId: string) {
    const updated = {
      ...nutrition,
      meals: nutrition.meals.map((m) =>
        m.id === mealId ? { ...m, items: m.items.filter((i) => i.id !== foodId) } : m
      ),
    };
    save(updated);
  }

  function removeMeal(mealId: string) {
    save({ ...nutrition, meals: nutrition.meals.filter((m) => m.id !== mealId) });
  }

  function addWater(oz: number) {
    save({ ...nutrition, waterOz: Math.max(0, nutrition.waterOz + oz) });
  }

  function addCustomFood() {
    if (!customFood.name) return;
    const food: FoodItem = {
      id: generateId(),
      name: customFood.name,
      calories: parseFloat(customFood.calories) || 0,
      proteinG: parseFloat(customFood.proteinG) || 0,
      carbsG: parseFloat(customFood.carbsG) || 0,
      fatG: parseFloat(customFood.fatG) || 0,
      servingSize: customFood.servingSize,
      quantity: parseFloat(customFood.quantity) || 1,
    };
    addFoodToMeal(food);
    setCustomFood({ name: '', calories: '', proteinG: '', carbsG: '', fatG: '', servingSize: '1 serving', quantity: '1' });
    setShowCustom(false);
  }

  const calPct = Math.min(100, (totals.calories / cal) * 100);
  const waterPct = Math.min(100, (nutrition.waterOz / waterGoal) * 100);

  const filteredFoods = COMMON_FOODS.filter((f) =>
    !foodSearch || f.name.toLowerCase().includes(foodSearch.toLowerCase())
  );

  return (
    <div className="fade-up px-4 pt-6 pb-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Nutrition</h1>
        <span className="text-sm text-slate-400">{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
      </div>

      {/* Calorie overview */}
      <Card className="flex items-center gap-4">
        <CircularProgress value={calPct} size={88} strokeWidth={8} color={calPct > 100 ? '#ef4444' : '#06b6d4'}>
          <div className="text-center">
            <div className="text-sm font-black text-white">{totals.calories}</div>
            <div className="text-[9px] text-slate-400">/ {cal}</div>
          </div>
        </CircularProgress>

        <div className="flex-1 space-y-2">
          <MacroRow label="Protein" val={totals.proteinG} goal={pro} color="#a855f7" unit="g" />
          <MacroRow label="Carbs"   val={totals.carbsG}   goal={carb} color="#f59e0b" unit="g" />
          <MacroRow label="Fat"     val={totals.fatG}      goal={fat}  color="#10b981" unit="g" />
        </div>
      </Card>

      {/* Water */}
      <Card className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Droplets size={16} className="text-cyan-400" />
            <span className="text-sm font-semibold text-white">Water</span>
          </div>
          <span className="text-sm text-slate-300">{nutrition.waterOz} / {waterGoal} oz</span>
        </div>
        <ProgressBar value={waterPct} color="cyan" height="sm" />
        <div className="flex gap-2">
          {[8, 12, 16, 24, 32].map((oz) => (
            <button
              key={oz}
              onClick={() => addWater(oz)}
              className="flex-1 py-2 rounded-xl text-xs font-medium bg-slate-800 text-slate-300 hover:bg-cyan-500/20 hover:text-cyan-400 transition-colors active:scale-95"
            >
              +{oz}
            </button>
          ))}
          <button
            onClick={() => addWater(-8)}
            className="px-2 py-2 rounded-xl text-xs bg-slate-800 text-slate-500 hover:text-red-400 transition-colors"
          >
            -8
          </button>
        </div>
      </Card>

      {/* Add meal button */}
      <Button
        variant="primary"
        fullWidth
        onClick={() => setShowMealModal(true)}
        className="flex items-center justify-center gap-2"
      >
        <Plus size={18} /> Log a Meal
      </Button>

      {/* Meals */}
      {nutrition.meals.length === 0 ? (
        <Card className="text-center py-8">
          <Apple size={24} className="text-slate-600 mx-auto mb-2" />
          <p className="text-slate-400 text-sm">No meals logged today. Start by adding breakfast!</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {MEAL_TYPES.map(({ value, label, emoji }) => {
            const meals = nutrition.meals.filter((m) => m.type === value);
            if (meals.length === 0) return null;
            return (
              <div key={value}>
                <div className="flex items-center gap-2 mb-2">
                  <span>{emoji}</span>
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</span>
                </div>
                {meals.map((meal) => (
                  <MealCard
                    key={meal.id}
                    meal={meal}
                    onAddFood={() => { setActiveMealId(meal.id); setShowFoodModal(true); }}
                    onRemoveFood={(foodId) => removeFoodFromMeal(meal.id, foodId)}
                    onRemoveMeal={() => removeMeal(meal.id)}
                  />
                ))}
              </div>
            );
          })}
        </div>
      )}

      {/* Macros remaining */}
      {nutrition.meals.length > 0 && (
        <Card style={{ background: 'rgba(168,85,247,0.04)', borderColor: 'rgba(168,85,247,0.12)' }}>
          <h3 className="text-xs font-semibold text-purple-400 uppercase tracking-wider mb-2">Remaining Today</h3>
          <div className="grid grid-cols-2 gap-y-1 text-sm">
            <span className="text-slate-400">Calories</span>
            <span className="text-right font-medium" style={{ color: cal - totals.calories < 0 ? '#ef4444' : '#f8fafc' }}>
              {cal - totals.calories} kcal
            </span>
            <span className="text-slate-400">Protein</span>
            <span className="text-right font-medium text-white">{Math.max(0, pro - totals.proteinG)}g</span>
            <span className="text-slate-400">Carbs</span>
            <span className="text-right font-medium text-white">{Math.max(0, carb - totals.carbsG)}g</span>
            <span className="text-slate-400">Fat</span>
            <span className="text-right font-medium text-white">{Math.max(0, fat - totals.fatG)}g</span>
          </div>
        </Card>
      )}

      {/* Meal type modal */}
      <Modal open={showMealModal} onClose={() => setShowMealModal(false)} title="Log a Meal">
        <div className="space-y-3">
          <p className="text-sm text-slate-400">What meal is this?</p>
          <div className="grid grid-cols-2 gap-2">
            {MEAL_TYPES.map(({ value, label, emoji }) => (
              <button
                key={value}
                onClick={() => setNewMealType(value)}
                className="flex items-center gap-2 p-3.5 rounded-2xl transition-all"
                style={{
                  background: newMealType === value ? 'rgba(6,182,212,0.12)' : '#111827',
                  border: `1px solid ${newMealType === value ? '#06b6d4' : 'rgba(255,255,255,0.06)'}`,
                }}
              >
                <span className="text-xl">{emoji}</span>
                <span className="text-sm font-medium" style={{ color: newMealType === value ? '#06b6d4' : '#94a3b8' }}>{label}</span>
              </button>
            ))}
          </div>
          <Button variant="primary" fullWidth size="lg" onClick={addMeal}>
            Continue →
          </Button>
        </div>
      </Modal>

      {/* Food search modal */}
      <Modal open={showFoodModal} onClose={() => setShowFoodModal(false)} title="Add Food" fullScreen>
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Search foods..."
            value={foodSearch}
            onChange={(e) => setFoodSearch(e.target.value)}
          />

          {/* Toggle custom */}
          <button
            onClick={() => setShowCustom((v) => !v)}
            className="w-full py-2.5 rounded-xl text-sm text-slate-400 hover:text-cyan-400 transition-colors border border-dashed border-slate-700"
          >
            {showCustom ? '− Hide custom entry' : '+ Enter custom food'}
          </button>

          {showCustom && (
            <Card className="space-y-3">
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Custom Food Entry</p>
              <input type="text" placeholder="Food name" value={customFood.name} onChange={(e) => setCustomFood((f) => ({ ...f, name: e.target.value }))} />
              <div className="grid grid-cols-2 gap-2">
                {['calories', 'proteinG', 'carbsG', 'fatG'].map((field) => (
                  <div key={field}>
                    <label className="block text-[11px] text-slate-500 mb-1 capitalize">{field.replace('G', ' (g)').replace('calories', 'calories')}</label>
                    <input
                      type="number"
                      placeholder="0"
                      value={customFood[field as keyof typeof customFood]}
                      onChange={(e) => setCustomFood((f) => ({ ...f, [field]: e.target.value }))}
                      inputMode="decimal"
                      style={{ padding: '8px 12px', borderRadius: '10px' }}
                    />
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] text-slate-500 mb-1">Serving size</label>
                  <input type="text" value={customFood.servingSize} onChange={(e) => setCustomFood((f) => ({ ...f, servingSize: e.target.value }))} style={{ padding: '8px 12px', borderRadius: '10px' }} />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-500 mb-1">Quantity</label>
                  <input type="number" value={customFood.quantity} onChange={(e) => setCustomFood((f) => ({ ...f, quantity: e.target.value }))} inputMode="decimal" style={{ padding: '8px 12px', borderRadius: '10px' }} />
                </div>
              </div>
              <Button variant="primary" fullWidth onClick={addCustomFood}>
                Add Custom Food
              </Button>
            </Card>
          )}

          {/* Common foods */}
          <p className="text-xs text-slate-500 uppercase tracking-wider">Common Foods</p>
          <div className="space-y-2">
            {filteredFoods.map((food) => (
              <button
                key={food.id}
                onClick={() => addFoodToMeal(food)}
                className="w-full flex items-center justify-between p-3 rounded-xl text-left transition-all active:scale-98"
                style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.06)' }}
              >
                <div>
                  <p className="text-sm font-medium text-white">{food.name}</p>
                  <p className="text-xs text-slate-500">{food.servingSize} · {food.calories} kcal</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-purple-400">{food.proteinG}g P</p>
                  <p className="text-xs text-amber-400">{food.carbsG}g C · {food.fatG}g F</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ─── Meal Card ─────────────────────────────────────────────────────────────────

function MealCard({ meal, onAddFood, onRemoveFood, onRemoveMeal }: {
  meal: Meal;
  onAddFood: () => void;
  onRemoveFood: (id: string) => void;
  onRemoveMeal: () => void;
}) {
  const mealTotals = meal.items.reduce(
    (acc, item) => ({
      calories: acc.calories + item.calories * item.quantity,
      proteinG: acc.proteinG + item.proteinG * item.quantity,
    }),
    { calories: 0, proteinG: 0 }
  );

  return (
    <Card className="mb-2">
      <div className="flex items-center justify-between mb-2">
        <div>
          <span className="text-sm font-semibold text-white">{meal.name}</span>
          <span className="text-xs text-slate-500 ml-2">{meal.time}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-cyan-400">{Math.round(mealTotals.calories)} kcal</span>
          <button onClick={onRemoveMeal} className="p-1 text-slate-600 hover:text-red-400 transition-colors">
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {meal.items.map((item) => (
        <div key={item.id} className="flex items-center justify-between py-1.5 border-t border-slate-800/50">
          <div>
            <p className="text-xs text-slate-300">{item.quantity > 1 ? `${item.quantity}× ` : ''}{item.name}</p>
            <p className="text-[11px] text-slate-500">{item.servingSize}</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-right">
              <p className="text-xs text-white">{Math.round(item.calories * item.quantity)} kcal</p>
              <p className="text-[11px] text-purple-400">{Math.round(item.proteinG * item.quantity)}g P</p>
            </div>
            <button onClick={() => onRemoveFood(item.id)} className="p-1 text-slate-600 hover:text-red-400">
              <X size={13} />
            </button>
          </div>
        </div>
      ))}

      <button
        onClick={onAddFood}
        className="w-full mt-2 py-2 rounded-xl text-xs text-slate-500 hover:text-cyan-400 border border-dashed border-slate-700 hover:border-cyan-500/30 transition-colors"
      >
        + Add food to this meal
      </button>
    </Card>
  );
}

// ─── Macro Row ─────────────────────────────────────────────────────────────────

function MacroRow({ label, val, goal, color, unit }: { label: string; val: number; goal: number; color: string; unit: string }) {
  const pct = goal > 0 ? Math.min(100, (val / goal) * 100) : 0;
  return (
    <div className="space-y-0.5">
      <div className="flex justify-between text-xs">
        <span className="text-slate-400">{label}</span>
        <span style={{ color }}>{Math.round(val)}{unit} / {goal}{unit}</span>
      </div>
      <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}
