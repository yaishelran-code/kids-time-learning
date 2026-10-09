// @vitest-environment jsdom
import { act, useState } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { App } from '../App';
import { AnalogClock } from '../components/AnalogClock';
import { angleDelta, formatTime, minuteAngleFromPoint, timeFromMinutes, type ClockTime } from './clockTime';

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
let container: HTMLDivElement;
let root: Root;
beforeEach(() => {
  container = document.createElement('div'); document.body.append(container);
  root = createRoot(container); act(() => root.render(<App />));
});
afterEach(() => { act(() => root.unmount()); container.remove(); vi.restoreAllMocks(); });
function button(label: string) {
  const found = [...container.querySelectorAll('button')].find(value => value.textContent === label);
  expect(found, `button ${label}`).toBeDefined(); return found!;
}
function click(label: string) { act(() => button(label).click()); }
function key(value: string) {
  act(() => container.querySelector('[role="slider"]')!.dispatchEvent(new KeyboardEvent('keydown', { key: value, bubbles: true })));
}
function open(mode: string) { click('נלמד חצי שעה'); click(mode); }
function hands(hour: number, minute: number) {
  expect(container.querySelector('[data-hand="hour"]')?.getAttribute('transform')).toBe(`rotate(${hour % 12 * 30 + minute * .5} 150 150)`);
  expect(container.querySelector('[data-hand="minute"]')?.getAttribute('transform')).toBe(minute ? 'rotate(180 150 150)' : null);
}
function status() { return container.querySelector('[role="status"]')?.textContent; }
function setTime(hour: number, minute: number) {
  key('Home'); for (let step = 0; step < (hour % 12 * 2 + minute / 30); step++) key('ArrowRight');
}
function pointer(target: Element, type: string, angle: number, pointerType: string, id = 1, extra = {}) {
  const event = new Event(type, { bubbles: true, cancelable: true });
  Object.assign(event, { pointerId: id, pointerType, isPrimary: true, button: 0,
    clientX: 170 + Math.sin(angle * Math.PI / 180) * 90, clientY: 180 - Math.cos(angle * Math.PI / 180) * 90, ...extra });
  act(() => target.dispatchEvent(event));
}
function mockSvg() {
  const svg = container.querySelector('svg')!;
  vi.spyOn(svg, 'getBoundingClientRect').mockReturnValue({ left: 20, top: 30, width: 300, height: 300 } as DOMRect);
  Object.assign(svg, { setPointerCapture: vi.fn(), hasPointerCapture: () => true, releasePointerCapture: vi.fn() });
  return svg;
}

