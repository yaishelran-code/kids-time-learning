import { dayPeriodAt, dayPeriods } from '../learning/dayPeriods';
export const activityStorageKey = 'kids-time-learning.my-day.v1';
export type Activity = { id: string; name: string; minutes: number };
export type PeriodId = typeof dayPeriods[number]['id'];

/** Resolve a 12-hour time and period without silently changing the child's choice. */
export function resolveActivityTime(hour: number, minute: number, period: PeriodId): number | null {
  if (!Number.isInteger(hour) || hour < 1 || hour > 12 || !Number.isInteger(minute) || minute < 0 || minute > 59) return null;
  const first = hour % 12 * 60 + minute;
  return [first, first + 720].find(value => dayPeriodAt(value).id === period) ?? null;
}
export function sortedActivities(activities: Activity[]): Activity[] {
  return [...activities].sort((a, b) => a.minutes - b.minutes);
}
export function loadActivities(): { activities: Activity[]; error: boolean } {
  try {
    const raw = localStorage.getItem(activityStorageKey);
    if (raw === null) return { activities: [], error: false };
    const data: unknown = JSON.parse(raw);
    if (!Array.isArray(data)) throw new Error('Invalid activities');
    const ids = new Set<string>();
    for (const item of data) {
      if (!item || typeof item !== 'object' || typeof item.id !== 'string' || !item.id || ids.has(item.id)
        || typeof item.name !== 'string' || !item.name.trim() || !Number.isInteger(item.minutes) || item.minutes < 0 || item.minutes >= 1440) throw new Error('Invalid activity');
      ids.add(item.id);
    }
    return { activities: data as Activity[], error: false };
  } catch { return { activities: [], error: true }; }
}
export function saveActivities(activities: Activity[]): boolean {
  try { localStorage.setItem(activityStorageKey, JSON.stringify(activities)); return true; }
  catch { return false; }
}
