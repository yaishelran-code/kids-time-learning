// @vitest-environment jsdom
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { App } from '../App';
import { calculationSteps, durationLabel, durationMinutes, relativeTimeExamples } from './relativeTime';

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
// Independent acceptance fixtures: start/end, total, kind, whole hours and five-minute steps.
const fixtures = [
  [3, 0, 5, 0, 120, 'elapsed', 2, 0], [9, 0, 12, 0, 180, 'elapsed', 3, 0],
  [4, 0, 6, 0, 120, 'remaining', 2, 0], [10, 0, 1, 0, 180, 'remaining', 3, 0],
  [3, 10, 3, 30, 20, 'elapsed', 0, 4], [4, 15, 4, 45, 30, 'remaining', 0, 6],
  [3, 40, 4, 10, 30, 'elapsed', 0, 6], [11, 45, 12, 15, 30, 'elapsed', 0, 6],
  [4, 40, 5, 0, 20, 'remaining', 0, 4], [11, 50, 12, 10, 20, 'remaining', 0, 4],
  [3, 15, 4, 45, 90, 'elapsed', 1, 6], [4, 20, 6, 0, 100, 'remaining', 1, 8],
] as const;
const answers = ['עברו שעתיים.', 'עברו 3 שעות.', 'נשארו שעתיים.', 'נשארו 3 שעות.', 'עברו 20 דקות.', 'נשארו 30 דקות.', 'עברו 30 דקות.', 'עברו 30 דקות.', 'נשארו 20 דקות.', 'נשארו 20 דקות.', 'עברו שעה ו־30 דקות.', 'נשארו שעה ו־40 דקות.'];

