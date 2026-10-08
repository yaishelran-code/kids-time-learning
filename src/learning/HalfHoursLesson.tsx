import { useEffect, useRef, useState } from 'react';
import { AnalogClock } from '../components/AnalogClock';
import { hourNames } from './examples';

// Each full hour is immediately followed by half past the same hour.
const examples = [7, 8, 11, 12].flatMap(hour => [
  { hour, minute: 0 }, { hour, minute: 30 },
]);

export function HalfHoursLesson({ onHome }: { onHome: () => void }) {
  const [index, setIndex] = useState(0);
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => { heading.current?.focus(); }, []);
  const { hour, minute } = examples[index];
  const nextHour = hour % 12 + 1;
  const timeLabel = `השעה ${hourNames[hour % 12]}${minute === 30 ? ' וחצי' : ''}`;

  return (
    <main className="home" dir="rtl">
      <header>
        <p className="eyebrow">מגלים את הזמן ביחד</p>
        <h1 ref={heading} tabIndex={-1}>חצי שעה</h1>
        <p className="welcome">30 דקות הן חצי שעה. כשהמחוג הארוך מצביע על 6, עברה חצי שעה.</p>
        <p>המחוג הקצר כבר התקדם חצי מהדרך אל השעה הבאה.</p>
      </header>
      <section className="clock-card" aria-label="לומדים חצי שעה" aria-live="polite" aria-atomic="true">
        <AnalogClock hour={hour} minute={minute} />
        <p className="digital-time" dir="ltr" aria-label={timeLabel}>{hour}:{minute === 0 ? '00' : '30'}</p>
        <p className="clock-caption">{timeLabel}</p>
        <p>{minute === 0
          ? `המחוג הארוך מצביע על 12. המחוג הקצר מצביע בדיוק על ${hour}.`
          : `המחוג הארוך מצביע על 6. המחוג הקצר נמצא בדיוק באמצע בין ${hour} ל־${nextHour}.`}</p>
        {minute === 30 && <p>שימו לב: שני המחוגים זזו — המחוג הארוך הגיע ל־6, והמחוג הקצר התקדם חצי הדרך לשעה הבאה.</p>}
      </section>
      <nav className="lesson-controls" aria-label="דוגמאות לחצי שעה">
        <button className="secondary-button" type="button" disabled={index === 0} onClick={() => setIndex(index - 1)}>הדוגמה הקודמת</button>
        <button className="start-button" type="button" disabled={index === examples.length - 1} onClick={() => setIndex(index + 1)}>הדוגמה הבאה</button>
      </nav>
      {index === examples.length - 1 && <section aria-label="תרגול חצי שעה">
        <h2>מוכנים לתרגל חצי שעה?</h2>
        <button className="secondary-button" type="button" disabled>תרגול חצי שעה — בקרוב</button>
        <p>בינתיים אפשר לחזור לדוגמאות ולהסתכל שוב על שני המחוגים.</p>
      </section>}
      <button className="secondary-button home-button" type="button" onClick={onHome}>חזרה לבית</button>
    </main>
  );
}
