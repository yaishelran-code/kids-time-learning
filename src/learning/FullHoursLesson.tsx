import { useEffect, useRef, useState } from 'react';
import { AnalogClock } from '../components/AnalogClock';
import { examples, hourNames } from './examples';

export function FullHoursLesson({ onHome }: { onHome: () => void }) {
  const [index, setIndex] = useState(0);
  const heading = useRef<HTMLHeadingElement>(null);
  const example = examples[index];
  const timeLabel = `השעה ${hourNames[example.hour % 12]} ${example.period}`;

  useEffect(() => { heading.current?.focus(); }, []);

  return (
    <main className="home" dir="rtl">
      <header>
        <p className="eyebrow">מגלים את הזמן ביחד</p>
        <h1 ref={heading} tabIndex={-1}>שעות שלמות</h1>
        <p className="welcome">המחוג הארוך מצביע על 12. המחוג הקצר מראה את השעה.</p>
      </header>
      <section className="clock-card" aria-label="לומדים שעות שלמות">
        <AnalogClock hour={example.hour} />
        <div aria-live="polite" aria-atomic="true">
          <p className="digital-time" dir="ltr" aria-label={timeLabel}>{example.hour}:00</p>
          <p className="day-period"><span aria-hidden="true">{example.icon} </span>{example.period}</p>
          <p className="clock-caption">{timeLabel} — {example.activity}</p>
        </div>
      </section>
      <p>בבוקר ובערב המחוגים נראים אותו הדבר, אבל זה זמן אחר ביום!</p>
      <nav className="lesson-controls" aria-label="דוגמאות לשעות שלמות">
        <button className="secondary-button" type="button" disabled={index === 0} onClick={() => setIndex(index - 1)}>הדוגמה הקודמת</button>
        <button className="start-button" type="button" onClick={() => setIndex((index + 1) % examples.length)}>{index === examples.length - 1 ? 'נלמד שוב' : 'הדוגמה הבאה'}</button>
      </nav>
      <button className="secondary-button home-button" type="button" onClick={onHome}>חזרה לבית</button>
    </main>
  );
}
