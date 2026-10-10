import { useEffect, useRef, useState } from 'react';
import { AnalogClock } from '../components/AnalogClock';
import { formatTime, timeFromMinutes } from '../learning/clockTime';
import { dayPeriodAt, dayPeriods } from '../learning/dayPeriods';
import { loadActivities, resolveActivityTime, saveActivities, sortedActivities, type Activity, type PeriodId } from './activities';

export function MyDay({ onHome }: { onHome: () => void }) {
  const [loaded] = useState(loadActivities);
  const [activities, setActivities] = useState(loaded.activities);
  const [storageError, setStorageError] = useState(loaded.error ? 'לא הצלחנו לטעון את הפעילויות. הנתונים השמורים לא שונו. אפשר לנסות שוב ברענון.' : '');
  const [saveFailed, setSaveFailed] = useState(false);
  const [editing, setEditing] = useState<string | null | undefined>(undefined);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [hour, setHour] = useState(7);
  const [minute, setMinute] = useState(0);
  const [period, setPeriod] = useState<PeriodId>('morning');
  const [error, setError] = useState('');
  const heading = useRef<HTMLHeadingElement>(null);
  const nameInput = useRef<HTMLInputElement>(null);
  const addButton = useRef<HTMLButtonElement>(null);
  const cancelDelete = useRef<HTMLButtonElement>(null);
  const deleteButtons = useRef<Record<string, HTMLButtonElement | null>>({});
  useEffect(() => { heading.current?.focus(); }, []);
  useEffect(() => { if (editing !== undefined) nameInput.current?.focus(); }, [editing]);
  useEffect(() => { if (deleting !== null) cancelDelete.current?.focus(); }, [deleting]);
  function commit(next: Activity[]) {
    setActivities(next);
    const saved = saveActivities(next);
    setSaveFailed(!saved);
    setStorageError(saved ? '' : 'לא הצלחנו לשמור במכשיר. השינויים מופיעים כאן כרגע, אבל עלולים להיעלם ברענון. נסו לשמור שוב.');
  }
  function start(activity?: Activity) {
    setDeleting(null); setEditing(activity?.id ?? null); setError('');
    setName(activity?.name ?? '');
    const time = timeFromMinutes(activity?.minutes ?? 420, 1);
    setHour(time.hour); setMinute(time.minute); setPeriod(dayPeriodAt(activity?.minutes ?? 420).id);
  }
  function closeForm() { setEditing(undefined); setError(''); addButton.current?.focus(); }
  const pendingDelete = activities.find(item => item.id === deleting);
  return <main className="home my-day" dir="rtl">
    <header><h1 ref={heading} tabIndex={-1}>היום שלי</h1>
      <p>הפעילויות שלי ביום רגיל — בלי תאריך ובלי משך זמן.</p>
      <p>הפעילויות נשמרות רק בדפדפן הזה ובמכשיר הזה.</p>
      <p>הרשימה מסודרת מתחילת היום בחצות, לפי השעה.</p>
    </header>
    {storageError && <section className="storage-message" role="alert"><p>{storageError}</p>
      {saveFailed && <button type="button" className="secondary-button" onClick={() => { const saved = saveActivities(activities); setSaveFailed(!saved); setStorageError(saved ? '' : 'עדיין לא הצלחנו לשמור. השינויים נשארים כאן עד שתעזבו או תרעננו.'); }}>נסו לשמור שוב</button>}
    </section>}
    <button ref={addButton} type="button" className="start-button" onClick={() => start()}>הוספת פעילות</button>
    {editing !== undefined && <form className="clock-card activity-form" onSubmit={event => {
      event.preventDefault();
      if (!name.trim()) { setError('כתבו שם לפעילות, למשל משחק עם חברים.'); nameInput.current?.focus(); return; }
      const minutes = resolveActivityTime(hour, minute, period);
      if (minutes === null) { setError('השעה וחלק היום לא מתאימים. בחרו חלק יום אחר או שנו את השעה. למשל, שבע יכולה להיות בבוקר או בערב.'); return; }
      const item = { id: editing ?? crypto.randomUUID(), name: name.trim(), minutes };
      commit(editing === null ? [...activities, item] : activities.map(value => value.id === editing ? item : value)); closeForm();
    }}>
      <h2>{editing === null ? 'פעילות חדשה' : 'עריכת פעילות'}</h2>
      <label>שם הפעילות<input ref={nameInput} value={name} onChange={event => { setName(event.target.value); setError(''); }} /></label>
      <div className="activity-time-fields">
        <label>שעה<select aria-label="שעה" value={hour} onChange={event => { setHour(Number(event.target.value)); setError(''); }}>{Array.from({ length: 12 }, (_, i) => <option key={i + 1} value={i + 1}>{i + 1}</option>)}</select></label>
        <label>דקות<select aria-label="דקות" value={minute} onChange={event => { setMinute(Number(event.target.value)); setError(''); }}>{Array.from({ length: 60 }, (_, i) => <option key={i} value={i}>{String(i).padStart(2, '0')}</option>)}</select></label>
      </div>
      <label>חלק ביום<select aria-label="חלק ביום" value={period} onChange={event => { setPeriod(event.target.value as PeriodId); setError(''); }}>{dayPeriods.map(value => <option key={value.id} value={value.id}>{value.name}</option>)}</select></label>
      <p className="digital-time" dir="ltr">{formatTime({ hour, minute })}</p>
      {error && <p role="alert">{error}</p>}
      <div className="lesson-controls"><button className="start-button" type="submit">שמירת פעילות</button><button className="secondary-button" type="button" onClick={closeForm}>ביטול</button></div>
    </form>}
    {pendingDelete && <section className="clock-card" role="alertdialog" aria-labelledby="delete-heading" aria-describedby="delete-description">
      <h2 id="delete-heading">למחוק את הפעילות?</h2><p id="delete-description">{pendingDelete.name} — המחיקה תסיר אותה מהיום שלי.</p>
      <div className="lesson-controls"><button ref={cancelDelete} className="secondary-button" type="button" onClick={() => { setDeleting(null); deleteButtons.current[pendingDelete.id]?.focus(); }}>ביטול מחיקה</button>
        <button className="secondary-button" type="button" onClick={() => { commit(activities.filter(item => item.id !== deleting)); setDeleting(null); addButton.current?.focus(); }}>כן, למחוק</button></div>
    </section>}
    {activities.length === 0 ? <p className="empty-day">עדיין אין פעילויות ביום שלי. לחצו על הוספת פעילות כדי להתחיל!</p> :
      <ol className="activity-list" aria-label="הפעילויות שלי לפי השעה">{sortedActivities(activities).map(item => {
        const time = timeFromMinutes(item.minutes, 1); const context = dayPeriodAt(item.minutes);
        return <li key={item.id} className="clock-card" aria-label={item.name}>
          <h2>{item.name}</h2><AnalogClock {...time} timeDescription={`${item.name}: ${formatTime(time)} ${context.context}`} />
          <p className="activity-time"><bdi className="digital-time" dir="ltr">{formatTime(time)}</bdi> <span>{context.context}</span></p>
          <div className="lesson-controls"><button className="secondary-button" type="button" aria-label={`עריכת ${item.name}`} onClick={() => start(item)}>עריכה</button>
            <button ref={element => { deleteButtons.current[item.id] = element; }} className="secondary-button" type="button" aria-label={`מחיקת ${item.name}`} onClick={() => { setEditing(undefined); setDeleting(item.id); }}>מחיקה</button></div>
        </li>;
      })}</ol>}
    <button className="secondary-button home-button" type="button" onClick={onHome}>חזרה לבית</button>
  </main>;
}
