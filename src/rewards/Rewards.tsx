import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { characters, emptyLedger, grant, readLedger, restartRun, writeLedger, type Ledger, type PracticeId } from './ledger';
const rewardContext = createContext<null | { ledger: Ledger; award: (practice: PracticeId, index: number) => ReturnType<typeof grant>; restart: (practice: PracticeId) => void; reset: () => boolean }>(null);
const starLabel = (count: number) => count === 1 ? 'כוכב אחד' : `${count} כוכבים`;
export const rewardSuccess = 'כל הכבוד! קיבלת כוכב ו־10 נקודות';
export function RewardsProvider({ children }: { children: ReactNode }) {
  const [loaded] = useState(readLedger);
  const [blocked, setBlocked] = useState(loaded.blocked);
  const [ledger, setLedger] = useState(loaded.ledger);
  // Synchronous source of truth prevents stale React state from granting twice.
  const current = useRef(ledger);
  const unreadable = useRef(blocked);
  const [failed, setFailed] = useState(false);
  function commit(next: Ledger) {
    current.current = next; setLedger(next);
    if (!unreadable.current) setFailed(!writeLedger(next));
  }
  function award(practice: PracticeId, index: number) {
    const result = grant(current.current, practice, index);
    if (result.awarded) commit(result.ledger);
    return result;
  }
  return <rewardContext.Provider value={{ledger, award, restart: practice => commit(restartRun(current.current, practice)), reset: () => {
    const next = emptyLedger();
    if (!writeLedger(next)) return false;
    current.current = next; unreadable.current = false; setLedger(next); setBlocked(false); setFailed(false); return true;
  }}}>
    {children}
    {(blocked || failed) && <aside className="home reward-storage" dir="rtl" role="alert">
      <p>{blocked ? 'לא הצלחנו לקרוא את התגמולים השמורים. לא נחליף את הנתונים השמורים. אפשר להמשיך לתרגל, אבל התגמולים החדשים נשמרים רק כאן כרגע. כדאי לבקש עזרה ממבוגר.' : 'לא הצלחנו לשמור את התגמולים במכשיר. הם נשארים כאן כרגע, אבל עלולים להיעלם ברענון או בסגירת הדף.'}</p>
      {!blocked && <button className="secondary-button" type="button" onClick={() => setFailed(!writeLedger(current.current))}>נסו לשמור תגמולים שוב</button>}
    </aside>}
  </rewardContext.Provider>;
}
export function useRewards() {
  const context = useContext(rewardContext);
  if (!context) throw new Error('RewardsProvider is required');
  return context;
}
export function usePracticeRewards(practice: PracticeId, index: number) {
  const rewards = useRewards();
  const [last, setLast] = useState<{index: number; message: string; opened: string[] } | null>(null);
  return {
    award: () => {
      const result = rewards.award(practice, index);
      setLast({ index, message: result.limit ? 'כל הכבוד! הגעת לכמות התגמולים המרבית שאפשר לשמור כאן.' : result.awarded ? rewardSuccess : 'כל הכבוד! את הכוכב והנקודות לשאלה הזאת כבר קיבלת ברצף הזה.', opened: result.opened });
    },
    restart: () => { rewards.restart(practice); setLast(null); },
    message: last?.index === index ? last.message : '',
    notice: last?.index === index && last.opened.length > 0 ? <p className="reward-unlock" aria-live="polite">נפתחה דמות חדשה באוסף: {characters.filter(c => last.opened.includes(c.id)).map(c => c.name).join(', ')}! אפשר להמשיך לתרגל.</p> : null,
    summary: <p className="reward-summary">ברצף הזה צברת {10 * (rewards.ledger.runs[practice]?.awarded.length ?? 0)} נקודות ו־{starLabel(rewards.ledger.runs[practice]?.awarded.length ?? 0)}.</p>,
  };
}
export function RewardTotals() {
  const { ledger } = useRewards();
  return <p className="reward-totals" dir="rtl">סך הכול: {ledger.points} נקודות ו־{starLabel(ledger.stars)}</p>;
}
export function Collection({ onHome }: { onHome: () => void }) {
  const { ledger } = useRewards();
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => { heading.current?.focus(); }, []);
  const next = characters.find(c => !ledger.unlocked.includes(c.id));
  return <main className="home" dir="rtl"><h1 ref={heading} tabIndex={-1}>האוסף שלי</h1><RewardTotals />
    <p>הכוכבים נשארים שלך גם אחרי שדמות נפתחת!</p>
    <p>{next ? `עוד ${starLabel(next.stars - ledger.stars)} לפתיחת ${next.name}.` : 'כל שלוש הדמויות נפתחו! אפשר להמשיך ללמוד ולצבור כוכבים.'}</p>
    <div className="character-collection">{characters.map(c => {
      const open = ledger.unlocked.includes(c.id);
      return <section className={`clock-card character-card${open ? '' : ' character-locked'}`} key={c.id} aria-label={`${c.name}: ${open ? 'פתוחה' : 'נעולה'}`}>
        <img src={c.image} alt={c.description} width="240" height="260" /><h2>{c.name}</h2>
        <p>{open ? 'הדמות פתוחה באוסף שלך' : `נעולה — נפתחת ב־${c.stars} כוכבים`}</p>
      </section>;
    })}</div>
    <p>האוסף נשמר רק בדפדפן ובמכשיר הזה.</p><button className="secondary-button home-button" type="button" onClick={onHome}>חזרה לבית</button>
  </main>;
}
