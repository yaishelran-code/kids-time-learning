import { useEffect, useRef, useState } from 'react';
import { FullHoursLesson } from './learning/FullHoursLesson';
import { HalfHoursLesson } from './learning/HalfHoursLesson';
import { QuarterHoursLesson } from './learning/QuarterHoursLesson';
import { FiveMinutesLesson } from './learning/FiveMinutesLesson';
import { ExactMinutesLesson } from './learning/ExactMinutesLesson';
import { RelativeTimeLesson } from './learning/RelativeTimeLesson';
import { AnalogClock } from './components/AnalogClock';

export function App() {
  const [relativeTime, setRelativeTime] = useState(false);
  const relativeTimeButton = useRef<HTMLButtonElement>(null);
  const wasRelativeTime = useRef(false);
  useEffect(() => {
    if (wasRelativeTime.current && !relativeTime) relativeTimeButton.current?.focus();
    wasRelativeTime.current = relativeTime;
  }, [relativeTime]);
  const [exactMinutes, setExactMinutes] = useState(false);
  const exactMinutesButton = useRef<HTMLButtonElement>(null);
  const wasExactMinutes = useRef(false);
  useEffect(() => {
    if (wasExactMinutes.current && !exactMinutes) exactMinutesButton.current?.focus();
    wasExactMinutes.current = exactMinutes;
  }, [exactMinutes]);
  const [minutes, setMinutes] = useState(false);
  const minutesButton = useRef<HTMLButtonElement>(null);
  const wasMinutes = useRef(false);
  useEffect(() => {
    if (wasMinutes.current && !minutes) minutesButton.current?.focus();
    wasMinutes.current = minutes;
  }, [minutes]);
  const [quarterHours, setQuarterHours] = useState(false);
  const quarterHoursButton = useRef<HTMLButtonElement>(null);
  const wasQuarterHours = useRef(false);
  useEffect(() => {
    if (wasQuarterHours.current && !quarterHours) quarterHoursButton.current?.focus();
    wasQuarterHours.current = quarterHours;
  }, [quarterHours]);
  const [halfHours, setHalfHours] = useState(false);
  const halfHoursButton = useRef<HTMLButtonElement>(null);
  const wasHalfHours = useRef(false);
  useEffect(() => {
    if (wasHalfHours.current && !halfHours) halfHoursButton.current?.focus();
    wasHalfHours.current = halfHours;
  }, [halfHours]);
  const [learning, setLearning] = useState(false);
  const startButton = useRef<HTMLButtonElement>(null);
  const wasLearning = useRef(false);
  useEffect(() => {
    if (wasLearning.current && !learning) startButton.current?.focus();
    wasLearning.current = learning;
  }, [learning]);
  if (relativeTime) return <RelativeTimeLesson onHome={() => setRelativeTime(false)} />;
  if (exactMinutes) return <ExactMinutesLesson onHome={() => setExactMinutes(false)} />;
  if (minutes) return <FiveMinutesLesson onHome={() => setMinutes(false)} />;
  if (quarterHours) return <QuarterHoursLesson onHome={() => setQuarterHours(false)} />;
  if (halfHours) return <HalfHoursLesson onHome={() => setHalfHours(false)} />;
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
      <button ref={halfHoursButton} className="secondary-button exercise-entry" type="button" onClick={() => setHalfHours(true)}>נלמד חצי שעה</button>
      <button ref={quarterHoursButton} className="secondary-button exercise-entry" type="button" onClick={() => setQuarterHours(true)}>לימוד רבע שעה</button>
      <button ref={minutesButton} className="secondary-button exercise-entry" type="button" onClick={() => setMinutes(true)}>לימוד דקות</button>
      <button ref={exactMinutesButton} className="secondary-button exercise-entry" type="button" onClick={() => setExactMinutes(true)}>לימוד דקות מדויקות</button>
      <button ref={relativeTimeButton} className="secondary-button exercise-entry" type="button" onClick={() => setRelativeTime(true)}>כמה זמן עבר ונשאר?</button>
      <p className="parent-placeholder">אזור הורים <span>— בקרוב</span></p>
    </main>
  );
}
