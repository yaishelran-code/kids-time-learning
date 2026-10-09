import { useEffect, useRef, useState } from 'react';
import { AnalogClock } from '../components/AnalogClock';
import { formatTime, minutesFromTime, timeFromMinutes, type ClockTime } from './clockTime';
import { hourNames } from './examples';

export type FiveMinutesPracticeMode = 'setting' | 'reading' | 'mixed';
type Exercise = ClockTime & { kind: 'setting' | 'reading' };
const fiveMinutesTimes: ClockTime[] = [
  { hour: 12, minute: 5 }, { hour: 8, minute: 25 }, { hour: 3, minute: 40 },
  { hour: 7, minute: 10 }, { hour: 12, minute: 55 }, { hour: 2, minute: 20 },
  { hour: 10, minute: 35 }, { hour: 4, minute: 50 }, { hour: 1, minute: 5 },
  { hour: 6, minute: 25 }, { hour: 11, minute: 55 }, { hour: 9, minute: 40 },
];
export const fiveMinutesExercises: Record<FiveMinutesPracticeMode, Exercise[]> = {
  setting: fiveMinutesTimes.map(time => ({ ...time, kind: 'setting' })),
  reading: fiveMinutesTimes.map(time => ({ ...time, kind: 'reading' })),
  mixed: [
    { hour: 12, minute: 5, kind: 'setting' }, { hour: 8, minute: 0, kind: 'reading' },
    { hour: 3, minute: 10, kind: 'reading' }, { hour: 7, minute: 30, kind: 'setting' },
    { hour: 2, minute: 20, kind: 'setting' }, { hour: 12, minute: 55, kind: 'reading' },
    { hour: 6, minute: 15, kind: 'reading' }, { hour: 8, minute: 25, kind: 'reading' },
    { hour: 10, minute: 35, kind: 'setting' }, { hour: 4, minute: 45, kind: 'setting' },
    { hour: 9, minute: 40, kind: 'reading' }, { hour: 11, minute: 50, kind: 'setting' },
    { hour: 12, minute: 55, kind: 'setting' }, { hour: 1, minute: 5, kind: 'reading' },
    { hour: 6, minute: 10, kind: 'setting' }, { hour: 2, minute: 20, kind: 'reading' },
    { hour: 8, minute: 25, kind: 'setting' }, { hour: 10, minute: 35, kind: 'reading' },
    { hour: 3, minute: 40, kind: 'setting' }, { hour: 11, minute: 50, kind: 'reading' },
  ],
};
export const fiveMinutesPracticeTitles: Record<FiveMinutesPracticeMode, string> = {
  setting: 'תרגול כיוון דקות', reading: 'תרגול קריאת דקות',
  mixed: 'תרגול משולב — כל כפולות ה־5',
};
const completionTitles: Record<FiveMinutesPracticeMode, string> = {
  setting: 'כל הכבוד! סיימתם את תרגול כיוון הדקות 🎉',
  reading: 'כל הכבוד! סיימתם את תרגול קריאת הדקות 🎉',
  mixed: 'כל הכבוד! סיימתם את התרגול המשולב של כפולות ה־5 🎉',
};
// Vary direction and distance so setting exercises do not share one solution gesture.
const initialTime = (exercise: Exercise, index: number) =>
  timeFromMinutes(minutesFromTime(exercise) - [5, -10, 20, -25, 35, -40, 50, -55][index % 8], 5);
const minuteNames: Record<ClockTime['minute'], string> = {
  0: '', 5: 'חמש', 10: 'עשר', 15: 'חמש עשרה', 20: 'עשרים', 25: 'עשרים וחמש',
  30: 'שלושים', 35: 'שלושים וחמש', 40: 'ארבעים', 45: 'ארבעים וחמש',
  50: 'חמישים', 55: 'חמישים וחמש',
};
function spokenTime(time: ClockTime) {
  return `${hourNames[time.hour % 12]}${time.minute ? ` ו${minuteNames[time.minute]} דקות` : ''}`;
}

export function FiveMinutesPractice({ mode, onLesson, onHome }: { mode: FiveMinutesPracticeMode; onLesson: () => void; onHome: () => void }) {
  const [index, setIndex] = useState(0);
  const [time, setTime] = useState(() => initialTime(fiveMinutesExercises[mode][0], 0));
  const [selected, setSelected] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<'idle' | 'correct' | 'incorrect'>('idle');
  const [completed, setCompleted] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const nextButton = useRef<HTMLButtonElement>(null);
  const target = fiveMinutesExercises[mode][index];
  const answer = formatTime(target);
  const choices: ClockTime[] = [target,
    { hour: target.hour, minute: (target.minute + 5) % 60 as ClockTime['minute'] },
    { hour: target.hour % 12 + 1, minute: target.minute }];
  const readingIndex = fiveMinutesExercises[mode].slice(0, index).filter(exercise => exercise.kind === 'reading').length;
  const answers = choices.map((_, offset) => choices[(offset + readingIndex) % 3]);
  useEffect(() => { heading.current?.focus(); }, [index, completed]);
  useEffect(() => { if (feedback === 'correct') nextButton.current?.focus(); }, [feedback]);
  function reset() {
    setIndex(0); setTime(initialTime(fiveMinutesExercises[mode][0], 0)); setSelected(null); setFeedback('idle'); setCompleted(false);
  }
  return <main className="home" dir="rtl">
    <header>
      <h1 ref={heading} tabIndex={-1}>{completed ? completionTitles[mode] : fiveMinutesPracticeTitles[mode]}</h1>
      {!completed && <>
        <p>תרגיל {index + 1} מתוך {fiveMinutesExercises[mode].length}</p>
        {target.kind === 'setting'
          ? <><p className="exercise-target">כוונו את השעון לשעה <bdi dir="ltr">{answer}</bdi> — {spokenTime(target)}</p>
            <p>גררו את המחוג הארוך. שני המחוגים מתקדמים יחד. אפשר גם להשתמש במקשי החצים.</p></>
          : <p className="exercise-target">מה השעה? בחרו תשובה ולחצו על בדיקה.</p>}
      </>}
    </header>
    {!completed && <>
      <section className="clock-card" aria-label={target.kind === 'setting' ? 'השעון שלכם' : 'השעון לקריאה'}>
        {target.kind === 'setting' ? <AnalogClock hour={time.hour} minute={time.minute} minuteStep={5}
          onTimeChange={feedback === 'correct' ? undefined : value => { setTime(value); setFeedback('idle'); }} />
          : <AnalogClock hour={target.hour} minute={target.minute} />}
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
          if (index === fiveMinutesExercises[mode].length - 1) setCompleted(true);
          else { setIndex(index + 1); setTime(initialTime(fiveMinutesExercises[mode][index + 1], index + 1)); setSelected(null); setFeedback('idle'); }
        }}>התרגיל הבא</button>}
    </>}
    <nav className="lesson-controls exercise-navigation" aria-label={completed ? 'סיום התרגול' : 'חזרה'}>
      {completed && <button className="start-button" type="button" onClick={reset}>תרגלו שוב</button>}
      <button className="secondary-button" type="button" onClick={onLesson}>חזרה ללימוד</button>
      <button className="secondary-button" type="button" onClick={onHome}>חזרה לבית</button>
    </nav>
  </main>;
}
