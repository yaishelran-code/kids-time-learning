/** Clockwise angle from twelve, rounded to the nearest full-hour position. */
export function fullHourFromPoint(x: number, y: number): number | null {
  // Ignore the small center area, where the angle would be unstable.
  if (Math.hypot(x, y) < 15) return null;
  const angle = Math.atan2(x, -y);
  const position = (Math.round(angle / (Math.PI / 6)) + 12) % 12;
  return position === 0 ? 12 : position;
}
