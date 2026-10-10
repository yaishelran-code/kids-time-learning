export const practiceSizes = {
  'full-setting': 6, 'full-reading': 6,
  'half-setting': 6, 'half-reading': 6, 'half-mixed': 6,
  'quarter-setting': 8, 'quarter-reading': 8, 'quarter-mixed': 12,
  'five-setting': 12, 'five-reading': 12, 'five-mixed': 20,
  'exact-setting': 12, 'exact-reading': 12, 'exact-mixed': 20,
  'relative-elapsed': 12, 'relative-remaining': 12, 'relative-mixed': 20,
  'day-identify': 10, 'day-compare': 8, 'day-mixed': 16,
} as const;
export type PracticeId = keyof typeof practiceSizes;
export const characters = [
  { id: 'spark', name: 'ניצוץ', stars: 10, description: 'נינג׳ה סקרן עם צעיף כתום וכוכב של אור', image: new URL('../assets/characters/spark.svg', import.meta.url).href },
  { id: 'dew', name: 'טל', stars: 20, description: 'נינג׳ה של טבע עם כובע עלה וחבר קטן בגינה', image: new URL('../assets/characters/dew.svg', import.meta.url).href },
  { id: 'glow', name: 'זוהר', stars: 30, description: 'נינג׳ה של אור עם גלימה ופנס בצורת ירח', image: new URL('../assets/characters/glow.svg', import.meta.url).href },
] as const;
export type Run = { id: string; awarded: number[] };
export type Ledger = { version: 1; points: number; stars: number; unlocked: string[]; runs: Partial<Record<PracticeId, Run>> };
export const rewardStorageKey = 'kids-time-learning.rewards.v1';
export const emptyLedger = (): Ledger => ({ version: 1, points: 0, stars: 0, unlocked: [], runs: {} });
export function validLedger(value: unknown): value is Ledger {
  if (!value || typeof value !== 'object') return false;
  const v = value as Ledger;
  if (v.version !== 1 || !Number.isSafeInteger(v.stars) || v.stars < 0 || !Number.isSafeInteger(v.points) || v.points !== v.stars * 10 || !Array.isArray(v.unlocked) || !v.runs || typeof v.runs !== 'object' || Array.isArray(v.runs)) return false;
  const expected = characters.filter(c => v.stars >= c.stars).map(c => c.id);
  if (v.unlocked.length !== expected.length || !expected.every((id, i) => v.unlocked[i] === id)) return false;
  let activeAwards = 0;
  const ids = new Set<string>();
  for (const [key, run] of Object.entries(v.runs)) {
    if (!Object.hasOwn(practiceSizes, key) || !run || typeof run.id !== 'string' || !run.id.trim() || ids.has(run.id) || !Array.isArray(run.awarded) || new Set(run.awarded).size !== run.awarded.length || !run.awarded.every(i => Number.isInteger(i) && i >= 0 && i < practiceSizes[key as PracticeId])) return false;
    ids.add(run.id); activeAwards += run.awarded.length;
  }
  return activeAwards <= v.stars;
}
export function readLedger(): { ledger: Ledger; blocked: boolean } {
  try {
    const raw = localStorage.getItem(rewardStorageKey);
    if (raw === null) return { ledger: emptyLedger(), blocked: false };
    const value: unknown = JSON.parse(raw);
    if (!validLedger(value)) throw new Error('Invalid rewards');
    return { ledger: value, blocked: false };
  } catch { return { ledger: emptyLedger(), blocked: true }; }
}
export function writeLedger(ledger: Ledger): boolean {
  try { localStorage.setItem(rewardStorageKey, JSON.stringify(ledger)); return true; }
  catch { return false; }
}
export function grant(ledger: Ledger, practice: PracticeId, question: number): { ledger: Ledger; awarded: boolean; opened: string[]; limit?: boolean } {
  if (!Number.isInteger(question) || question < 0 || question >= practiceSizes[practice]) throw new Error('Invalid reward question');
  const run = ledger.runs[practice];
  if (run?.awarded.includes(question)) return { ledger, awarded: false, opened: [] };
  if (!Number.isSafeInteger(ledger.points + 10) || !Number.isSafeInteger(ledger.stars + 1)) return { ledger, awarded: false, opened: [], limit: true };
  const stars = ledger.stars + 1;
  const unlocked = characters.filter(c => stars >= c.stars).map(c => c.id);
  const next: Ledger = { ...ledger, stars, points: ledger.points + 10, unlocked,
    runs: { ...ledger.runs, [practice]: { id: run?.id ?? crypto.randomUUID(), awarded: [...(run?.awarded ?? []), question] } } };
  return { ledger: next, awarded: true, opened: unlocked.filter(id => !ledger.unlocked.includes(id)) };
}
export function restartRun(ledger: Ledger, practice: PracticeId): Ledger {
  return { ...ledger, runs: { ...ledger.runs, [practice]: { id: crypto.randomUUID(), awarded: [] } } };
}
