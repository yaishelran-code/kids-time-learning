import { useEffect, useRef, useState } from 'react';
import { AnalogClock } from '../components/AnalogClock';
import { formatTime } from '../learning/clockTime';
import { completedAssessment, lessonNames, loadAssessment, questions, saveAssessment, type StartingPoint } from './assessment';
export function Baseline({ onHome, onLesson }: { onHome: () => void; onLesson: (point: StartingPoint) => void }) {
  const [loaded] = useState(loadAssessment);
  const [assessment, setAssessment] = useState(loaded.assessment);
  const [running, setRunning] = useState(false);
  const [answers, setAnswers] = useState<(string | null)[]>([]);
  const [answered, setAnswered] = useState(false);
  const [warning, setWarning] = useState(loaded.error ? 'לא הצלחנו לקרוא את ההמלצה השמורה. הנתונים השמורים לא שונו. אפשר לנסות שוב ברענון.' : '');
  const [saveFailed, setSaveFailed] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const next = useRef<HTMLButtonElement>(null);
  const index = answered ? answers.length - 1 : answers.length;
  const question = questions[index];
  useEffect(() => { heading.current?.focus(); }, [running, index, assessment]);
  useEffect(() => { if (answered) next.current?.focus(); }, [answered]);
  function start() { setAnswers([]); setAnswered(false); setRunning(true); }
  function answer(value: string | null) { if (answered) return; setAnswers(previous => [...previous, value]); setAnswered(true); }
  return <main className="home baseline" dir="rtl">
    <header><h1 ref={heading} tabIndex={-1}>{running ? question.prompt : 'מאיפה מתחילים?'}</h1>
      {running ? <p>שאלה {index + 1} מתוך {questions.length}</p> : <p>ננסה כמה שאלות קצרות כדי למצוא מאיפה כדאי להתחיל.</p>}
    </header>
    {warning && <section className="storage-message" role="alert"><p>{warning}</p>{saveFailed && assessment && <button className="secondary-button" type="button" onClick={() => { const saved = saveAssessment(assessment); setSaveFailed(!saved); setWarning(saved ? '' : 'עדיין לא הצלחנו לשמור. אפשר להמשיך ללמוד כאן.'); }}>נסו לשמור שוב</button>}</section>}
    {running ? <>
      <section className="clock-card" aria-label="השאלה">
        {question.kind === 'digital' ? <p className="digital-time" dir="ltr">{formatTime(question.time)}</p> : <AnalogClock {...question.time} timeDescription="השעון בשאלה" />}
      </section>
      <div className="lesson-controls baseline-answers" role="group" aria-label="בחרו תשובה">
        {question.choices.map(choice => <button key={choice} className="secondary-button" type="button" disabled={answered} onClick={() => answer(choice)}>{question.kind === 'analog' ? <bdi dir="ltr">{choice}</bdi> : choice}</button>)}
        <button className="secondary-button" type="button" disabled={answered} onClick={() => answer(null)}>עדיין לא יודע/ת</button>
      </div>
      <p className="exercise-feedback" role="status">{answered ? 'תודה, ממשיכים' : ''}</p>
      {answered && <button ref={next} className="start-button" type="button" onClick={() => {
        if (answers.length === questions.length) {
          const result = completedAssessment(answers); setAssessment(result); setRunning(false);
          const saved = saveAssessment(result); setSaveFailed(!saved); setWarning(saved ? '' : 'לא הצלחנו לשמור את ההמלצה במכשיר. היא מופיעה כאן כרגע, אבל עלולה להיעלם ברענון. ההמלצה הקודמת לא שונתה.');
        }
        setAnswered(false);
      }}>{answers.length === questions.length ? 'לנקודת ההתחלה שלי' : 'השאלה הבאה'}</button>}
    </> : assessment ? <section className="clock-card" aria-label="נקודת ההתחלה המומלצת">
      <h2>כדאי להתחיל ב{lessonNames[assessment.recommendation]}</h2>
      <p>זו הצעה לנקודת התחלה, ולא קביעה שכבר יודעים את כל הנושאים. אפשר לבחור גם נושא אחר במסך הבית.</p>
      <button className="start-button" type="button" onClick={() => onLesson(assessment.recommendation)}>לשיעור המומלץ</button>
      <button className="secondary-button exercise-entry" type="button" onClick={start}>בדיקה חדשה</button>
    </section> : <><p>אפשר לבחור ״עדיין לא יודע/ת״. אין כאן ציון. אפשר לחזור לבית בכל רגע; רק בדיקה שלמה נשמרת.</p><button className="start-button" type="button" onClick={start}>בואו נתחיל</button></>}
    {running && <p>יציאה כעת לא תשמור בדיקה חלקית ולא תמחק המלצה קודמת.</p>}
    <button className="secondary-button home-button" type="button" onClick={onHome}>{running ? 'יציאה בלי לשמור בדיקה חלקית' : 'חזרה לבית'}</button>
  </main>;
}
