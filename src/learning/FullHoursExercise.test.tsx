// @vitest-environment jsdom
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { App } from '../App';
import { fullHourFromPoint } from './fullHour';

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
function openExercise() { click('התחל ללמוד'); click('נתרגל עם המחוג'); }
function key(value: string) {
  act(() => container.querySelector('[role="slider"]')!.dispatchEvent(new KeyboardEvent('keydown', { key: value, bubbles: true })));
}
function setHour(hour: number) {
  key('Home');
  for (let step = 1; step < hour; step++) key('ArrowRight');
}
function checkClock(hour: number) {
  expect(container.querySelector('[role="slider"]')?.getAttribute('aria-valuenow')).toBe(String(hour));
  expect(container.querySelector('.digital-time')).toBeNull();
  expect(container.textContent?.match(/\b\d{1,2}:00\b/g)).toEqual([
    container.querySelector('.exercise-target bdi')?.textContent,
  ]);
  expect(container.querySelector('[data-hand="hour"]')?.getAttribute('transform')).toBe(`rotate(${hour % 12 * 30} 150 150)`);
  const minute = container.querySelector('[data-hand="minute"]')!;
  expect(minute.getAttribute('x1')).toBe(minute.getAttribute('x2'));
  expect(minute.getAttribute('y2')).toBe('60');
  expect(minute.hasAttribute('transform')).toBe(false);
}

