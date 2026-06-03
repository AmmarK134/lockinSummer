'use client';

import { useState } from 'react';
import { Search, ChevronRight, X } from 'lucide-react';
import Card from '@/components/ui/Card';
import Modal from '@/components/ui/Modal';
import { EXERCISES, EXERCISE_CATEGORIES, searchExercises } from '@/data/exercises';
import type { ExerciseData, MuscleGroup } from '@/types';

const MUSCLE_COLORS: Record<string, string> = {
  chest: '#06b6d4',
  upper_chest: '#06b6d4',
  lower_chest: '#0891b2',
  back: '#a855f7',
  lats: '#a855f7',
  traps: '#9333ea',
  rhomboids: '#7e22ce',
  lower_back: '#7c3aed',
  shoulders: '#f59e0b',
  front_delt: '#f59e0b',
  side_delt: '#d97706',
  rear_delt: '#b45309',
  biceps: '#10b981',
  triceps: '#059669',
  forearms: '#047857',
  quads: '#ef4444',
  hamstrings: '#dc2626',
  glutes: '#b91c1c',
  calves: '#991b1b',
  core: '#ec4899',
  abs: '#ec4899',
  obliques: '#db2777',
  hip_flexors: '#be185d',
  full_body: '#06b6d4',
};

const MUSCLE_LABELS: Partial<Record<MuscleGroup, string>> = {
  chest: 'Chest',
  upper_chest: 'Upper Chest',
  back: 'Back',
  lats: 'Lats',
  traps: 'Traps',
  shoulders: 'Shoulders',
  front_delt: 'Front Delt',
  side_delt: 'Side Delt',
  rear_delt: 'Rear Delt',
  biceps: 'Biceps',
  triceps: 'Triceps',
  quads: 'Quads',
  hamstrings: 'Hamstrings',
  glutes: 'Glutes',
  calves: 'Calves',
  core: 'Core',
  abs: 'Abs',
  lower_back: 'Lower Back',
};

const DIFFICULTY_COLORS = {
  beginner:     { bg: 'rgba(16,185,129,0.15)',  text: '#10b981' },
  intermediate: { bg: 'rgba(245,158,11,0.15)',  text: '#f59e0b' },
  advanced:     { bg: 'rgba(239,68,68,0.15)',   text: '#ef4444' },
};

export default function ExercisesPage() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<string | null>(null);
  const [selected, setSelected] = useState<ExerciseData | null>(null);

  const filtered = searchExercises(query).filter(
    (e) => !category || e.category === category
  );

  return (
    <div className="flex flex-col h-full">
      {/* Header + Search */}
      <div className="px-4 pt-6 pb-3 space-y-3 flex-shrink-0">
        <h1 className="text-2xl font-bold text-white">Exercise Guide</h1>

        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
          <input
            type="text"
            placeholder="Search exercises, muscles, equipment..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{ paddingLeft: '36px' }}
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Category pills */}
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1" style={{ scrollbarWidth: 'none' }}>
          <CategoryPill label="All" active={!category} onClick={() => setCategory(null)} />
          {EXERCISE_CATEGORIES.map((cat) => (
            <CategoryPill key={cat} label={cat} active={category === cat} onClick={() => setCategory(cat === category ? null : cat)} />
          ))}
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2">
        {filtered.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-slate-400 text-sm">No exercises found for &quot;{query}&quot;</p>
          </div>
        ) : (
          filtered.map((exercise) => (
            <ExerciseRow key={exercise.id} exercise={exercise} onTap={() => setSelected(exercise)} />
          ))
        )}
      </div>

      {/* Detail modal */}
      <Modal
        open={!!selected}
        onClose={() => setSelected(null)}
        title={selected?.name ?? ''}
        fullScreen
      >
        {selected && <ExerciseDetail exercise={selected} />}
      </Modal>
    </div>
  );
}

// ─── Category pill ─────────────────────────────────────────────────────────────

function CategoryPill({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap"
      style={{
        background: active ? '#06b6d4' : '#0d1422',
        color: active ? '#fff' : '#64748b',
        border: `1px solid ${active ? '#06b6d4' : 'rgba(255,255,255,0.06)'}`,
      }}
    >
      {label}
    </button>
  );
}

// ─── Exercise row ──────────────────────────────────────────────────────────────

