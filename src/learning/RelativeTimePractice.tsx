import { useEffect, useRef, useState } from 'react';
import { AnalogClock } from '../components/AnalogClock';
import { formatTime, timeFromMinutes, type ClockTime } from './clockTime';
import { durationLabel, durationMinutes, type RelativeTimeExample } from './relativeTime';

export type RelativeTimePracticeMode = 'elapsed' | 'remaining' | 'mixed';
export const relativeTimePracticeTitles = {
  elapsed: 'תרגול זמן שעבר', remaining: 'תרגול זמן שנותר', mixed: 'תרגול משולב — זמן שעבר ונשאר',
};
// Same-day fixtures: absolute hours are used only to define unambiguous event order.
const fixtures = [
  [9, 0, 12, 0], [15, 0, 16, 0], [16, 0, 18, 0],
  [15, 10, 15, 30], [16, 15, 16, 45], [11, 5, 11, 20],
  [11, 45, 12, 15], [16, 40, 17, 0], [12, 50, 13, 10],
  [15, 15, 16, 45], [16, 20, 18, 0], [10, 30, 13, 0],
] as const;
const activities = ['טיול', 'משחק', 'ביקור אצל המשפחה', 'ציור', 'חוג', 'קריאה', 'ארוחת צהריים', 'כדורגל', 'משחק בקוביות', 'משחק עם חברים', 'ארוחת ערב', 'יצירה'];
function period(hour: number) { return hour < 12 ? 'בבוקר' : hour < 15 ? 'בצהריים' : hour < 18 ? 'אחר הצהריים' : 'בערב'; }
function exercise(kind: 'elapsed' | 'remaining', fixture: typeof fixtures[number], index: number): RelativeTimeExample {
  const [sh, sm, eh, em] = fixture;
  const start: ClockTime = { hour: sh % 12 || 12, minute: sm };
  const end: ClockTime = { hour: eh % 12 || 12, minute: em };
  const startPeriod = period(sh), endPeriod = period(eh);
  return { kind, start, end, startPeriod, endPeriod,
    stage: sm === 0 && em === 0 ? 'שעות שלמות' : sh === eh ? 'דקות באותה שעה' : (eh - sh) * 60 + em - sm < 60 ? 'דקות שחוצות שעה' : 'שעות ודקות יחד',
    story: kind === 'elapsed'
      ? `התחלנו ${activities[index]} ב־${formatTime(start)} ${startPeriod}. עכשיו ${formatTime(end)} ${endPeriod}. כמה זמן עבר?`
      : `עכשיו ${formatTime(start)} ${startPeriod}. הפעילות שלנו — ${activities[index]} — מתחילה ב־${formatTime(end)} ${endPeriod}. כמה זמן נשאר?`,
  };
}
const elapsed = fixtures.map((fixture, index) => exercise('elapsed', fixture, index));
const remaining = fixtures.map((fixture, index) => exercise('remaining', fixture, index));
export const relativeTimeExercises: Record<RelativeTimePracticeMode, RelativeTimeExample[]> = {
  elapsed, remaining,
  mixed: fixtures.flatMap((_, index) => [elapsed[index], remaining[(index + 5) % fixtures.length]]).slice(0, 20),
};
export function durationChoices(total: number, index: number): number[] {
  const values = total >= 170 ? [total, total - 10, total - 20] : [total, total + 10, total > 20 ? total - 10 : total + 20];
  return values.map((_, offset) => values[(offset + index) % 3]);
}
export function RelativeTimePractice({ mode, onLesson, onHome }: { mode: RelativeTimePracticeMode; onLesson: () => void; onHome: () => void }) {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<'idle' | 'correct' | 'incorrect'>('idle');
  const [completed, setCompleted] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const next = useRef<HTMLButtonElement>(null);
  useEffect(() => { heading.current?.focus(); }, [index, completed]);
  useEffect(() => { if (feedback === 'correct') next.current?.focus(); }, [feedback]);
  const questions = relativeTimeExercises[mode];
  const question = questions[index];
  const total = durationMinutes(question.start, question.end);
  const hours = Math.floor(total / 60), minutes = total % 60;
  const anchor = timeFromMinutes(question.start.hour % 12 * 60 + question.start.minute + hours * 60, 5);
  function clear() { setSelected(null); setFeedback('idle'); }
  return <main className="home" dir="rtl">
    <header><h1 ref={heading} tabIndex={-1}>{completed ? `כל הכבוד! סיימתם ${relativeTimePracticeTitles[mode]} 🎉` : relativeTimePracticeTitles[mode]}</h1>
      {!completed && <><p>תרגיל {index + 1} מתוך {questions.length}</p><p className="relative-question">{question.story}</p></>}
    </header>
    {!completed && <>
      <section className="clock-card relative-time-card" aria-label="השעות בסיפור">
        <div className="relative-clocks">
          {[{ time: question.start, period: question.startPeriod, role: question.kind === 'elapsed' ? 'התחלנו' : 'עכשיו' },
            { time: question.end, period: question.endPeriod, role: question.kind === 'elapsed' ? 'עכשיו' : 'הפעילות מתחילה' }].map(({ time, period, role }) => <figure key={role}>
            <h2>{role}</h2><AnalogClock {...time} timeDescription={`${role}: ${formatTime(time)} ${period}`} />
            <figcaption><bdi className="digital-time" dir="ltr">{formatTime(time)}</bdi><br />{period}</figcaption>
          </figure>)}
        </div>
      </section>
      <div className="lesson-controls reading-answers duration-answers" role="group" aria-label="בחרו משך זמן">
        {durationChoices(total, index).map(value => <button key={value} type="button" className="secondary-button" aria-pressed={selected === value}
          disabled={feedback === 'correct'} onClick={() => { setSelected(value); setFeedback('idle'); }}>{durationLabel(value)}</button>)}
      </div>
      <p className="exercise-feedback" role="status" aria-live="polite">{feedback === 'idle' ? '' : feedback === 'correct' ? 'כל הכבוד! תשובה נכונה 🎉' : 'כמעט! נסו שוב'}</p>
      {feedback === 'correct' && <section className="relative-calculation" aria-label="הסבר החישוב">
        <p>סופרים קדימה לפי סדר האירועים וחלקי היום.</p>
        <p>{hours > 0 && <>מ־<bdi dir="ltr">{formatTime(question.start)}</bdi> עד <bdi dir="ltr">{formatTime(anchor)}</bdi>: {durationLabel(hours * 60)}. </>}{minutes > 0 && <>מ־<bdi dir="ltr">{formatTime(anchor)}</bdi> עד <bdi dir="ltr">{formatTime(question.end)}</bdi>: עוד {minutes / 5} צעדים של 5 דקות, שהם {minutes} דקות</>}.</p>
        <p className="relative-answer">{question.kind === 'elapsed' ? 'עברו' : 'נשארו'} {durationLabel(total)}.</p>
      </section>}
      {feedback !== 'correct' ? <button type="button" className="start-button" disabled={selected === null} onClick={() => setFeedback(selected === total ? 'correct' : 'incorrect')}>בדיקה</button>
        : <button ref={next} type="button" className="start-button" onClick={() => { if (index === questions.length - 1) setCompleted(true); else { setIndex(index + 1); clear(); } }}>התרגיל הבא</button>}
    </>}
    <nav className="lesson-controls exercise-navigation" aria-label={completed ? 'סיום התרגול' : 'חזרה'}>
      {completed && <button type="button" className="start-button" onClick={() => { setIndex(0); clear(); setCompleted(false); }}>תרגלו שוב</button>}
      <button type="button" className="secondary-button" onClick={onLesson}>חזרה ללימוד</button>
      <button type="button" className="secondary-button" onClick={onHome}>חזרה לבית</button>
    </nav>
  </main>;
}
