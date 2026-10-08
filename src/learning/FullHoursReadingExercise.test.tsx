// @vitest-environment jsdom
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { App } from '../App';
import { hourNames } from './examples';

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
let container: HTMLDivElement;
let root: Root;
beforeEach(() => {
  container = document.createElement('div');
  document.body.append(container);
  root = createRoot(container);
  act(() => root.render(<App />));
});
afterEach(() => { act(() => root.unmount()); container.remove(); });
function button(name: string) {
  return [...container.querySelectorAll('button')].find(button => button.textContent === name);
}
function click(name: string) {
  expect(button(name)).toBeDefined();
  act(() => button(name)!.click());
}
function openExercise() { click('התחל ללמוד'); click('נתרגל קריאת שעון'); }
function answers() { return [...container.querySelectorAll<HTMLButtonElement>('.reading-answers button')]; }
function checkQuestion(hour: number) {
  expect(container.querySelector('h1')?.textContent).toBe('מה השעה?');
  expect(container.querySelector('main')?.getAttribute('dir')).toBe('rtl');
  const clock = container.querySelector('svg')!;
  expect(clock.getAttribute('role')).toBe('img');
  expect(clock.getAttribute('aria-labelledby')).toBe(clock.querySelector('title')?.id);
  expect(clock.querySelector('title')?.textContent).toBe(`שעון אנלוגי המציג את השעה ${hourNames[hour % 12]}`);
  expect(clock.querySelector('[data-hand="hour"]')?.getAttribute('transform')).toBe(`rotate(${hour % 12 * 30} 150 150)`);
  const minute = clock.querySelector('[data-hand="minute"]')!;
  expect(minute.getAttribute('x1')).toBe(minute.getAttribute('x2'));
  expect(minute.getAttribute('y2')).toBe('60');
  expect(minute.hasAttribute('transform')).toBe(false);
  expect(container.querySelector('[role="slider"]')).toBeNull();
  expect(clock.classList.contains('interactive-clock')).toBe(false);
  expect(container.querySelector('.digital-time')).toBeNull();
  expect(container.querySelector('.clock-card')?.textContent).not.toMatch(/\d+:\d+/);
  expect(container.querySelector('header')?.textContent).not.toMatch(/\d+:\d+/);
  const options = answers();
  expect(options).toHaveLength(3);
  expect(new Set(options.map(option => option.textContent)).size).toBe(3);
  expect(options.filter(option => option.textContent === `${hour}:00`)).toHaveLength(1);
  for (const option of options) {
    expect(option.textContent).toMatch(/^(?:[1-9]|1[0-2]):00$/);
    expect(option.querySelector('bdi')?.getAttribute('dir')).toBe('ltr');
  }
  expect(container.textContent).not.toMatch(/בבוקר|בערב|בצהריים/);
}

describe('full-hour reading exercise', () => {
  it('retries the same question without revealing the answer, then advances after success', () => {
    openExercise();
    checkQuestion(1);
    expect(document.activeElement).toBe(container.querySelector('h1'));
    expect(button('התרגיל הבא')).toBeUndefined();
    const initialOptions = answers().map(option => option.textContent);
    click('3:00');
    checkQuestion(1);
    expect(container.querySelector('[role="status"]')?.textContent).toBe('כמעט! נסו שוב');
    expect(answers().map(option => option.textContent)).toEqual(initialOptions);
    expect(answers().filter(option => option.getAttribute('aria-pressed') === 'true').map(option => option.textContent)).toEqual(['3:00']);
    expect(answers().every(option => !option.disabled)).toBe(true);
    expect(button('התרגיל הבא')).toBeUndefined();
    click('11:00');
    expect(answers().filter(option => option.getAttribute('aria-pressed') === 'true').map(option => option.textContent)).toEqual(['11:00']);
    click('1:00');
    expect(container.querySelector('[role="status"]')?.textContent).toBe('כל הכבוד! תשובה נכונה 🎉');
    expect(answers().filter(option => option.getAttribute('aria-pressed') === 'true').map(option => option.textContent)).toEqual(['1:00']);
    expect(document.activeElement).toBe(button('התרגיל הבא'));
    click('התרגיל הבא');
    checkQuestion(3);
    expect(container.querySelector('[role="status"]')?.textContent).toBe('');
    expect(answers().every(option => option.getAttribute('aria-pressed') === 'false' && !option.disabled)).toBe(true);
    expect(document.activeElement).toBe(container.querySelector('h1'));
  });

  it.each(['mouse', 'touch'])('ignores %s dragging on either hand and keyboard movement', pointerType => {
    openExercise();
    const svg = container.querySelector('svg')!;
    for (const hand of svg.querySelectorAll('[data-hand]')) {
      for (const [target, type] of [[hand, 'pointerdown'], [svg, 'pointermove'], [svg, 'pointerup']] as const) {
        const event = new Event(type, { bubbles: true });
        Object.assign(event, { pointerId: 1, pointerType, isPrimary: true, button: 0, clientX: 150, clientY: 250 });
        act(() => target.dispatchEvent(event));
      }
      act(() => hand.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true })));
    }
    checkQuestion(1);
    expect(container.querySelector('[role="status"]')?.textContent).toBe('');
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
      expect(container.querySelector('[role="status"]')?.textContent).toBe('כל הכבוד! תשובה נכונה 🎉');
      click('התרגיל הבא');
    }
    expect(container.querySelector('h1')?.textContent).toBe('כל הכבוד! סיימתם את תרגול קריאת השעון 🎉');
    expect(document.activeElement).toBe(container.querySelector('h1'));
    expect(container.querySelector('svg')).toBeNull();
    expect([...container.querySelectorAll('button')].map(button => button.textContent)).toEqual(['תרגלו שוב', 'חזרה ללימוד']);
    click('תרגלו שוב');
    checkQuestion(1);
    expect(answers().map(option => option.textContent)).toEqual(initialOptions);
    expect(container.querySelector('[role="status"]')?.textContent).toBe('');
    expect(answers().every(option => option.getAttribute('aria-pressed') === 'false')).toBe(true);
    expect(button('התרגיל הבא')).toBeUndefined();
  });

  it('returns to the preserved lesson example and Home, and reentry starts fresh', () => {
    click('התחל ללמוד');
    click('הדוגמה הבאה');
    click('נתרגל קריאת שעון');
    click('1:00');
    click('חזרה ללימוד');
    expect(container.querySelector('h1')?.textContent).toBe('שעות שלמות');
    expect(container.querySelector('.day-period')?.textContent).toContain('בערב');
    expect(document.activeElement).toBe(container.querySelector('h1'));
    click('נתרגל קריאת שעון');
    checkQuestion(1);
    expect(container.querySelector('[role="status"]')?.textContent).toBe('');
    click('חזרה לבית');
    expect(container.querySelector('h1')?.textContent).toBe('לומדים את השעה');
    expect(container.querySelector('.digital-time')?.textContent).toBe('7:00');
    expect(document.activeElement).toBe(button('התחל ללמוד'));
  });

  it('returns to learning from completion', () => {
    openExercise();
    for (const hour of [1, 3, 6, 8, 10, 12]) { click(`${hour}:00`); click('התרגיל הבא'); }
    click('חזרה ללימוד');
    expect(container.querySelector('h1')?.textContent).toBe('שעות שלמות');
    expect(document.activeElement).toBe(container.querySelector('h1'));
  });
});
