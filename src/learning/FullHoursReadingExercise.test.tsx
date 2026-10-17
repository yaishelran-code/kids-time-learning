import { allVisible, queryVisible, visibleText } from '../test/visible';
// @vitest-environment jsdom
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { App } from '../App';
import { hourNames } from './examples';

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
let container: HTMLDivElement;
let root: Root;
beforeEach(() => { localStorage.clear();
  container = document.createElement('div');
  document.body.append(container);
  root = createRoot(container);
  act(() => root.render(<App />));
});
afterEach(() => { act(() => root.unmount()); container.remove(); });
function button(name: string) {
  return [...allVisible(container, 'button')].find(button => button.textContent === name);
}
function click(name: string) {
  expect(button(name)).toBeDefined();
  act(() => button(name)!.click());
}
function openExercise() { click('התחל ללמוד'); click('נתרגל קריאת שעון'); }
function answers() { return [...allVisible<HTMLButtonElement>(container, '.reading-answers button')]; }
function checkQuestion(hour: number) {
  expect(queryVisible(container, 'h1')?.textContent).toBe('מה השעה?');
  expect(queryVisible(container, 'main')?.getAttribute('dir')).toBe('rtl');
  const clock = queryVisible(container, 'svg')!;
  expect(clock.getAttribute('role')).toBe('img');
  expect(clock.getAttribute('aria-labelledby')).toBe(clock.querySelector('title')?.id);
  expect(clock.querySelector('title')?.textContent).toBe(`שעון אנלוגי המציג את השעה ${hourNames[hour % 12]}`);
  expect(clock.querySelector('[data-hand="hour"]')?.getAttribute('transform')).toBe(`rotate(${hour % 12 * 30} 150 150)`);
  const minute = clock.querySelector('[data-hand="minute"]')!;
  expect(minute.getAttribute('x1')).toBe(minute.getAttribute('x2'));
  expect(minute.getAttribute('y2')).toBe('60');
  expect(minute.hasAttribute('transform')).toBe(false);
  expect(queryVisible(container, '[role="slider"]')).toBeNull();
  expect(clock.classList.contains('interactive-clock')).toBe(false);
  expect(queryVisible(container, '.digital-time')).toBeNull();
  expect(queryVisible(container, '.clock-card')?.textContent).not.toMatch(/\d+:\d+/);
  expect(queryVisible(container, 'header')?.textContent).not.toMatch(/\d+:\d+/);
  const options = answers();
  expect(options).toHaveLength(3);
  expect(new Set(options.map(option => option.textContent)).size).toBe(3);
  expect(options.filter(option => option.textContent === `${hour}:00`)).toHaveLength(1);
  for (const option of options) {
    expect(option.textContent).toMatch(/^(?:[1-9]|1[0-2]):00$/);
    expect(option.querySelector('bdi')?.getAttribute('dir')).toBe('ltr');
  }
  expect(visibleText(container)).not.toMatch(/בבוקר|בערב|בצהריים/);
}

