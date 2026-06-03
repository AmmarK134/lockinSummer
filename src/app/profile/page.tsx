'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronRight, ChevronLeft, Check, User, Target, Dumbbell, Settings } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { getProfile, saveProfile, getGameStats, saveGameStats, getLatestWeight, todayStr } from '@/lib/storage';
import { calcBMR, calcTDEE, calcCalorieGoal, calcMacroGoals, calcWaterGoal } from '@/lib/calculations';
import type { UserProfile, FitnessGoal, ActivityLevel, GymExperience, Equipment, Gender } from '@/types';

const STEPS = ['basics', 'body', 'goals', 'experience', 'diet'] as const;
type Step = typeof STEPS[number];

const GOAL_OPTIONS: { value: FitnessGoal; label: string; emoji: string; desc: string }[] = [
  { value: 'lose_fat',       label: 'Lose Fat',      emoji: '🔥', desc: 'Burn fat while preserving muscle' },
  { value: 'build_muscle',   label: 'Build Muscle',  emoji: '💪', desc: 'Maximize muscle growth' },
  { value: 'get_stronger',   label: 'Get Stronger',  emoji: '⚡', desc: 'Increase strength and power' },
  { value: 'improve_cardio', label: 'Cardio Fit',    emoji: '🏃', desc: 'Build endurance and stamina' },
  { value: 'general_fitness',label: 'General Fit',   emoji: '🌟', desc: 'Overall health and fitness' },
];

const ACTIVITY_OPTIONS: { value: ActivityLevel; label: string; desc: string }[] = [
  { value: 'sedentary',    label: 'Sedentary',     desc: 'Little or no exercise' },
  { value: 'light',        label: 'Light',         desc: '1–3 workouts per week' },
  { value: 'moderate',     label: 'Moderate',      desc: '3–5 workouts per week' },
  { value: 'very_active',  label: 'Very Active',   desc: '6–7 workouts per week' },
  { value: 'extra_active', label: 'Extra Active',  desc: 'Athlete / physical job' },
];

const EXPERIENCE_OPTIONS: { value: GymExperience; label: string; emoji: string }[] = [
  { value: 'beginner',     label: 'Beginner',     emoji: '🌱' },
  { value: 'intermediate', label: 'Intermediate', emoji: '🌿' },
  { value: 'advanced',     label: 'Advanced',     emoji: '🌳' },
];

const EQUIPMENT_OPTIONS: { value: Equipment; label: string; emoji: string }[] = [
  { value: 'full_gym', label: 'Full Gym',    emoji: '🏋️' },
  { value: 'home',     label: 'Home Gym',   emoji: '🏠' },
  { value: 'minimal',  label: 'Minimal',    emoji: '🎒' },
];

type FormState = {
  name: string;
  age: string;
  gender: Gender;
  heightFt: string;
  heightIn: string;
  weightLbs: string;
  goalWeightLbs: string;
  fitnessGoal: FitnessGoal;
  activityLevel: ActivityLevel;
  gymExperience: GymExperience;
  preferredDays: string;
  equipment: Equipment;
  injuries: string;
  dietPreference: string;
};

const defaultForm: FormState = {
  name: '', age: '', gender: 'male',
  heightFt: '5', heightIn: '10',
  weightLbs: '175', goalWeightLbs: '160',
  fitnessGoal: 'build_muscle',
  activityLevel: 'moderate',
  gymExperience: 'beginner',
  preferredDays: '4',
  equipment: 'full_gym',
  injuries: '',
  dietPreference: '',
};

