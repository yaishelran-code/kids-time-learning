import { useEffect, useRef, useState } from 'react';
import { AnalogClock } from '../components/AnalogClock';
import { hourNames } from './examples';
import { ExactMinutesPractice, exactMinutesPracticeTitles, type ExactMinutesPracticeMode } from './ExactMinutesPractice';

const examples = [
  { hour: 8, minute: 0 }, { hour: 8, minute: 1 }, { hour: 8, minute: 4 },
  { hour: 8, minute: 5 }, { hour: 8, minute: 6 }, { hour: 8, minute: 7 },
  { hour: 8, minute: 9 }, { hour: 8, minute: 10 }, { hour: 8, minute: 23 },
  { hour: 8, minute: 37 }, { hour: 8, minute: 58 }, { hour: 8, minute: 59 },
  { hour: 9, minute: 0 }, { hour: 12, minute: 1 }, { hour: 12, minute: 59 },
];
const minuteNames: Record<number, string> = {
  1: 'דקה אחת', 4: 'ארבע דקות', 5: 'חמש דקות', 6: 'שש דקות', 7: 'שבע דקות',
  9: 'תשע דקות', 10: 'עשר דקות', 23: 'עשרים ושלוש דקות',
  37: 'שלושים ושבע דקות', 58: 'חמישים ושמונה דקות', 59: 'חמישים ותשע דקות',
};
function spokenTime(hour: number, minute: number) {
  return `השעה ${hourNames[hour % 12]}${minute ? ` ו${minuteNames[minute]}` : ''}`;
}
function digitalTime(hour: number, minute: number) {
  return `${hour}:${String(minute).padStart(2, '0')}`;
}
function explanation(hour: number, minute: number) {
  if (hour === 9 && minute === 0) return 'עברו 60 דקות מאז שמונה — שעה שלמה! המחוג הארוך חזר ל־12, הדקות חזרו ל־00 והמחוג הקצר הגיע ל־9.';
  if (minute === 0) return 'מתחילים בשמונה. המחוג הארוך מצביע על 12 והדקות הן 00.';
  const anchor = Math.floor(minute / 5) * 5;
  const steps = minute - anchor;
  const start = anchor === 0 ? 'מתחילים ב־12: 0 דקות' : `מתחילים במספר ${anchor / 5}: ${anchor} דקות`;
  return `${start}. ${steps ? steps === 1 ? `עוד צעד אחד של דקה מביא ל־${minute} ${minute === 1 ? "דקה" : "דקות"}.` : `עוד ${steps} צעדים של דקה מביאים ל־${minute} דקות.` : 'הגענו בדיוק לסימון של חמש דקות, בלי צעדים נוספים.'} המחוג הקצר התקדם מ־${hour} לכיוון ${hour % 12 + 1}.`;
}

