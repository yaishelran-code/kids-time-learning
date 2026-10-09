// @vitest-environment jsdom
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { App } from '../App';
import { AnalogClock } from '../components/AnalogClock';

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
function button(label: string) {
  const result = [...container.querySelectorAll('button')].find(b => b.textContent === label);
  expect(result).toBeDefined();
  return result!;
}
function click(label: string) { act(() => button(label).click()); }
function check(hour: number, minute: number) {
  expect(container.querySelector('[data-hand="hour"]')?.getAttribute('transform')).toBe(`rotate(${hour % 12 * 30 + minute * 0.5} 150 150)`);
  expect(container.querySelector('[data-hand="minute"]')?.getAttribute('transform')).toBe(minute ? `rotate(${minute * 6} 150 150)` : null);
  expect(container.querySelector('.digital-time')?.textContent).toBe(`${hour}:${minute ? '30' : '00'}`);
  expect(container.querySelector('.digital-time')?.getAttribute('dir')).toBe('ltr');
  const label = `השעה ${['שתים עשרה', 'אחת', 'שתיים', 'שלוש', 'ארבע', 'חמש', 'שש', 'שבע', 'שמונה', 'תשע', 'עשר', 'אחת עשרה'][hour % 12]}${minute ? ' וחצי' : ''}`;
  expect(container.querySelector('svg title')?.textContent).toContain(label);
  expect(container.querySelector('.clock-caption')?.textContent).toBe(label);
  expect(container.querySelector('[role="slider"]')).toBeNull();
  expect(container.textContent).not.toMatch(/(?:1[3-9]|2[0-3]):[03]0/);
}

describe('half-hour teaching', () => {
  it('compares all four full hours with half past, supports back navigation and active practice entries', () => {
    click('נלמד חצי שעה');
    expect(document.activeElement).toBe(container.querySelector('h1'));
    expect(container.querySelector('main')?.getAttribute('dir')).toBe('rtl');
    expect(container.textContent).toContain('30 דקות הן חצי שעה');
    expect(container.textContent).toContain('חצי מהדרך');
    expect(button('הדוגמה הקודמת').disabled).toBe(true);
    for (const hour of [7, 8, 11, 12]) {
      check(hour, 0);
      click('הדוגמה הבאה');
      check(hour, 30);
      expect(container.textContent).toContain(`בדיוק באמצע בין ${hour} ל־${hour % 12 + 1}`);
      click('הדוגמה הקודמת');
      check(hour, 0);
      click('הדוגמה הבאה');
      if (hour !== 12) click('הדוגמה הבאה');
    }
    expect(button('הדוגמה הבאה').disabled).toBe(true);
    for (const label of ['תרגול כיוון חצי שעה', 'תרגול קריאת חצי שעה', 'תרגול משולב']) expect(button(label).disabled).toBe(false);
    click('הדוגמה הבאה');
    check(12, 30);
    click('חזרה לבית');
    expect(container.querySelector('h1')?.textContent).toBe('לומדים את השעה');
    expect(document.activeElement).toBe(button('נלמד חצי שעה'));
    click('נלמד חצי שעה');
    check(7, 0);
  });
});

describe('minute-aware clock display and full-hour regression', () => {
  for (let hour = 1; hour <= 12; hour++) {
    for (const minute of [0, 30]) {
      it(`positions both hands at ${hour}:${minute ? '30' : '00'}`, () => {
        act(() => root.render(<AnalogClock hour={hour} minute={minute} />));
        expect(container.querySelector('[data-hand="hour"]')?.getAttribute('transform')).toBe(`rotate(${hour % 12 * 30 + minute * 0.5} 150 150)`);
        expect(container.querySelector('[data-hand="minute"]')?.getAttribute('transform')).toBe(minute ? 'rotate(180 150 150)' : null);
      });
    }
  }
  it('defaults to the original full hour when minutes are omitted', () => {
    act(() => root.render(<AnalogClock hour={12} />));
    expect(container.querySelector('[data-hand="hour"]')?.getAttribute('transform')).toBe('rotate(0 150 150)');
    expect(container.querySelector('[data-hand="minute"]')?.hasAttribute('transform')).toBe(false);
    expect(container.querySelector('title')?.textContent).toBe('שעון אנלוגי המציג את השעה שתים עשרה');
  });
});
