'use client';

import { useState, useEffect } from 'react';
import { Plus, Dumbbell, Clock, Zap, ChevronDown, ChevronUp, Trash2, Check, X, Play, Square } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { getWorkouts, saveWorkout, deleteWorkout, getGameStats, saveGameStats, todayStr, generateId } from '@/lib/storage';
import { calcWorkoutXP, checkAchievements } from '@/lib/gamification';
import type { WorkoutSession, LoggedExercise, ExerciseSet, CardioLog } from '@/types';

const QUICK_EXERCISES = [
  'Bench Press', 'Squat', 'Deadlift', 'Overhead Press', 'Pull-up',
  'Lat Pulldown', 'Cable Row', 'Incline Press', 'Leg Press', 'Romanian Deadlift',
  'Bicep Curl', 'Tricep Pushdown', 'Lateral Raise', 'Face Pull', 'Plank',
  'Treadmill', 'Elliptical', 'Rowing Machine', 'Stationary Bike',
];

type WorkoutState = 'idle' | 'active' | 'done';

export default function WorkoutPage() {
  const [state, setState] = useState<WorkoutState>('idle');
  const [session, setSession] = useState<WorkoutSession | null>(null);
  const [history, setHistory] = useState<WorkoutSession[]>([]);
  const [showExerciseModal, setShowExerciseModal] = useState(false);
  const [showNameModal, setShowNameModal] = useState(false);
  const [workoutName, setWorkoutName] = useState('');
  const [customExercise, setCustomExercise] = useState('');
  const [exerciseType, setExerciseType] = useState<'strength' | 'cardio'>('strength');
  const [startTime, setStartTime] = useState<number>(0);
  const [elapsed, setElapsed] = useState(0);
  const [xpEarned, setXpEarned] = useState(0);

  useEffect(() => {
    setHistory(getWorkouts().slice(0, 20));
  }, []);

  useEffect(() => {
    if (state !== 'active') return;
    const id = setInterval(() => setElapsed(Math.floor((Date.now() - startTime) / 1000)), 1000);
    return () => clearInterval(id);
  }, [state, startTime]);

  function startWorkout() {
    const newSession: WorkoutSession = {
      id: generateId(),
      date: todayStr(),
      name: workoutName || `Workout — ${new Date().toLocaleDateString('en-US', { weekday: 'long' })}`,
      exercises: [],
      durationMin: 0,
      notes: '',
      xpEarned: 0,
      completed: false,
    };
    setSession(newSession);
    setStartTime(Date.now());
    setState('active');
    setShowNameModal(false);
  }

  function addExercise(name: string) {
    if (!session) return;
    const exercise: LoggedExercise = {
      id: generateId(),
      name,
      type: exerciseType,
      sets: exerciseType === 'strength' ? [{ reps: 10, weightLbs: 0, restSec: 90, completed: false }] : undefined,
      cardio: exerciseType === 'cardio' ? { equipment: name, durationMin: 20 } : undefined,
      notes: '',
      difficulty: 3,
      muscleGroups: [],
    };
    setSession((s) => s ? { ...s, exercises: [...s.exercises, exercise] } : s);
    setShowExerciseModal(false);
    setCustomExercise('');
  }

  function updateSet(exIdx: number, setIdx: number, field: keyof ExerciseSet, value: string | boolean) {
    setSession((s) => {
      if (!s) return s;
      const exercises = s.exercises.map((ex, i) => {
        if (i !== exIdx || !ex.sets) return ex;
        const sets = ex.sets.map((set, j) => {
          if (j !== setIdx) return set;
          return { ...set, [field]: typeof value === 'boolean' ? value : parseFloat(value) || 0 };
        });
        return { ...ex, sets };
      });
      return { ...s, exercises };
    });
  }

  function addSet(exIdx: number) {
    setSession((s) => {
      if (!s) return s;
      const exercises = s.exercises.map((ex, i) => {
        if (i !== exIdx || !ex.sets) return ex;
        const lastSet = ex.sets[ex.sets.length - 1];
        return { ...ex, sets: [...ex.sets, { ...lastSet, completed: false }] };
      });
      return { ...s, exercises };
    });
  }

  function removeExercise(exIdx: number) {
    setSession((s) => s ? { ...s, exercises: s.exercises.filter((_, i) => i !== exIdx) } : s);
  }

  function updateCardio(exIdx: number, field: keyof CardioLog, value: string) {
    setSession((s) => {
      if (!s) return s;
      const exercises = s.exercises.map((ex, i) => {
        if (i !== exIdx || !ex.cardio) return ex;
        return { ...ex, cardio: { ...ex.cardio, [field]: parseFloat(value) || 0 } };
      });
      return { ...s, exercises };
    });
  }

  function finishWorkout() {
    if (!session) return;
    const durationMin = Math.round(elapsed / 60);
    const totalSets = session.exercises.reduce((acc, ex) => acc + (ex.sets?.length ?? 0), 0);
    const hasCardio = session.exercises.some((ex) => ex.type === 'cardio');
    const xp = calcWorkoutXP(session.exercises.length, totalSets, hasCardio);

    const completed = {
      ...session,
      durationMin,
      xpEarned: xp,
      completed: true,
    };

    saveWorkout(completed);

    const gameStats = getGameStats();
    const today = todayStr();
    const isNewStreak = gameStats.lastWorkoutDate !== today;
    const newStreak = isNewStreak ? gameStats.streak + 1 : gameStats.streak;
    const updatedStats = {
      ...gameStats,
      xp: gameStats.xp + xp,
      streak: newStreak,
      lastWorkoutDate: today,
      lastActiveDate: today,
      totalWorkouts: gameStats.totalWorkouts + 1,
      achievements: checkAchievements(
        gameStats.achievements,
        gameStats.totalWorkouts + 1,
        newStreak,
        gameStats.xp + xp,
        gameStats.totalMealsLogged,
        gameStats.totalWeighIns,
      ),
    };
    saveGameStats(updatedStats);

    setXpEarned(xp);
    setSession(completed);
    setState('done');
    setHistory((h) => [completed, ...h]);
  }

  function fmtTime(sec: number) {
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }

  // ── Done screen ──────────────────────────────────────────────────────────
  if (state === 'done' && session) {
    return (
      <div className="fade-up px-4 pt-8 pb-6 flex flex-col items-center gap-5 text-center">
        <div className="text-6xl">🎉</div>
        <h1 className="text-2xl font-black text-white">Workout Complete!</h1>
        <div className="grid grid-cols-3 gap-3 w-full">
          <Card className="text-center py-3">
            <div className="text-xl font-black text-cyan-400">{fmtTime(elapsed)}</div>
            <div className="text-[11px] text-slate-400">Duration</div>
          </Card>
          <Card className="text-center py-3">
            <div className="text-xl font-black text-purple-400">{session.exercises.length}</div>
            <div className="text-[11px] text-slate-400">Exercises</div>
          </Card>
          <Card className="text-center py-3 glow-amber">
            <div className="text-xl font-black text-amber-400">+{xpEarned}</div>
            <div className="text-[11px] text-slate-400">XP</div>
          </Card>
        </div>
        <Button
          variant="primary"
          fullWidth
          size="lg"
          onClick={() => { setState('idle'); setSession(null); setElapsed(0); }}
        >
          Back to Workouts
        </Button>
      </div>
    );
  }

  // ── Active workout ────────────────────────────────────────────────────────
  if (state === 'active' && session) {
    return (
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="px-4 pt-5 pb-3 flex items-center justify-between flex-shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div>
            <h1 className="text-base font-bold text-white leading-tight">{session.name}</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <Clock size={13} className="text-cyan-400" />
              <span className="text-sm text-cyan-400 font-mono font-bold">{fmtTime(elapsed)}</span>
              <span className="text-xs text-slate-500">· {session.exercises.length} exercises</span>
            </div>
          </div>
          <Button variant="success" size="sm" onClick={finishWorkout} className="flex items-center gap-1">
            <Check size={14} /> Finish
          </Button>
        </div>

        {/* Exercise list */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
          {session.exercises.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center gap-3">
              <Dumbbell size={32} className="text-slate-600" />
              <p className="text-slate-400 text-sm">No exercises yet. Add your first one!</p>
            </div>
          )}

          {session.exercises.map((ex, exIdx) => (
            <ExerciseCard
              key={ex.id}
              exercise={ex}
              onUpdateSet={(setIdx, field, val) => updateSet(exIdx, setIdx, field, val)}
              onAddSet={() => addSet(exIdx)}
              onRemove={() => removeExercise(exIdx)}
              onUpdateCardio={(field, val) => updateCardio(exIdx, field, val)}
            />
          ))}

          <button
            onClick={() => setShowExerciseModal(true)}
            className="w-full py-4 rounded-2xl border-2 border-dashed border-slate-700 flex items-center justify-center gap-2 text-slate-500 hover:border-cyan-500/50 hover:text-cyan-400 transition-colors"
          >
            <Plus size={18} /> Add Exercise
          </button>
        </div>

        {/* Add exercise modal */}
        <Modal
          open={showExerciseModal}
          onClose={() => setShowExerciseModal(false)}
          title="Add Exercise"
          fullScreen
        >
          <div className="space-y-4">
            {/* Type toggle */}
            <div className="flex gap-2">
              <button
                onClick={() => setExerciseType('strength')}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all"
                style={{
                  background: exerciseType === 'strength' ? 'rgba(6,182,212,0.15)' : '#111827',
                  border: `1px solid ${exerciseType === 'strength' ? '#06b6d4' : 'rgba(255,255,255,0.08)'}`,
                  color: exerciseType === 'strength' ? '#06b6d4' : '#64748b',
                }}
              >
                💪 Strength
              </button>
              <button
                onClick={() => setExerciseType('cardio')}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all"
                style={{
                  background: exerciseType === 'cardio' ? 'rgba(16,185,129,0.15)' : '#111827',
                  border: `1px solid ${exerciseType === 'cardio' ? '#10b981' : 'rgba(255,255,255,0.08)'}`,
                  color: exerciseType === 'cardio' ? '#10b981' : '#64748b',
                }}
              >
                🏃 Cardio
              </button>
            </div>

            {/* Custom search/input */}
            <input
              type="text"
              placeholder="Type exercise name..."
              value={customExercise}
              onChange={(e) => setCustomExercise(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && customExercise.trim()) addExercise(customExercise.trim()); }}
            />
            {customExercise.trim() && (
              <Button variant="primary" fullWidth onClick={() => addExercise(customExercise.trim())}>
                Add "{customExercise.trim()}"
              </Button>
            )}

            {/* Quick picks */}
            <div>
              <p className="text-xs text-slate-500 mb-2 uppercase tracking-wider">Quick pick</p>
              <div className="grid grid-cols-2 gap-2">
                {QUICK_EXERCISES.filter((e) => !customExercise || e.toLowerCase().includes(customExercise.toLowerCase())).map((e) => (
                  <button
                    key={e}
                    onClick={() => addExercise(e)}
                    className="py-2.5 px-3 rounded-xl text-sm text-left text-slate-300 transition-colors"
                    style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.06)' }}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Modal>
      </div>
    );
  }

  // ── Idle (workout list) ───────────────────────────────────────────────────
  return (
    <div className="fade-up px-4 pt-6 pb-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Workouts</h1>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20">
          <Zap size={13} className="text-amber-400" />
          <span className="text-xs font-semibold text-amber-400">Ready</span>
        </div>
      </div>

      {/* Start button */}
      <button
        onClick={() => setShowNameModal(true)}
        className="w-full py-5 rounded-3xl flex flex-col items-center gap-2 transition-all active:scale-95"
        style={{
          background: 'linear-gradient(135deg, rgba(6,182,212,0.15), rgba(168,85,247,0.15))',
          border: '1px solid rgba(6,182,212,0.3)',
          boxShadow: '0 0 30px rgba(6,182,212,0.15)',
        }}
      >
        <Play size={32} className="text-cyan-400" />
        <span className="text-lg font-bold text-white">Start Workout</span>
        <span className="text-xs text-slate-400">Tap to begin tracking</span>
      </button>

      {/* History */}
      <div>
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Recent Workouts</h2>
        {history.length === 0 ? (
          <Card className="text-center py-8">
            <Dumbbell size={24} className="text-slate-600 mx-auto mb-2" />
            <p className="text-slate-400 text-sm">No workouts yet. Start your first one!</p>
          </Card>
        ) : (
          <div className="space-y-2">
            {history.map((w) => (
              <WorkoutHistoryCard key={w.id} workout={w} onDelete={() => {
                deleteWorkout(w.id);
                setHistory((h) => h.filter((x) => x.id !== w.id));
              }} />
            ))}
          </div>
        )}
      </div>

      {/* Name modal */}
      <Modal open={showNameModal} onClose={() => setShowNameModal(false)} title="Start Workout">
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1.5">Workout name (optional)</label>
            <input
              type="text"
              placeholder={`Workout — ${new Date().toLocaleDateString('en-US', { weekday: 'long' })}`}
              value={workoutName}
              onChange={(e) => setWorkoutName(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            {['Push Day', 'Pull Day', 'Leg Day', 'Upper Body', 'Lower Body', 'Full Body', 'Cardio', 'Arms'].map((n) => (
              <button
                key={n}
                onClick={() => setWorkoutName(n)}
                className="py-2.5 rounded-xl text-sm font-medium transition-all"
                style={{
                  background: workoutName === n ? 'rgba(6,182,212,0.15)' : '#111827',
                  border: `1px solid ${workoutName === n ? '#06b6d4' : 'rgba(255,255,255,0.06)'}`,
                  color: workoutName === n ? '#06b6d4' : '#94a3b8',
                }}
              >
                {n}
              </button>
            ))}
          </div>
          <Button variant="primary" fullWidth size="lg" onClick={startWorkout} className="flex items-center justify-center gap-2">
            <Play size={18} /> Let&apos;s Go!
          </Button>
        </div>
      </Modal>
    </div>
  );
}

// ─── Exercise Card ─────────────────────────────────────────────────────────────

function ExerciseCard({
  exercise, onUpdateSet, onAddSet, onRemove, onUpdateCardio,
}: {
  exercise: LoggedExercise;
  onUpdateSet: (setIdx: number, field: keyof ExerciseSet, val: string | boolean) => void;
  onAddSet: () => void;
  onRemove: () => void;
  onUpdateCardio: (field: keyof CardioLog, val: string) => void;
}) {
  const [expanded, setExpanded] = useState(true);

  return (
    <Card>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 flex-1">
          <span className="text-base">{exercise.type === 'cardio' ? '🏃' : '💪'}</span>
          <span className="text-sm font-bold text-white">{exercise.name}</span>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => setExpanded((e) => !e)} className="p-1.5 text-slate-500 hover:text-slate-300">
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          <button onClick={onRemove} className="p-1.5 text-slate-600 hover:text-red-400">
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {expanded && (
        <>
          {exercise.type === 'strength' && exercise.sets && (
            <div className="space-y-2">
              {/* Set headers */}
              <div className="grid grid-cols-[32px_1fr_1fr_80px_28px] gap-1.5 px-1">
                <span className="text-[11px] text-slate-500 text-center">Set</span>
                <span className="text-[11px] text-slate-500 text-center">Reps</span>
                <span className="text-[11px] text-slate-500 text-center">Weight (lbs)</span>
                <span className="text-[11px] text-slate-500 text-center">Rest (s)</span>
                <span />
              </div>

              {exercise.sets.map((set, i) => (
                <div key={i} className="grid grid-cols-[32px_1fr_1fr_80px_28px] gap-1.5 items-center">
                  <span
                    className="text-xs font-bold text-center rounded-lg py-1"
                    style={{ background: set.completed ? 'rgba(16,185,129,0.15)' : '#111827', color: set.completed ? '#10b981' : '#64748b' }}
                  >
                    {i + 1}
                  </span>
                  <input
                    type="number"
                    value={set.reps || ''}
                    onChange={(e) => onUpdateSet(i, 'reps', e.target.value)}
                    className="text-center text-sm"
                    style={{ padding: '8px 4px', borderRadius: '10px' }}
                    inputMode="numeric"
                  />
                  <input
                    type="number"
                    value={set.weightLbs || ''}
                    onChange={(e) => onUpdateSet(i, 'weightLbs', e.target.value)}
                    className="text-center text-sm"
                    style={{ padding: '8px 4px', borderRadius: '10px' }}
                    inputMode="decimal"
                  />
                  <input
                    type="number"
                    value={set.restSec || ''}
                    onChange={(e) => onUpdateSet(i, 'restSec', e.target.value)}
                    className="text-center text-sm"
                    style={{ padding: '8px 4px', borderRadius: '10px' }}
                    inputMode="numeric"
                  />
                  <button
                    onClick={() => onUpdateSet(i, 'completed', !set.completed)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
                    style={{ background: set.completed ? 'rgba(16,185,129,0.2)' : '#111827', border: `1px solid ${set.completed ? '#10b981' : 'rgba(255,255,255,0.1)'}` }}
                  >
                    {set.completed ? <Check size={13} className="text-emerald-400" /> : <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />}
                  </button>
                </div>
              ))}

              <button
                onClick={onAddSet}
                className="w-full py-2 rounded-xl text-xs text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/5 transition-colors border border-dashed border-slate-700"
              >
                + Add Set
              </button>
            </div>
          )}

          {exercise.type === 'cardio' && exercise.cardio && (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] text-slate-500 mb-1">Duration (min)</label>
                <input
                  type="number"
                  value={exercise.cardio.durationMin || ''}
                  onChange={(e) => onUpdateCardio('durationMin', e.target.value)}
                  inputMode="numeric"
                  style={{ padding: '8px 12px', borderRadius: '10px' }}
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-500 mb-1">Speed (mph)</label>
                <input
                  type="number"
                  value={exercise.cardio.speedMph || ''}
                  onChange={(e) => onUpdateCardio('speedMph', e.target.value)}
                  inputMode="decimal"
                  style={{ padding: '8px 12px', borderRadius: '10px' }}
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-500 mb-1">Incline (%)</label>
                <input
                  type="number"
                  value={exercise.cardio.inclinePct || ''}
                  onChange={(e) => onUpdateCardio('inclinePct', e.target.value)}
                  inputMode="decimal"
                  style={{ padding: '8px 12px', borderRadius: '10px' }}
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-500 mb-1">Calories burned</label>
                <input
                  type="number"
                  value={exercise.cardio.caloriesBurned || ''}
                  onChange={(e) => onUpdateCardio('caloriesBurned', e.target.value)}
                  inputMode="numeric"
                  style={{ padding: '8px 12px', borderRadius: '10px' }}
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-500 mb-1">Distance (mi)</label>
                <input
                  type="number"
                  value={exercise.cardio.distanceMi || ''}
                  onChange={(e) => onUpdateCardio('distanceMi', e.target.value)}
                  inputMode="decimal"
                  style={{ padding: '8px 12px', borderRadius: '10px' }}
                />
              </div>
            </div>
          )}
        </>
      )}
    </Card>
  );
}

// ─── Workout history card ──────────────────────────────────────────────────────

function WorkoutHistoryCard({ workout, onDelete }: { workout: WorkoutSession; onDelete: () => void }) {
  const [confirming, setConfirming] = useState(false);
  const totalSets = workout.exercises.reduce((acc, ex) => acc + (ex.sets?.length ?? 0), 0);

  return (
    <Card className="flex items-center gap-3">
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.2)' }}
      >
        <Dumbbell size={18} className="text-cyan-400" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-white truncate">{workout.name}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-slate-400">{new Date(workout.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
          <span className="text-xs text-slate-600">·</span>
          <span className="text-xs text-slate-400">{workout.durationMin}m</span>
          <span className="text-xs text-slate-600">·</span>
          <span className="text-xs text-slate-400">{workout.exercises.length} exercises</span>
          {totalSets > 0 && <><span className="text-xs text-slate-600">·</span><span className="text-xs text-slate-400">{totalSets} sets</span></>}
        </div>
      </div>
      <div className="flex items-center gap-1">
        <span className="text-xs font-bold text-amber-400">+{workout.xpEarned}</span>
        {confirming ? (
          <div className="flex gap-1">
            <button onClick={onDelete} className="p-1.5 text-red-400"><Check size={14} /></button>
            <button onClick={() => setConfirming(false)} className="p-1.5 text-slate-500"><X size={14} /></button>
          </div>
        ) : (
          <button onClick={() => setConfirming(true)} className="p-1.5 text-slate-600 hover:text-red-400 transition-colors">
            <Trash2 size={14} />
          </button>
        )}
      </div>
    </Card>
  );
}