export function ExactMinutesLesson({ onHome }: { onHome: () => void }) {
  const [index, setIndex] = useState(0);
  const [practice, setPractice] = useState<ExactMinutesPracticeMode | null>(null);
  const previousPractice = useRef<ExactMinutesPracticeMode | null>(null);
  const entries = useRef<Partial<Record<ExactMinutesPracticeMode, HTMLButtonElement | null>>>({});
  const exampleHeading = useRef<HTMLHeadingElement>(null);
  useEffect(() => { exampleHeading.current?.focus(); }, [index]);
  useEffect(() => {
    if (previousPractice.current && !practice) entries.current[previousPractice.current]?.focus();
    previousPractice.current = practice;
  }, [practice]);
  if (practice) return <ExactMinutesPractice key={practice} mode={practice} onLesson={() => setPractice(null)} onHome={onHome} />;
  const { hour, minute } = examples[index];
  const label = spokenTime(hour, minute);
  return <main className="home" dir="rtl">
    <header>
      <p className="eyebrow">מגלים את הזמן ביחד</p>
      <h1>לימוד דקות מדויקות</h1>
      <p className="welcome">בין שני סימונים קטנים עוברת דקה אחת.</p>
      <p>המספרים הגדולים מציינים שעות. הסימונים שעל שפת השעון מציינים דקות. בין שני מספרים סמוכים יש חמישה צעדים של דקה.</p>
      <p>המחוג הארוך מראה את הדקות. המחוג הקצר מתקדם מעט בכל דקה. סיבוב מלא הוא 60 דקות, ואז מתחילה שעה חדשה והדקות חוזרות ל־00.</p>
    </header>
    <section className="clock-card" aria-labelledby="exact-minutes-example-heading">
      <h2 id="exact-minutes-example-heading" ref={exampleHeading} tabIndex={-1}>דוגמה {index + 1} מתוך {examples.length}: {label}</h2>
      <AnalogClock hour={hour} minute={minute} highlightMinute timeDescription={`שעון אנלוגי: ${label}`} />
      <p className="digital-time" dir="ltr" aria-label={label}>{digitalTime(hour, minute)}</p>
      <p className="clock-caption">{label}</p>
      <p className="exact-minute-explanation">{explanation(hour, minute)}</p>
      <p>העיגול עם המסגרת והמשולש מסמנים את הדקה הנוכחית: {String(minute).padStart(2, '0')}.</p>
    </section>
    <nav className="lesson-controls" aria-label="דוגמאות לדקות מדויקות">
      <button className="secondary-button" type="button" disabled={index === 0} onClick={() => setIndex(index - 1)}>הדוגמה הקודמת</button>
      <button className="start-button" type="button" disabled={index === examples.length - 1} onClick={() => setIndex(index + 1)}>הדוגמה הבאה</button>
    </nav>
    <section className="quarter-comparison" aria-labelledby="exact-minutes-comparison-heading">
      <h2 id="exact-minutes-comparison-heading">מחמש לשבע דקות: בכל צעד עוברת דקה</h2>
      <div className="quarter-comparison-grid minutes-comparison-grid">
        {[5, 6, 7].map(value => <figure key={value}>
          <AnalogClock hour={8} minute={value} highlightMinute timeDescription={`שעון אנלוגי: ${spokenTime(8, value)}`} />
          <figcaption><bdi dir="ltr">{digitalTime(8, value)}</bdi><br />{spokenTime(8, value)}</figcaption>
        </figure>)}
      </div>
      <p>המספר 1 מייצג 5 דקות. צעד אחד מביא ל־6 דקות; עוד צעד מביא ל־7 דקות.</p>
    </section>
    <section className="quarter-comparison" aria-labelledby="exact-minutes-rollover-heading">
      <h2 id="exact-minutes-rollover-heading">משמונה לתשע: מתחילה שעה חדשה</h2>
      <div className="quarter-comparison-grid minutes-comparison-grid">
        {[{ hour: 8, minute: 58 }, { hour: 8, minute: 59 }, { hour: 9, minute: 0 }].map(time => <figure key={time.minute}>
          <AnalogClock {...time} highlightMinute timeDescription={`שעון אנלוגי: ${spokenTime(time.hour, time.minute)}`} />
          <figcaption><bdi dir="ltr">{digitalTime(time.hour, time.minute)}</bdi><br />{spokenTime(time.hour, time.minute)}</figcaption>
        </figure>)}
      </div>
      <p>אחרי 58 דקות מגיעות 59 דקות. אחרי עוד דקה עברו 60 דקות מאז שמונה: המחוג הארוך חוזר ל־12, הדקות חוזרות ל־00 והמחוג הקצר מגיע ל־9.</p>
    </section>
    <nav className="lesson-controls exercise-navigation" aria-label="תרגול דקות מדויקות">
      {(Object.keys(exactMinutesPracticeTitles) as ExactMinutesPracticeMode[]).map(mode => <button key={mode}
        ref={element => { entries.current[mode] = element; }} className="secondary-button" type="button"
        onClick={() => setPractice(mode)}>{exactMinutesPracticeTitles[mode]}</button>)}
    </nav>
    <button className="secondary-button home-button" type="button" onClick={onHome}>חזרה לבית</button>
  </main>;
}