describe('full-hour exercise', () => {
  it('validates, retries without revealing an answer, and resets feedback after movement', () => {
    openExercise();
    expect(container.querySelector('main')?.getAttribute('dir')).toBe('rtl');
    expect(container.querySelector('.exercise-target bdi')?.getAttribute('dir')).toBe('ltr');
    checkClock(1);
    expect(button('התרגיל הבא')).toBeUndefined();
    click('בדיקה');
    expect(container.querySelector('[role="status"]')?.textContent).toContain('עוד לא');
    expect(container.querySelector('[role="status"]')?.textContent).not.toContain('6');
    checkClock(1);
    click('נסה שוב');
    expect(document.activeElement).toBe(container.querySelector('[role="slider"]'));
    setHour(6);
    click('בדיקה');
    expect(container.querySelector('[role="status"]')?.textContent).toContain('כל הכבוד');
    expect(button('התרגיל הבא')).toBeDefined();
    key('ArrowUp');
    checkClock(7);
    expect(button('התרגיל הבא')).toBeUndefined();
    expect(container.querySelector('[role="status"]')?.textContent).toBe('');
  });

  it('covers all exercise targets, identical morning/evening hands, and safe repetition', () => {
    openExercise();
    for (const hour of [6, 7, 7, 8, 10, 12]) {
      expect(container.querySelector('.exercise-target bdi')?.textContent).toBe(`${hour}:00`);
      checkClock(1);
      setHour(hour);
      checkClock(hour);
      click('בדיקה');
      if (hour !== 12) click('התרגיל הבא');
      for (const time of container.querySelectorAll('.digital-time, .exercise-target bdi')) {
        expect(time.textContent).toMatch(/^(?:[1-9]|1[0-2]):00$/);
      }
    }
    expect(container.querySelector('h1')?.textContent).toBe('כל הכבוד! סיימתם את התרגול 🎉');
    expect(document.activeElement).toBe(container.querySelector('h1'));
    expect([...container.querySelectorAll('button')].map(button => button.textContent)).toEqual(['תרגלו שוב', 'חזרה ללימוד']);
    expect(button('התרגיל הבא')).toBeUndefined();
    expect(container.querySelector('[role="slider"]')).toBeNull();
    click('תרגלו שוב');
    expect(container.querySelector('.exercise-target bdi')?.textContent).toBe('6:00');
    checkClock(1);
    expect(container.querySelector('[role="status"]')?.textContent).toBe('');
    expect(button('התרגיל הבא')).toBeUndefined();
    click('בדיקה');
    expect(container.querySelector('[role="status"]')?.textContent).toContain('עוד לא');
    click('חזרה ללימוד');
    expect(container.querySelector('h1')?.textContent).toBe('שעות שלמות');
    click('הדוגמה הבאה');
    expect(container.querySelector('.day-period')?.textContent).toContain('בערב');
    click('נתרגל עם המחוג');
    click('חזרה לבית');
    expect(container.querySelector('h1')?.textContent).toBe('לומדים את השעה');
    expect(document.activeElement?.textContent).toBe('התחל ללמוד');
  });

  it('completes only after a correct final answer and can return directly to the lesson', () => {
    click('התחל ללמוד');
    click('הדוגמה הבאה');
    click('נתרגל עם המחוג');
    for (const hour of [6, 7, 7, 8, 10]) {
      setHour(hour);
      click('בדיקה');
      click('התרגיל הבא');
    }
    click('בדיקה');
    expect(container.querySelector('[role="status"]')?.textContent).toContain('עוד לא');
    expect(button('תרגלו שוב')).toBeUndefined();
    expect(button('התרגיל הבא')).toBeUndefined();
    click('נסה שוב');
    setHour(12);
    click('בדיקה');
    expect(container.querySelector('h1')?.textContent).toBe('כל הכבוד! סיימתם את התרגול 🎉');
    click('חזרה ללימוד');
    expect(container.querySelector('h1')?.textContent).toBe('שעות שלמות');
    expect(container.querySelector('.day-period')?.textContent).toContain('בערב');
  });

  it('supports all twelve keyboard positions and wraparound', () => {
    openExercise();
    for (let hour = 1; hour <= 12; hour++) { setHour(hour); checkClock(hour); }
    key('ArrowUp'); checkClock(1);
    key('ArrowLeft'); checkClock(12);
    key('ArrowDown'); checkClock(11);
    key('End'); checkClock(12);
  });

  it.each(['mouse', 'touch'])('snaps %s dragging across all positions and ends capture on release or cancellation', pointerType => {
    openExercise();
    const svg = container.querySelector('svg')!;
    const slider = container.querySelector('[role="slider"]')!;
    vi.spyOn(svg, 'getBoundingClientRect').mockReturnValue({ left: 20, top: 30, width: 300, height: 300 } as DOMRect);
    Object.assign(svg, { setPointerCapture: vi.fn(), hasPointerCapture: () => true, releasePointerCapture: vi.fn() });
    function pointer(target: Element, type: string, hour: number, id = 1) {
      const angle = hour * Math.PI / 6;
      const event = new Event(type, { bubbles: true, cancelable: true });
      Object.assign(event, { pointerId: id, pointerType, isPrimary: true, button: 0, clientX: 170 + Math.sin(angle) * 72, clientY: 180 - Math.cos(angle) * 72 });
      act(() => target.dispatchEvent(event));
    }
    // The minute hand cannot start a drag.
    pointer(container.querySelector('[data-hand="minute"]')!, 'pointerdown', 12);
    pointer(svg, 'pointermove', 8);
    checkClock(1);
    pointer(slider, 'pointerdown', 1);
    expect(svg.setPointerCapture).toHaveBeenCalledWith(1);
    pointer(svg, 'pointermove', 8, 2); checkClock(1);
    for (let hour = 1; hour <= 12; hour++) { pointer(svg, 'pointermove', hour); checkClock(hour); }
    pointer(svg, 'pointerup', 12);
    expect(svg.releasePointerCapture).toHaveBeenCalledWith(1);
    pointer(svg, 'pointermove', 4); checkClock(12);
    pointer(slider, 'pointerdown', 12);
    pointer(svg, 'pointercancel', 12);
    pointer(svg, 'pointermove', 4); checkClock(12);
  });
});

describe('clock snapping geometry', () => {
  it('rounds to nearby full hours on either side of twelve and ignores the center', () => {
    expect(fullHourFromPoint(0, 0)).toBeNull();
    for (let hour = 1; hour <= 12; hour++) {
      for (const offset of [-0.2, 0, 0.2]) {
        const angle = hour * Math.PI / 6 + offset;
        expect(fullHourFromPoint(Math.sin(angle) * 90, -Math.cos(angle) * 90)).toBe(hour);
      }
    }
  });
});
