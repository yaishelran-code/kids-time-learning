import { useEffect, useRef, useState } from 'react';
import { AnalogClock } from '../components/AnalogClock';
import { RelativeTimePractice, relativeTimePracticeTitles, type RelativeTimePracticeMode } from './RelativeTimePractice';
import { formatTime } from './clockTime';
import { calculationSteps, durationLabel, durationMinutes, relativeTimeExamples } from './relativeTime';

export function RelativeTimeLesson({ onHome }: { onHome: () => void }) {
  const [index, setIndex] = useState(0);
  const [practice, setPractice] = useState<RelativeTimePracticeMode | null>(null);
  const previousPractice = useRef<RelativeTimePracticeMode | null>(null);
  const entries = useRef<Partial<Record<RelativeTimePracticeMode, HTMLButtonElement | null>>>({});
  useEffect(() => {
    if (previousPractice.current && !practice) entries.current[previousPractice.current]?.focus();
    previousPractice.current = practice;
  }, [practice]);
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => { heading.current?.focus(); }, [index]);
  if (practice) return <RelativeTimePractice key={practice} mode={practice} onLesson={() => setPractice(null)} onHome={onHome} />;
  const example = relativeTimeExamples[index];
  const elapsed = example.kind === 'elapsed';
  const total = durationMinutes(example.start, example.end);
  const steps = calculationSteps(example);
  const hours = Math.floor(total / 60);
  const minutes = total % 60;
  const anchor = steps[hours - 1]?.to ?? example.start;
  return <main className="home" dir="rtl">
    <header>
      <p className="eyebrow">מגלים את הזמן ביחד</p>
      <h1>כמה זמן עבר ונשאר?</h1>
      <p className="welcome">השעה אומרת מתי. משך הזמן אומר כמה זמן.</p>
      <p>״כמה זמן עבר?״ סופרים מההתחלה עד עכשיו. ״כמה זמן נשאר?״ סופרים מעכשיו עד שהפעילות מתחילה.</p>
      <p>60 דקות הן שעה. 90 דקות הן שעה ו־30 דקות — גם ״שעה וחצי״.</p>
    </header>
    <section className="clock-card relative-time-card" aria-labelledby="relative-example-heading">
      <h2 id="relative-example-heading" ref={heading} tabIndex={-1}>דוגמה {index + 1} מתוך 12: {example.stage}</h2>
      <p className="relative-question">{elapsed ? 'כמה זמן עבר?' : 'כמה זמן נשאר?'}</p>
      <p>{example.story}</p>
      <div className="relative-clocks">
        {[{ time: example.start, period: example.startPeriod, role: elapsed ? 'התחלנו' : 'עכשיו' },
          { time: example.end, period: example.endPeriod, role: elapsed ? 'עכשיו' : 'הפעילות מתחילה' }].map(({ time, period, role }) => <figure key={role}>
          <h3>{role}</h3>
          <AnalogClock {...time} timeDescription={`${role}: ${formatTime(time)} ${period}`} />
          <figcaption><bdi className="digital-time" dir="ltr">{formatTime(time)}</bdi><br />{period}</figcaption>
        </figure>)}
      </div>
      <section className="relative-calculation" aria-labelledby="relative-calculation-heading">
        <h3 id="relative-calculation-heading">סופרים קדימה: שעות שלמות, ואז צעדים של 5 דקות</h3>
        <p>בציר הזמן מתקדמים לפי החצים, מההתחלה אל הסיום.</p>
        <ol className="relative-timeline" aria-label="צעדי החישוב לפי סדר הזמן">
          {steps.map((step, stepIndex) => <li key={stepIndex}>
            <span className="timeline-number">{stepIndex + 1}</span>
            <span>מ־<bdi dir="ltr">{formatTime(step.from)}</bdi> עד <bdi dir="ltr">{formatTime(step.to)}</bdi><br /><strong>עוד {step.minutes === 60 ? 'שעה' : '5 דקות'}</strong></span>
            {stepIndex < steps.length - 1 && <span className="timeline-arrow" aria-hidden="true">↓</span>}
          </li>)}
        </ol>
        <p className="relative-summary">{hours ? <>מ־<bdi dir="ltr">{formatTime(example.start)}</bdi> עד <bdi dir="ltr">{formatTime(anchor)}</bdi>: {durationLabel(hours * 60)}.{minutes > 0 && <> ועוד {minutes} דקות עד <bdi dir="ltr">{formatTime(example.end)}</bdi>.</>}</> : <>ספרנו {steps.length} צעדים של 5 דקות: {minutes} דקות.</>}</p>
        {(example.start.hour === 11 || example.start.hour === 10 || example.start.hour === 9) && <p>אחרי אחת עשרה בבוקר מגיעה שתים עשרה בצהריים, ואחריה אחת בצהריים. ממשיכים קדימה לפי סדר האירועים וחלק היום.</p>}
      </section>
      <p className="relative-answer">{elapsed ? 'עברו' : 'נשארו'} {durationLabel(total)}.</p>
      <p>זהו משך זמן בין שתי שעות בשעון.</p>
    </section>
    <nav className="lesson-controls" aria-label="דוגמאות לזמן שעבר ונשאר">
      <button className="secondary-button" type="button" disabled={index === 0} onClick={() => setIndex(index - 1)}>הדוגמה הקודמת</button>
      <button className="start-button" type="button" disabled={index === 11} onClick={() => setIndex(index + 1)}>הדוגמה הבאה</button>
    </nav>
    <nav className="lesson-controls exercise-navigation" aria-label="תרגול זמן שעבר ונשאר">
      {(Object.keys(relativeTimePracticeTitles) as RelativeTimePracticeMode[]).map(mode => <button key={mode}
        ref={element => { entries.current[mode] = element; }} type="button" className="secondary-button"
        onClick={() => setPractice(mode)}>{relativeTimePracticeTitles[mode]}</button>)}
    </nav>
    <button className="secondary-button home-button" type="button" onClick={onHome}>חזרה לבית</button>
  </main>;
}
