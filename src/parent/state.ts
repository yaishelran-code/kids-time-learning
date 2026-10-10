export const topicNames = {
  full: 'שעות שלמות', half: 'חצאי שעות', quarter: 'רבעי שעות',
  five: 'חמש דקות', exact: 'דקות מדויקות', relative: 'זמן יחסי', day: 'חלקי היום',
} as const;
export type Topic = keyof typeof topicNames;
export type ParentState = { version: 1; mistakes: Record<Topic, number> };
export const parentStorageKey = 'kids-time-learning.parent-help.v1';
export const emptyParentState = (): ParentState => ({ version: 1, mistakes: { full: 0, half: 0, quarter: 0, five: 0, exact: 0, relative: 0, day: 0 } });
export function clockTopic(minute: number): Topic {
  return minute === 0 ? 'full' : minute === 30 ? 'half' : minute === 15 || minute === 45 ? 'quarter' : minute % 5 === 0 ? 'five' : 'exact';
}
export function validParentState(value: unknown): value is ParentState {
  if (!value || typeof value !== 'object') return false;
  const v = value as ParentState;
  return v.version === 1 && !!v.mistakes && typeof v.mistakes === 'object' && !Array.isArray(v.mistakes)
    && Object.keys(v.mistakes).length === Object.keys(topicNames).length
    && Object.keys(topicNames).every(key => Number.isInteger(v.mistakes[key as Topic]) && v.mistakes[key as Topic] >= 0 && v.mistakes[key as Topic] <= 3);
}
export function readParentState(): { state: ParentState; blocked: boolean } {
  try {
    const raw = localStorage.getItem(parentStorageKey);
    if (raw === null) return { state: emptyParentState(), blocked: false };
    const value: unknown = JSON.parse(raw);
    if (!validParentState(value)) throw new Error('Invalid parent help');
    return { state: value, blocked: false };
  } catch { return { state: emptyParentState(), blocked: true }; }
}
export function writeParentState(state: ParentState): boolean {
  try { localStorage.setItem(parentStorageKey, JSON.stringify(state)); return true; }
  catch { return false; }
}
export function recordAttempt(state: ParentState, topic: Topic, correct: boolean): ParentState {
  if (state.mistakes[topic] >= 3) return state;
  return { ...state, mistakes: { ...state.mistakes, [topic]: correct ? 0 : state.mistakes[topic] + 1 } };
}
export const validPin = (pin: string) => pin === '1212';
