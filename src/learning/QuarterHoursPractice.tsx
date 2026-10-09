import { useEffect, useRef, useState } from 'react';
import { AnalogClock } from '../components/AnalogClock';
import { formatTime, minutesFromTime, timeFromMinutes, type ClockTime } from './clockTime';
import { hourNames } from './examples';

export type QuarterPracticeMode = 'setting' | 'reading' | 'mixed';
type Exercise = ClockTime & { kind: 'setting' | 'reading' };
const quarterTimes: ClockTime[] = [
  { hour: 7, minute: 15 }, { hour: 7, minute: 45 }, { hour: 1, minute: 15 }, { hour: 3, minute: 45 },
  { hour: 8, minute: 15 }, { hour: 10, minute: 45 }, { hour: 12, minute: 15 }, { hour: 12, minute: 45 },
];
export const quarterExercises: Record<QuarterPracticeMode, Exercise[]> = {
  setting: quarterTimes.map(time => ({ ...time, kind: 'setting' })),
  reading: quarterTimes.map(time => ({ ...time, kind: 'reading' })),
  mixed: [
    { hour: 7, minute: 15, kind: 'setting' }, { hour: 12, minute: 0, kind: 'reading' },
    { hour: 7, minute: 45, kind: 'reading' }, { hour: 12, minute: 30, kind: 'setting' },
    { hour: 12, minute: 45, kind: 'setting' }, { hour: 1, minute: 15, kind: 'reading' },
    { hour: 1, minute: 0, kind: 'setting' }, { hour: 8, minute: 30, kind: 'reading' },
    { hour: 12, minute: 15, kind: 'reading' }, { hour: 3, minute: 45, kind: 'setting' },
    { hour: 10, minute: 15, kind: 'setting' }, { hour: 12, minute: 45, kind: 'reading' },
  ],
};
export const quarterPracticeTitles: Record<QuarterPracticeMode, string> = {
  setting: 'תרגול כיוון רבעי שעות', reading: 'תרגול קריאת רבעי שעות',
  mixed: 'תרגול משולב — שעות שלמות, חצאים ורבעים',
};
const completionTitles: Record<QuarterPracticeMode, string> = {
  setting: 'כל הכבוד! סיימתם את תרגול כיוון רבעי השעות 🎉',
  reading: 'כל הכבוד! סיימתם את תרגול קריאת רבעי השעות 🎉',
  mixed: 'כל הכבוד! סיימתם את תרגול השעות השלמות, החצאים והרבעים 🎉',
};
const initialTime = (exercise: Exercise) => timeFromMinutes(minutesFromTime(exercise) - 15, 15);
function spokenTime(time: ClockTime) {
  return `${hourNames[time.hour % 12]}${time.minute === 15 ? ' ורבע' : time.minute === 30 ? ' וחצי' : time.minute === 45 ? ' ארבעים וחמש' : ''}`;
}

export function QuarterHoursPractice({ mode, onLesson, onHome }: { mode: QuarterPracticeMode; onLesson: () => void; onHome: () => void }) {
  const [index, setIndex] = useState(0);
  const [time, setTime] = useState(() => initialTime(quarterExercises[mode][0]));
  const [selected, setSelected] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<'idle' | 'correct' | 'incorrect'>('idle');
  const [completed, setCompleted] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const nextButton = useRef<HTMLButtonElement>(null);
  const target = quarterExercises[mode][index];
  const answer = formatTime(target);
  const choices: ClockTime[] = [target,
    { hour: target.hour, minute: target.minute === 45 ? 15 : target.minute === 15 ? 45 : target.minute === 0 ? 30 : 0 },
    { hour: target.hour % 12 + 1, minute: target.minute }];
  const readingIndex = quarterExercises[mode].slice(0, index).filter(exercise => exercise.kind === 'reading').length;
  const answers = choices.map((_, offset) => choices[(offset + readingIndex) % 3]);
  useEffect(() => { heading.current?.focus(); }, [index, completed]);
  useEffect(() => { if (feedback === 'correct') nextButton.current?.focus(); }, [feedback]);
  function reset() {
    setIndex(0); setTime(initialTime(quarterExercises[mode][0])); setSelected(null); setFeedback('idle'); setCompleted(false);
  }
  return <main className="home" dir="rtl">
    <header>
      <h1 ref={heading} tabIndex={-1}>{completed ? completionTitles[mode] : quarterPracticeTitles[mode]}</h1>
      {!completed && <>
        <p>תרגיל {index + 1} מתוך {quarterExercises[mode].length}</p>
        {target.kind === 'setting'
          ? <><p className="exercise-target">כוונו את השעון לשעה <bdi dir="ltr">{answer}</bdi> — {spokenTime(target)}</p>
            <p>גררו את המחוג הארוך. שני המחוגים מתקדמים יחד. אפשר גם להשתמש במקשי החצים.</p></>
          : <p className="exercise-target">מה השעה? בחרו תשובה ולחצו על בדיקה.</p>}
      </>}
    </header>
    {!completed && <>
      <section className="clock-card" aria-label={target.kind === 'setting' ? 'השעון שלכם' : 'השעון לקריאה'}>
        {target.kind === 'setting' ? <AnalogClock hour={time.hour} minute={time.minute} minuteStep={15}
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
          if (index === quarterExercises[mode].length - 1) setCompleted(true);
          else { setIndex(index + 1); setTime(initialTime(quarterExercises[mode][index + 1])); setSelected(null); setFeedback('idle'); }
        }}>התרגיל הבא</button>}
    </>}
    <nav className="lesson-controls exercise-navigation" aria-label={completed ? 'סיום התרגול' : 'חזרה'}>
      {completed && <button className="start-button" type="button" onClick={reset}>תרגלו שוב</button>}
      <button className="secondary-button" type="button" onClick={onLesson}>חזרה ללימוד</button>
      <button className="secondary-button" type="button" onClick={onHome}>חזרה לבית</button>
    </nav>
  </main>;
}
