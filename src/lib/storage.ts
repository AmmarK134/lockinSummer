// Thin localStorage helpers — all reads/writes go through here

export const LS_PLAN = 'lockin_plan_v1';
export const LS_REMINDERS = 'lockin_reminders_v1';
export const LS_TWEAKS = 'lockin_tweaks_v1';

export function lsGet<T>(key: string): T | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export function lsSet<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* ignore */ }
}

export function lsRemove(key: string): void {
  if (typeof window === 'undefined') return;
  try { localStorage.removeItem(key); } catch { /* ignore */ }
}
