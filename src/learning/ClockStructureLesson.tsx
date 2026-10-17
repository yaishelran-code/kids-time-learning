import { useEffect, useRef, useState } from 'react';
import { AnalogClock } from '../components/AnalogClock';
import { hourNames } from './examples';
import { formatTime } from './clockTime';

export function ClockStructureLesson({ onHome, onFullHours, startHour = 7 }: { onHome: () => void; onFullHours: () => void; startHour?: number }) {
  const examples = [0,15,30,45,60].map(m=>({hour:m===60?startHour%12+1:startHour,minute:m%60}));
  const [index, setIndex] = useState(0);
  const [freeTime, setFreeTime] = useState({hour: startHour, minute: 0});
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => { heading.current?.focus(); }, []);
  const time = examples[index];
  return <main className="home" dir="rtl">
    <header><h1 ref={heading} tabIndex={-1}>מבנה השעון</h1><p>בואו נכיר את שני המחוגים ואת המספרים!</p></header>
    <section className="clock-card">
      <p>המחוג הקצר והעבה, בצבע סגול, מראה את השעות. המחוג הארוך והדק, בצבע ירוק, מראה את הדקות.</p>
      <p>על השעון יש 12 מספרים, מ־1 עד 12. אחרי 12 חוזרים ל־1. המחוג הקצר משלים סיבוב ב־12 שעות.</p>
      <section aria-label="התנסות בשני המחוגים" className="clock-play">
        <h2>בואו נשחק עם המחוגים</h2>
        <p>גררו את הידית העגולה של המחוג הקצר או של המחוג הארוך. אפשר גם לבחור מחוג ולהשתמש בחצים.</p>
        <p>שני המחוגים קשורים: כשמזיזים אחד, השני מתקדם יחד איתו. כאן אפשר לנסות בלי טעויות ובלי ניקוד.</p>
        <AnalogClock {...freeTime} onTimeChange={setFreeTime} minuteStep={1} bothHands />
        <p className="play-time" dir="ltr" aria-live="polite">{formatTime(freeTime)}</p>
        <p>חצי סיבוב של המחוג הקצר מקדם שש שעות; סיבוב מלא של הארוך מקדם שעה. בחצים: הקצר שעה בכל צעד, הארוך דקה.</p>
        <button type="button" className="secondary-button" onClick={() => setFreeTime({hour:startHour, minute:0})}>איפוס שעון ההתנסות</button>
      </section>
      <h2>נראה איך עוברת שעה</h2>
      <AnalogClock {...time} />
      <p className="digital-time" dir="ltr">{formatTime(time)}</p>
      <p role="status">עברו {index * 15} דקות מאז {hourNames[startHour % 12]}. {index === 4 ? `סיימנו את הדוגמאות. המחוג הארוך השלים סיבוב וחזר ל־12. המחוג הקצר הגיע ל־${startHour%12+1}!` : 'המחוגים מתקדמים בכיוון המספרים.'}</p>
      <p>סיבוב מלא של המחוג הארוך הוא 60 דקות — שעה אחת. בזמן הזה גם המחוג הקצר מתקדם אל השעה הבאה.</p>
    </section>
    <nav className="lesson-controls" aria-label="סיבוב המחוגים">
      <button className="secondary-button" type="button" disabled={index === 0} onClick={() => setIndex(index - 1)}>הצעד הקודם</button>
      <button className="start-button" type="button" onClick={() => setIndex(index === 4 ? 0 : index + 1)}>{index === 4 ? 'נראה שוב את הסיבוב' : 'עוד 15 דקות'}</button>
    </nav>
    <button className="start-button exercise-entry" type="button" onClick={onFullHours}>נמשיך לשעות שלמות</button>
    <button className="secondary-button home-button" type="button" onClick={onHome}>חזרה לבית</button>
  </main>;
}