function ExerciseRow({ exercise, onTap }: { exercise: ExerciseData; onTap: () => void }) {
  const diff = DIFFICULTY_COLORS[exercise.difficulty];

  return (
    <button
      onClick={onTap}
      className="w-full text-left transition-all active:scale-98"
    >
      <Card className="flex items-center gap-3">
        {/* Muscle indicator */}
        <div className="flex flex-col gap-1 flex-shrink-0">
          {exercise.primaryMuscles.slice(0, 2).map((m) => (
            <div
              key={m}
              className="w-2.5 h-2.5 rounded-full"
              style={{ background: MUSCLE_COLORS[m] ?? '#475569' }}
            />
          ))}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <p className="text-sm font-semibold text-white truncate">{exercise.name}</p>
            <span
              className="text-[10px] font-medium px-1.5 py-0.5 rounded-full flex-shrink-0"
              style={{ background: diff.bg, color: diff.text }}
            >
              {exercise.difficulty}
            </span>
          </div>
          <p className="text-xs text-slate-500">{exercise.category} · {exercise.equipment}</p>
          <div className="flex items-center gap-1.5 mt-1 flex-wrap">
            {exercise.primaryMuscles.slice(0, 3).map((m) => (
              <span
                key={m}
                className="text-[10px] px-1.5 py-0.5 rounded-md"
                style={{ background: `${MUSCLE_COLORS[m] ?? '#475569'}20`, color: MUSCLE_COLORS[m] ?? '#475569' }}
              >
                {MUSCLE_LABELS[m as MuscleGroup] ?? m}
              </span>
            ))}
          </div>
        </div>

        <ChevronRight size={16} className="text-slate-600 flex-shrink-0" />
      </Card>
    </button>
  );
}

// ─── Exercise Detail ───────────────────────────────────────────────────────────

