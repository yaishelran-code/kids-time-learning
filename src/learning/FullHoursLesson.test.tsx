import { allVisible, queryVisible, visibleText } from '../test/visible';
// @vitest-environment jsdom
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { App } from '../App';

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
let container: HTMLDivElement;
let root: Root;

beforeEach(() => {
  container = document.createElement('div');
  document.body.append(container);
  root = createRoot(container);
  act(() => root.render(<App />));
});
afterEach(() => {
  act(() => root.unmount());
  container.remove();
});
function click(label: string) {
  const button = [...allVisible(container, 'button')].find(button => button.textContent === label);
  expect(button, `Button: ${label}`).toBeDefined();
  act(() => button!.click());
}
function checkClock(hour: number, period: string) {
  expect(queryVisible(container, '.digital-time')?.textContent).toBe(`${hour}:00`);
  expect(queryVisible(container, '.digital-time')?.getAttribute('dir')).toBe('ltr');
  expect(queryVisible(container, '.day-period')?.textContent).toContain(period);
  const hourHand = queryVisible(container, '[data-hand="hour"]')!;
  expect(hourHand.getAttribute('transform')).toBe(`rotate(${hour * 30} 150 150)`);
  const minuteHand = queryVisible(container, '[data-hand="minute"]')!;
  expect(minuteHand.getAttribute('x1')).toBe(minuteHand.getAttribute('x2'));
  expect(minuteHand.getAttribute('y2')).toBe('60');
  expect(minuteHand.hasAttribute('transform')).toBe(false);
  expect(visibleText(container)).not.toMatch(/(?:1[3-9]|2[0-3]):00/);
}

describe('full-hour learning flow', () => {
  it('opens from Home, focuses the lesson heading, and returns to the existing Home', () => {
    click('התחל ללמוד');
    expect(queryVisible(container, 'h1')?.textContent).toBe('שעות שלמות');
    expect(document.activeElement).toBe(queryVisible(container, 'h1'));
    expect(queryVisible(container, 'main')?.getAttribute('dir')).toBe('rtl');
    checkClock(7, 'בבוקר');
    click('חזרה לבית');
    expect(queryVisible(container, 'h1')?.textContent).toBe('לומדים את השעה');
    expect(visibleText(container)).toContain('אזור הורה');
    expect(document.activeElement?.textContent).toBe('התחל ללמוד');
    click('התחל ללמוד');
    checkClock(7, 'בבוקר');
  });

  it('keeps both clocks synchronized across every example and restarts safely', () => {
    click('התחל ללמוד');
    expect(queryVisible<HTMLButtonElement>(container, '.secondary-button')?.disabled).toBe(true);
    const expected = [[7, 'בבוקר'], [7, 'בערב'], [8, 'בבוקר'], [8, 'בערב'], [6, 'בבוקר'], [6, 'בערב']] as const;
    for (const [index, [hour, period]] of expected.entries()) {
      checkClock(hour, period);
      click(index === expected.length - 1 ? 'נלמד שוב' : 'הדוגמה הבאה');
    }
    checkClock(7, 'בבוקר');
    click('הדוגמה הבאה');
    click('הדוגמה הקודמת');
    checkClock(7, 'בבוקר');
  });
});
