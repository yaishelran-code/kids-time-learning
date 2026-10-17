import { allVisible, queryVisible, visibleText } from '../test/visible';
// @vitest-environment jsdom
import { readLedger } from '../rewards/ledger';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { App } from '../App';
import { dayPracticeChoices, dayPracticeQuestions, dayPracticeTitles, type DayPracticeMode } from './dayPeriodPractice';
import { dayPeriodAt, dayPeriods } from './dayPeriods';

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
let container: HTMLDivElement, root: Root;
beforeEach(() => { localStorage.clear(); container = document.createElement('div'); document.body.append(container); root = createRoot(container); act(() => root.render(<App />)); });
afterEach(() => { act(() => root.unmount()); container.remove(); });
function button(label: string) { const value = [...allVisible(container, 'button')].find(item => item.textContent === label); expect(value).toBeDefined(); return value!; }
function click(label: string) { act(() => button(label).click()); if (label.startsWith('תרגול') || label.startsWith('נתרגל')) { const restart = allVisible<HTMLButtonElement>(container, 'button').find(b=>b.textContent==='התחלה מחדש — רצף תגמולים חדש' || b.textContent==='תרגלו שוב'); if(restart)act(()=>restart.click()); } }
function choose(storyIndex: number, name: string) {
  const group = allVisible(container, '.day-period-answers')[storyIndex];
  const value = [...group.querySelectorAll('button')].find(item => item.textContent === name);
  expect(value).toBeDefined(); act(() => value!.click());
}
function open(mode: DayPracticeMode) { click('לימוד חלקי היום'); click('הדוגמה הבאה'); click(dayPracticeTitles[mode]); }
const identificationPeriods = ['morning', 'noon', 'afternoon', 'evening', 'night', 'morning', 'noon', 'afternoon', 'evening', 'night'];
const comparisonPeriods = [['morning', 'evening'], ['morning', 'evening'], ['morning', 'night'], ['night', 'morning'], ['noon', 'night'], ['night', 'noon'], ['noon', 'night'], ['night', 'afternoon']];
const identificationMinutes = [420, 720, 960, 1140, 1320, 600, 810, 1050, 1230, 120];
const comparisonMinutes = [[420, 1140], [480, 1200], [600, 1320], [1380, 660], [720, 0], [90, 810], [840, 120], [240, 960]];
function expectedPeriods(mode: DayPracticeMode, index: number): string[] {
  if (mode === 'identify') return [identificationPeriods[index]];
  if (mode === 'compare') return comparisonPeriods[index];
  return index % 2 ? comparisonPeriods[Math.floor(index / 2)] : [identificationPeriods[[0, 2, 4, 6, 8, 1, 7, 9][index / 2]]];
}
function expectedMinutes(mode: DayPracticeMode, index: number): number[] {
  if (mode === 'identify') return [identificationMinutes[index]];
  if (mode === 'compare') return comparisonMinutes[index];
  return index % 2 ? comparisonMinutes[Math.floor(index / 2)] : [identificationMinutes[[0, 2, 4, 6, 8, 1, 7, 9][index / 2]]];
}

