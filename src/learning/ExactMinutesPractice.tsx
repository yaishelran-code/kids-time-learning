import { useEffect, useRef, useState } from 'react';
import { AnalogClock } from '../components/AnalogClock';
import { formatTime, minutesFromTime, timeFromMinutes, type ClockTime } from './clockTime';
import { hourNames } from './examples';

export type ExactMinutesPracticeMode = 'setting' | 'reading' | 'mixed';
type Exercise = ClockTime & { kind: 'setting' | 'reading' };
const exactMinutesTimes: ClockTime[] = [
  { hour: 8, minute: 1 }, { hour: 8, minute: 7 }, { hour: 8, minute: 23 },
  { hour: 8, minute: 37 }, { hour: 8, minute: 58 }, { hour: 8, minute: 59 },
  { hour: 12, minute: 1 }, { hour: 12, minute: 59 }, { hour: 3, minute: 6 },
  { hour: 1, minute: 14 }, { hour: 10, minute: 42 }, { hour: 6, minute: 56 },
];
export const exactMinutesExercises: Record<ExactMinutesPracticeMode, Exercise[]> = {
  setting: exactMinutesTimes.map(time => ({ ...time, kind: 'setting' })),
  reading: exactMinutesTimes.map(time => ({ ...time, kind: 'reading' })),
  mixed: [
    { hour: 8, minute: 1, kind: 'setting' }, { hour: 7, minute: 0, kind: 'reading' },
    { hour: 8, minute: 7, kind: 'reading' }, { hour: 3, minute: 30, kind: 'setting' },
    { hour: 12, minute: 59, kind: 'setting' }, { hour: 12, minute: 1, kind: 'reading' },
    { hour: 6, minute: 15, kind: 'reading' }, { hour: 3, minute: 6, kind: 'setting' },
    { hour: 8, minute: 37, kind: 'reading' }, { hour: 4, minute: 45, kind: 'setting' },
    { hour: 8, minute: 23, kind: 'setting' }, { hour: 10, minute: 25, kind: 'reading' },
    { hour: 8, minute: 59, kind: 'reading' }, { hour: 1, minute: 5, kind: 'setting' },
    { hour: 8, minute: 58, kind: 'setting' }, { hour: 1, minute: 14, kind: 'reading' },
    { hour: 9, minute: 0, kind: 'setting' }, { hour: 6, minute: 56, kind: 'reading' },
    { hour: 10, minute: 42, kind: 'setting' }, { hour: 2, minute: 30, kind: 'reading' },
  ],
};
export const exactMinutesPracticeTitles: Record<ExactMinutesPracticeMode, string> = {
  setting: 'תרגול כיוון דקות מדויקות', reading: 'תרגול קריאת דקות מדויקות',
  mixed: 'תרגול משולב — כל הדקות',
};
const completionTitles: Record<ExactMinutesPracticeMode, string> = {
  setting: 'כל הכבוד! סיימתם את תרגול כיוון הדקות המדויקות 🎉',
  reading: 'כל הכבוד! סיימתם את תרגול קריאת הדקות המדויקות 🎉',
  mixed: 'כל הכבוד! סיימתם את התרגול המשולב של כל הדקות 🎉',
};
// Vary direction and distance so setting exercises do not share one solution gesture.
const initialTime = (exercise: Exercise, index: number) =>
  timeFromMinutes(minutesFromTime(exercise) - [1, -2, 13, -17, 31, -43, 59, -61][index % 8], 1);
const minuteNames: Record<number, string> = {
  1: 'דקה אחת', 5: 'חמש דקות', 6: 'שש דקות', 7: 'שבע דקות',
  14: 'ארבע עשרה דקות', 15: 'חמש עשרה דקות', 23: 'עשרים ושלוש דקות',
  25: 'עשרים וחמש דקות', 30: 'שלושים דקות', 37: 'שלושים ושבע דקות',
  42: 'ארבעים ושתיים דקות', 45: 'ארבעים וחמש דקות', 56: 'חמישים ושש דקות',
  58: 'חמישים ושמונה דקות', 59: 'חמישים ותשע דקות',
};
function spokenTime(time: ClockTime) {
  return `${hourNames[time.hour % 12]}${time.minute ? ` ו${minuteNames[time.minute]}` : ''}`;
}

