import { useEffect, useRef, useState } from 'react';
import { FullHoursLesson } from './learning/FullHoursLesson';
import { AnalogClock } from './components/AnalogClock';

export function App() {
  const [learning, setLearning] = useState(false);
  const startButton = useRef<HTMLButtonElement>(null);
  const wasLearning = useRef(false);
  useEffect(() => {
    if (wasLearning.current && !learning) startButton.current?.focus();
    wasLearning.current = learning;
  }, [learning]);
  if (learning) return <FullHoursLesson onHome={() => setLearning(false)} />;

  return (
    <main className="home">
      <header>
        <p className="eyebrow">מגלים את הזמן ביחד</p>
        <h1>לומדים את השעה</h1>
        <p className="welcome">שלום! איזה כיף שבאתם. בואו נכיר את השעון!</p>
      </header>
      <section className="clock-card" id="clock" aria-label="מכירים את השעון" tabIndex={-1}>
        <AnalogClock />
        <p className="digital-time" dir="ltr" aria-label="השעה שבע">7:00</p>
        <p className="clock-caption">השעה שבע</p>
      </section>
      <button ref={startButton} className="start-button" type="button" onClick={() => setLearning(true)}>התחל ללמוד</button>
      <p className="parent-placeholder">אזור הורים <span>— בקרוב</span></p>
    </main>
  );
}
