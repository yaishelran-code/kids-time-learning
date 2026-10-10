import { timeFromMinutes, type ClockTime } from './clockTime';

export type RelativeTimeExample = {
  kind: 'elapsed' | 'remaining';
  stage: string;
  start: ClockTime;
  end: ClockTime;
  startPeriod: string;
  endPeriod: string;
  story: string;
};
const whole = 'שעות שלמות';
const same = 'דקות באותה שעה';
const crossing = 'דקות שחוצות שעה';
const combined = 'שעות ודקות יחד';
export const relativeTimeExamples: RelativeTimeExample[] = [
  { kind: 'elapsed', stage: whole, start: { hour: 3, minute: 0 }, end: { hour: 5, minute: 0 }, startPeriod: 'אחר הצהריים', endPeriod: 'אחר הצהריים', story: 'התחלנו לשחק בשלוש אחר הצהריים. עכשיו חמש אחר הצהריים. כמה זמן עבר?' },
  { kind: 'elapsed', stage: whole, start: { hour: 9, minute: 0 }, end: { hour: 12, minute: 0 }, startPeriod: 'בבוקר', endPeriod: 'בצהריים', story: 'התחלנו טיול בתשע בבוקר. עכשיו שתים עשרה בצהריים. כמה זמן עבר?' },
  { kind: 'remaining', stage: whole, start: { hour: 4, minute: 0 }, end: { hour: 6, minute: 0 }, startPeriod: 'אחר הצהריים', endPeriod: 'בערב', story: 'עכשיו ארבע אחר הצהריים. נפגשים עם המשפחה בשש בערב. כמה זמן נשאר?' },
  { kind: 'remaining', stage: whole, start: { hour: 10, minute: 0 }, end: { hour: 1, minute: 0 }, startPeriod: 'בבוקר', endPeriod: 'בצהריים', story: 'עכשיו עשר בבוקר. ארוחת הצהריים מתחילה באחת בצהריים. כמה זמן נשאר?' },
  { kind: 'elapsed', stage: same, start: { hour: 3, minute: 10 }, end: { hour: 3, minute: 30 }, startPeriod: 'אחר הצהריים', endPeriod: 'אחר הצהריים', story: 'התחלנו לצייר בשלוש ועשר דקות אחר הצהריים. עכשיו שלוש וחצי אחר הצהריים. כמה זמן עבר?' },
  { kind: 'remaining', stage: same, start: { hour: 4, minute: 15 }, end: { hour: 4, minute: 45 }, startPeriod: 'אחר הצהריים', endPeriod: 'אחר הצהריים', story: 'עכשיו ארבע ורבע אחר הצהריים. החוג מתחיל בארבע ארבעים וחמש אחר הצהריים. כמה זמן נשאר?' },
  { kind: 'elapsed', stage: crossing, start: { hour: 3, minute: 40 }, end: { hour: 4, minute: 10 }, startPeriod: 'אחר הצהריים', endPeriod: 'אחר הצהריים', story: 'התחלנו לבנות בקוביות בשלוש ארבעים אחר הצהריים. עכשיו ארבע ועשר דקות אחר הצהריים. כמה זמן עבר?' },
  { kind: 'elapsed', stage: crossing, start: { hour: 11, minute: 45 }, end: { hour: 12, minute: 15 }, startPeriod: 'בבוקר', endPeriod: 'בצהריים', story: 'התחלנו לקרוא באחת עשרה ארבעים וחמש בבוקר. עכשיו שתים עשרה ורבע בצהריים. כמה זמן עבר?' },
  { kind: 'remaining', stage: crossing, start: { hour: 4, minute: 40 }, end: { hour: 5, minute: 0 }, startPeriod: 'אחר הצהריים', endPeriod: 'אחר הצהריים', story: 'עכשיו ארבע ארבעים אחר הצהריים. חוג הכדורגל מתחיל בחמש אחר הצהריים. כמה זמן נשאר?' },
  { kind: 'remaining', stage: crossing, start: { hour: 11, minute: 50 }, end: { hour: 12, minute: 10 }, startPeriod: 'בבוקר', endPeriod: 'בצהריים', story: 'עכשיו אחת עשרה חמישים בבוקר. ארוחת הצהריים מתחילה בשתים עשרה ועשר דקות בצהריים. כמה זמן נשאר?' },
  { kind: 'elapsed', stage: combined, start: { hour: 3, minute: 15 }, end: { hour: 4, minute: 45 }, startPeriod: 'אחר הצהריים', endPeriod: 'אחר הצהריים', story: 'התחלנו לשחק עם חברים בשלוש ורבע אחר הצהריים. עכשיו ארבע ארבעים וחמש אחר הצהריים. כמה זמן עבר?' },
  { kind: 'remaining', stage: combined, start: { hour: 4, minute: 20 }, end: { hour: 6, minute: 0 }, startPeriod: 'אחר הצהריים', endPeriod: 'בערב', story: 'עכשיו ארבע ועשרים דקות אחר הצהריים. ארוחת הערב מתחילה בשש בערב. כמה זמן נשאר?' },
];

/** Forward event order on a 12-hour clock; examples never span a night or day. */
export function durationMinutes(start: ClockTime, end: ClockTime): number {
  const startMinutes = (start.hour - 1) * 60 + start.minute;
  const endMinutes = (end.hour - 1) * 60 + end.minute;
  return (endMinutes - startMinutes + 720) % 720;
}
export function durationLabel(total: number): string {
  const hours = Math.floor(total / 60);
  const minutes = total % 60;
  const hourLabel = hours === 1 ? 'שעה' : hours === 2 ? 'שעתיים' : `${hours} שעות`;
  return hours ? `${hourLabel}${minutes ? ` ו־${minutes} דקות` : ''}` : `${minutes} דקות`;
}
export function calculationSteps(example: RelativeTimeExample) {
  const total = durationMinutes(example.start, example.end);
  const sizes = [...Array.from({ length: Math.floor(total / 60) }, () => 60), ...Array.from({ length: total % 60 / 5 }, () => 5)];
  let current = example.start;
  return sizes.map(minutes => {
    const from = current;
    current = timeFromMinutes(current.hour % 12 * 60 + current.minute + minutes, 5);
    return { from, to: current, minutes };
  });
}
