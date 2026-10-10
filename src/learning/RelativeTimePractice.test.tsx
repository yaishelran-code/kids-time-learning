// @vitest-environment jsdom
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { App } from '../App';
import { durationMinutes, durationLabel, calculationSteps } from './relativeTime';
import { durationChoices, relativeTimeExercises, relativeTimePracticeTitles } from './RelativeTimePractice';
Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
let container: HTMLDivElement, root: Root;
beforeEach(() => { container = document.createElement('div'); document.body.append(container); root = createRoot(container); act(() => root.render(<App />)); });
afterEach(() => { act(() => root.unmount()); container.remove(); });
function button(label: string) { const value = [...container.querySelectorAll('button')].find(b => b.textContent === label); expect(value).toBeDefined(); return value!; }
function click(label: string) { act(() => button(label).click()); }
const expected = [180, 60, 120, 20, 30, 15, 30, 20, 20, 90, 100, 150];
const periods: Record<string, number> = { 'בבוקר': 0, 'בצהריים': 12, 'אחר הצהריים': 12, 'בערב': 12 };
function absolute(hour: number, minute: number, period: string) { return hour % 12 * 60 + minute + periods[period] * 60; }
describe('relative-time practice acceptance', () => {
  it('has fixed, varied sequences and independently correct same-day durations and choices', () => {
    expect(relativeTimeExercises.elapsed).toHaveLength(12); expect(relativeTimeExercises.remaining).toHaveLength(12); expect(relativeTimeExercises.mixed).toHaveLength(20);
    for (const mode of ['elapsed', 'remaining', 'mixed'] as const) {
      const questions = relativeTimeExercises[mode];
      expect(new Set(questions.map(q => q.stage)).size).toBe(4);
      expect(questions.some(q => q.start.hour === 11 && q.end.hour === 12)).toBe(true);
      expect(questions.some(q => q.start.hour === 12 && q.end.hour === 1)).toBe(true);
      if (mode !== 'mixed') expect(questions.every(q => q.kind === mode)).toBe(true);
      else expect(new Set(questions.map(q => q.kind)).size).toBe(2);
      for (const [index, q] of questions.entries()) {
        const correct = absolute(q.end.hour, q.end.minute, q.endPeriod) - absolute(q.start.hour, q.start.minute, q.startPeriod);
        expect(correct).toBeGreaterThan(0); expect(correct).toBeLessThanOrEqual(180); expect(correct % 5).toBe(0);
        expect(q.start.minute % 5).toBe(0); expect(q.end.minute % 5).toBe(0);
        expect(durationMinutes(q.start, q.end)).toBe(correct);
        if (mode !== 'mixed') expect(correct).toBe(expected[index]);
        const choices = durationChoices(correct, index);
        expect(choices.filter(value => value === correct)).toHaveLength(1);
        expect(new Set(choices.map(durationLabel)).size).toBe(3);
        for (const value of choices) { expect(value).toBeGreaterThan(0); expect(value).toBeLessThanOrEqual(180); }
        for (let a = 0; a < 3; a++) for (let b = a + 1; b < 3; b++) expect(Math.abs(choices[a] - choices[b])).toBeGreaterThanOrEqual(7);
        const steps = calculationSteps(q);
        expect(steps.reduce((sum, step) => sum + step.minutes, 0)).toBe(correct);
        expect(steps.at(-1)?.to).toEqual(q.end);
      }
      expect(new Set(questions.map((q, i) => durationChoices(durationMinutes(q.start, q.end), i).indexOf(durationMinutes(q.start, q.end)))).size).toBe(3);
    }
  });
  it.each(['elapsed', 'remaining', 'mixed'] as const)('completes %s with hidden explanation, retry, locking, navigation and reset', mode => {
    click('כמה זמן עבר ונשאר?'); click('הדוגמה הבאה'); click(relativeTimePracticeTitles[mode]);
    for (const [index, q] of relativeTimeExercises[mode].entries()) {
      expect(container.textContent).toContain(`תרגיל ${index + 1} מתוך ${relativeTimeExercises[mode].length}`);
      expect(document.activeElement).toBe(container.querySelector('h1'));
      expect(container.querySelector('main')?.dir).toBe('rtl');
      expect(container.querySelectorAll('svg[role="img"]')).toHaveLength(2);
      expect(container.querySelector('[role="slider"]')).toBeNull();
      expect(container.querySelectorAll('.digital-time[dir="ltr"]')).toHaveLength(2);
      [...container.querySelectorAll('figure')].forEach((figure, i) => {
        const time = i ? q.end : q.start;
        const role = q.kind === 'elapsed' ? i ? 'עכשיו' : 'התחלנו' : i ? 'הפעילות מתחילה' : 'עכשיו';
        expect(figure.querySelector('h2')?.textContent).toBe(role);
        expect(figure.querySelector('figcaption')?.textContent).toContain(i ? q.endPeriod : q.startPeriod);
        expect(figure.querySelector('bdi')?.textContent).toBe(`${time.hour}:${String(time.minute).padStart(2, '0')}`);
        expect(figure.querySelector('[data-hand="hour"]')?.getAttribute('transform')).toBe(`rotate(${time.hour % 12 * 30 + time.minute * .5} 150 150)`);
        expect(figure.querySelector('[data-hand="minute"]')?.getAttribute('transform')).toBe(time.minute ? `rotate(${time.minute * 6} 150 150)` : null);
      });
      expect(container.querySelector('.relative-calculation')).toBeNull();
      expect(container.querySelector('.relative-timeline')).toBeNull();
      expect(button('בדיקה').disabled).toBe(true);
      const total = durationMinutes(q.start, q.end);
      click(durationLabel(durationChoices(total, index).find(n => n !== total)!)); click('בדיקה');
      expect(container.querySelector('[role="status"]')?.textContent).toBe('כמעט! נסו שוב');
      expect(container.querySelector('.relative-calculation')).toBeNull();
      click(durationLabel(total)); expect(container.querySelector('[role="status"]')?.textContent).toBe(''); click('בדיקה');
      expect(container.querySelector('.relative-answer')?.textContent).toContain(durationLabel(total));
      expect(container.querySelector('.relative-calculation')?.textContent).toContain('סופרים קדימה');
      expect([...container.querySelectorAll('.duration-answers button')].every(b => (b as HTMLButtonElement).disabled)).toBe(true);
      expect(document.activeElement).toBe(button('התרגיל הבא')); click('התרגיל הבא');
    }
    expect(container.querySelector('h1')?.textContent).toContain('סיימתם');
    expect(container.querySelector('.relative-calculation')).toBeNull();
    click('חזרה ללימוד'); expect(container.querySelector('h2')?.textContent).toContain('דוגמה 2 מתוך 12');
    expect(document.activeElement).toBe(button(relativeTimePracticeTitles[mode]));
    click(relativeTimePracticeTitles[mode]);
    const questions = relativeTimeExercises[mode];
    for (const q of questions) { click(durationLabel(durationMinutes(q.start, q.end))); click('בדיקה'); click('התרגיל הבא'); }
    click('תרגלו שוב'); expect(container.textContent).toContain(`תרגיל 1 מתוך ${questions.length}`);
    expect(container.querySelector('[aria-pressed="true"]')).toBeNull(); expect(button('בדיקה').disabled).toBe(true);
    expect(container.querySelector('.relative-calculation')).toBeNull();
    click('חזרה ללימוד'); click(relativeTimePracticeTitles[mode]); click('חזרה לבית');
    expect(document.activeElement).toBe(button('כמה זמן עבר ונשאר?'));
  });
  it.each(['elapsed', 'remaining', 'mixed'] as const)('leaves %s during a retry and reenters fresh', mode => {
    click('כמה זמן עבר ונשאר?'); click('הדוגמה הבאה'); click(relativeTimePracticeTitles[mode]);
    click('שעתיים ו־50 דקות'); click('בדיקה'); click('חזרה ללימוד');
    expect(container.querySelector('h2')?.textContent).toContain('דוגמה 2 מתוך 12');
    click(relativeTimePracticeTitles[mode]); expect(container.querySelector('[role="status"]')?.textContent).toBe('');
    expect(container.querySelector('[aria-pressed="true"]')).toBeNull();
    click('חזרה לבית'); expect(document.activeElement).toBe(button('כמה זמן עבר ונשאר?'));
  });
});
