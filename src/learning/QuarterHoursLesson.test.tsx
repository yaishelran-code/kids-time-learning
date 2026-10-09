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
  container = document.createElement('div'); document.body.append(container);
  root = createRoot(container); act(() => root.render(<App />));
});
afterEach(() => { act(() => root.unmount()); container.remove(); });
function button(label: string) {
  const found = [...container.querySelectorAll('button')].find(value => value.textContent === label);
  expect(found).toBeDefined(); return found!;
}
function click(label: string) { act(() => button(label).click()); }
function hands(element: Element, hourAngle: number, minuteAngle: number) {
  expect(element.querySelector('[data-hand="hour"]')?.getAttribute('transform')).toBe(`rotate(${hourAngle} 150 150)`);
  expect(element.querySelector('[data-hand="minute"]')?.getAttribute('transform')).toBe(minuteAngle ? `rotate(${minuteAngle} 150 150)` : null);
}
const sequence = [
  [7, 0, 210, 0, 'שבע'], [7, 15, 217.5, 90, 'שבע ורבע'],
  [7, 30, 225, 180, 'שבע וחצי'], [7, 45, 232.5, 270, 'שבע ארבעים וחמש'],
  [12, 15, 7.5, 90, 'שתים עשרה ורבע'], [12, 45, 22.5, 270, 'שתים עשרה ארבעים וחמש'],
] as const;

describe('quarter-hour lesson', () => {
  it('teaches the sequence, synchronizes digital time, and handles both navigation boundaries', () => {
    click('לימוד רבע שעה');
    expect(container.querySelector('main')?.getAttribute('dir')).toBe('rtl');
    expect(container.textContent).toContain('רבע שעה = 15 דקות');
    expect(button('הדוגמה הקודמת').disabled).toBe(true);
    click('הדוגמה הקודמת');
    for (let index = 0; index < sequence.length; index++) {
      const [hour, minute, hourAngle, minuteAngle, wording] = sequence[index];
      const card = container.querySelector('.clock-card')!;
      hands(card, hourAngle, minuteAngle);
      expect(document.activeElement).toBe(card.querySelector('h2'));
      expect(card.querySelector('.digital-time')?.textContent).toBe(`${hour}:${String(minute).padStart(2, '0')}`);
      expect(card.querySelector('.digital-time')?.getAttribute('dir')).toBe('ltr');
      expect(card.querySelector('.clock-caption')?.textContent).toBe(`השעה ${wording}`);
      expect(card.querySelector('svg')?.getAttribute('role')).toBe('img');
      expect(card.querySelector('svg title')?.textContent).toContain(minute === 15 ? `ו־${minute} דקות` : wording);
      if (minute === 15) expect(card.textContent).toContain(`רבע מהדרך מ־${hour} ל־${hour % 12 + 1}`);
      if (minute === 45) expect(card.textContent).toContain(`שלושה רבעים מהדרך מ־${hour} ל־${hour % 12 + 1}`);
      expect(container.querySelector('[role="slider"]')).toBeNull();
      expect(container.textContent).not.toContain('רבע לשמונה');
      if (index < sequence.length - 1) click('הדוגמה הבאה');
    }
    expect(button('הדוגמה הבאה').disabled).toBe(true);
    click('הדוגמה הבאה'); hands(container.querySelector('.clock-card')!, 22.5, 270);
    for (let index = sequence.length - 2; index >= 0; index--) {
      click('הדוגמה הקודמת');
      hands(container.querySelector('.clock-card')!, sequence[index][2], sequence[index][3]);
      expect(document.activeElement).toBe(container.querySelector('.clock-card h2'));
    }
    click('חזרה לבית');
    expect(container.querySelector('h1')?.textContent).toBe('לומדים את השעה');
    expect(document.activeElement).toBe(button('לימוד רבע שעה'));
    expect(button('התחל ללמוד').disabled).toBe(false);
    expect(button('נלמד חצי שעה').disabled).toBe(false);
    click('לימוד רבע שעה'); hands(container.querySelector('.clock-card')!, 210, 0);
  });

  it('visually compares full, quarter, half and three-quarter hours in a predictable order', () => {
    click('לימוד רבע שעה');
    const figures = [...container.querySelectorAll('.quarter-comparison figure')];
    expect(figures).toHaveLength(4);
    for (let index = 0; index < figures.length; index++) {
      hands(figures[index], sequence[index][2], sequence[index][3]);
      expect(figures[index].querySelector('bdi')?.textContent).toBe(`7:${String(index * 15).padStart(2, '0')}`);
      expect(figures[index].querySelector('bdi')?.getAttribute('dir')).toBe('ltr');
    }
    expect([...container.querySelectorAll('button')].map(value => value.textContent)).toEqual([
      'הדוגמה הקודמת', 'הדוגמה הבאה', 'תרגול כיוון רבעי שעות', 'תרגול קריאת רבעי שעות',
      'תרגול משולב — שעות שלמות, חצאים ורבעים', 'חזרה לבית',
    ]);
  });
});

describe('quarter-hour clock geometry', () => {
  it.each(sequence)('positions the hands at %s:%s with exact angles', (hour, minute, hourAngle, minuteAngle) => {
    act(() => root.render(<AnalogClock hour={hour} minute={minute} />));
    hands(container, hourAngle, minuteAngle);
    expect(container.querySelector('[role="slider"]')).toBeNull();
  });
});
