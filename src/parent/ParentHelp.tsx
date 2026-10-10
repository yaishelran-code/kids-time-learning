import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { useRewards } from '../rewards/Rewards';
import { emptyParentState, readParentState, recordAttempt, topicNames, validPin, writeParentState, type ParentState, type Topic } from './state';
const ParentContext = createContext<null | {
  state: ParentState; blocked: boolean; attempt: (topic: Topic, correct: boolean) => boolean;
  unlock: (topic?: Topic) => boolean; recover: () => boolean;
}>(null);
export function ParentHelpProvider({ children }: { children: ReactNode }) {
  const [loaded] = useState(readParentState);
  const [state, setState] = useState(loaded.state);
  const [blocked, setBlocked] = useState(loaded.blocked);
  const current = useRef(state);
  const unreadable = useRef(blocked);
  const [failed, setFailed] = useState(false);
  function commit(next: ParentState) {
    current.current = next; setState(next); setFailed(!writeParentState(next));
  }
  return <ParentContext.Provider value={{ state, blocked,
    attempt: (topic, correct) => {
      if (unreadable.current || current.current.mistakes[topic] >= 3) return false;
      commit(recordAttempt(current.current, topic, correct)); return true;
    },
    unlock: topic => {
      if (unreadable.current) return false;
      const mistakes = { ...current.current.mistakes };
      if (topic) mistakes[topic] = 0;
      else for (const key of Object.keys(topicNames) as Topic[]) if (mistakes[key] >= 3) mistakes[key] = 0;
      commit({ ...current.current, mistakes }); return true;
    },
    recover: () => {
      const next = emptyParentState();
      if (!writeParentState(next)) return false;
      current.current = next; unreadable.current = false;
      setState(next); setBlocked(false); setFailed(false); return true;
    },
  }}>
    {children}
    {(blocked || failed) && <aside className="home parent-storage" dir="rtl" role="alert">
      <p>{blocked ? 'לא הצלחנו לקרוא את נתוני עזרת ההורה. המענה בתרגולים חסום עד התאוששות באזור ההורה. הבית והשיעורים זמינים. הנתונים השמורים לא יוחלפו ללא אישור.' : 'לא הצלחנו לשמור את נתוני עזרת ההורה. המונים והעצירות נשארים כאן כרגע; רענון או סגירה עלולים לאבד שינויים שלא נשמרו.'}</p>
      {!blocked && <button type="button" className="secondary-button" onClick={() => setFailed(!writeParentState(current.current))}>נסו לשמור עזרת הורה שוב</button>}
    </aside>}
  </ParentContext.Provider>;
}
export function useParentHelp() {
  const context = useContext(ParentContext);
  if (!context) throw new Error('ParentHelpProvider is required');
  return context;
}
export function usePracticeHelp(topic: Topic) {
  const help = useParentHelp();
  const paused = help.blocked || help.state.mistakes[topic] >= 3;
  const wasPaused = useRef(paused);
  useEffect(() => {
    if (wasPaused.current && !paused) document.querySelector<HTMLElement>('main h1')?.focus();
    wasPaused.current = paused;
  }, [paused]);
  return { paused, attempt: (correct: boolean) => help.attempt(topic, correct) };
}
function FocusHeading({ children }: { children: ReactNode }) {
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => { heading.current?.focus(); }, []);
  return <h1 tabIndex={-1} ref={heading}>{children}</h1>;
}
export function PinForm({ onVerified }: { onVerified: () => void }) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  return <form className="parent-pin" onSubmit={event => {
    event.preventDefault();
    if (validPin(pin)) { setPin(''); setError(false); onVerified(); }
    else { setPin(''); setError(true); }
  }}>
    <label htmlFor="parent-pin">קוד הורה — ארבע ספרות</label>
    <input id="parent-pin" type="password" inputMode="numeric" pattern="[0-9]{4}" minLength={4} maxLength={4} required
      autoComplete="off" value={pin} aria-describedby={error ? 'pin-error' : undefined}
      onChange={event => { setPin(event.target.value.replace(/[^0-9]/g, '').slice(0, 4)); setError(false); }} />
    <button type="submit" className="start-button">אישור קוד הורה</button>
    {error && <p id="pin-error" role="alert">הקוד אינו נכון. בקשו עזרה ממבוגר ונסו שוב.</p>}
  </form>;
}
export function PracticePause({ topic, onLesson, onHome }: { topic: Topic; onLesson: () => void; onHome: () => void }) {
  const help = useParentHelp();
  return <main className="home" dir="rtl">
    <FocusHeading>בואו נעצור רגע</FocusHeading>
    <p>בואו נעצור רגע. כדאי לבקש עזרה מאמא, אבא או מבוגר שמלווה אותך.</p>
    <p>הנושא: {topicNames[topic]}</p>
    {help.blocked ? <p>כדי להתאושש מנתוני עזרת הורה שלא ניתן לקרוא, חזרו לבית והיכנסו לאזור ההורה.</p>
      : <PinForm onVerified={() => help.unlock(topic)} />}
    <nav className="lesson-controls" aria-label="חזרה">
      <button type="button" className="secondary-button" onClick={onLesson}>חזרה ללימוד</button>
      <button type="button" className="secondary-button" onClick={onHome}>חזרה לבית</button>
    </nav>
  </main>;
}
export function ParentArea({ onHome }: { onHome: () => void }) {
  const help = useParentHelp();
  const rewards = useRewards();
  const [authenticated, setAuthenticated] = useState(false);
  const [confirmation, setConfirmation] = useState<'rewards' | 'recovery' | null>(null);
  const [message, setMessage] = useState('');
  const dashboardHeading = useRef<HTMLHeadingElement>(null);
  useEffect(() => { if (authenticated) dashboardHeading.current?.focus(); }, [authenticated]);
  const confirmationHeading = useRef<HTMLHeadingElement>(null);
  const resetButton = useRef<HTMLButtonElement>(null);
  const previousConfirmation = useRef(confirmation);
  useEffect(() => {
    if (confirmation) confirmationHeading.current?.focus();
    else if (previousConfirmation.current) resetButton.current?.focus();
    previousConfirmation.current = confirmation;
  }, [confirmation]);
  const paused = (Object.keys(topicNames) as Topic[]).filter(topic => help.state.mistakes[topic] >= 3);
  return <main className="home" dir="rtl">
    <FocusHeading>אזור הורה</FocusHeading>
    {!authenticated ? <PinForm onVerified={() => setAuthenticated(true)} /> : <>
      <h2 ref={dashboardHeading} tabIndex={-1}>נושאים שממתינים לעזרה</h2>
      {help.blocked ? <p>נתוני עזרת ההורה אינם זמינים. נדרשת התאוששות מפורשת כדי לאפשר מענה.</p> : <>
        {paused.length === 0 ? <p>אין נושאים שממתינים לעזרה.</p> : <ul className="parent-topics">{paused.map(topic => <li key={topic}>{topicNames[topic]} <button type="button" className="secondary-button" onClick={() => { help.unlock(topic); setMessage(`נפתח הנושא: ${topicNames[topic]}`); }}>פתיחת {topicNames[topic]}</button></li>)}</ul>}
        {paused.length > 0 && <button type="button" className="secondary-button" onClick={() => { help.unlock(); setMessage('נפתחו כל הנושאים שנעצרו.'); }}>פתיחת כל הנושאים</button>}
      </>}
      {confirmation ? <section className="clock-card parent-confirmation" aria-label="אישור נוסף">
        <h2 ref={confirmationHeading} tabIndex={-1}>אישור נוסף</h2>
        <p>{confirmation === 'rewards' ? 'האיפוס ימחק את כל הנקודות והכוכבים וינעל מחדש את הדמויות. הפעילויות האישיות ותוצאת בדיקת הידע יישמרו. האם להמשיך?' : 'ההתאוששות תאפס את מוני הטעויות ואת כל העצירות בלבד. התגמולים, תוצאת בדיקת הידע והפעילויות האישיות יישמרו. האם להמשיך?'}</p>
        <button type="button" className="start-button" onClick={() => {
          const ok = confirmation === 'rewards' ? rewards.reset() : help.recover();
          setMessage(ok ? (confirmation === 'rewards' ? 'התגמולים והאוסף אופסו ונשמרו.' : 'נתוני עזרת ההורה אופסו ונשמרו.') : 'לא הצלחנו לשמור את האיפוס. המצב הקודם נשמר. אפשר לנסות שוב.');
          if (ok) setConfirmation(null);
        }}>אישור האיפוס</button>
        <button type="button" className="secondary-button" onClick={() => { setConfirmation(null); setMessage(''); }}>ביטול</button>
      </section> : <div className="lesson-controls">
        <button ref={resetButton} type="button" className="secondary-button" onClick={() => { setConfirmation('rewards'); setMessage(''); }}>איפוס התגמולים והאוסף</button>
        {help.blocked && <button type="button" className="secondary-button" onClick={() => { setConfirmation('recovery'); setMessage(''); }}>התאוששות נתוני עזרת הורה</button>}
      </div>}
      <p role="status" aria-live="polite">{message}</p>
    </>}
    <button type="button" className="secondary-button home-button" onClick={onHome}>חזרה לבית</button>
  </main>;
}