describe('full-hour reading exercise', () => {
  it('retries the same question without revealing the answer, then advances after success', () => {
    openExercise();
    checkQuestion(1);
    expect(document.activeElement).toBe(queryVisible(container, 'h1'));
    expect(button('התרגיל הבא')).toBeUndefined();
    const initialOptions = answers().map(option => option.textContent);
    click('3:00');
    checkQuestion(1);
    expect(queryVisible(container, '[role="status"]')?.textContent).toBe('כמעט! נסו שוב');
    expect(answers().map(option => option.textContent)).toEqual(initialOptions);
    expect(answers().filter(option => option.getAttribute('aria-pressed') === 'true').map(option => option.textContent)).toEqual(['3:00']);
    expect(answers().every(option => !option.disabled)).toBe(true);
    expect(button('התרגיל הבא')).toBeUndefined();
    click('11:00');
    expect(answers().filter(option => option.getAttribute('aria-pressed') === 'true').map(option => option.textContent)).toEqual(['11:00']);
    click('1:00');
    expect(queryVisible(container, '[role="status"]')?.textContent).toBe('כל הכבוד! קיבלת כוכב ו־10 נקודות');
    expect(answers().filter(option => option.getAttribute('aria-pressed') === 'true').map(option => option.textContent)).toEqual(['1:00']);
    expect(document.activeElement).toBe(button('התרגיל הבא'));
    click('התרגיל הבא');
    checkQuestion(3);
    expect(queryVisible(container, '[role="status"]')?.textContent).toBe('');
    expect(answers().every(option => option.getAttribute('aria-pressed') === 'false' && !option.disabled)).toBe(true);
    expect(document.activeElement).toBe(queryVisible(container, 'h1'));
  });

  it.each(['mouse', 'touch'])('ignores %s dragging on either hand and keyboard movement', pointerType => {
    openExercise();
    const svg = queryVisible(container, 'svg')!;
    for (const hand of svg.querySelectorAll('[data-hand]')) {
      for (const [target, type] of [[hand, 'pointerdown'], [svg, 'pointermove'], [svg, 'pointerup']] as const) {
        const event = new Event(type, { bubbles: true });
        Object.assign(event, { pointerId: 1, pointerType, isPrimary: true, button: 0, clientX: 150, clientY: 250 });
        act(() => target.dispatchEvent(event));
      }
      act(() => hand.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true })));
    }
    checkQuestion(1);
    expect(queryVisible(container, '[role="status"]')?.textContent).toBe('');
  });

  it('covers the deterministic sequence, gates completion, and resets on restart', () => {
    openExercise();
    const initialOptions = answers().map(option => option.textContent);
    for (const hour of [1, 3, 6, 8, 10, 12]) {
      checkQuestion(hour);
      expect(button('התרגיל הבא')).toBeUndefined();
      const wrong = answers().find(option => option.textContent !== `${hour}:00`)!;
      click(wrong.textContent!);
      expect(button('תרגלו שוב')).toBeUndefined();
      expect(button('התרגיל הבא')).toBeUndefined();
      checkQuestion(hour);
      click(`${hour}:00`);
      expect(queryVisible(container, '[role="status"]')?.textContent).toBe('כל הכבוד! קיבלת כוכב ו־10 נקודות');
      click('התרגיל הבא');
    }
    expect(queryVisible(container, 'h1')?.textContent).toBe('כל הכבוד! סיימתם את תרגול קריאת השעון 🎉');
    expect(document.activeElement).toBe(queryVisible(container, 'h1'));
    expect(queryVisible(container, 'svg')).toBeNull();
    expect([...allVisible(container, 'button')].map(button => button.textContent)).toEqual(['לנושא הבא', 'תרגלו שוב', 'חזרה ללימוד', 'חזרה לבית']);
    click('תרגלו שוב');
    checkQuestion(1);
    expect(answers().map(option => option.textContent)).toEqual(initialOptions);
    expect(queryVisible(container, '[role="status"]')?.textContent).toBe('');
    expect(answers().every(option => option.getAttribute('aria-pressed') === 'false')).toBe(true);
    expect(button('התרגיל הבא')).toBeUndefined();
  });

  it('returns to the preserved lesson example and Home, and explicit restart starts fresh', () => {
    click('התחל ללמוד');
    click('הדוגמה הבאה');
    click('נתרגל קריאת שעון');
    click('1:00');
    click('חזרה ללימוד');
    expect(queryVisible(container, 'h1')?.textContent).toBe('שעות שלמות');
    expect(queryVisible(container, '.day-period')?.textContent).toContain('בערב');
    expect(document.activeElement).toBe(button('נתרגל קריאת שעון'));
    click('נתרגל קריאת שעון');
    click('התחלה מחדש — רצף תגמולים חדש');
    checkQuestion(1);
    expect(queryVisible(container, '[role="status"]')?.textContent).toBe('');
    click('חזרה לבית');
    expect(queryVisible(container, 'h1')?.textContent).toBe('לומדים את השעה');
    expect(queryVisible(container, '.digital-time')?.textContent).toBe('7:00');
    expect(document.activeElement).toBe(button('התחל ללמוד'));
  });

  it('returns to learning from completion', () => {
    openExercise();
    for (const hour of [1, 3, 6, 8, 10, 12]) { click(`${hour}:00`); click('התרגיל הבא'); }
    click('חזרה ללימוד');
    expect(queryVisible(container, 'h1')?.textContent).toBe('שעות שלמות');
    expect(document.activeElement).toBe(button('נתרגל קריאת שעון'));
  });
});
