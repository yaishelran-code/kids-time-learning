import { FlowExperience } from './flow/FlowExperience';
import { ParentArea, ParentHelpProvider } from './parent/ParentHelp';
import { Collection, RewardTotals, RewardsProvider } from './rewards/Rewards';
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

export function App() { return <ParentHelpProvider><RewardsProvider><AppScreens /></RewardsProvider></ParentHelpProvider>; }
function AppScreens() {
  const [flowVisible, setFlowVisible] = useState(false);
  const [flowCommand, setFlowCommand] = useState<{id:number; resume?:boolean;topic?:'structure'|'full'|'half'|'quarter'|'five'}>({id:0});
  const [hasSession, setHasSession] = useState(false);
  const flowButton = useRef<HTMLButtonElement>(null);
  function openFlow(resume = false) { setFlowCommand(c=>({id:c.id+1,resume})); setFlowVisible(true); }
  function flowHome() { setBaseline(false); setBaselineLesson(null); setFlowVisible(false); setTimeout(()=>flowButton.current?.focus(),0); }

  const [parent, setParent] = useState(false);
  const parentButton = useRef<HTMLButtonElement>(null);
  const wasParent = useRef(false);
  useEffect(() => {
    if (wasParent.current && !parent) parentButton.current?.focus();
    wasParent.current = parent;
  }, [parent]);
  const [collection, setCollection] = useState(false);
  const collectionButton = useRef<HTMLButtonElement>(null);
  const wasCollection = useRef(false);
  useEffect(() => {
    if (wasCollection.current && !collection) collectionButton.current?.focus();
    wasCollection.current = collection;
  }, [collection]);
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
  const legacyPage = parent?'parent':collection?'collection':baseline?'baseline':structure?'structure':myDay?'myDay':dayPeriods?'day':relativeTime?'relative':exactMinutes?'exact':minutes?'five':quarterHours?'quarter':halfHours?'half':learning?'full':null;
  useEffect(()=>{
    if(legacyPage && !flowVisible) history.pushState({legacyPage},'');
  },[legacyPage,flowVisible]);
  useEffect(()=>{
    const back=(event:PopStateEvent)=>{
      if(!legacyPage && event.state?.flow){setFlowVisible(true);return;}
      if(flowVisible || !legacyPage || legacyPage==='parent' || legacyPage==='myDay')return;
      setCollection(false);setBaseline(false);setStructure(false);setDayPeriods(false);setRelativeTime(false);setExactMinutes(false);setMinutes(false);setQuarterHours(false);setHalfHours(false);setLearning(false);
    };
    window.addEventListener('popstate',back);return()=>window.removeEventListener('popstate',back);
  },[legacyPage,flowVisible]);
  function renderPage() {
  if (parent) return <ParentArea onHome={() => setParent(false)} />;
  if (collection) return <Collection onHome={() => setCollection(false)} />;
  if (baseline) {
    const onHome = () => { setBaseline(false); setBaselineLesson(null); };
    if (baselineLesson === 'structure') return <ClockStructureLesson onHome={onHome} onFullHours={() => setBaselineLesson('fullHours')} />;
    if (baselineLesson === 'fullHours') return <FullHoursLesson onHome={onHome} />;
    if (baselineLesson === 'halfHours') return <HalfHoursLesson onHome={onHome} />;
    if (baselineLesson === 'quarterHours') return <QuarterHoursLesson onHome={onHome} />;
    if (baselineLesson === 'fiveMinutes') return <FiveMinutesLesson onHome={onHome} />;
    return <Baseline onHome={onHome} onLesson={point=>{setFlowCommand(c=>({id:c.id+1,topic:({structure:'structure',fullHours:'full',halfHours:'half',quarterHours:'quarter',fiveMinutes:'five'} as const)[point]}));setFlowVisible(true);}} />;
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
      <button ref={flowButton} className="start-button exercise-entry" type="button" onClick={()=>openFlow()}>בואו נתרגל</button>
      {hasSession && <button className="secondary-button exercise-entry" type="button" onClick={()=>openFlow(true)}>המשך התרגול</button>}
      <RewardTotals />
      <button ref={collectionButton} className="secondary-button exercise-entry" type="button" onClick={() => setCollection(true)}>האוסף שלי</button>
      <button ref={baselineButton} className="secondary-button exercise-entry" type="button" onClick={() => setBaseline(true)}>מאיפה מתחילים?</button>
      <details className="learn-topics"><summary>לימוד לפי נושא</summary>
      <button ref={structureButton} className="secondary-button exercise-entry" type="button" onClick={() => setStructure(true)}>מבנה השעון</button>
      <button ref={startButton} className="start-button" type="button" onClick={() => setLearning(true)}>התחל ללמוד</button>
      <button ref={halfHoursButton} className="secondary-button exercise-entry" type="button" onClick={() => setHalfHours(true)}>נלמד חצי שעה</button>
      <button ref={quarterHoursButton} className="secondary-button exercise-entry" type="button" onClick={() => setQuarterHours(true)}>לימוד רבע שעה</button>
      <button ref={minutesButton} className="secondary-button exercise-entry" type="button" onClick={() => setMinutes(true)} aria-describedby="five-description">קפיצות של 5 דקות</button><p id="five-description">בין מספר למספר בשעון עוברות 5 דקות</p>
      <button ref={exactMinutesButton} className="secondary-button exercise-entry" type="button" onClick={() => setExactMinutes(true)} aria-describedby="exact-description">צעדים של דקה אחת</button><p id="exact-description">בין שני סימונים קטנים בשעון עוברת דקה אחת</p>
      <button ref={relativeTimeButton} className="secondary-button exercise-entry" type="button" onClick={() => setRelativeTime(true)}>כמה זמן עבר ונשאר?</button>
      <button ref={dayPeriodsButton} className="secondary-button exercise-entry" type="button" onClick={() => setDayPeriods(true)}>לימוד חלקי היום</button>
      </details>
      <button ref={myDayButton} className="secondary-button exercise-entry" type="button" onClick={() => setMyDay(true)}>היום שלי</button>
      <button ref={parentButton} type="button" className="secondary-button exercise-entry" onClick={() => setParent(true)}>אזור הורה</button>
    </main>
  );
  }
  return <><div hidden={flowVisible}>{renderPage()}</div><FlowExperience active={flowVisible} command={flowCommand} onHome={flowHome} onSession={setHasSession}/></>;
}
