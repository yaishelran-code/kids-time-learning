import { useEffect, useRef, useState } from 'react';
import { AnalogClock } from '../components/AnalogClock';
import { hourNames } from './examples';

const examples = [
  { hour: 7, minute: 0 }, { hour: 7, minute: 15 },
  { hour: 7, minute: 30 }, { hour: 7, minute: 45 },
  { hour: 12, minute: 15 }, { hour: 12, minute: 45 },
];
const comparisonMinutes = [0, 15, 30, 45];
function timeLabel(hour: number, minute: number) {
  return `השעה ${hourNames[hour % 12]}${minute === 15 ? ' ורבע' : minute === 30 ? ' וחצי' : minute === 45 ? ' ארבעים וחמש' : ''}`;
}
function digitalTime(hour: number, minute: number) {
  return `${hour}:${String(minute).padStart(2, '0')}`;
}

export function QuarterHoursLesson({ onHome }: { onHome: () => void }) {
  const [index, setIndex] = useState(0);
  const exampleHeading = useRef<HTMLHeadingElement>(null);
  useEffect(() => { exampleHeading.current?.focus(); }, [index]);
  const { hour, minute } = examples[index];
  const nextHour = hour % 12 + 1;
  const label = timeLabel(hour, minute);

  return <main className="home" dir="rtl">
    <header>
      <p className="eyebrow">מגלים את הזמן ביחד</p>
      <h1>לימוד רבע שעה</h1>
      <p className="welcome">רבע שעה = 15 דקות. ארבעה רבעים של שעה הם שעה שלמה — 60 דקות.</p>
      <p>שני המחוגים מתקדמים יחד: המחוג הארוך מראה את הדקות, והמחוג הקצר מתקדם אל השעה הבאה.</p>
    </header>
    <section className="clock-card" aria-labelledby="quarter-example-heading">
      <h2 id="quarter-example-heading" ref={exampleHeading} tabIndex={-1}>
        דוגמה {index + 1} מתוך {examples.length}: {label}
      </h2>
      <AnalogClock hour={hour} minute={minute} />
      <p className="digital-time" dir="ltr" aria-label={label}>{digitalTime(hour, minute)}</p>
      <p className="clock-caption">{label}</p>
      <p>{minute === 0
        ? `המחוג הארוך מצביע על 12. המחוג הקצר מצביע בדיוק על ${hour}.`
        : minute === 15
          ? `עברו 15 דקות — רבע שעה. המחוג הארוך מצביע על 3. המחוג הקצר התקדם רבע מהדרך מ־${hour} ל־${nextHour}.`
          : minute === 30
            ? `עברו 30 דקות — חצי שעה. המחוג הארוך מצביע על 6. המחוג הקצר התקדם חצי מהדרך מ־${hour} ל־${nextHour}.`
            : `עברו 45 דקות — שלושה רבעים של שעה. המחוג הארוך מצביע על 9. המחוג הקצר התקדם שלושה רבעים מהדרך מ־${hour} ל־${nextHour}.`}</p>
    </section>
    <nav className="lesson-controls" aria-label="דוגמאות לרבע שעה">
      <button className="secondary-button" type="button" disabled={index === 0} onClick={() => setIndex(index - 1)}>הדוגמה הקודמת</button>
      <button className="start-button" type="button" disabled={index === examples.length - 1} onClick={() => setIndex(index + 1)}>הדוגמה הבאה</button>
    </nav>
    <section className="quarter-comparison" aria-labelledby="quarter-comparison-heading">
      <h2 id="quarter-comparison-heading">משבע עד שמונה: כל רבע שעה המחוגים מתקדמים</h2>
      <div className="quarter-comparison-grid">
        {comparisonMinutes.map(value => <figure key={value}>
          <AnalogClock hour={7} minute={value} />
          <figcaption><bdi dir="ltr">{digitalTime(7, value)}</bdi><br />{timeLabel(7, value)}</figcaption>
        </figure>)}
      </div>
    </section>
    <button className="secondary-button home-button" type="button" onClick={onHome}>חזרה לבית</button>
  </main>;
}
