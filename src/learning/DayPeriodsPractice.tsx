import { useEffect, useRef, useState } from 'react';
import { AnalogClock } from '../components/AnalogClock';
import { formatTime } from './clockTime';
import { dayPeriodAt } from './dayPeriods';
import { dayPracticeChoices, dayPracticeQuestions, dayPracticeTitles, type DayPeriodId, type DayPracticeMode } from './dayPeriodPractice';

export function DayPeriodsPractice({ mode, onLesson, onHome }: { mode: DayPracticeMode; onLesson: () => void; onHome: () => void }) {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<(DayPeriodId | null)[]>([]);
  const [feedback, setFeedback] = useState<'idle' | 'correct' | 'incorrect'>('idle');
  const [completed, setCompleted] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const next = useRef<HTMLButtonElement>(null);
  useEffect(() => { heading.current?.focus(); }, [index, completed]);
  useEffect(() => { if (feedback === 'correct') next.current?.focus(); }, [feedback]);
  const questions = dayPracticeQuestions[mode];
  const question = questions[index];
  const comparing = question.kind === 'compare';
  function clear() { setSelected([]); setFeedback('idle'); }
  return <main className="home day-practice" dir="rtl">
    <header>
      <h1 ref={heading} tabIndex={-1}>{completed ? `כל הכבוד! סיימתם ${dayPracticeTitles[mode]} 🎉` : dayPracticeTitles[mode]}</h1>
      {!completed && <><p>תרגיל {index + 1} מתוך {questions.length}</p>
        <p>אלה סיפורים לדוגמה. אצל משפחות שונות עושים דברים בשעות שונות.</p>
        <p>{comparing ? 'בחרו חלק יום לכל סיפור. בדיקה תבדוק את שתי הבחירות יחד.' : 'קראו את הסיפור ובחרו את חלק היום לפי הרמזים.'}</p></>}
    </header>
    {!completed && <>
      <div className={comparing ? 'day-practice-stories day-practice-pair' : 'day-practice-stories'}>
        {question.stories.map((item, storyIndex) => <section key={storyIndex} className="clock-card day-practice-story" aria-labelledby={`day-practice-story-${storyIndex}`}>
          <h2 id={`day-practice-story-${storyIndex}`}>סיפור {storyIndex + 1}</h2>
          <p className="day-story">{item.story}</p>
          <AnalogClock {...item.time} timeDescription={`סיפור ${storyIndex + 1}: ${formatTime(item.time)}`} />
          <p className="digital-time" dir="ltr">{formatTime(item.time)}</p>
          <div className="lesson-controls reading-answers day-period-answers" role="group" aria-label={`בחרו חלק יום לסיפור ${storyIndex + 1}`}>
            {dayPracticeChoices(item, index, storyIndex).map(period => <button key={period.id} type="button" className="secondary-button"
              aria-pressed={selected[storyIndex] === period.id} disabled={feedback === 'correct'}
              onClick={() => { setSelected(previous => { const values = [...previous]; values[storyIndex] = period.id; return values; }); setFeedback('idle'); }}>{period.name}</button>)}
          </div>
        </section>)}
      </div>
      <p className="exercise-feedback" role="status" aria-live="polite">{feedback === 'idle' ? '' : feedback === 'correct' ? 'כל הכבוד! תשובה נכונה 🎉' : 'כמעט! קראו שוב את הרמזים ונסו שוב'}</p>
      {feedback === 'correct' && <section className="day-practice-explanation" aria-label="הסבר התשובה">
        {comparing && <p>המחוגים זהים, אבל ההקשר בסיפור שונה.</p>}
        {question.stories.map((item, storyIndex) => <p key={storyIndex}>סיפור {storyIndex + 1}: <strong>{dayPeriodAt(item.minutes).name}</strong> — {item.clue}</p>)}
      </section>}
      {feedback !== 'correct' ? <button className="start-button" type="button" disabled={!question.stories.every((_, i) => selected[i] != null)}
        onClick={() => setFeedback(question.stories.every((item, i) => selected[i] === dayPeriodAt(item.minutes).id) ? 'correct' : 'incorrect')}>בדיקה</button>
        : <button ref={next} className="start-button" type="button" onClick={() => { if (index === questions.length - 1) setCompleted(true); else { setIndex(index + 1); clear(); } }}>התרגיל הבא</button>}
    </>}
    <nav className="lesson-controls exercise-navigation" aria-label={completed ? 'סיום התרגול' : 'חזרה'}>
      {completed && <button className="start-button" type="button" onClick={() => { setIndex(0); clear(); setCompleted(false); }}>תרגלו שוב</button>}
      <button className="secondary-button" type="button" onClick={onLesson}>חזרה ללימוד</button>
      <button className="secondary-button" type="button" onClick={onHome}>חזרה לבית</button>
    </nav>
  </main>;
}
