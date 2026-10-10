// @vitest-environment jsdom
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { quarterExercises } from '../learning/QuarterHoursPractice';
import { fiveMinutesExercises } from '../learning/FiveMinutesPractice';
import { exactMinutesExercises } from '../learning/ExactMinutesPractice';
import { App } from '../App';
import { ParentHelpProvider, useParentHelp } from './ParentHelp';
import { clockTopic, emptyParentState, parentStorageKey, readParentState, recordAttempt, topicNames, validParentState, validPin, writeParentState, type Topic } from './state';
import { characters, emptyLedger, readLedger, rewardStorageKey, writeLedger } from '../rewards/ledger';
import { baselineStorageKey } from '../baseline/assessment';
import { activityStorageKey } from '../myDay/activities';
Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
let root: Root, container: HTMLDivElement;
beforeEach(() => { localStorage.clear(); container = document.createElement('div'); document.body.append(container); root = createRoot(container); act(() => root.render(<App />)); });
afterEach(() => { act(() => root.unmount()); container.remove(); vi.restoreAllMocks(); });
function button(label: string) { const b = [...container.querySelectorAll('button')].find(b => b.textContent === label); expect(b, label).toBeDefined(); return b!; }
function click(label: string) { act(() => button(label).click()); }
function remount() { act(() => root.unmount()); root = createRoot(container); act(() => root.render(<App />)); }
function pin(value: string) {
  const input = container.querySelector<HTMLInputElement>('input[type="password"]')!;
  act(() => { Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(input, value); input.dispatchEvent(new Event('input', { bubbles: true })); });
  act(() => container.querySelector('form')!.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })));
}
const counters = () => readParentState().state.mistakes;
const openReading = () => { click('התחל ללמוד'); click('נתרגל קריאת שעון'); };
function seedPause(topic: Topic) { const state = emptyParentState(); state.mistakes[topic] = 3; writeParentState(state); remount(); }
describe('topic rules and storage', () => {
  it('classifies every minute independently of screen level', () => {
    const expected: Topic[] = Array.from({ length: 60 }, (_, m) => m === 0 ? 'full' : m === 30 ? 'half' : [15, 45].includes(m) ? 'quarter' : m % 5 === 0 ? 'five' : 'exact');
    expect(expected.map((_, m) => clockTopic(m))).toEqual(expected);
  });
  it('stops at three, resets only success topic, and never accepts a paused attempt', () => {
    let state = emptyParentState();
    for (const topic of Object.keys(topicNames) as Topic[]) { state = recordAttempt(state, topic, false); state = recordAttempt(state, topic, false); expect(state.mistakes[topic]).toBe(2); }
    state = recordAttempt(state, 'full', true); expect(state.mistakes.full).toBe(0); expect(state.mistakes.half).toBe(2);
    state = recordAttempt(state, 'half', false); expect(state.mistakes.half).toBe(3); expect(recordAttempt(state, 'half', true)).toBe(state); expect(recordAttempt(state, 'half', false)).toBe(state);
  });
  it('protects malformed and unreadable parent data', () => {
    for (const raw of ['{', 'null', '{}', JSON.stringify({ ...emptyParentState(), version: 2 }), JSON.stringify({ ...emptyParentState(), mistakes: { full: 0 } }), JSON.stringify({ ...emptyParentState(), mistakes: { ...emptyParentState().mistakes, full: 4 } })]) {
      localStorage.setItem(parentStorageKey, raw); expect(readParentState().blocked).toBe(true); expect(localStorage.getItem(parentStorageKey)).toBe(raw);
    }
    expect(validParentState(emptyParentState())).toBe(true);
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('blocked'); }); expect(readParentState().blocked).toBe(true);
  });
  it('accepts only the fixed four-digit PIN', () => { for (const p of ['', '12', '12121', '01212', ' 1212', '1111', '１２１２']) expect(validPin(p)).toBe(false); expect(validPin('1212')).toBe(true); });
});
describe('practice integration', () => {
  const modes: [string, string, string, Topic, boolean][] = [
    ['full-setting', 'התחל ללמוד', 'נתרגל עם המחוג', 'full', false], ['full-reading', 'התחל ללמוד', 'נתרגל קריאת שעון', 'full', true],
    ['half-setting', 'נלמד חצי שעה', 'תרגול כיוון חצי שעה', 'half', false], ['half-reading', 'נלמד חצי שעה', 'תרגול קריאת חצי שעה', 'half', true], ['half-mixed', 'נלמד חצי שעה', 'תרגול משולב', 'full', true],
    ['quarter-setting', 'לימוד רבע שעה', 'תרגול כיוון רבעי שעות', 'quarter', false], ['quarter-reading', 'לימוד רבע שעה', 'תרגול קריאת רבעי שעות', 'quarter', false], ['quarter-mixed', 'לימוד רבע שעה', 'תרגול משולב — שעות שלמות, חצאים ורבעים', 'quarter', false],
    ['five-setting', 'לימוד דקות', 'תרגול כיוון דקות', 'five', false], ['five-reading', 'לימוד דקות', 'תרגול קריאת דקות', 'five', false], ['five-mixed', 'לימוד דקות', 'תרגול משולב — כל כפולות ה־5', 'five', false],
    ['exact-setting', 'לימוד דקות מדויקות', 'תרגול כיוון דקות מדויקות', 'exact', false], ['exact-reading', 'לימוד דקות מדויקות', 'תרגול קריאת דקות מדויקות', 'exact', false], ['exact-mixed', 'לימוד דקות מדויקות', 'תרגול משולב — כל הדקות', 'exact', false],
    ['relative-elapsed', 'כמה זמן עבר ונשאר?', 'תרגול זמן שעבר', 'relative', false], ['relative-remaining', 'כמה זמן עבר ונשאר?', 'תרגול זמן שנותר', 'relative', false], ['relative-mixed', 'כמה זמן עבר ונשאר?', 'תרגול משולב — זמן שעבר ונשאר', 'relative', false],
    ['day-identify', 'לימוד חלקי היום', 'תרגול זיהוי חלק היום', 'day', false], ['day-compare', 'לימוד חלקי היום', 'תרגול אותה שעה, הקשר שונה', 'day', false], ['day-mixed', 'לימוד חלקי היום', 'תרגול משולב — חלקי היום', 'day', false],
  ];
  it.each(modes)('counts and blocks %s exactly after three actual attempts', (id, home, entry, topic, immediate) => {
    click(home); click(entry);
    function chooseWrong() {
      if (id.includes('setting') || ['quarter-mixed', 'five-mixed', 'exact-mixed'].includes(id)) return;
      const groups = container.querySelectorAll('.reading-answers');
      for (const group of groups) act(() => (group.querySelectorAll<HTMLButtonElement>('button')[id.startsWith('day-') ? 1 : 2]).click());
    }
    chooseWrong();
    if (!immediate) { expect(counters()[topic]).toBe(0); click('בדיקה'); }
    expect(counters()[topic]).toBe(1);
    for (let n = 2; n <= 3; n++) { if (immediate) chooseWrong(); else click('בדיקה'); expect(counters()[topic]).toBe(n); }
    expect(container.textContent).toContain('בואו נעצור רגע. כדאי לבקש עזרה'); expect(container.querySelector('.reading-answers')).toBeNull(); expect(container.querySelector('[role="slider"]')).toBeNull();
    expect(readLedger().ledger.stars).toBe(0); expect(Object.values(counters()).reduce((a, b) => a + b, 0)).toBe(3);
  });
  it.each([
    ['quarter', 'לימוד רבע שעה', 'תרגול משולב — שעות שלמות, חצאים ורבעים', quarterExercises.mixed, [1]],
    ['five', 'לימוד דקות', 'תרגול משולב — כל כפולות ה־5', fiveMinutesExercises.mixed, [1, -2, 4, -5, 7, -8, 10, -11]],
    ['exact', 'לימוד דקות מדויקות', 'תרגול משולב — כל הדקות', exactMinutesExercises.mixed, [1, -2, 13, -17, 31, -43, 59, -61]],
  ] as const)('classifies every %s mixed question, isolates success resets and preserves rewards', (_, home, entry, questions, offsets) => {
    const state = emptyParentState(); state.mistakes.day = 2; writeParentState(state); remount(); click(home); click(entry);
    questions.forEach((question, index) => {
      const topic = clockTopic(question.minute);
      const answer = `${question.hour}:${String(question.minute).padStart(2, '0')}`;
      if (question.kind === 'reading') {
        const wrong = [...container.querySelectorAll<HTMLButtonElement>('.reading-answers button')].find(b => b.textContent !== answer)!;
        act(() => wrong.click()); expect(counters()[topic]).toBe(0); click('בדיקה');
      } else click('בדיקה');
      expect(counters()[topic]).toBe(1); expect(counters().day).toBe(2);
      if (question.kind === 'reading') click(answer);
      else {
        const offset = offsets[index % offsets.length];
        for (let i = 0; i < Math.abs(offset); i++) act(() => container.querySelector('[role="slider"]')!.dispatchEvent(new KeyboardEvent('keydown', { key: offset > 0 ? 'ArrowRight' : 'ArrowLeft', bubbles: true })));
      }
      click('בדיקה'); expect(counters()[topic]).toBe(0); expect(counters().day).toBe(2);
      expect(readLedger().ledger.stars).toBe(index + 1); click('התרגיל הבא');
    });
  });
  it('shares counters across reading/setting, persists restart/navigation/reload, and unlocks the current question without reward', () => {
    openReading(); click('3:00'); click('3:00'); click('התחלה מחדש — רצף תגמולים חדש'); expect(counters().full).toBe(2);
    click('חזרה לבית'); click('התחל ללמוד'); click('נתרגל עם המחוג'); click('בדיקה'); expect(counters().full).toBe(3);
    pin('1111'); expect(container.textContent).toContain('הקוד אינו נכון'); expect(counters().full).toBe(3); pin('1212'); expect(counters().full).toBe(0); expect(readLedger().ledger.stars).toBe(0); expect(container.querySelector('[role="slider"]')).not.toBeNull(); expect(document.activeElement).toBe(container.querySelector('h1'));
    click('בדיקה'); click('חזרה לבית'); remount(); openReading(); expect(counters().full).toBe(1); click('3:00'); click('3:00'); click('חזרה לבית'); remount(); openReading(); expect(container.querySelector('input[type="password"]')).not.toBeNull();
  });
  it('resets a success counter even for an already rewarded question without duplication', () => {
    openReading(); click('1:00'); click('חזרה לבית'); openReading(); click('3:00'); click('1:00'); expect(counters().full).toBe(0); expect(readLedger().ledger.stars).toBe(1);
  });
  it('blocks earlier-level mixed questions and keeps other topics/lessons available', () => {
    seedPause('full'); click('נלמד חצי שעה'); click('תרגול משולב'); expect(container.textContent).toContain('בואו נעצור רגע'); click('חזרה ללימוד'); click('תרגול קריאת חצי שעה'); click('1:30'); expect(counters().half).toBe(0); expect(counters().full).toBe(3);
  });
  it('records one error for a two-story comparison with one wrong selection', () => {
    click('לימוד חלקי היום'); click('תרגול אותה שעה, הקשר שונה');
    const select = (i: number, label: string) => act(() => [...container.querySelectorAll('.day-period-answers')[i].querySelectorAll<HTMLButtonElement>('button')].find(b => b.textContent === label)!.click());
    select(0, 'בוקר'); select(1, 'לילה'); expect(counters().day).toBe(0); click('בדיקה'); expect(counters().day).toBe(1); select(1, 'ערב'); click('בדיקה'); expect(counters().day).toBe(0); expect(readLedger().ledger.stars).toBe(1);
  });
  it('uses synchronous state to reject checks after the third mistake before rendering', () => {
    function Burst() { const h = useParentHelp(); return <button onClick={() => { for (let i = 0; i < 4; i++) h.attempt('full', false); h.attempt('full', true); }}>burst</button>; }
    act(() => root.render(<ParentHelpProvider><Burst /></ParentHelpProvider>)); click('burst'); expect(counters().full).toBe(3);
  });
});
describe('parent actions and save failures', () => {
  it('requires PIN on every entry/refresh and unlocks one topic or all paused topics', () => {
    const state = emptyParentState(); state.mistakes.full = 3; state.mistakes.half = 3; state.mistakes.five = 2; writeParentState(state); remount(); click('אזור הורה');
    expect(container.textContent).not.toContain('איפוס התגמולים והאוסף'); pin('0000'); expect(counters().full).toBe(3); pin('1212'); click('פתיחת שעות שלמות'); expect(counters().full).toBe(0); expect(counters().half).toBe(3); click('פתיחת כל הנושאים'); expect(counters().half).toBe(0); expect(counters().five).toBe(2);
    click('חזרה לבית'); expect(document.activeElement).toBe(button('אזור הורה')); click('אזור הורה'); expect(container.querySelector('input[type="password"]')).not.toBeNull(); pin('1212'); remount(); click('אזור הורה'); expect(container.querySelector('input[type="password"]')).not.toBeNull();
  });
  it('cancels reset, preserves state on failed save, retries atomically, and allows earning anew', () => {
    const ledger = { ...emptyLedger(), stars: 30, points: 300, unlocked: characters.map(c => c.id), runs: { 'full-reading': { id: 'run', awarded: [0] } } }; writeLedger(ledger);
    const parent = emptyParentState(); parent.mistakes.half = 3; writeParentState(parent); localStorage.setItem(baselineStorageKey, 'keep baseline'); localStorage.setItem(activityStorageKey, 'keep activities'); remount();
    click('אזור הורה'); pin('1212'); click('איפוס התגמולים והאוסף'); click('ביטול'); expect(readLedger().ledger).toEqual(ledger);
    click('איפוס התגמולים והאוסף'); const spy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('quota'); }); click('אישור האיפוס'); expect(container.textContent).toContain('המצב הקודם נשמר'); expect(readLedger().ledger).toEqual(ledger);
    click('ביטול'); click('חזרה לבית'); expect(container.textContent).toContain('300 נקודות'); click('האוסף שלי'); expect(container.querySelectorAll('.character-locked')).toHaveLength(0); click('חזרה לבית'); click('אזור הורה'); pin('1212'); click('איפוס התגמולים והאוסף'); spy.mockRestore(); click('אישור האיפוס'); expect(readLedger().ledger).toEqual(emptyLedger());
    expect(localStorage.getItem(baselineStorageKey)).toBe('keep baseline'); expect(localStorage.getItem(activityStorageKey)).toBe('keep activities'); expect(readParentState().state).toEqual(parent);
    click('חזרה לבית'); click('האוסף שלי'); expect(container.querySelectorAll('.character-locked')).toHaveLength(3); click('חזרה לבית'); remount(); openReading(); click('1:00'); expect(readLedger().ledger.stars).toBe(1); click('חזרה לבית'); remount(); openReading(); click('1:00'); expect(readLedger().ledger.stars).toBe(1);
  });
  it('allows only explicitly confirmed reset of corrupt rewards and resumes durable awards', () => {
    localStorage.setItem(rewardStorageKey, 'broken rewards'); remount(); openReading(); click('1:00'); expect(localStorage.getItem(rewardStorageKey)).toBe('broken rewards'); click('חזרה לבית'); click('אזור הורה'); pin('1212'); click('איפוס התגמולים והאוסף'); click('ביטול'); expect(localStorage.getItem(rewardStorageKey)).toBe('broken rewards'); click('איפוס התגמולים והאוסף'); click('אישור האיפוס'); expect(readLedger().ledger).toEqual(emptyLedger()); click('חזרה לבית'); openReading(); click('1:00'); expect(readLedger().ledger.stars).toBe(1);
  });
  it('protects corrupt parent data, blocks every topic, and recovers only after confirmed successful save', () => {
    localStorage.setItem(parentStorageKey, 'broken pauses'); const ledger = { ...emptyLedger(), stars: 10, points: 100, unlocked: ['spark'] }; writeLedger(ledger); localStorage.setItem(baselineStorageKey, 'baseline'); localStorage.setItem(activityStorageKey, 'activities'); remount();
    openReading(); expect(container.querySelector('.reading-answers')).toBeNull(); click('חזרה ללימוד'); expect(container.querySelector('input')).toBeNull(); click('חזרה לבית'); click('לימוד דקות מדויקות'); click('תרגול כיוון דקות מדויקות'); expect(container.querySelector('[role="slider"]')).toBeNull(); click('חזרה לבית'); click('אזור הורה'); pin('1212'); click('התאוששות נתוני עזרת הורה'); click('ביטול'); expect(localStorage.getItem(parentStorageKey)).toBe('broken pauses'); click('התאוששות נתוני עזרת הורה');
    const spy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('quota'); }); click('אישור האיפוס'); expect(localStorage.getItem(parentStorageKey)).toBe('broken pauses'); expect(container.textContent).toContain('המצב הקודם נשמר'); spy.mockRestore(); click('אישור האיפוס'); expect(readParentState()).toEqual({ state: emptyParentState(), blocked: false }); expect(readLedger().ledger).toEqual(ledger); expect(localStorage.getItem(baselineStorageKey)).toBe('baseline'); expect(localStorage.getItem(activityStorageKey)).toBe('activities'); click('חזרה לבית'); openReading(); click('1:00'); expect(readLedger().ledger.stars).toBe(11);
  });
  it('keeps an unsaved pause across navigation, retries storage without undoing it, then persists reload', () => {
    const spy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('quota'); }); openReading(); click('3:00'); click('3:00'); click('3:00'); expect(container.textContent).toContain('בואו נעצור רגע'); click('חזרה לבית'); openReading(); expect(container.querySelector('input[type="password"]')).not.toBeNull(); expect(container.textContent).toContain('לא הצלחנו לשמור את נתוני'); spy.mockRestore(); click('נסו לשמור עזרת הורה שוב'); expect(counters().full).toBe(3); remount(); openReading(); expect(container.querySelector('input[type="password"]')).not.toBeNull();
  });
  it('treats unavailable reads as blocked, and never counts Baseline or lessons', () => {
    click('מבנה השעון'); click('עוד 15 דקות'); click('חזרה לבית'); click('מאיפה מתחילים?'); click('בואו נתחיל'); click('עדיין לא יודע/ת'); expect(localStorage.getItem(parentStorageKey)).toBeNull();
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('blocked'); }); remount(); openReading(); expect(container.querySelector('.reading-answers')).toBeNull(); expect(container.textContent).toContain('נתוני עזרת');
  });
});
