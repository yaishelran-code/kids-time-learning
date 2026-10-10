import type { ClockTime } from '../learning/clockTime';
export const skills = ['hourHand', 'minuteHand', 'fullHours', 'halfHours', 'quarterHours', 'digital'] as const;
export type Skill = typeof skills[number];
export type StartingPoint = 'structure' | 'fullHours' | 'halfHours' | 'quarterHours' | 'fiveMinutes';
export const lessonNames: Record<StartingPoint, string> = { structure: 'מבנה השעון', fullHours: 'שעות שלמות', halfHours: 'חצי שעה', quarterHours: 'רבע שעה', fiveMinutes: 'דקות בקפיצות של חמש' };
export type Question = { skill: Skill; prompt: string; time: ClockTime; kind: 'hand' | 'analog' | 'digital'; choices: string[]; answer: string };
export const questions: Question[] = [
  {skill:'hourHand',kind:'hand',prompt:'איזה מחוג מראה את השעות?',time:{hour:3,minute:0},choices:['המחוג הסגול','המחוג הירוק'],answer:'המחוג הסגול'},
  {skill:'minuteHand',kind:'hand',prompt:'איזה מחוג מראה את הדקות?',time:{hour:8,minute:30},choices:['המחוג הסגול','המחוג הירוק'],answer:'המחוג הירוק'},
  {skill:'fullHours',kind:'analog',prompt:'מה השעה בשעון?',time:{hour:7,minute:0},choices:['9:00','7:00','4:00'],answer:'7:00'},
  {skill:'halfHours',kind:'analog',prompt:'מה השעה בשעון?',time:{hour:2,minute:30},choices:['2:00','3:30','2:30'],answer:'2:30'},
  {skill:'quarterHours',kind:'analog',prompt:'מה השעה בשעון?',time:{hour:7,minute:15},choices:['7:15','7:45','8:15'],answer:'7:15'},
  {skill:'digital',kind:'digital',prompt:'איך קוראים את השעה הכתובה?',time:{hour:8,minute:0},choices:['שש בדיוק','שמונה בדיוק','עשר בדיוק'],answer:'שמונה בדיוק'},
  {skill:'hourHand',kind:'hand',prompt:'איזה מחוג מראה את השעות?',time:{hour:10,minute:15},choices:['המחוג הירוק','המחוג הסגול'],answer:'המחוג הסגול'},
  {skill:'minuteHand',kind:'hand',prompt:'איזה מחוג מראה את הדקות?',time:{hour:4,minute:45},choices:['המחוג הירוק','המחוג הסגול'],answer:'המחוג הירוק'},
  {skill:'fullHours',kind:'analog',prompt:'מה השעה בשעון?',time:{hour:12,minute:0},choices:['3:00','10:00','12:00'],answer:'12:00'},
  {skill:'halfHours',kind:'analog',prompt:'מה השעה בשעון?',time:{hour:11,minute:30},choices:['11:30','11:00','12:30'],answer:'11:30'},
  {skill:'quarterHours',kind:'analog',prompt:'מה השעה בשעון?',time:{hour:12,minute:45},choices:['12:15','12:45','1:45'],answer:'12:45'},
  {skill:'digital',kind:'digital',prompt:'איך קוראים את השעה הכתובה?',time:{hour:3,minute:30},choices:['שלוש בדיוק','ארבע וחצי','שלוש וחצי'],answer:'שלוש וחצי'},
];
export type Results = Record<Skill, boolean>;
export type Assessment = { version: 1; results: Results; recommendation: StartingPoint };
export function recommend(results: Results): StartingPoint {
  if (!results.hourHand || !results.minuteHand || !results.digital) return 'structure';
  for (const skill of ['fullHours','halfHours','quarterHours'] as const) if (!results[skill]) return skill;
  return 'fiveMinutes';
}
export function completedAssessment(answers: (string | null)[]): Assessment {
  if (answers.length !== questions.length) throw new Error('Assessment is incomplete');
  const results = Object.fromEntries(skills.map(skill => [skill, questions.every((q, i) => q.skill !== skill || answers[i] === q.answer)])) as Results;
  return {version:1,results,recommendation:recommend(results)};
}
export const baselineStorageKey = 'kids-time-learning.baseline.v1';
export function loadAssessment(): { assessment: Assessment | null; error: boolean } {
  try {
    const raw = localStorage.getItem(baselineStorageKey);
    if (raw === null) return {assessment:null,error:false};
    const value = JSON.parse(raw);
    if (!value || value.version !== 1 || !value.results || !skills.every(skill => typeof value.results[skill] === 'boolean') || value.recommendation !== recommend(value.results)) throw new Error('Invalid baseline');
    return {assessment:value as Assessment,error:false};
  } catch { return {assessment:null,error:true}; }
}
export function saveAssessment(value: Assessment): boolean {
  try { localStorage.setItem(baselineStorageKey, JSON.stringify(value)); return true; }
  catch { return false; }
}
