export type ClockTime = { hour: number; minute: 0 | 5 | 10 | 15 | 20 | 25 | 30 | 35 | 40 | 45 | 50 | 55 };
export function timeFromMinutes(total: number, step: 5 | 15 | 30 = 30): ClockTime {
  const normalized = ((Math.round(total / step) * step) % 720 + 720) % 720;
  return { hour: Math.floor(normalized / 60) || 12, minute: normalized % 60 as ClockTime['minute'] };
}
export function minutesFromTime(time: ClockTime): number { return time.hour % 12 * 60 + time.minute; }
export function formatTime(time: ClockTime): string { return `${time.hour}:${String(time.minute).padStart(2, '0')}`; }
/** Ignore the center, where the angle is unstable. */
export function minuteAngleFromPoint(x: number, y: number): number | null {
  return Math.hypot(x, y) < 15 ? null : Math.atan2(x, -y) * 180 / Math.PI;
}
export function angleDelta(previous: number, next: number): number {
  return ((next - previous + 540) % 360) - 180;
}