function ExerciseDetail({ exercise }: { exercise: ExerciseData }) {
  const diff = DIFFICULTY_COLORS[exercise.difficulty];

  return (
    <div className="space-y-5">
      {/* Badges */}
      <div className="flex flex-wrap gap-2">
        <span className="text-xs px-2.5 py-1 rounded-full bg-slate-800 text-slate-300">{exercise.category}</span>
        <span className="text-xs px-2.5 py-1 rounded-full bg-slate-800 text-slate-300">{exercise.equipment}</span>
        <span className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ background: diff.bg, color: diff.text }}>
          {exercise.difficulty}
        </span>
        <span className="text-xs px-2.5 py-1 rounded-full bg-slate-800 text-slate-300">
          {exercise.recommendedSets} sets · {exercise.recommendedReps} reps
        </span>
      </div>

      {/* Description */}
      <p className="text-sm text-slate-300 leading-relaxed">{exercise.description}</p>

      {/* Muscle SVG diagram */}
      <Card>
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Muscles Worked</h3>
        <MuscleBodyDiagram primaryMuscles={exercise.primaryMuscles} secondaryMuscles={exercise.secondaryMuscles} />
        <div className="flex gap-3 mt-3">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-cyan-400" />
            <span className="text-xs text-slate-400">Primary</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-slate-600" style={{ background: 'rgba(6,182,212,0.3)' }} />
            <span className="text-xs text-slate-400">Secondary</span>
          </div>
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {exercise.primaryMuscles.map((m) => (
            <span key={m} className="text-xs px-2 py-1 rounded-lg font-medium" style={{ background: `${MUSCLE_COLORS[m] ?? '#06b6d4'}20`, color: MUSCLE_COLORS[m] ?? '#06b6d4' }}>
              {MUSCLE_LABELS[m as MuscleGroup] ?? m}
            </span>
          ))}
          {exercise.secondaryMuscles.map((m) => (
            <span key={m} className="text-xs px-2 py-1 rounded-lg text-slate-400" style={{ background: '#1e293b' }}>
              {MUSCLE_LABELS[m as MuscleGroup] ?? m}
            </span>
          ))}
        </div>
      </Card>

      {/* Machine setup */}
      {exercise.machineSetup && exercise.machineSetup.length > 0 && (
        <Card style={{ background: 'rgba(168,85,247,0.05)', borderColor: 'rgba(168,85,247,0.15)' }}>
          <h3 className="text-sm font-bold text-purple-400 mb-2">⚙️ Machine Setup</h3>
          <ol className="space-y-2">
            {exercise.machineSetup.map((step, i) => (
              <li key={i} className="flex gap-2 text-sm text-slate-300">
                <span className="text-purple-400 font-bold flex-shrink-0">{i + 1}.</span>
                <span className="leading-relaxed">{step}</span>
              </li>
            ))}
          </ol>
        </Card>
      )}

      {/* Instructions */}
      <Card>
        <h3 className="text-sm font-bold text-white mb-3">📋 How to Perform</h3>
        <ol className="space-y-3">
          {exercise.instructions.map((step, i) => (
            <li key={i} className="flex gap-3">
              <span
                className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5"
                style={{ background: 'rgba(6,182,212,0.15)', color: '#06b6d4' }}
              >
                {i + 1}
              </span>
              <span className="text-sm text-slate-300 leading-relaxed">{step}</span>
            </li>
          ))}
        </ol>
      </Card>

      {/* Common mistakes */}
      <Card style={{ background: 'rgba(239,68,68,0.04)', borderColor: 'rgba(239,68,68,0.12)' }}>
        <h3 className="text-sm font-bold text-red-400 mb-2">❌ Common Mistakes</h3>
        <ul className="space-y-2">
          {exercise.commonMistakes.map((m, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
              <span className="text-red-400 flex-shrink-0 mt-0.5">•</span>
              {m}
            </li>
          ))}
        </ul>
      </Card>

      {/* Safety tips */}
      <Card style={{ background: 'rgba(245,158,11,0.04)', borderColor: 'rgba(245,158,11,0.12)' }}>
        <h3 className="text-sm font-bold text-amber-400 mb-2">⚠️ Safety Tips</h3>
        <ul className="space-y-2">
          {exercise.safetyTips.map((t, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
              <span className="text-amber-400 flex-shrink-0 mt-0.5">•</span>
              {t}
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

// ─── SVG Body Diagram ──────────────────────────────────────────────────────────

function MuscleBodyDiagram({ primaryMuscles, secondaryMuscles }: { primaryMuscles: MuscleGroup[]; secondaryMuscles: MuscleGroup[] }) {
  const isHit = (group: string) => {
    const normalizedGroup = group as MuscleGroup;
    return primaryMuscles.includes(normalizedGroup) || secondaryMuscles.includes(normalizedGroup);
  };
  const isPrimary = (group: string) => primaryMuscles.includes(group as MuscleGroup);

  const hitColor = (group: string) => {
    if (isPrimary(group)) return '#06b6d4';
    if (isHit(group)) return 'rgba(6,182,212,0.35)';
    return '#1e293b';
  };

  // Helper: check if any of multiple muscle names match
  const anyHit = (...groups: string[]) => groups.some((g) => isHit(g));
  const anyPrimary = (...groups: string[]) => groups.some((g) => isPrimary(g));
  const multiColor = (...groups: string[]) => {
    if (anyPrimary(...groups)) return '#06b6d4';
    if (anyHit(...groups)) return 'rgba(6,182,212,0.35)';
    return '#1e293b';
  };

  return (
    <div className="flex gap-4 justify-center">
      {/* Front */}
      <div className="text-center">
        <p className="text-[10px] text-slate-500 mb-1">Front</p>
        <svg viewBox="0 0 100 200" width="90" height="180" style={{ overflow: 'visible' }}>
          {/* Head */}
          <ellipse cx="50" cy="14" rx="12" ry="13" fill="#1e293b" stroke="#334155" strokeWidth="1" />
          {/* Neck */}
          <rect x="44" y="26" width="12" height="8" rx="3" fill="#1e293b" />
          {/* Chest */}
          <path d="M30 34 Q50 30 70 34 L68 65 Q50 68 32 65 Z" fill={multiColor('chest', 'upper_chest', 'lower_chest')} stroke="#334155" strokeWidth="0.5" />
          {/* Shoulders */}
          <ellipse cx="24" cy="42" rx="10" ry="12" fill={multiColor('shoulders', 'front_delt', 'side_delt')} stroke="#334155" strokeWidth="0.5" />
          <ellipse cx="76" cy="42" rx="10" ry="12" fill={multiColor('shoulders', 'front_delt', 'side_delt')} stroke="#334155" strokeWidth="0.5" />
          {/* Biceps */}
          <rect x="13" y="54" width="10" height="22" rx="5" fill={hitColor('biceps')} stroke="#334155" strokeWidth="0.5" />
          <rect x="77" y="54" width="10" height="22" rx="5" fill={hitColor('biceps')} stroke="#334155" strokeWidth="0.5" />
          {/* Forearms */}
          <rect x="12" y="77" width="10" height="20" rx="4" fill={hitColor('forearms')} stroke="#334155" strokeWidth="0.5" />
          <rect x="78" y="77" width="10" height="20" rx="4" fill={hitColor('forearms')} stroke="#334155" strokeWidth="0.5" />
          {/* Abs / core */}
          <path d="M34 65 Q50 67 66 65 L65 95 Q50 97 35 95 Z" fill={multiColor('abs', 'core')} stroke="#334155" strokeWidth="0.5" />
          {/* Obliques */}
          <path d="M34 65 L32 95 Q28 90 28 80 L30 65 Z" fill={hitColor('obliques')} stroke="#334155" strokeWidth="0.5" />
          <path d="M66 65 L68 95 Q72 90 72 80 L70 65 Z" fill={hitColor('obliques')} stroke="#334155" strokeWidth="0.5" />
          {/* Hip flexors */}
          <rect x="35" y="95" width="12" height="10" rx="3" fill={hitColor('hip_flexors')} stroke="#334155" strokeWidth="0.5" />
          <rect x="53" y="95" width="12" height="10" rx="3" fill={hitColor('hip_flexors')} stroke="#334155" strokeWidth="0.5" />
          {/* Quads */}
          <rect x="33" y="105" width="14" height="42" rx="6" fill={hitColor('quads')} stroke="#334155" strokeWidth="0.5" />
          <rect x="53" y="105" width="14" height="42" rx="6" fill={hitColor('quads')} stroke="#334155" strokeWidth="0.5" />
          {/* Calves */}
          <rect x="34" y="150" width="12" height="32" rx="5" fill={hitColor('calves')} stroke="#334155" strokeWidth="0.5" />
          <rect x="54" y="150" width="12" height="32" rx="5" fill={hitColor('calves')} stroke="#334155" strokeWidth="0.5" />
        </svg>
      </div>

      {/* Back */}
      <div className="text-center">
        <p className="text-[10px] text-slate-500 mb-1">Back</p>
        <svg viewBox="0 0 100 200" width="90" height="180" style={{ overflow: 'visible' }}>
          {/* Head */}
          <ellipse cx="50" cy="14" rx="12" ry="13" fill="#1e293b" stroke="#334155" strokeWidth="1" />
          {/* Neck */}
          <rect x="44" y="26" width="12" height="8" rx="3" fill="#1e293b" />
          {/* Traps */}
          <path d="M35 34 Q50 28 65 34 L62 50 Q50 48 38 50 Z" fill={hitColor('traps')} stroke="#334155" strokeWidth="0.5" />
          {/* Shoulders back */}
          <ellipse cx="24" cy="42" rx="10" ry="12" fill={multiColor('shoulders', 'rear_delt')} stroke="#334155" strokeWidth="0.5" />
          <ellipse cx="76" cy="42" rx="10" ry="12" fill={multiColor('shoulders', 'rear_delt')} stroke="#334155" strokeWidth="0.5" />
          {/* Lats */}
          <path d="M30 50 Q24 55 22 72 L36 78 Q36 62 38 50 Z" fill={multiColor('lats', 'back')} stroke="#334155" strokeWidth="0.5" />
          <path d="M70 50 Q76 55 78 72 L64 78 Q64 62 62 50 Z" fill={multiColor('lats', 'back')} stroke="#334155" strokeWidth="0.5" />
          {/* Rhomboids */}
          <path d="M38 50 Q50 52 62 50 L62 70 Q50 72 38 70 Z" fill={hitColor('rhomboids')} stroke="#334155" strokeWidth="0.5" />
          {/* Triceps */}
          <rect x="13" y="54" width="10" height="22" rx="5" fill={hitColor('triceps')} stroke="#334155" strokeWidth="0.5" />
          <rect x="77" y="54" width="10" height="22" rx="5" fill={hitColor('triceps')} stroke="#334155" strokeWidth="0.5" />
          {/* Forearms */}
          <rect x="12" y="77" width="10" height="20" rx="4" fill={hitColor('forearms')} stroke="#334155" strokeWidth="0.5" />
          <rect x="78" y="77" width="10" height="20" rx="4" fill={hitColor('forearms')} stroke="#334155" strokeWidth="0.5" />
          {/* Lower back */}
          <path d="M36 78 L36 97 Q50 99 64 97 L64 78 Q50 80 36 78 Z" fill={hitColor('lower_back')} stroke="#334155" strokeWidth="0.5" />
          {/* Glutes */}
          <ellipse cx="42" cy="107" rx="12" ry="13" fill={hitColor('glutes')} stroke="#334155" strokeWidth="0.5" />
          <ellipse cx="58" cy="107" rx="12" ry="13" fill={hitColor('glutes')} stroke="#334155" strokeWidth="0.5" />
          {/* Hamstrings */}
          <rect x="33" y="118" width="14" height="33" rx="6" fill={hitColor('hamstrings')} stroke="#334155" strokeWidth="0.5" />
          <rect x="53" y="118" width="14" height="33" rx="6" fill={hitColor('hamstrings')} stroke="#334155" strokeWidth="0.5" />
          {/* Calves */}
          <rect x="34" y="154" width="12" height="28" rx="5" fill={hitColor('calves')} stroke="#334155" strokeWidth="0.5" />
          <rect x="54" y="154" width="12" height="28" rx="5" fill={hitColor('calves')} stroke="#334155" strokeWidth="0.5" />
        </svg>
      </div>
    </div>
  );
}