export function ExactMinutesPractice({ mode, onLesson, onHome }: { mode: ExactMinutesPracticeMode; onLesson: () => void; onHome: () => void }) {
  const [index, setIndex] = useState(0);
  const [time, setTime] = useState(() => initialTime(exactMinutesExercises[mode][0], 0));
  const [selected, setSelected] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<'idle' | 'correct' | 'incorrect'>('idle');
  const [completed, setCompleted] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const nextButton = useRef<HTMLButtonElement>(null);
  const target = exactMinutesExercises[mode][index];
  const answer = formatTime(target);
  // Alternate adjacent-minute and several-minute confusion; keep an hour distractor.
  const minuteOffset = [1, -1, 3, -4][index % 4];
  const choices: ClockTime[] = [target,
    { hour: target.hour, minute: (target.minute + minuteOffset + 60) % 60 },
    { hour: target.hour % 12 + 1, minute: target.minute }];
  const readingIndex = exactMinutesExercises[mode].slice(0, index).filter(exercise => exercise.kind === 'reading').length;
  const answers = choices.map((_, offset) => choices[(offset + readingIndex) % 3]);
  useEffect(() => { heading.current?.focus(); }, [index, completed]);
  useEffect(() => { if (feedback === 'correct') nextButton.current?.focus(); }, [feedback]);
  function reset() {
    setIndex(0); setTime(initialTime(exactMinutesExercises[mode][0], 0)); setSelected(null); setFeedback('idle'); setCompleted(false);
  }
  return <main className="home" dir="rtl">
    <header>
      <h1 ref={heading} tabIndex={-1}>{completed ? completionTitles[mode] : exactMinutesPracticeTitles[mode]}</h1>
      {!completed && <>
        <p>תרגיל {index + 1} מתוך {exactMinutesExercises[mode].length}</p>
        {target.kind === 'setting'
          ? <><p className="exercise-target">כוונו את השעון לשעה <bdi dir="ltr">{answer}</bdi> — {spokenTime(target)}</p>
            <p>גררו את המחוג הארוך. שני המחוגים מתקדמים יחד. אפשר גם להשתמש במקשי החצים.</p></>
          : <p className="exercise-target">מה השעה? בחרו תשובה ולחצו על בדיקה.</p>}
      </>}
    </header>
    {!completed && <>
      <section className="clock-card" aria-label={target.kind === 'setting' ? 'השעון שלכם' : 'השעון לקריאה'}>
        {target.kind === 'setting' ? <AnalogClock hour={time.hour} minute={time.minute} minuteStep={1} emphasizeMinuteTicks
          onTimeChange={feedback === 'correct' ? undefined : value => { setTime(value); setFeedback('idle'); }} />
          : <AnalogClock hour={target.hour} minute={target.minute} emphasizeMinuteTicks timeDescription={`שעון אנלוגי: השעה ${spokenTime(target)}`} />}
      </section>
      {target.kind === 'reading' && <div className="lesson-controls reading-answers" role="group" aria-label="בחרו את השעה">
        {answers.map(value => <button key={formatTime(value)} type="button" className="secondary-button"
          aria-pressed={selected === formatTime(value)} disabled={feedback === 'correct'} onClick={() => {
            setSelected(formatTime(value)); setFeedback('idle');
          }}><bdi dir="ltr">{formatTime(value)}</bdi></button>)}
      </div>}
      <p className="exercise-feedback" role="status" aria-live="polite">{feedback === 'idle' ? '' : feedback === 'correct' ? 'כל הכבוד! תשובה נכונה 🎉' : 'כמעט! נסו שוב'}</p>
      {feedback !== 'correct' ? <button className="start-button" type="button" disabled={target.kind === 'reading' && selected === null}
        onClick={() => setFeedback((target.kind === 'setting' ? formatTime(time) : selected) === answer ? 'correct' : 'incorrect')}>בדיקה</button>
        : <button ref={nextButton} className="start-button" type="button" onClick={() => {
          if (index === exactMinutesExercises[mode].length - 1) setCompleted(true);
          else { setIndex(index + 1); setTime(initialTime(exactMinutesExercises[mode][index + 1], index + 1)); setSelected(null); setFeedback('idle'); }
        }}>התרגיל הבא</button>}
    </>}
    <nav className="lesson-controls exercise-navigation" aria-label={completed ? 'סיום התרגול' : 'חזרה'}>
      {completed && <button className="start-button" type="button" onClick={reset}>תרגלו שוב</button>}
      <button className="secondary-button" type="button" onClick={onLesson}>חזרה ללימוד</button>
      <button className="secondary-button" type="button" onClick={onHome}>חזרה לבית</button>
    </nav>
  </main>;
}