export default function ProfilePage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('basics');
  const [form, setForm] = useState<FormState>(defaultForm);
  const [existingProfile, setExistingProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const p = getProfile();
    if (p?.setupComplete) {
      setExistingProfile(p);
      setIsEditing(true);
      const totalIn = p.heightCm / 2.54;
      setForm({
        name: p.name,
        age: String(p.age),
        gender: p.gender,
        heightFt: String(Math.floor(totalIn / 12)),
        heightIn: String(Math.round(totalIn % 12)),
        weightLbs: String(p.weightLbs),
        goalWeightLbs: String(p.goalWeightLbs),
        fitnessGoal: p.fitnessGoal,
        activityLevel: p.activityLevel,
        gymExperience: p.gymExperience,
        preferredDays: String(p.preferredDays),
        equipment: p.equipment,
        injuries: p.injuries,
        dietPreference: p.dietPreference,
      });
    }
  }, []);

  const set = (key: keyof FormState, value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  const stepIdx = STEPS.indexOf(step);

  function next() {
    if (stepIdx < STEPS.length - 1) setStep(STEPS[stepIdx + 1]);
    else saveAndFinish();
  }

  function back() {
    if (stepIdx > 0) setStep(STEPS[stepIdx - 1]);
  }

  function saveAndFinish() {
    const heightCm = (parseInt(form.heightFt) * 12 + parseInt(form.heightIn)) * 2.54;
    const weightLbs = parseFloat(form.weightLbs);
    const age = parseInt(form.age);

    const bmr = calcBMR(weightLbs, heightCm, age, form.gender);
    const tdee = calcTDEE(bmr, form.activityLevel);
    const calorieGoal = calcCalorieGoal(tdee, form.fitnessGoal);
    const { proteinG, carbsG, fatG } = calcMacroGoals(calorieGoal, form.fitnessGoal, weightLbs);
    const waterOz = calcWaterGoal(weightLbs, form.activityLevel);

    const profile: UserProfile = {
      name: form.name || 'Athlete',
      age,
      gender: form.gender,
      heightCm: Math.round(heightCm * 10) / 10,
      weightLbs,
      goalWeightLbs: parseFloat(form.goalWeightLbs),
      fitnessGoal: form.fitnessGoal,
      activityLevel: form.activityLevel,
      gymExperience: form.gymExperience,
      preferredDays: parseInt(form.preferredDays),
      equipment: form.equipment,
      injuries: form.injuries,
      dietPreference: form.dietPreference,
      dailyCalorieGoal: calorieGoal,
      dailyProteinGoal: proteinG,
      dailyCarbGoal: carbsG,
      dailyFatGoal: fatG,
      dailyWaterOz: waterOz,
      setupComplete: true,
      createdAt: existingProfile?.createdAt ?? new Date().toISOString(),
    };

    saveProfile(profile);

    // Sync starting weight if new user
    if (!existingProfile) {
      const { saveWeightEntry } = require('@/lib/storage');
      saveWeightEntry({ date: todayStr(), weightLbs, notes: 'Starting weight' });
    }

    setSaved(true);
    setTimeout(() => router.push('/'), 1200);
  }

  if (saved) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-4 px-6 text-center">
        <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
          <Check size={32} className="text-emerald-400" />
        </div>
        <h2 className="text-xl font-bold text-white">Profile Saved!</h2>
        <p className="text-slate-400 text-sm">Taking you to your dashboard…</p>
      </div>
    );
  }

  if (isEditing && !saved) {
    return <EditView form={form} set={set} profile={existingProfile!} onSave={saveAndFinish} />;
  }

  return (
    <div className="flex flex-col h-full">
      {/* Progress bar */}
      <div className="px-4 pt-6 pb-4">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-xl font-bold text-white">Set Up Profile</h1>
          <span className="text-sm text-slate-400">{stepIdx + 1} / {STEPS.length}</span>
        </div>
        <div className="flex gap-1.5">
          {STEPS.map((s, i) => (
            <div
              key={s}
              className="flex-1 h-1.5 rounded-full transition-colors"
              style={{ background: i <= stepIdx ? '#06b6d4' : '#1e293b' }}
            />
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-6 space-y-4">
        {step === 'basics' && <BasicsStep form={form} set={set} />}
        {step === 'body' && <BodyStep form={form} set={set} />}
        {step === 'goals' && <GoalsStep form={form} set={set} />}
        {step === 'experience' && <ExperienceStep form={form} set={set} />}
        {step === 'diet' && <DietStep form={form} set={set} />}
      </div>

      {/* Navigation */}
      <div className="px-4 pb-6 flex gap-3">
        {stepIdx > 0 && (
          <Button variant="secondary" onClick={back} className="flex items-center gap-1">
            <ChevronLeft size={16} /> Back
          </Button>
        )}
        <Button
          variant="primary"
          fullWidth
          onClick={next}
          className="flex items-center justify-center gap-1"
        >
          {stepIdx === STEPS.length - 1 ? (
            <>Save Profile <Check size={16} /></>
          ) : (
            <>Next <ChevronRight size={16} /></>
          )}
        </Button>
      </div>
    </div>
  );
}

// ─── Steps ────────────────────────────────────────────────────────────────────

function BasicsStep({ form, set }: { form: FormState; set: (k: keyof FormState, v: string) => void }) {
  return (
    <div className="space-y-4 fade-up">
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1.5 flex items-center gap-2">
          <User size={15} /> What's your name?
        </label>
        <input
          type="text"
          placeholder="e.g. Ammar"
          value={form.name}
          onChange={(e) => set('name', e.target.value)}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1.5">Age</label>
        <input
          type="number"
          placeholder="e.g. 22"
          value={form.age}
          onChange={(e) => set('age', e.target.value)}
          inputMode="numeric"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">Gender</label>
        <div className="grid grid-cols-3 gap-2">
          {(['male', 'female', 'other'] as Gender[]).map((g) => (
            <button
              key={g}
              onClick={() => set('gender', g)}
              className="py-3 rounded-2xl text-sm font-medium transition-all capitalize"
              style={{
                background: form.gender === g ? 'rgba(6,182,212,0.15)' : '#111827',
                border: `1px solid ${form.gender === g ? '#06b6d4' : 'rgba(255,255,255,0.08)'}`,
                color: form.gender === g ? '#06b6d4' : '#94a3b8',
              }}
            >
              {g}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function BodyStep({ form, set }: { form: FormState; set: (k: keyof FormState, v: string) => void }) {
  return (
    <div className="space-y-4 fade-up">
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1.5">Height</label>
        <div className="grid grid-cols-2 gap-3">
          <div className="relative">
            <input type="number" value={form.heightFt} onChange={(e) => set('heightFt', e.target.value)} inputMode="numeric" />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none">ft</span>
          </div>
          <div className="relative">
            <input type="number" value={form.heightIn} onChange={(e) => set('heightIn', e.target.value)} inputMode="numeric" />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none">in</span>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1.5">Current Weight</label>
        <div className="relative">
          <input
            type="number"
            placeholder="175"
            value={form.weightLbs}
            onChange={(e) => set('weightLbs', e.target.value)}
            inputMode="decimal"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none">lbs</span>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1.5">Goal Weight</label>
        <div className="relative">
          <input
            type="number"
            placeholder="160"
            value={form.goalWeightLbs}
            onChange={(e) => set('goalWeightLbs', e.target.value)}
            inputMode="decimal"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none">lbs</span>
        </div>
      </div>

      <Card style={{ background: 'rgba(6,182,212,0.04)', borderColor: 'rgba(6,182,212,0.12)' }}>
        <p className="text-xs text-slate-400 leading-relaxed">
          We'll use your weight and height to calculate your calorie and macro targets automatically using the Mifflin-St Jeor formula.
        </p>
      </Card>
    </div>
  );
}

function GoalsStep({ form, set }: { form: FormState; set: (k: keyof FormState, v: string) => void }) {
  return (
    <div className="space-y-4 fade-up">
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
          <Target size={15} /> Your primary goal?
        </label>
        <div className="space-y-2">
          {GOAL_OPTIONS.map((g) => (
            <button
              key={g.value}
              onClick={() => set('fitnessGoal', g.value)}
              className="w-full flex items-center gap-3 p-3.5 rounded-2xl text-left transition-all"
              style={{
                background: form.fitnessGoal === g.value ? 'rgba(6,182,212,0.12)' : '#0d1422',
                border: `1px solid ${form.fitnessGoal === g.value ? '#06b6d4' : 'rgba(255,255,255,0.06)'}`,
              }}
            >
              <span className="text-2xl">{g.emoji}</span>
              <div className="flex-1">
                <p className="text-sm font-semibold text-white">{g.label}</p>
                <p className="text-xs text-slate-400 mt-0.5">{g.desc}</p>
              </div>
              {form.fitnessGoal === g.value && <Check size={18} className="text-cyan-400 flex-shrink-0" />}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">Activity Level</label>
        <div className="space-y-1.5">
          {ACTIVITY_OPTIONS.map((a) => (
            <button
              key={a.value}
              onClick={() => set('activityLevel', a.value)}
              className="w-full flex items-center justify-between p-3 rounded-xl transition-all"
              style={{
                background: form.activityLevel === a.value ? 'rgba(168,85,247,0.12)' : '#111827',
                border: `1px solid ${form.activityLevel === a.value ? '#a855f7' : 'rgba(255,255,255,0.06)'}`,
              }}
            >
              <div className="text-left">
                <p className="text-sm font-medium text-white">{a.label}</p>
                <p className="text-xs text-slate-400">{a.desc}</p>
              </div>
              {form.activityLevel === a.value && <Check size={16} className="text-purple-400" />}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function ExperienceStep({ form, set }: { form: FormState; set: (k: keyof FormState, v: string) => void }) {
  return (
    <div className="space-y-5 fade-up">
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
          <Dumbbell size={15} /> Gym experience?
        </label>
        <div className="grid grid-cols-3 gap-2">
          {EXPERIENCE_OPTIONS.map((e) => (
            <button
              key={e.value}
              onClick={() => set('gymExperience', e.value)}
              className="flex flex-col items-center gap-2 py-4 rounded-2xl transition-all"
              style={{
                background: form.gymExperience === e.value ? 'rgba(6,182,212,0.12)' : '#0d1422',
                border: `1px solid ${form.gymExperience === e.value ? '#06b6d4' : 'rgba(255,255,255,0.06)'}`,
              }}
            >
              <span className="text-2xl">{e.emoji}</span>
              <span className="text-xs font-medium text-slate-300">{e.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">Available equipment?</label>
        <div className="grid grid-cols-3 gap-2">
          {EQUIPMENT_OPTIONS.map((e) => (
            <button
              key={e.value}
              onClick={() => set('equipment', e.value)}
              className="flex flex-col items-center gap-2 py-4 rounded-2xl transition-all"
              style={{
                background: form.equipment === e.value ? 'rgba(168,85,247,0.12)' : '#0d1422',
                border: `1px solid ${form.equipment === e.value ? '#a855f7' : 'rgba(255,255,255,0.06)'}`,
              }}
            >
              <span className="text-2xl">{e.emoji}</span>
              <span className="text-xs font-medium text-slate-300">{e.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1.5">
          Days per week you can train?
        </label>
        <div className="flex gap-2">
          {[2, 3, 4, 5, 6].map((d) => (
            <button
              key={d}
              onClick={() => set('preferredDays', String(d))}
              className="flex-1 py-3 rounded-xl text-sm font-bold transition-all"
              style={{
                background: form.preferredDays === String(d) ? '#06b6d4' : '#111827',
                color: form.preferredDays === String(d) ? '#fff' : '#64748b',
                border: `1px solid ${form.preferredDays === String(d) ? '#06b6d4' : 'rgba(255,255,255,0.06)'}`,
              }}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1.5">
          Injuries or limitations? <span className="text-slate-500">(optional)</span>
        </label>
        <textarea
          placeholder="e.g. bad left knee, shoulder impingement..."
          value={form.injuries}
          onChange={(e) => set('injuries', e.target.value)}
          rows={3}
          style={{ resize: 'none' }}
        />
      </div>
    </div>
  );
}

function DietStep({ form, set }: { form: FormState; set: (k: keyof FormState, v: string) => void }) {
  const diets = ['None / Everything', 'Vegetarian', 'Vegan', 'Keto', 'Low-carb', 'Intermittent Fasting', 'Halal', 'Gluten-free'];

  return (
    <div className="space-y-4 fade-up">
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">Diet preference?</label>
        <div className="grid grid-cols-2 gap-2">
          {diets.map((d) => (
            <button
              key={d}
              onClick={() => set('dietPreference', d)}
              className="py-3 px-3 rounded-xl text-sm font-medium text-left transition-all"
              style={{
                background: form.dietPreference === d ? 'rgba(16,185,129,0.12)' : '#111827',
                border: `1px solid ${form.dietPreference === d ? '#10b981' : 'rgba(255,255,255,0.06)'}`,
                color: form.dietPreference === d ? '#10b981' : '#94a3b8',
              }}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      <Card style={{ background: 'rgba(245,158,11,0.06)', borderColor: 'rgba(245,158,11,0.15)' }}>
        <p className="text-xs font-semibold text-amber-400 mb-1">Your calorie targets will be calculated as:</p>
        <p className="text-xs text-slate-300 leading-relaxed">
          Based on the Mifflin-St Jeor equation + your activity level and goal. You can always adjust these manually on your profile.
        </p>
      </Card>
    </div>
  );
}

// ─── Edit View (for existing users) ──────────────────────────────────────────

function EditView({
  form, set, profile, onSave,
}: {
  form: FormState;
  set: (k: keyof FormState, v: string) => void;
  profile: UserProfile;
  onSave: () => void;
}) {
  const latestWeight = getLatestWeight();

  return (
    <div className="px-4 pt-6 pb-6 space-y-5 fade-up">
      <div className="flex items-center gap-3">
        <div className="w-14 h-14 rounded-full bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-2xl">
          💪
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">{profile.name}</h1>
          <p className="text-sm text-slate-400">{profile.fitnessGoal.replace(/_/g, ' ')} · {profile.gymExperience}</p>
        </div>
      </div>

      {/* Stats summary */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="text-center py-3">
          <div className="text-lg font-bold text-cyan-400">{profile.weightLbs}</div>
          <div className="text-[11px] text-slate-400">lbs</div>
        </Card>
        <Card className="text-center py-3">
          <div className="text-lg font-bold text-purple-400">{profile.dailyCalorieGoal}</div>
          <div className="text-[11px] text-slate-400">kcal goal</div>
        </Card>
        <Card className="text-center py-3">
          <div className="text-lg font-bold text-emerald-400">{profile.preferredDays}d</div>
          <div className="text-[11px] text-slate-400">per week</div>
        </Card>
      </div>

      {/* Editable fields */}
      <Card>
        <h2 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
          <Settings size={15} className="text-slate-400" /> Profile Settings
        </h2>
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-slate-400 mb-1">Name</label>
            <input value={form.name} onChange={(e) => set('name', e.target.value)} />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Current Weight (lbs)</label>
            <input type="number" value={form.weightLbs} onChange={(e) => set('weightLbs', e.target.value)} inputMode="decimal" />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Goal Weight (lbs)</label>
            <input type="number" value={form.goalWeightLbs} onChange={(e) => set('goalWeightLbs', e.target.value)} inputMode="decimal" />
          </div>
        </div>
      </Card>

      <Card>
        <h2 className="text-sm font-semibold text-white mb-3">Daily Goals (Auto-calculated)</h2>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex justify-between"><span className="text-slate-400">Calories</span><span className="text-white font-medium">{profile.dailyCalorieGoal} kcal</span></div>
          <div className="flex justify-between"><span className="text-slate-400">Protein</span><span className="text-white font-medium">{profile.dailyProteinGoal}g</span></div>
          <div className="flex justify-between"><span className="text-slate-400">Carbs</span><span className="text-white font-medium">{profile.dailyCarbGoal}g</span></div>
          <div className="flex justify-between"><span className="text-slate-400">Fat</span><span className="text-white font-medium">{profile.dailyFatGoal}g</span></div>
          <div className="flex justify-between"><span className="text-slate-400">Water</span><span className="text-white font-medium">{profile.dailyWaterOz} oz</span></div>
        </div>
      </Card>

      <Button variant="primary" fullWidth onClick={onSave} size="lg">
        Save Changes
      </Button>
    </div>
  );
}
