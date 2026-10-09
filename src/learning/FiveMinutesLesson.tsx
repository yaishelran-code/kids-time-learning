import { useEffect, useRef, useState } from 'react';
import { AnalogClock } from '../components/AnalogClock';
import { hourNames } from './examples';

const examples = [
  ...Array.from({ length: 13 }, (_, index) => ({ hour: index === 12 ? 9 : 8, minute: index === 12 ? 0 : index * 5 })),
  { hour: 12, minute: 5 }, { hour: 12, minute: 55 },
];
const minuteNames: Record<number, string> = {
  5: 'חמש', 10: 'עשר', 15: 'חמש עשרה', 20: 'עשרים', 25: 'עשרים וחמש',
  30: 'שלושים', 35: 'שלושים וחמש', 40: 'ארבעים', 45: 'ארבעים וחמש',
  50: 'חמישים', 55: 'חמישים וחמש',
};
function spokenTime(hour: number, minute: number) {
  return `השעה ${hourNames[hour % 12]}${minute ? ` ו${minuteNames[minute]} דקות` : ''}`;
}
function digitalTime(hour: number, minute: number) {
  return `${hour}:${String(minute).padStart(2, '0')}`;
}

export function FiveMinutesLesson({ onHome }: { onHome: () => void }) {
  const [index, setIndex] = useState(0);
  const [showMinuteLabels, setShowMinuteLabels] = useState(false);
  const exampleHeading = useRef<HTMLHeadingElement>(null);
  useEffect(() => { exampleHeading.current?.focus(); }, [index]);
  const { hour, minute } = examples[index];
  const label = spokenTime(hour, minute);
  const connection = minute === 15 ? 'רבע שעה' : minute === 30 ? 'חצי שעה' : minute === 45 ? 'שלושה רבעים של שעה' : '';

  return <main className="home" dir="rtl">
    <header>
      <p className="eyebrow">מגלים את הזמן ביחד</p>
      <h1>לימוד דקות</h1>
      <p className="welcome">בין מספר למספר עוברות 5 דקות.</p>
      <p>המחוג הארוך מראה את הדקות. המחוג הקצר מתקדם מעט בכל צעד אל השעה הבאה.</p>
      <p>סיבוב מלא הוא 60 דקות. כשהמחוג הארוך חוזר ל־12, מתחילה שעה חדשה ותצוגת הדקות חוזרת ל־00.</p>
    </header>
    <section className="clock-card" aria-labelledby="minutes-example-heading">
      <h2 id="minutes-example-heading" ref={exampleHeading} tabIndex={-1}>דוגמה {index + 1} מתוך {examples.length}: {label}</h2>
      <AnalogClock hour={hour} minute={minute} showMinuteLabels={showMinuteLabels} timeDescription={`שעון אנלוגי: ${label}`} />
      <p className="digital-time" dir="ltr" aria-label={label}>{digitalTime(hour, minute)}</p>
      <p className="clock-caption">{label}</p>
      <p>{index === 12
        ? 'עברו 60 דקות מאז שמונה — שעה שלמה! המחוג הארוך חזר ל־12, הדקות חזרו ל־00 והמחוג הקצר הגיע ל־9.'
        : minute === 0
          ? 'מתחילים בשמונה. המחוג הארוך מצביע על 12 והדקות הן 00.'
          : `עברו ${minute} דקות מאז ${hourNames[hour % 12]}. המחוג הארוך מצביע על ${minute / 5}, והמחוג הקצר התקדם מ־${hour} לכיוון ${hour % 12 + 1}.`}</p>
      {connection && <p>{minute} דקות הן {connection} — כמו שכבר למדנו!</p>}
      <button className="secondary-button" type="button" aria-pressed={showMinuteLabels} onClick={() => setShowMinuteLabels(!showMinuteLabels)}>סימוני דקות ליד המספרים</button>
    </section>
    <nav className="lesson-controls" aria-label="דוגמאות לדקות">
      <button className="secondary-button" type="button" disabled={index === 0} onClick={() => setIndex(index - 1)}>הדוגמה הקודמת</button>
      <button className="start-button" type="button" disabled={index === examples.length - 1} onClick={() => setIndex(index + 1)}>הדוגמה הבאה</button>
    </nav>
    <section className="minute-mapping" aria-labelledby="minute-mapping-heading">
      <h2 id="minute-mapping-heading">מספרי השעון והדקות</h2>
      <ul>{Array.from({ length: 11 }, (_, index) => <li key={index}>המספר {index + 1}: {(index + 1) * 5} דקות</li>)}</ul>
      <p>ב־12 עברו 60 דקות — שעה חדשה, והדקות שוב 00.</p>
    </section>
    <section className="quarter-comparison" aria-labelledby="minutes-comparison-heading">
      <h2 id="minutes-comparison-heading">בכל צעד עברו עוד 5 דקות</h2>
      <div className="quarter-comparison-grid minutes-comparison-grid">
        {[5, 10, 15].map(value => <figure key={value}>
          <AnalogClock hour={8} minute={value} timeDescription={`שעון אנלוגי: ${spokenTime(8, value)}`} />
          <figcaption><bdi dir="ltr">{digitalTime(8, value)}</bdi><br />{spokenTime(8, value)}</figcaption>
        </figure>)}
      </div>
      <p>משמונה וחמש דקות לשמונה ועשר דקות עברו 5 דקות. משמונה ועשר דקות לשמונה וחמש עשרה דקות עברו עוד 5 דקות.</p>
    </section>
    <button className="secondary-button home-button" type="button" onClick={onHome}>חזרה לבית</button>
  </main>;
}
