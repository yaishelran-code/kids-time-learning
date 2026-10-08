import { useEffect, useRef, useState } from 'react';
import { AnalogClock } from '../components/AnalogClock';

const exercises = [
  { hour: 6, period: 'בבוקר' },
  { hour: 7, period: 'בבוקר' },
  { hour: 7, period: 'בערב' },
  { hour: 8, period: 'בערב' },
  { hour: 10, period: '' },
  { hour: 12, period: '' },
] as const;

export function FullHoursExercise({ onLesson, onHome }: { onLesson: () => void; onHome: () => void }) {
  const [index, setIndex] = useState(0);
  const [hour, setHour] = useState(1);
  const [feedback, setFeedback] = useState<'idle' | 'correct' | 'incorrect'>('idle');
  const heading = useRef<HTMLHeadingElement>(null);
  const nextButton = useRef<HTMLButtonElement>(null);
  const clockCard = useRef<HTMLElement>(null);
  const target = exercises[index];
  const completed = index === exercises.length - 1 && feedback === 'correct';
  useEffect(() => { heading.current?.focus(); }, [index, completed]);
  useEffect(() => { if (feedback === 'correct' && !completed) nextButton.current?.focus(); }, [feedback, completed]);

  if (completed) return (
    <main className="home" dir="rtl">
      <header className="clock-card">
        <h1 ref={heading} tabIndex={-1}>כל הכבוד! סיימתם את התרגול 🎉</h1>
      </header>
      <nav className="lesson-controls" aria-label="סיום התרגול">
        <button className="start-button" type="button" onClick={() => {
          setIndex(0);
          setHour(1);
          setFeedback('idle');
        }}>תרגלו שוב</button>
        <button className="secondary-button" type="button" onClick={onLesson}>חזרה ללימוד</button>
      </nav>
    </main>
  );

  return (
    <main className="home" dir="rtl">
      <header>
        <p className="eyebrow">עכשיו תורכם להזיז את המחוג</p>
        <h1 ref={heading} tabIndex={-1}>מכוונים את השעון</h1>
        <p className="exercise-target">כוונו את השעון לשעה <bdi dir="ltr">{target.hour}:00</bdi>{target.period && ` ${target.period}`}</p>
        <p>גררו את המחוג הקצר. המחוג הארוך נשאר על 12.</p>
      </header>
      <section ref={clockCard} className="clock-card" aria-label="השעון שלכם">
        <AnalogClock hour={hour} onHourChange={value => { setHour(value); setFeedback('idle'); }} />
        <p className="clock-caption">אפשר גם לבחור במחוג ולהשתמש במקשי החצים.</p>
      </section>
      <p className="exercise-feedback" role="status" aria-live="polite">
        {feedback === 'correct' ? 'כל הכבוד! כיוונתם את השעון נכון!' : feedback === 'incorrect' ? 'עוד לא, אבל אתם בדרך! נסו להזיז את המחוג הקצר ולבדוק שוב.' : ''}
      </p>
      <nav className="lesson-controls" aria-label="בדיקת התרגיל">
        {feedback !== 'correct' && <button className="start-button" type="button" onClick={() => setFeedback(hour === target.hour ? 'correct' : 'incorrect')}>בדיקה</button>}
        {feedback === 'incorrect' && <button className="secondary-button" type="button" onClick={() => {
          setFeedback('idle');
          clockCard.current?.querySelector<SVGElement>('[role="slider"]')?.focus();
        }}>נסה שוב</button>}
        {feedback === 'correct' && <button ref={nextButton} className="start-button" type="button" onClick={() => {
          setIndex(index + 1);
          setHour(1);
          setFeedback('idle');
        }}>התרגיל הבא</button>}
      </nav>
      <nav className="lesson-controls exercise-navigation" aria-label="חזרה">
        <button className="secondary-button" type="button" onClick={onLesson}>חזרה ללימוד</button>
        <button className="secondary-button" type="button" onClick={onHome}>חזרה לבית</button>
      </nav>
    </main>
  );
}
