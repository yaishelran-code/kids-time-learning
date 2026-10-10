import { useEffect, useRef, useState } from 'react';
import { AnalogClock } from '../components/AnalogClock';
import { formatTime } from './clockTime';
const examples = [{hour:7,minute:0},{hour:7,minute:15},{hour:7,minute:30},{hour:7,minute:45},{hour:8,minute:0}];
export function ClockStructureLesson({ onHome, onFullHours }: { onHome: () => void; onFullHours: () => void }) {
  const [index, setIndex] = useState(0);
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => { heading.current?.focus(); }, []);
  const time = examples[index];
  return <main className="home" dir="rtl">
    <header><h1 ref={heading} tabIndex={-1}>מבנה השעון</h1><p>בואו נכיר את שני המחוגים ואת המספרים!</p></header>
    <section className="clock-card">
      <p>המחוג הקצר והעבה, בצבע סגול, מראה את השעות. המחוג הארוך והדק, בצבע ירוק, מראה את הדקות.</p>
      <p>על השעון יש 12 מספרים, מ־1 עד 12. אחרי 12 חוזרים ל־1. המחוג הקצר משלים סיבוב ב־12 שעות.</p>
      <AnalogClock {...time} />
      <p className="digital-time" dir="ltr">{formatTime(time)}</p>
      <p role="status">עברו {index * 15} דקות מאז שבע. {index === 4 ? 'המחוג הארוך השלים סיבוב וחזר ל־12. המחוג הקצר הגיע לשמונה!' : 'המחוגים מתקדמים בכיוון המספרים.'}</p>
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