describe('day-period practice content', () => {
  it('has 10 identification, 8 comparison and 16 mixed questions with all periods and midnight', () => {
    expect(dayPracticeQuestions.identify).toHaveLength(10); expect(dayPracticeQuestions.compare).toHaveLength(8); expect(dayPracticeQuestions.mixed).toHaveLength(16);
    for (const id of identificationPeriods) expect(identificationPeriods.filter(value => value === id)).toHaveLength(2);
    for (const mode of ['identify', 'compare', 'mixed'] as const) {
      const correctPositions = [new Set<number>(), new Set<number>()];
      const covered = new Set<string>();
      for (const [index, question] of dayPracticeQuestions[mode].entries()) {
        expect(question.kind).toBe(mode === 'mixed' ? index % 2 ? 'compare' : 'identify' : mode);
        expect(question.stories.map(item => item.minutes)).toEqual(expectedMinutes(mode, index));
        expect(question.stories.map(item => dayPeriodAt(item.minutes).id)).toEqual(expectedPeriods(mode, index));
        question.stories.forEach((item, storyIndex) => {
          const correct = expectedPeriods(mode, index)[storyIndex]; covered.add(correct);
          expect(item.time.hour).toBe(Math.floor(item.minutes / 60) % 12 || 12);
          expect(item.time.minute).toBe(item.minutes % 60);
          // Every story contains light or event-order clues, not only an activity.
          expect(item.story).toMatch(/שמש|זריח|שקיע|חצות|אמצע היום|חשוך/);
          for (const period of dayPeriods) expect(item.story).not.toContain(period.name);
          expect(item.story).not.toMatch(/🌅|☀️|🌤️|🌇|🌙/);
          const options = dayPracticeChoices(item, index, storyIndex);
          expect(options).toHaveLength(3); expect(new Set(options.map(option => option.id)).size).toBe(3);
          expect(options.filter(option => option.id === correct)).toHaveLength(1);
          correctPositions[storyIndex].add(options.findIndex(option => option.id === correct));
        });
        if (question.kind === 'compare') {
          expect(question.stories[0].time).toEqual(question.stories[1].time);
          expect(question.stories[0].story).not.toBe(question.stories[1].story);
          expect(expectedPeriods(mode, index)[0]).not.toBe(expectedPeriods(mode, index)[1]);
        }
      }
      expect(covered.size).toBe(5); expect(correctPositions[0].size).toBe(3);
      if (mode !== 'identify') expect(correctPositions[1].size).toBe(3);
      expect(dayPracticeQuestions[mode].some(q => q.stories.some(item => item.minutes > 0 && item.minutes < 300))).toBe(true);
    }
  });

  it.each(['identify', 'compare', 'mixed'] as const)('completes %s with retries, no answer leakage, exact geometry, locks and restart', mode => {
    open(mode);
    for (const [index, question] of dayPracticeQuestions[mode].entries()) {
      const correct = expectedPeriods(mode, index);
      expect(visibleText(container)).toContain(`תרגיל ${index + 1} מתוך ${dayPracticeQuestions[mode].length}`);
      expect(document.activeElement).toBe(queryVisible(container, 'h1'));
      expect(queryVisible(container, 'main')?.dir).toBe('rtl');
      expect(queryVisible(container, '.day-practice-explanation')).toBeNull();
      expect(button('בדיקה').disabled).toBe(true);
      expect(queryVisible(container, '[role="slider"]')).toBeNull();
      const stories = [...allVisible(container, '.day-practice-story')];
      expect(stories).toHaveLength(question.stories.length);
      stories.forEach((element, storyIndex) => {
        const minutes = expectedMinutes(mode, index)[storyIndex];
        const time = `${Math.floor(minutes / 60) % 12 || 12}:${String(minutes % 60).padStart(2, '0')}`;
        expect(element.querySelector('.day-story')?.textContent).toBe(question.stories[storyIndex].story);
        expect(element.querySelector('.digital-time')?.textContent).toBe(time);
        expect(element.querySelector('.digital-time')?.getAttribute('dir')).toBe('ltr');
        expect(element.querySelector('title')?.textContent).toBe(`סיפור ${storyIndex + 1}: ${time}`);
        expect(element.querySelector('svg')?.getAttribute('role')).toBe('img');
        expect(element.querySelector('[data-hand="hour"]')?.getAttribute('transform')).toBe(`rotate(${minutes % 720 / 2} 150 150)`);
        expect(element.querySelector('[data-hand="minute"]')?.getAttribute('transform')).toBe(minutes % 60 ? `rotate(${minutes % 60 * 6} 150 150)` : null);
        expect(element.querySelector('.day-period')).toBeNull();
        expect(element.querySelector('.day-period-answers')?.getAttribute('aria-label')).toBe(`בחרו חלק יום לסיפור ${storyIndex + 1}`);
        for (const period of dayPeriods) expect(element.querySelector('.day-story')?.textContent).not.toContain(period.name);
        const options = dayPracticeChoices(question.stories[storyIndex], index, storyIndex);
        choose(storyIndex, options.find(option => option.id !== correct[storyIndex])!.name);
        if (storyIndex === 0 && question.kind === 'compare') expect(button('בדיקה').disabled).toBe(true);
      });
      expect(button('בדיקה').disabled).toBe(false); click('בדיקה');
      expect(queryVisible(container, '[role="status"]')?.textContent).toContain('נסו שוב');
      expect(queryVisible(container, '.day-practice-explanation')).toBeNull();
      expect([...allVisible(container, '.day-period-answers button')].every(b => !(b as HTMLButtonElement).disabled)).toBe(true);
      correct.forEach((id, storyIndex) => {
        choose(storyIndex, dayPeriods.find(period => period.id === id)!.name);
        expect(queryVisible(container, '[role="status"]')?.textContent).toBe('');
      });
      click('בדיקה');
      expect(queryVisible(container, '[role="status"]')?.textContent).toContain('קיבלת כוכב');
      const explanation = queryVisible(container, '.day-practice-explanation')!;
      correct.forEach((id, storyIndex) => {
        expect(explanation.textContent).toContain(dayPeriods.find(period => period.id === id)!.name);
        expect(explanation.textContent).toContain(question.stories[storyIndex].clue);
      });
      if (question.kind === 'compare') expect(explanation.textContent).toContain('המחוגים זהים, אבל ההקשר בסיפור שונה');
      expect([...allVisible(container, '.day-period-answers button')].every(b => (b as HTMLButtonElement).disabled)).toBe(true);
      const first = queryVisible<HTMLButtonElement>(container, '.day-period-answers button')!;
      const before = allVisible(container, '[aria-pressed="true"]').length;
      act(() => first.click()); expect(allVisible(container, '[aria-pressed="true"]').length).toBe(before);
      expect(document.activeElement).toBe(button('התרגיל הבא')); click('התרגיל הבא');
      expect(queryVisible(container, '[aria-pressed="true"]')).toBeNull();
    }
    expect(queryVisible(container, 'h1')?.textContent).toContain('סיימתם');
    expect(readLedger().ledger.stars).toBe(dayPracticeQuestions[mode].length);
    expect(readLedger().ledger.runs[`day-${mode}`]!.awarded).toHaveLength(dayPracticeQuestions[mode].length);
    expect(queryVisible(container, '.reward-summary')?.textContent).toBe(`ברצף הזה צברת ${10 * dayPracticeQuestions[mode].length} נקודות ו־${dayPracticeQuestions[mode].length} כוכבים.`);
    expect(queryVisible(container, 'svg')).toBeNull(); expect(queryVisible(container, '.day-practice-explanation')).toBeNull();
    expect(document.activeElement).toBe(queryVisible(container, 'h1'));
    click('תרגלו שוב');
    expect(visibleText(container)).toContain(`תרגיל 1 מתוך ${dayPracticeQuestions[mode].length}`);
    expect(button('בדיקה').disabled).toBe(true); expect(queryVisible(container, '[aria-pressed="true"]')).toBeNull();
    expect(queryVisible(container, '[role="status"]')?.textContent).toBe('');
    click('חזרה ללימוד'); expect(queryVisible(container, '.day-example h2')?.textContent).toContain('דוגמה 2 מתוך 10');
    expect(document.activeElement).toBe(button(dayPracticeTitles[mode]));
    click(dayPracticeTitles[mode]); click('חזרה לבית'); expect(document.activeElement).toBe(button('לימוד חלקי היום'));
  });

  it('checks both comparison selections together, and either single error keeps all solutions hidden', () => {
    open('compare');
    choose(0, 'בוקר'); choose(1, 'לילה'); click('בדיקה');
    expect(queryVisible(container, '[role="status"]')?.textContent).toContain('נסו שוב');
    expect(queryVisible(container, '.day-practice-explanation')).toBeNull();
    choose(1, 'ערב'); expect(queryVisible(container, '[role="status"]')?.textContent).toBe('');
    choose(0, 'צהריים'); click('בדיקה');
    expect(queryVisible(container, '[role="status"]')?.textContent).toContain('נסו שוב');
    expect(queryVisible(container, '.day-practice-explanation')).toBeNull();
    choose(0, 'בוקר'); click('בדיקה'); expect(queryVisible(container, '.day-practice-explanation')).not.toBeNull();
  });

  it.each(['identify', 'compare', 'mixed'] as const)('leaves %s after an incorrect answer and returns fresh', mode => {
    open(mode);
    const q = dayPracticeQuestions[mode][0];
    q.stories.forEach((item, i) => choose(i, dayPracticeChoices(item, 0, i).find(period => period.id !== expectedPeriods(mode, 0)[i])!.name));
    click('בדיקה'); click('חזרה ללימוד');
    expect(queryVisible(container, '.day-example h2')?.textContent).toContain('דוגמה 2 מתוך 10');
    click(dayPracticeTitles[mode]); expect(queryVisible(container, '[role="status"]')?.textContent).toBe('');
    expect(queryVisible(container, '[aria-pressed="true"]')).toBeNull();
    expect(button('בדיקה').disabled).toBe(true); click('חזרה לבית');
    click('לימוד חלקי היום'); click(dayPracticeTitles[mode]); expect(visibleText(container)).toContain('תרגיל 1 מתוך');
  });

  it.each(['identify', 'compare', 'mixed'] as const)('preserves the lesson example and restores its entry from %s completion', mode => {
    open(mode);
    dayPracticeQuestions[mode].forEach((question, index) => {
      expectedPeriods(mode, index).forEach((id, i) => choose(i, dayPeriods.find(period => period.id === id)!.name));
      click('בדיקה'); click('התרגיל הבא');
    });
    click('חזרה ללימוד'); expect(queryVisible(container, '.day-example h2')?.textContent).toContain('דוגמה 2 מתוך 10');
    expect(document.activeElement).toBe(button(dayPracticeTitles[mode]));
  });
});