describe('half-hour practice flows', () => {
  it('validates setting, retries without a solution, and clears success after movement', () => {
    open('תרגול כיוון חצי שעה'); hands(7, 0);
    expect(container.querySelector('.digital-time')).toBeNull();
    expect(container.querySelector('main')?.getAttribute('dir')).toBe('rtl');
    expect(container.querySelector('.exercise-target bdi')?.getAttribute('dir')).toBe('ltr');
    expect(container.querySelector('[role="slider"]')?.getAttribute('aria-label')).toBe('מחוג הדקות');
    click('בדיקה'); expect(status()).toBe('כמעט! נסו שוב');
    expect(status()).not.toContain('7:30');
    expect(container.textContent).not.toContain('התרגיל הבא');
    key('ArrowRight'); hands(7, 30); expect(status()).toBe('');
    click('בדיקה'); expect(status()).toContain('כל הכבוד');
    expect(document.activeElement).toBe(button('התרגיל הבא'));
    key('ArrowDown'); hands(7, 0); expect(status()).toBe('');
    expect(container.textContent).not.toContain('התרגיל הבא');
  });

  it('completes all setting targets including 12:30, then restarts and returns home', () => {
    open('תרגול כיוון חצי שעה');
    for (const hour of [7, 1, 3, 6, 10, 12]) {
      expect(container.querySelector('.exercise-target bdi')?.textContent).toBe(`${hour}:30`);
      hands(hour, 0); key('ArrowRight'); hands(hour, 30);
      click('בדיקה'); click('התרגיל הבא');
    }
    expect(container.querySelector('h1')?.textContent).toBe('כל הכבוד! סיימתם את תרגול השעות השלמות וחצאי השעות 🎉');
    expect(document.activeElement).toBe(container.querySelector('h1'));
    expect(container.querySelector('[role="slider"]')).toBeNull();
    click('תרגלו שוב'); hands(7, 0); expect(status()).toBe('');
    click('חזרה לבית'); expect(document.activeElement).toBe(button('נלמד חצי שעה'));
  });

  it('reads all required half hours with three unique choices, retries, completion and reset', () => {
    open('תרגול קריאת חצי שעה');
    for (const hour of [1, 3, 6, 8, 10, 12]) {
      hands(hour, 30);
      expect(container.querySelector('[role="slider"]')).toBeNull();
      expect(container.querySelector('.digital-time')).toBeNull();
      expect(container.querySelector('svg title')?.textContent).toContain('וחצי');
      const answers = [...container.querySelectorAll('.reading-answers button')];
      expect(answers).toHaveLength(3);
      expect(new Set(answers.map(value => value.textContent)).size).toBe(3);
      expect(answers.filter(value => value.textContent === `${hour}:30`)).toHaveLength(1);
      for (const value of answers) expect(value.querySelector('bdi')?.getAttribute('dir')).toBe('ltr');
      click(`${hour}:00`); expect(status()).toBe('כמעט! נסו שוב'); expect(status()).not.toContain(`${hour}:30`);
      click(`${hour}:30`); expect(status()).toContain('כל הכבוד');
      expect(answers.every(value => (value as HTMLButtonElement).disabled)).toBe(true);
      click('התרגיל הבא');
    }
    click('תרגלו שוב'); hands(1, 30); expect(status()).toBe('');
    expect(container.querySelector('[aria-pressed="true"]')).toBeNull();
    click('חזרה ללימוד'); expect(container.querySelector('h1')?.textContent).toBe('חצי שעה');
  });

  it('mixes setting and reading of full and half hours and only completes after the final correct answer', () => {
    open('תרגול משולב');
    const sequence = [[4, 0, 'reading'], [7, 30, 'setting'], [11, 0, 'setting'], [2, 30, 'reading'], [12, 0, 'reading'], [9, 30, 'setting']] as const;
    for (const [hour, minute, kind] of sequence) {
      if (kind === 'setting') {
        click('בדיקה'); expect(status()).toBe('כמעט! נסו שוב');
        expect(container.textContent).not.toContain('תרגלו שוב');
        key('ArrowRight'); hands(hour, minute); click('בדיקה');
      } else { hands(hour, minute); click(`${hour}:${minute ? '30' : '00'}`); }
      expect(status()).toContain('כל הכבוד'); click('התרגיל הבא');
    }
    click('תרגלו שוב'); hands(4, 0); expect(status()).toBe('');
  });

  it('preserves the selected lesson example when returning and resets a new practice', () => {
    click('נלמד חצי שעה'); click('הדוגמה הבאה'); click('תרגול כיוון חצי שעה'); key('ArrowRight');
    click('חזרה ללימוד'); hands(7, 30);
    expect(document.activeElement).toBe(button('תרגול כיוון חצי שעה'));
    click('תרגול כיוון חצי שעה'); hands(7, 0);
  });

  it('can select all 24 valid keyboard times and wraps across twelve', () => {
    open('תרגול כיוון חצי שעה');
    for (let hour = 1; hour <= 12; hour++) for (const minute of [0, 30]) {
      setTime(hour, minute); hands(hour, minute);
      expect(container.querySelector('[role="slider"]')?.getAttribute('aria-valuetext')).toBe(`השעה ${hour}:${minute ? '30' : '00'}`);
    }
    key('ArrowUp'); hands(1, 0); key('ArrowLeft'); hands(12, 30);
    key('Home'); hands(12, 0); key('ArrowDown'); hands(11, 30);
    key('End'); hands(11, 30); key('Escape'); hands(11, 30);
  });

  it.each(['mouse', 'touch'])('tracks %s rotation, reverse motion, twelve crossing and capture cancellation', pointerType => {
    open('תרגול כיוון חצי שעה'); const svg = mockSvg(); const slider = container.querySelector('[role="slider"]')!;
    pointer(slider, 'pointerdown', 0, pointerType, 1, { isPrimary: false });
    pointer(svg, 'pointermove', 120, pointerType); hands(7, 0);
    pointer(slider, 'pointerdown', 0, pointerType);
    pointer(svg, 'pointermove', 120, pointerType, 2); hands(7, 0);
    for (const angle of [60, 120, 180]) pointer(svg, 'pointermove', angle, pointerType);
    hands(7, 30);
    for (const angle of [240, 300, 360]) pointer(svg, 'pointermove', angle, pointerType);
    hands(8, 0);
    for (const angle of [300, 240, 180, 120, 60, 0]) pointer(svg, 'pointermove', angle, pointerType);
    hands(7, 0);
    pointer(svg, 'pointerup', 0, pointerType);
    expect(svg.releasePointerCapture).toHaveBeenCalledWith(1);
    pointer(svg, 'pointermove', 120, pointerType); hands(7, 0);
    setTime(12, 0);
    pointer(slider, 'pointerdown', 0, pointerType);
    for (const angle of [60, 120, 180]) pointer(svg, 'pointermove', angle, pointerType);
    hands(12, 30);
    pointer(svg, 'pointercancel', 180, pointerType);
    pointer(svg, 'pointermove', 240, pointerType); hands(12, 30);
    pointer(slider, 'pointerdown', 180, pointerType);
    pointer(svg, 'lostpointercapture', 180, pointerType);
    pointer(svg, 'pointermove', 240, pointerType); hands(12, 30);
  });

  it('ignores center dragging and refuses to independently move the hour hand', () => {
    open('תרגול כיוון חצי שעה'); const svg = mockSvg(); const slider = container.querySelector('[role="slider"]')!;
    pointer(container.querySelector('[data-hand="hour"]')!, 'pointerdown', 0, 'mouse');
    pointer(svg, 'pointermove', 120, 'mouse'); hands(7, 0);
    pointer(slider, 'pointerdown', 0, 'mouse', 1, { clientX: 170, clientY: 180 });
    expect(svg.setPointerCapture).not.toHaveBeenCalled();
    pointer(slider, 'pointerdown', 0, 'mouse');
    pointer(svg, 'pointermove', 0, 'mouse', 1, { clientX: 170, clientY: 180 }); hands(7, 0);
  });
});

