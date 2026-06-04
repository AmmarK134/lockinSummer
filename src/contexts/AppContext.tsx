'use client';
import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';

export interface Meal {
  id: string;
  type: string;
  name: string;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  portion: string;
  items?: string[];
}

export interface TodayWorkout {
  name: string;
  exercises: number;
  mins: number;
  done: boolean;
}

export interface AppState {
  xp: number;
  streak: number;
  caloriesGoal: number;
  caloriesEaten: number;
  proteinGoal: number;
  proteinEaten: number;
  carbsGoal: number;
  carbsEaten: number;
  fatGoal: number;
  fatEaten: number;
  waterGoal: number;
  waterCups: number;
  meals: Meal[];
  weightSeries: number[];
  todayWorkout: TodayWorkout;
  lastDate: string; // YYYY-MM-DD, used for daily reset
}

export interface Profile {
  name: string;
  age: string;
  gender: string;
  heightCm: string;
  weightKg: string;
  goalWeightKg: string;
  goal: string;
  activity: string;
  experience: string;
  diet: string;
  days: string[];
  _startXp: number;
}

// Demo state — only used for "Skip / explore the demo" button in onboarding
export const DEMO_STATE: AppState = {
  xp: 8240,
  streak: 12,
  caloriesGoal: 2400,
  caloriesEaten: 1480,
  proteinGoal: 175,
  proteinEaten: 118,
  carbsGoal: 240,
  carbsEaten: 150,
  fatGoal: 70,
  fatEaten: 44,
  waterGoal: 8,
  waterCups: 5,
  meals: [
    { id: 'm1', type: 'Breakfast', name: 'Oats & Blueberries', kcal: 380, protein: 20, carbs: 60, fat: 8, portion: '1 bowl' },
    { id: 'm2', type: 'Lunch', name: 'Chicken, Rice & Broccoli', kcal: 700, protein: 58, carbs: 78, fat: 18, portion: '1 plate' },
    { id: 'm3', type: 'Snack', name: 'Protein Shake', kcal: 400, protein: 40, carbs: 12, fat: 18, portion: '1 scoop + milk' },
  ],
  weightSeries: [82.4, 82.0, 81.7, 81.9, 81.2, 80.8, 80.6],
  todayWorkout: { name: 'Push Day — Chest & Shoulders', exercises: 6, mins: 52, done: false },
  lastDate: '',
};

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function yesterdayStr() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

// Build a fresh zero-state from the user's profile
export function createFreshState(profile: Profile): AppState {
  const weightKg = parseFloat(profile.weightKg) || 75;
  const proteinGoal = Math.round(weightKg * 1.8);
  const caloriesGoal =
    profile.goal === 'lose-fat'     ? 1800 :
    profile.goal === 'build-muscle' ? 2800 :
    profile.goal === 'get-stronger' ? 2600 :
    profile.goal === 'cardio'       ? 2400 : 2200;
  const fatGoal    = Math.round(caloriesGoal * 0.25 / 9);
  const carbsGoal  = Math.max(50, Math.round((caloriesGoal - proteinGoal * 4 - fatGoal * 9) / 4));

  return {
    xp: profile._startXp,
    streak: 0,
    caloriesGoal,
    caloriesEaten: 0,
    proteinGoal,
    proteinEaten: 0,
    carbsGoal,
    carbsEaten: 0,
    fatGoal,
    fatEaten: 0,
    waterGoal: 8,
    waterCups: 0,
    meals: [],
    weightSeries: [weightKg],
    todayWorkout: { name: 'Push Day — Chest & Shoulders', exercises: 6, mins: 52, done: false },
    lastDate: todayStr(),
  };
}

// Reset daily-tracked values when the calendar date has changed
function applyDailyReset(state: AppState): AppState {
  const today = todayStr();
  if (state.lastDate === today) return state; // already up-to-date

  const streakContinues = state.lastDate === yesterdayStr();
  return {
    ...state,
    caloriesEaten: 0,
    proteinEaten: 0,
    carbsEaten: 0,
    fatEaten: 0,
    waterCups: 0,
    meals: [],
    todayWorkout: { ...state.todayWorkout, done: false },
    streak: streakContinues ? state.streak : 0,
    lastDate: today,
  };
}

const LS_PROFILE = 'lockin_profile_v1';
const LS_STATE   = 'lockin_state_v1';

function loadProfile(): Profile | null {
  if (typeof window === 'undefined') return null;
  try { return JSON.parse(localStorage.getItem(LS_PROFILE) || 'null'); } catch { return null; }
}

function loadState(profile: Profile | null): AppState {
  if (typeof window === 'undefined') return DEMO_STATE;
  try {
    const saved = JSON.parse(localStorage.getItem(LS_STATE) || 'null') as AppState | null;
    if (saved) return applyDailyReset({ ...saved, lastDate: saved.lastDate || '' });
  } catch { /* ignore */ }
  return profile ? createFreshState(profile) : DEMO_STATE;
}

interface AppContextType {
  profile: Profile | null;
  setProfile: (p: Profile | null) => void;
  state: AppState;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
  toast: (msg: string) => void;
  toastMsg: string | null;
  weighOpen: boolean;
  setWeighOpen: (v: boolean) => void;
  addOpen: boolean;
  setAddOpen: (v: boolean) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfileState] = useState<Profile | null>(null);
  const [state, setState] = useState<AppState>(DEMO_STATE);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [weighOpen, setWeighOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Hydrate from localStorage on mount
  useEffect(() => {
    const p = loadProfile();
    setProfileState(p);
    setState(loadState(p));
  }, []);

  // Persist state whenever it changes
  useEffect(() => {
    if (profile && typeof window !== 'undefined') {
      try { localStorage.setItem(LS_STATE, JSON.stringify(state)); } catch { /* ignore */ }
    }
  }, [state, profile]);

  const setProfile = useCallback((p: Profile | null) => {
    setProfileState(p);
    if (p) {
      try { localStorage.setItem(LS_PROFILE, JSON.stringify(p)); } catch { /* ignore */ }
    } else {
      try { localStorage.removeItem(LS_PROFILE); localStorage.removeItem(LS_STATE); } catch { /* ignore */ }
    }
  }, []);

  const toast = useCallback((msg: string) => {
    setToastMsg(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastMsg(null), 2200);
  }, []);

  return (
    <AppContext.Provider value={{ profile, setProfile, state, setState, toast, toastMsg, weighOpen, setWeighOpen, addOpen, setAddOpen }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
