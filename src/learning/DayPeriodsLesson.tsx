import { useEffect, useRef, useState } from 'react';
import { AnalogClock } from '../components/AnalogClock';
import { formatTime } from './clockTime';
import { dayExamples, dayPeriodAt, dayPeriods, sameClockPairs, type DayExample } from './dayPeriods';

function ContextClock({ example }: { example: DayExample }) {
  const period = dayPeriodAt(example.minutes);
  const label = `${formatTime(example.time)} ${period.context}`;
  return <figure className="day-context-clock">
    <p className="day-period"><span aria-hidden="true">{period.icon} </span>{period.name}</p>
    <AnalogClock {...example.time} timeDescription={label} />
    <figcaption>
      <span className="day-time"><bdi className="digital-time" dir="ltr">{formatTime(example.time)}</bdi> <span>{period.context}</span></span>
      <p className="clock-caption">{example.activity}</p>
    </figcaption>
  </figure>;
}

export function DayPeriodsLesson({ onHome }: { onHome: () => void }) {
  const [index, setIndex] = useState(0);
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => { heading.current?.focus(); }, [index]);
  const example = dayExamples[index];
  return <main className="home" dir="rtl">
    <header>
      <p className="eyebrow">מגלים את הזמן ביחד</p>
      <h1>לימוד חלקי היום</h1>
      <p className="welcome">אותה שעה בשעון, סיפור אחר ביום!</p>
      <p>הפעילויות כאן הן דוגמאות. אצל משפחות שונות עושים דברים בשעות שונות, וזה בסדר.</p>
    </header>
    <section className="day-sequence" aria-labelledby="day-sequence-heading">
      <h2 id="day-sequence-heading">חלקי היום לפי הסדר</h2>
      <p>מתקדמים מלמעלה למטה לפי החצים.</p>
      <ol aria-label="סדר חלקי היום">
        {dayPeriods.map((period, i) => <li key={period.id} aria-current={period.id === dayPeriodAt(example.minutes).id ? 'step' : undefined}>
          <span aria-hidden="true">{period.icon} </span>{period.name}
          {i < dayPeriods.length - 1 && <span className="day-sequence-arrow" aria-hidden="true">↓</span>}
        </li>)}
      </ol>
      <p className="day-new-morning">אחרי הלילה מגיע הבוקר של יום חדש! <span aria-hidden="true">🌅</span></p>
    </section>
    <section className="clock-card day-example" aria-labelledby="day-example-heading">
      <h2 id="day-example-heading" ref={heading} tabIndex={-1}>דוגמה {index + 1} מתוך {dayExamples.length}</h2>
      <ContextClock example={example} />
      <p className="day-story">{example.story}</p>
    </section>
    <nav className="lesson-controls" aria-label="דוגמאות לחלקי היום">
      <button type="button" className="secondary-button" disabled={index === 0} onClick={() => setIndex(index - 1)}>הדוגמה הקודמת</button>
      <button type="button" className="start-button" disabled={index === dayExamples.length - 1} onClick={() => setIndex(index + 1)}>הדוגמה הבאה</button>
    </nav>
    <section className="day-comparisons" aria-labelledby="day-comparisons-heading">
      <h2 id="day-comparisons-heading">אותם מחוגים, חלק אחר ביום</h2>
      <p>השעון לבדו לא אומר אם זו שעה בבוקר או בערב. צריך לדעת גם את חלק היום.</p>
      {sameClockPairs.map(pair => <section className="day-comparison" key={pair[0].minutes} aria-label={`השוואת ${formatTime(pair[0].time)}`}>
        <h3><bdi dir="ltr">{formatTime(pair[0].time)}</bdi>: {dayPeriodAt(pair[0].minutes).name} מול {dayPeriodAt(pair[1].minutes).name}</h3>
        <div className="day-comparison-grid">{pair.map(item => <div key={item.minutes}><ContextClock example={item} /><p>{item.story}</p></div>)}</div>
        <p>המחוגים זהים, אבל חלק היום, הסיפור והסמל שונים.</p>
      </section>)}
    </section>
    <button type="button" className="secondary-button home-button" onClick={onHome}>חזרה לבית</button>
  </main>;
}