describe('clock geometry', () => {
  it('normalizes both directions and snaps near both allowed positions', () => {
    expect(formatTime(timeFromMinutes(-30))).toBe('11:30');
    expect(formatTime(timeFromMinutes(750))).toBe('12:30');
    for (let total = 0; total < 720; total += 30) for (const offset of [-14, 0, 14]) {
      expect(timeFromMinutes(total + offset)).toEqual(timeFromMinutes(total));
    }
    expect(minuteAngleFromPoint(0, 0)).toBeNull();
    expect(angleDelta(170, -170)).toBe(20); expect(angleDelta(-170, 170)).toBe(-20);
  });

  it('keeps a controlled clock synchronized through a complete revolution', () => {
    function Clock() { const [time, setTime] = useState<ClockTime>({ hour: 11, minute: 30 }); return <AnalogClock {...time} onTimeChange={setTime} />; }
    act(() => root.render(<Clock />)); const svg = mockSvg();
    pointer(container.querySelector('[role="slider"]')!, 'pointerdown', 180, 'touch');
    for (const angle of [240, 300, 360]) pointer(svg, 'pointermove', angle, 'touch'); hands(12, 0);
    for (const angle of [60, 120, 180]) pointer(svg, 'pointermove', angle, 'touch'); hands(12, 30);
  });
});
