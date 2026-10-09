import { useEffect, useRef, useState } from 'react';
import { AnalogClock } from '../components/AnalogClock';
import { formatTime, minutesFromTime, timeFromMinutes, type ClockTime } from './clockTime';

export type PracticeMode = 'setting' | 'reading' | 'mixed';
type Exercise = ClockTime & { kind: 'setting' | 'reading' };
const halfHours: ClockTime[] = [1, 3, 6, 8, 10, 12].map(hour => ({ hour, minute: 30 }));
const exercises: Record<PracticeMode, Exercise[]> = {
  setting: [7, 1, 3, 6, 10, 12].map(hour => ({ hour, minute: 30, kind: 'setting' })),
  reading: halfHours.map(time => ({ ...time, kind: 'reading' })),
  mixed: [
    { hour: 4, minute: 0, kind: 'reading' }, { hour: 7, minute: 30, kind: 'setting' },
    { hour: 11, minute: 0, kind: 'setting' }, { hour: 2, minute: 30, kind: 'reading' },
    { hour: 12, minute: 0, kind: 'reading' }, { hour: 9, minute: 30, kind: 'setting' },
  ],
};
const titles: Record<PracticeMode, string> = {
  setting: 'תרגול כיוון חצי שעה', reading: 'תרגול קריאת חצי שעה', mixed: 'תרגול משולב',
};
const initialTime = (exercise: Exercise) => timeFromMinutes(minutesFromTime(exercise) - 30);

export function HalfHoursPractice({ mode, onLesson, onHome }: { mode: PracticeMode; onLesson: () => void; onHome: () => void }) {
  const [index, setIndex] = useState(0);
  const [time, setTime] = useState(() => initialTime(exercises[mode][0]));
  const [selected, setSelected] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<'idle' | 'correct' | 'incorrect'>('idle');
  const [completed, setCompleted] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const nextButton = useRef<HTMLButtonElement>(null);
  const target = exercises[mode][index];
  const answer = formatTime(target);
  const choices = [target, { hour: target.hour, minute: target.minute === 0 ? 30 : 0 } as ClockTime,
    { hour: target.hour % 12 + 1, minute: target.minute }];
  // Rotate the correct choice to avoid teaching one fixed button position.
  const answers = choices.map((_, offset) => choices[(offset + index) % 3]);
  useEffect(() => { heading.current?.focus(); }, [index, completed]);
  useEffect(() => { if (feedback === 'correct') nextButton.current?.focus(); }, [feedback]);
  function reset() {
    setIndex(0); setTime(initialTime(exercises[mode][0])); setSelected(null); setFeedback('idle'); setCompleted(false);
  }
  return <main className="home" dir="rtl">
    <header>
      <h1 ref={heading} tabIndex={-1}>{completed ? 'כל הכבוד! סיימתם את תרגול השעות השלמות וחצאי השעות 🎉' : titles[mode]}</h1>
      {!completed && (target.kind === 'setting'
        ? <><p className="exercise-target">כוונו את השעון לשעה <bdi dir="ltr">{answer}</bdi></p><p>גררו את המחוג הארוך. שני המחוגים מתקדמים יחד. אפשר גם להשתמש במקשי החצים.</p></>
        : <p className="exercise-target">מה השעה?</p>)}
    </header>
    {!completed && <>
      <section className="clock-card" aria-label={target.kind === 'setting' ? 'השעון שלכם' : 'השעון לקריאה'}>
        {target.kind === 'setting' ? <AnalogClock hour={time.hour} minute={time.minute} onTimeChange={value => {
          setTime(value); setFeedback('idle');
        }} /> : <AnalogClock hour={target.hour} minute={target.minute} />}
      </section>
      {target.kind === 'reading' && <div className="lesson-controls reading-answers" role="group" aria-label="בחרו את השעה">
        {answers.map(value => <button key={formatTime(value)} type="button" className="secondary-button"
          aria-pressed={selected === formatTime(value)} disabled={feedback === 'correct'} onClick={() => {
            setSelected(formatTime(value)); setFeedback(formatTime(value) === answer ? 'correct' : 'incorrect');
          }}><bdi dir="ltr">{formatTime(value)}</bdi></button>)}
      </div>}
      <p className="exercise-feedback" role="status" aria-live="polite">{feedback === 'idle' ? '' : feedback === 'correct' ? 'כל הכבוד! תשובה נכונה 🎉' : 'כמעט! נסו שוב'}</p>
      {target.kind === 'setting' && feedback !== 'correct' && <button className="start-button" type="button"
        onClick={() => setFeedback(formatTime(time) === answer ? 'correct' : 'incorrect')}>בדיקה</button>}
      {feedback === 'correct' && <button ref={nextButton} className="start-button" type="button" onClick={() => {
        if (index === exercises[mode].length - 1) setCompleted(true);
        else { setIndex(index + 1); setTime(initialTime(exercises[mode][index + 1])); setSelected(null); setFeedback('idle'); }
      }}>התרגיל הבא</button>}
    </>}
    <nav className="lesson-controls exercise-navigation" aria-label={completed ? 'סיום התרגול' : 'חזרה'}>
      {completed && <button className="start-button" type="button" onClick={reset}>תרגלו שוב</button>}
      <button className="secondary-button" type="button" onClick={onLesson}>חזרה ללימוד</button>
      <button className="secondary-button" type="button" onClick={onHome}>חזרה לבית</button>
    </nav>
  </main>;
}
