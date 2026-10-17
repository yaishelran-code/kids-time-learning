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
  container = document.createElement('div'); document.body.append(container);
  root = createRoot(container); act(() => root.render(<App />));
});
afterEach(() => { act(() => root.unmount()); container.remove(); });
function button(label: string) { return [...allVisible(container, 'button')].find(value => value.textContent === label)!; }
function click(label: string) { act(() => button(label).click()); if (label.startsWith('תרגול') || label.startsWith('נתרגל')) { const restart = allVisible<HTMLButtonElement>(container, 'button').find(b=>b.textContent==='התחלה מחדש — רצף תגמולים חדש' || b.textContent==='תרגלו שוב'); if(restart)act(()=>restart.click()); } }
const times = [[8, 0], [8, 1], [8, 4], [8, 5], [8, 6], [8, 7], [8, 9], [8, 10], [8, 23], [8, 37], [8, 58], [8, 59], [9, 0], [12, 1], [12, 59]];
const labels = ['השעה שמונה', 'השעה שמונה ודקה אחת', 'השעה שמונה וארבע דקות', 'השעה שמונה וחמש דקות', 'השעה שמונה ושש דקות', 'השעה שמונה ושבע דקות', 'השעה שמונה ותשע דקות', 'השעה שמונה ועשר דקות', 'השעה שמונה ועשרים ושלוש דקות', 'השעה שמונה ושלושים ושבע דקות', 'השעה שמונה וחמישים ושמונה דקות', 'השעה שמונה וחמישים ותשע דקות', 'השעה תשע', 'השעה שתים עשרה ודקה אחת', 'השעה שתים עשרה וחמישים ותשע דקות'];
const explanationParts = [
  ['מתחילים בשמונה', '00'], ['ב־12: 0 דקות', 'עוד צעד אחד', 'ל־1 דקה'],
  ['ב־12: 0 דקות', 'עוד 4 צעדים', 'ל־4 דקות'], ['במספר 1: 5 דקות', 'בלי צעדים נוספים'],
  ['במספר 1: 5 דקות', 'עוד צעד אחד', 'ל־6 דקות'], ['במספר 1: 5 דקות', 'עוד 2 צעדים', 'ל־7 דקות'],
  ['במספר 1: 5 דקות', 'עוד 4 צעדים', 'ל־9 דקות'], ['במספר 2: 10 דקות', 'בלי צעדים נוספים'],
  ['במספר 4: 20 דקות', 'עוד 3 צעדים', 'ל־23 דקות'], ['במספר 7: 35 דקות', 'עוד 2 צעדים', 'ל־37 דקות'],
  ['במספר 11: 55 דקות', 'עוד 3 צעדים', 'ל־58 דקות'], ['במספר 11: 55 דקות', 'עוד 4 צעדים', 'ל־59 דקות'],
  ['עברו 60 דקות', 'הדקות חזרו ל־00', 'המחוג הקצר הגיע ל־9'],
  ['ב־12: 0 דקות', 'עוד צעד אחד', 'מ־12 לכיוון 1'], ['במספר 11: 55 דקות', 'עוד 4 צעדים', 'מ־12 לכיוון 1'],
];
function hands(element: Element, hour: number, minute: number) {
  expect(element.querySelector('[data-hand="hour"]')?.getAttribute('transform')).toBe(`rotate(${hour % 12 * 30 + minute * .5} 150 150)`);
  expect(element.querySelector('[data-hand="minute"]')?.getAttribute('transform')).toBe(minute ? `rotate(${minute * 6} 150 150)` : null);
  const marker = element.querySelector('[data-minute-marker]')!;
  expect(marker.getAttribute('data-minute-marker')).toBe(String(minute));
  expect(marker.getAttribute('transform')).toBe(`rotate(${minute * 6} 150 150)`);
  expect(marker.querySelector('circle')?.getAttribute('stroke')).toBe('#243450');
  expect(marker.querySelector('path')).not.toBeNull();
}
describe('exact-minute lesson', () => {
  it('teaches all 15 fixed examples with synchronized hands, marker, wording, explanations and accessible navigation', () => {
    click('צעדים של דקה אחת');
    expect(button('הדוגמה הקודמת').disabled).toBe(true);
    click('הדוגמה הקודמת');
    for (let index = 0; index < times.length; index++) {
      const [hour, minute] = times[index];
      const card = queryVisible(container, '.clock-card')!;
      hands(card, hour, minute);
      expect(card.querySelector('h2')?.textContent).toBe(`דוגמה ${index + 1} מתוך 15: ${labels[index]}`);
      expect(document.activeElement).toBe(card.querySelector('h2'));
      expect(card.querySelector('.digital-time')?.textContent).toBe(`${hour}:${String(minute).padStart(2, '0')}`);
      expect(card.querySelector('.digital-time')?.getAttribute('dir')).toBe('ltr');
      expect(card.querySelector('.digital-time')?.getAttribute('aria-label')).toBe(labels[index]);
      expect(card.querySelector('title')?.textContent).toBe(`שעון אנלוגי: ${labels[index]}`);
      expect(card.querySelector('.clock-caption')?.textContent).toBe(labels[index]);
      expect(card.querySelector('svg')?.getAttribute('role')).toBe('img');
      expect(queryVisible(container, '[role="slider"]')).toBeNull();
      for (const text of explanationParts[index]) expect(card.querySelector('.exact-minute-explanation')?.textContent).toContain(text);
      if (index < times.length - 1) click('הדוגמה הבאה');
    }
    expect(button('הדוגמה הבאה').disabled).toBe(true);
    click('הדוגמה הבאה'); hands(queryVisible(container, '.clock-card')!, 12, 59);
    for (let index = times.length - 2; index >= 0; index--) {
      click('הדוגמה הקודמת'); hands(queryVisible(container, '.clock-card')!, ...times[index] as [number, number]);
    }
    expect(button('הדוגמה הקודמת').disabled).toBe(true);
    expect(queryVisible(container, 'main')?.getAttribute('dir')).toBe('rtl');
    expect(visibleText(container)).toContain('בין שני סימונים קטנים עוברת דקה אחת');
    expect(visibleText(container)).toContain('חמישה צעדים של דקה');
    for (const caption of allVisible(container, '.clock-caption, figcaption')) expect(caption.textContent).not.toMatch(/לתשע|לאחת/);
    expect(allVisible(container, '.exercise-navigation button')).toHaveLength(3);
    click('חזרה לבית'); expect(document.activeElement).toBe(button('צעדים של דקה אחת'));
    expect(queryVisible(container, '[data-minute-marker]')).toBeNull();
    click('צעדים של דקה אחת'); hands(queryVisible(container, '.clock-card')!, 8, 0);
  });
  it('compares single ticks and the hour rollover with precise hand positions', () => {
    click('צעדים של דקה אחת');
    const groups = [...allVisible(container, '.minutes-comparison-grid')];
    expect(groups).toHaveLength(2);
    for (const [groupIndex, group] of groups.entries()) {
      const expected = groupIndex === 0 ? [[8, 5], [8, 6], [8, 7]] : [[8, 58], [8, 59], [9, 0]];
      const figures = [...group.querySelectorAll('figure')];
      expect(figures).toHaveLength(3);
      figures.forEach((figure, index) => {
        const [hour, minute] = expected[index]; hands(figure, hour, minute);
        expect(figure.querySelector('bdi')?.textContent).toBe(`${hour}:${String(minute).padStart(2, '0')}`);
        expect(figure.querySelector('bdi')?.getAttribute('dir')).toBe('ltr');
      });
    }
  });
});
