import { useEffect, useRef, useState } from 'react';
import { AnalogClock } from '../components/AnalogClock';

const exercises = [
  { hour: 1, answers: [3, 1, 11] },
  { hour: 3, answers: [3, 6, 9] },
  { hour: 6, answers: [12, 5, 6] },
  { hour: 8, answers: [6, 8, 10] },
  { hour: 10, answers: [10, 2, 9] },
  { hour: 12, answers: [11, 1, 12] },
] as const;

export function FullHoursReadingExercise({ onLesson, onHome }: { onLesson: () => void; onHome: () => void }) {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [completed, setCompleted] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const nextButton = useRef<HTMLButtonElement>(null);
  const target = exercises[index];
  const correct = selected === target.hour;

  useEffect(() => { heading.current?.focus(); }, [index, completed]);
  useEffect(() => { if (correct) nextButton.current?.focus(); }, [correct]);

  if (completed) return (
    <main className="home" dir="rtl">
      <header className="clock-card">
        <h1 ref={heading} tabIndex={-1}>כל הכבוד! סיימתם את תרגול קריאת השעון 🎉</h1>
      </header>
      <nav className="lesson-controls" aria-label="סיום תרגול קריאת השעון">
        <button className="start-button" type="button" onClick={() => {
          setIndex(0);
          setSelected(null);
          setCompleted(false);
        }}>תרגלו שוב</button>
        <button className="secondary-button" type="button" onClick={onLesson}>חזרה ללימוד</button>
      </nav>
    </main>
  );

  return (
    <main className="home" dir="rtl">
      <header>
        <p className="eyebrow">קוראים את השעון</p>
        <h1 ref={heading} tabIndex={-1}>מה השעה?</h1>
        <p>הסתכלו על המחוגים ובחרו את השעה.</p>
      </header>
      <section className="clock-card" aria-label="השעון לקריאה">
        <AnalogClock hour={target.hour} />
      </section>
      <div className="lesson-controls reading-answers" role="group" aria-label="בחרו את השעה">
        {target.answers.map(hour => (
          <button key={hour} className="secondary-button" type="button" aria-pressed={selected === hour}
            disabled={correct} onClick={() => setSelected(hour)}>
            <bdi dir="ltr">{hour}:00</bdi>
          </button>
        ))}
      </div>
      <p className="exercise-feedback" role="status" aria-live="polite">
        {selected === null ? '' : correct ? 'כל הכבוד! תשובה נכונה 🎉' : 'כמעט! נסו שוב'}
      </p>
      {correct && <button ref={nextButton} className="start-button" type="button" onClick={() => {
        if (index === exercises.length - 1) setCompleted(true);
        else { setIndex(index + 1); setSelected(null); }
      }}>התרגיל הבא</button>}
      <nav className="lesson-controls exercise-navigation" aria-label="חזרה">
        <button className="secondary-button" type="button" onClick={onLesson}>חזרה ללימוד</button>
        <button className="secondary-button" type="button" onClick={onHome}>חזרה לבית</button>
      </nav>
    </main>
  );
}
