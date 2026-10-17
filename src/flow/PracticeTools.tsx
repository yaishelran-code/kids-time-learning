import { useEffect, useRef, useState } from 'react';
import { AnalogClock } from '../components/AnalogClock';
import { ClockStructureLesson } from '../learning/ClockStructureLesson';
import { formatTime } from '../learning/clockTime';
import { topicNames } from '../parent/state';
import { useFlow, type PracticeMeta } from './context';

/** The question stays mounted. The dialog owns only demonstration state. */
export function PracticeTools({ meta }: { meta: PracticeMeta }) {
  const flow = useFlow();
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [structure, setStructure] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLButtonElement>(null);
  const marker = useRef<string | null>(null);
  const serialized = JSON.stringify(meta);
  useEffect(() => { flow?.report(JSON.parse(serialized)); }, [serialized, flow?.report]);
  useEffect(() => {
    if (!open) return;
    const element = dialog.current!;
    element.showModal?.();
    const previous = history.state;
    const id = crypto.randomUUID(); marker.current = id;
    history.pushState({ ...previous, help: id }, '');
    const back = (event: PopStateEvent) => { event.stopImmediatePropagation(); marker.current = null; setOpen(false); opener.current?.focus(); };
    window.addEventListener('popstate', back, true);
    return () => { element.close?.(); window.removeEventListener('popstate', back, true); };
  }, [open]);
  function close() {
    if (marker.current && history.state?.help === marker.current) history.back();
    else { setOpen(false); opener.current?.focus(); }
  }
  // A different hour avoids displaying the current clock's answer in any clock-level help.
  const example = {hour: ((meta.hour ?? 7) + 4) % 12 || 12, minute: {full:0,half:30,quarter:15,five:20,exact:23,relative:0,day:0}[meta.topic]};
  return <section className="practice-tools" aria-label="עזרה והמשך">
    {!meta.completed && <button ref={opener} className="secondary-button" type="button" onClick={() => { setExpanded(false); setStructure(false); setOpen(true); }}>צריך עזרה?</button>}
    {meta.completed && flow && <button className="start-button" type="button" onClick={flow.nextTopic}>{flow.nextLabel}</button>}
    {open && <dialog ref={dialog} open={typeof HTMLDialogElement.prototype.showModal !== 'function'} className="help-dialog" dir="rtl" aria-label="עזרה לשאלה" onCancel={event => { event.preventDefault(); close(); }}>
      <h2 tabIndex={-1}>נלמד יחד — {topicNames[meta.topic]}</h2>
      <p>זו דוגמה אחרת כדי ללמוד את הדרך. השאלה שלכם מחכה בדיוק כפי שהשארתם אותה.</p>
      {structure ? <ClockStructureLesson startHour={example.hour} onHome={close} onFullHours={() => { setStructure(false); setExpanded(true); }} /> : <>
        {['relative','day'].includes(meta.topic) ? <>
          {meta.topic === 'relative' ? <>
            <p>{meta.kind === 'remaining' ? 'כדי לדעת כמה נשאר, סופרים מעכשיו עד תחילת הפעילות.' : 'כדי לדעת כמה זמן עבר, סופרים מההתחלה עד עכשיו.'}</p>
            <p>סוג השאלה: {meta.stage}. נתחיל בשעות השלמות, נגיע לשעה עגולה כשצריך, ואז נוסיף את הדקות.</p>
            {expanded && <p>למשל: מקריאה שהתחילה בשש וחמישים עד שבע ועשר, סופרים עשר דקות עד שבע ועוד עשר אחריה. מחברים את שני החלקים. משך זמן אומר כמה עבר, ולא מה השעה.</p>}
          </> : <>
            <p>{meta.kind === 'compare' ? 'אותם מחוגים יכולים להופיע פעמיים ביום. בודקים כל סיפור בנפרד, לפי האור וסדר האירועים.' : 'לא די להסתכל במחוגים. חפשו בסיפור מה כבר קרה: האם היום התחיל, הגיע לאמצעו או הסתיים?'}</p>
            {expanded && <p>סדר חלקי היום הוא בוקר, צהריים, אחר הצהריים, ערב ולילה. פעילות לבדה אינה קובעת את חלק היום: חשוב לקרוא את ההקשר.</p>}
          </>}
        </> : <>
          <AnalogClock {...example} showMinuteLabels={meta.topic === 'five'} highlightMinute={meta.topic === 'exact'} />
          <p className="digital-time" dir="ltr">{formatTime(example)}</p>
          <p>{({full:'מחפשים את המחוג הקצר כדי לדעת את השעה. כשהארוך על 12, זו שעה שלמה.',half:'המחוג הארוך על 6 אומר שעברו 30 דקות. הקצר באמצע הדרך לשעה הבאה.',quarter:'על 3 עברו 15 דקות, ועל 9 עברו 45 דקות. הקצר מתקדם בהתאם.',five:'כל מספר בשעון הוא עוד חמש דקות: 1 הוא 5, 2 הוא 10, וכן הלאה.',exact:'מתחילים מכפולת חמש הקרובה ומוסיפים דקה לכל סימון קטן.',relative:'',day:''})[meta.topic]}</p>
          {expanded && <p>קוראים קודם את השעה שהמחוג הקצר כבר עבר, ואז את הדקות שמראה הארוך. גם כשקרובים לשעה הבאה, מחכים שהקצר יגיע אליה.</p>}
        </>}
        {!expanded && <button type="button" className="secondary-button" onClick={() => setExpanded(true)}>נלמד עוד</button>}
        <button type="button" className="secondary-button exercise-entry" onClick={() => setStructure(true)}>נכיר את המחוגים</button>
      </>}
      <button type="button" className="start-button exercise-entry" onClick={close}>חזרה לשאלה</button>
    </dialog>}
  </section>;
}
