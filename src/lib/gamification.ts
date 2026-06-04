export interface Rank {
  name: string;
  min: number;
  tag: string;
  accent: string;
}

export const RANKS: Rank[] = [
  { name: 'Protein Peasant',    min: 0,     tag: 'Everyone starts somewhere. Usually sore.',          accent: '#9aa3ad' },
  { name: 'Bench Baby',         min: 400,   tag: 'You found the bench. It found you back.',            accent: '#b6bdc6' },
  { name: 'Cardio Goblin',      min: 1000,  tag: 'Lurks near the treadmills. Feral.',                  accent: '#7fd0ff' },
  { name: 'Treadmill Menace',   min: 1900,  tag: 'A danger to incline settings everywhere.',           accent: '#56c2ff' },
  { name: 'Creatine Gremlin',   min: 3100,  tag: 'Slightly bloated. Fully committed.',                 accent: '#54e08a' },
  { name: 'Pump Apprentice',    min: 4700,  tag: 'The veins are starting to learn.',                   accent: '#7be0a0' },
  { name: 'Rep Goblin',         min: 6800,  tag: 'Hoards reps like shiny treasure.',                   accent: '#ffd24a' },
  { name: 'Bulk Bandit',        min: 9500,  tag: 'Steals gains in broad daylight.',                    accent: '#ffb24a' },
  { name: 'Cutting Creature',   min: 13000, tag: 'Shredding. Cranky. Iconic.',                         accent: '#ff9a4a' },
  { name: 'Sweat Baron',        min: 17500, tag: 'Rules the rack. Owns a towel empire.',               accent: '#ff7a55' },
  { name: 'Iron Wizard',        min: 23000, tag: 'Casts barbell spells. Eats oats.',                   accent: '#ff5c38' },
  { name: 'Swole Sage',         min: 30000, tag: 'Has achieved inner and outer mass.',                 accent: '#ff5c38' },
  { name: 'Pump Lord',          min: 39000, tag: 'The pump is eternal now.',                           accent: '#ff4d2e' },
  { name: 'Grandmaster Baiter', min: 50000, tag: 'Peak form. Maximum mischief. Legendary.',            accent: '#ffd24a' },
];

export interface RankInfo {
  idx: number;
  rank: Rank;
  next: Rank | null;
  pct: number;
  into: number;
  span: number;
  toNext: number;
}

export function rankForXp(xp: number): RankInfo {
  let idx = 0;
  for (let i = 0; i < RANKS.length; i++) {
    if (xp >= RANKS[i].min) idx = i;
  }
  const cur = RANKS[idx];
  const next = RANKS[idx + 1] || null;
  const span = next ? next.min - cur.min : 1;
  const into = xp - cur.min;
  const pct = next ? Math.min(1, into / span) : 1;
  return { idx, rank: cur, next, pct, into, span, toNext: next ? next.min - xp : 0 };
}
