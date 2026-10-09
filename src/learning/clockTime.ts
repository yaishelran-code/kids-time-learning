export type ClockTime = { hour: number; minute: 0 | 30 };
export function timeFromMinutes(total: number): ClockTime {
  const normalized = ((Math.round(total / 30) * 30) % 720 + 720) % 720;
  return { hour: Math.floor(normalized / 60) || 12, minute: normalized % 60 as 0 | 30 };
}
export function minutesFromTime(time: ClockTime): number { return time.hour % 12 * 60 + time.minute; }
export function formatTime(time: ClockTime): string { return `${time.hour}:${time.minute === 0 ? '00' : '30'}`; }
/** Ignore the center, where the angle is unstable. */
export function minuteAngleFromPoint(x: number, y: number): number | null {
  return Math.hypot(x, y) < 15 ? null : Math.atan2(x, -y) * 180 / Math.PI;
}
export function angleDelta(previous: number, next: number): number {
  return ((next - previous + 540) % 360) - 180;
}
