// @vitest-environment jsdom
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { App } from '../App';

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
let container: HTMLDivElement;
let root: Root;
beforeEach(() => {
  container = document.createElement('div'); document.body.append(container);
  root = createRoot(container); act(() => root.render(<App />));
});
afterEach(() => { act(() => root.unmount()); container.remove(); });
function button(label: string) { return [...container.querySelectorAll('button')].find(value => value.textContent === label)!; }
function click(label: string) { act(() => button(label).click()); }
const times = [...Array.from({ length: 13 }, (_, i) => [i === 12 ? 9 : 8, i === 12 ? 0 : i * 5]), [12, 5], [12, 55]];
function hands(element: Element, hour: number, minute: number) {
  expect(element.querySelector('[data-hand="hour"]')?.getAttribute('transform')).toBe(`rotate(${hour % 12 * 30 + minute * .5} 150 150)`);
  expect(element.querySelector('[data-hand="minute"]')?.getAttribute('transform')).toBe(minute ? `rotate(${minute * 6} 150 150)` : null);
}
describe('five-minute lesson', () => {
  it('synchronizes all 15 examples, explanations, accessible descriptions and navigation boundaries', () => {
    click('לימוד דקות');
    expect(button('הדוגמה הקודמת').disabled).toBe(true);
    click('הדוגמה הקודמת');
    for (let index = 0; index < times.length; index++) {
      const [hour, minute] = times[index];
      const card = container.querySelector('.clock-card')!;
      hands(card, hour, minute);
      expect(card.querySelector('h2')?.textContent).toContain(`דוגמה ${index + 1} מתוך 15`);
      expect(document.activeElement).toBe(card.querySelector('h2'));
      expect(card.querySelector('.digital-time')?.textContent).toBe(`${hour}:${String(minute).padStart(2, '0')}`);
      expect(card.querySelector('.digital-time')?.getAttribute('dir')).toBe('ltr');
      const caption = card.querySelector('.clock-caption')!.textContent!;
      expect(card.querySelector('title')?.textContent).toBe(`שעון אנלוגי: ${caption}`);
      expect(card.querySelector('.digital-time')?.getAttribute('aria-label')).toBe(caption);
      expect(card.querySelector('svg')?.getAttribute('role')).toBe('img');
      expect(container.querySelector('[role="slider"]')).toBeNull();
      if (minute === 15) expect(card.textContent).toContain('רבע שעה');
      if (minute === 30) expect(card.textContent).toContain('חצי שעה');
      if (minute === 45) expect(card.textContent).toContain('שלושה רבעים');
      if (index === 12) expect(card.textContent).toContain('עברו 60 דקות');
      if (index === 2) expect(caption).toBe('השעה שמונה ועשר דקות');
      if (index === 8) expect(caption).toBe('השעה שמונה וארבעים דקות');
      if (index < times.length - 1) click('הדוגמה הבאה');
    }
    expect(button('הדוגמה הבאה').disabled).toBe(true);
    click('הדוגמה הבאה'); hands(container.querySelector('.clock-card')!, 12, 55);
    for (let index = times.length - 2; index >= 0; index--) { click('הדוגמה הקודמת'); hands(container.querySelector('.clock-card')!, ...times[index] as [number, number]); }
    expect(container.querySelector('main')?.getAttribute('dir')).toBe('rtl');
    expect(container.textContent).not.toContain('לתשע');
    click('חזרה לבית'); expect(document.activeElement).toBe(button('לימוד דקות'));
    click('לימוד דקות'); hands(container.querySelector('.clock-card')!, 8, 0);
  });
  it('toggles minute labels without replacing hour numbers and teaches every mapping', () => {
    click('לימוד דקות');
    expect(container.querySelectorAll('[data-minute-label]')).toHaveLength(0);
    click('סימוני דקות ליד המספרים');
    expect(button('סימוני דקות ליד המספרים').getAttribute('aria-pressed')).toBe('true');
    const svg = container.querySelector('.clock-card svg')!;
    expect(svg.querySelectorAll('text:not([data-minute-label])')).toHaveLength(12);
    for (let number = 1; number <= 12; number++) {
      expect(svg.querySelector(`[data-minute-label="${number}"]`)?.textContent).toBe(number === 12 ? '60/00' : String(number * 5));
      if (number < 12) expect(container.querySelector('.minute-mapping')?.textContent).toContain(`המספר ${number}: ${number * 5} דקות`);
    }
    click('הדוגמה הבאה'); expect(container.querySelectorAll('[data-minute-label]')).toHaveLength(12);
    click('סימוני דקות ליד המספרים'); expect(container.querySelectorAll('[data-minute-label]')).toHaveLength(0);
  });
  it('compares 8:05, 8:10 and 8:15 in order', () => {
    click('לימוד דקות');
    const figures = [...container.querySelectorAll('.minutes-comparison-grid figure')];
    expect(figures).toHaveLength(3);
    figures.forEach((figure, index) => { hands(figure, 8, (index + 1) * 5); expect(figure.querySelector('bdi')?.textContent).toBe(`8:${String((index + 1) * 5).padStart(2, '0')}`); });
    expect(container.textContent).toContain('בכל צעד עברו עוד 5 דקות');
  });
});