describe('relative-time lesson', () => {
  it.each(fixtures.map((fixture, index) => ({ fixture, index })))('calculates example $index with hour-first steps ending at the exact time', ({ fixture, index }) => {
    const [sh, sm, eh, em, total, kind, hours, fives] = fixture;
    const example = relativeTimeExamples[index];
    expect(example.start).toEqual({ hour: sh, minute: sm });
    expect(example.end).toEqual({ hour: eh, minute: em });
    expect(example.kind).toBe(kind);
    expect(durationMinutes(example.start, example.end)).toBe(total);
    const steps = calculationSteps(example);
    expect(steps.map(step => step.minutes)).toEqual([...Array(hours).fill(60), ...Array(fives).fill(5)]);
    expect(steps.reduce((sum, step) => sum + step.minutes, 0)).toBe(total);
    expect(steps[0].from).toEqual(example.start);
    expect(steps.at(-1)?.to).toEqual(example.end);
    steps.forEach((step, i) => {
      expect(durationMinutes(step.from, step.to)).toBe(step.minutes);
      if (i) expect(step.from).toEqual(steps[i - 1].to);
    });
  });
  it('renders all examples, both clock angles, digital times, role/day labels, explanations, answers and focus', () => {
    click('כמה זמן עבר ונשאר?');
    expect(relativeTimeExamples).toHaveLength(12);
    expect(button('הדוגמה הקודמת').disabled).toBe(true);
    click('הדוגמה הקודמת');
    expect(container.textContent).toContain('השעה אומרת מתי. משך הזמן אומר כמה זמן');
    expect(container.textContent).toContain('60 דקות הן שעה');
    expect(container.textContent).toContain('90 דקות הן שעה ו־30 דקות');
    expect(container.textContent).toContain('שעה וחצי');
    for (let index = 0; index < 12; index++) {
      const [sh, sm, eh, em, , kind, hours, fives] = fixtures[index];
      const example = relativeTimeExamples[index];
      const card = container.querySelector('.relative-time-card')!;
      expect(card.querySelector('h2')?.textContent).toBe(`דוגמה ${index + 1} מתוך 12: ${example.stage}`);
      expect(document.activeElement).toBe(card.querySelector('h2'));
      expect(card.querySelector('.relative-question')?.textContent).toBe(kind === 'elapsed' ? 'כמה זמן עבר?' : 'כמה זמן נשאר?');
      expect(card.querySelector('.relative-answer')?.textContent).toBe(answers[index]);
      expect(card.textContent).toContain(example.story);
      const figures = [...card.querySelectorAll('figure')];
      expect(figures).toHaveLength(2);
      figures.forEach((figure, i) => {
        const [hour, minute] = i ? [eh, em] : [sh, sm];
        const role = kind === 'elapsed' ? i ? 'עכשיו' : 'התחלנו' : i ? 'הפעילות מתחילה' : 'עכשיו';
        const period = i ? example.endPeriod : example.startPeriod;
        expect(figure.querySelector('h3')?.textContent).toBe(role);
        expect(figure.querySelector('bdi')?.textContent).toBe(`${hour}:${String(minute).padStart(2, '0')}`);
        expect(figure.querySelector('bdi')?.getAttribute('dir')).toBe('ltr');
        expect(figure.querySelector('title')?.textContent).toBe(`${role}: ${hour}:${String(minute).padStart(2, '0')} ${period}`);
        expect(figure.querySelector('figcaption')?.textContent).toContain(period);
        expect(figure.querySelector('[data-hand="hour"]')?.getAttribute('transform')).toBe(`rotate(${hour % 12 * 30 + minute * .5} 150 150)`);
        expect(figure.querySelector('[data-hand="minute"]')?.getAttribute('transform')).toBe(minute ? `rotate(${minute * 6} 150 150)` : null);
        expect(figure.querySelector('svg')?.getAttribute('role')).toBe('img');
      });
      expect(card.querySelectorAll('.relative-timeline li')).toHaveLength(hours + fives);
      expect(card.querySelectorAll('.timeline-arrow')).toHaveLength(hours + fives - 1);
      const steps = calculationSteps(example);
      [...card.querySelectorAll('.relative-timeline li')].forEach((li, i) => {
        expect(li.querySelector('.timeline-number')?.textContent).toBe(String(i + 1));
        expect(li.querySelectorAll('bdi')[0].textContent).toBe(`${steps[i].from.hour}:${String(steps[i].from.minute).padStart(2, '0')}`);
        expect(li.querySelectorAll('bdi')[1].textContent).toBe(`${steps[i].to.hour}:${String(steps[i].to.minute).padStart(2, '0')}`);
        expect(li.querySelector('strong')?.textContent).toBe(steps[i].minutes === 60 ? 'עוד שעה' : 'עוד 5 דקות');
      });
      if (index === 3) expect(card.textContent).toContain('עשר בבוקר');
      if ([1, 3, 7, 9].includes(index)) expect(card.textContent).toContain('סדר האירועים וחלק היום');
      if (index === 10) expect(card.querySelector('.relative-summary')?.textContent).toBe('מ־3:15 עד 4:15: שעה. ועוד 30 דקות עד 4:45.');
      if (index === 11) expect(card.querySelector('.relative-summary')?.textContent).toBe('מ־4:20 עד 5:20: שעה. ועוד 40 דקות עד 6:00.');
      expect(container.querySelector('[role="slider"]')).toBeNull();
      if (index < 11) click('הדוגמה הבאה');
    }
    expect(button('הדוגמה הבאה').disabled).toBe(true);
    click('הדוגמה הבאה'); expect(container.querySelector('h2')?.textContent).toContain('12 מתוך 12');
    for (let index = 10; index >= 0; index--) {
      click('הדוגמה הקודמת'); expect(container.querySelector('h2')?.textContent).toContain(`דוגמה ${index + 1} מתוך 12`);
    }
    expect(button('הדוגמה הקודמת').disabled).toBe(true);
    expect(container.querySelector('main')?.getAttribute('dir')).toBe('rtl');
    click('חזרה לבית'); expect(document.activeElement).toBe(button('כמה זמן עבר ונשאר?'));
    for (const entry of ['התחל ללמוד', 'נלמד חצי שעה', 'לימוד רבע שעה', 'לימוד דקות', 'לימוד דקות מדויקות']) expect(button(entry)).toBeDefined();
    click('כמה זמן עבר ונשאר?'); expect(container.querySelector('h2')?.textContent).toContain('דוגמה 1 מתוך 12');
  });
  it('formats duration independently of clock time', () => {
    expect(durationLabel(60)).toBe('שעה'); expect(durationLabel(90)).toBe('שעה ו־30 דקות');
    expect(durationLabel(120)).toBe('שעתיים'); expect(durationLabel(180)).toBe('3 שעות');
  });
});
