import { Baseline } from './baseline/Baseline';
import type { StartingPoint } from './baseline/assessment';
import { ClockStructureLesson } from './learning/ClockStructureLesson';
import { useEffect, useRef, useState } from 'react';
import { FullHoursLesson } from './learning/FullHoursLesson';
import { HalfHoursLesson } from './learning/HalfHoursLesson';
import { QuarterHoursLesson } from './learning/QuarterHoursLesson';
import { FiveMinutesLesson } from './learning/FiveMinutesLesson';
import { ExactMinutesLesson } from './learning/ExactMinutesLesson';
import { RelativeTimeLesson } from './learning/RelativeTimeLesson';
import { AnalogClock } from './components/AnalogClock';
import { MyDay } from './myDay/MyDay';
import { DayPeriodsLesson } from './learning/DayPeriodsLesson';

export function App() {
  const [baseline, setBaseline] = useState(false);
  const [baselineLesson, setBaselineLesson] = useState<StartingPoint | null>(null);
  const baselineButton = useRef<HTMLButtonElement>(null);
  const wasBaseline = useRef(false);
  useEffect(() => {
    if (wasBaseline.current && !baseline) baselineButton.current?.focus();
    wasBaseline.current = baseline;
  }, [baseline]);
  const [structure, setStructure] = useState(false);
  const structureButton = useRef<HTMLButtonElement>(null);
  const wasStructure = useRef(false);
  useEffect(() => {
    if (wasStructure.current && !structure) structureButton.current?.focus();
    wasStructure.current = structure;
  }, [structure]);
  const [myDay, setMyDay] = useState(false);
  const myDayButton = useRef<HTMLButtonElement>(null);
  const wasMyDay = useRef(false);
  useEffect(() => {
    if (wasMyDay.current && !myDay) myDayButton.current?.focus();
    wasMyDay.current = myDay;
  }, [myDay]);
  const [dayPeriods, setDayPeriods] = useState(false);
  const dayPeriodsButton = useRef<HTMLButtonElement>(null);
  const wasDayPeriods = useRef(false);
  useEffect(() => {
    if (wasDayPeriods.current && !dayPeriods) dayPeriodsButton.current?.focus();
    wasDayPeriods.current = dayPeriods;
  }, [dayPeriods]);
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
  if (baseline) {
    const onHome = () => { setBaseline(false); setBaselineLesson(null); };
    if (baselineLesson === 'structure') return <ClockStructureLesson onHome={onHome} onFullHours={() => setBaselineLesson('fullHours')} />;
    if (baselineLesson === 'fullHours') return <FullHoursLesson onHome={onHome} />;
    if (baselineLesson === 'halfHours') return <HalfHoursLesson onHome={onHome} />;
    if (baselineLesson === 'quarterHours') return <QuarterHoursLesson onHome={onHome} />;
    if (baselineLesson === 'fiveMinutes') return <FiveMinutesLesson onHome={onHome} />;
    return <Baseline onHome={onHome} onLesson={setBaselineLesson} />;
  }
  if (structure) return <ClockStructureLesson onHome={() => setStructure(false)} onFullHours={() => { setStructure(false); setLearning(true); }} />;
  if (myDay) return <MyDay onHome={() => setMyDay(false)} />;
  if (dayPeriods) return <DayPeriodsLesson onHome={() => setDayPeriods(false)} />;
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
      <button ref={baselineButton} className="secondary-button exercise-entry" type="button" onClick={() => setBaseline(true)}>מאיפה מתחילים?</button>
      <button ref={structureButton} className="secondary-button exercise-entry" type="button" onClick={() => setStructure(true)}>מבנה השעון</button>
      <button ref={startButton} className="start-button" type="button" onClick={() => setLearning(true)}>התחל ללמוד</button>
      <button ref={halfHoursButton} className="secondary-button exercise-entry" type="button" onClick={() => setHalfHours(true)}>נלמד חצי שעה</button>
      <button ref={quarterHoursButton} className="secondary-button exercise-entry" type="button" onClick={() => setQuarterHours(true)}>לימוד רבע שעה</button>
      <button ref={minutesButton} className="secondary-button exercise-entry" type="button" onClick={() => setMinutes(true)}>לימוד דקות</button>
      <button ref={exactMinutesButton} className="secondary-button exercise-entry" type="button" onClick={() => setExactMinutes(true)}>לימוד דקות מדויקות</button>
      <button ref={relativeTimeButton} className="secondary-button exercise-entry" type="button" onClick={() => setRelativeTime(true)}>כמה זמן עבר ונשאר?</button>
      <button ref={dayPeriodsButton} className="secondary-button exercise-entry" type="button" onClick={() => setDayPeriods(true)}>לימוד חלקי היום</button>
      <button ref={myDayButton} className="secondary-button exercise-entry" type="button" onClick={() => setMyDay(true)}>היום שלי</button>
      <p className="parent-placeholder">אזור הורים <span>— בקרוב</span></p>
    </main>
  );
}
