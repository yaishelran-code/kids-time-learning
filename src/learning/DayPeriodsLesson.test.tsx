import { allVisible, queryVisible, visibleText } from '../test/visible';
// @vitest-environment jsdom
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { App } from '../App';
import { dayExamples, dayPeriodAt } from './dayPeriods';

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
let container: HTMLDivElement;
let root: Root;
beforeEach(() => {
  container = document.createElement('div'); document.body.append(container);
  root = createRoot(container); act(() => root.render(<App />));
});
afterEach(() => { act(() => root.unmount()); container.remove(); });
function button(label: string) { return [...allVisible(container, 'button')].find(item => item.textContent === label)!; }
function click(label: string) { act(() => button(label).click()); if (label.startsWith('תרגול') || label.startsWith('נתרגל')) { const restart = allVisible<HTMLButtonElement>(container, 'button').find(b=>b.textContent==='התחלה מחדש — רצף תגמולים חדש' || b.textContent==='תרגלו שוב'); if(restart)act(()=>restart.click()); } }

describe('day-period classification', () => {
  it.each([
    [0, 'night'], [1, 'night'], [299, 'night'], [300, 'morning'], [301, 'morning'],
    [719, 'morning'], [720, 'noon'], [721, 'noon'],
    [899, 'noon'], [900, 'afternoon'], [901, 'afternoon'],
    [1079, 'afternoon'], [1080, 'evening'], [1081, 'evening'],
    [1259, 'evening'], [1260, 'night'], [1261, 'night'], [1439, 'night'],
    [1440, 'night'], [1441, 'night'], [1739, 'night'], [1740, 'morning'],
    [-1, 'night'], [-1440, 'night'], [-1140, 'morning'],
  ])('classifies minute %s as %s, including boundaries and midnight', (minutes, period) => {
    expect(dayPeriodAt(minutes).id).toBe(period);
  });
});

// Acceptance fixtures are independent of lesson data and rendering calculations.
const fixtures = [
  ['7:00', 'בוקר', 'בבוקר', 'מתארגנים לבית הספר', 210, 0, 420],
  ['10:00', 'בוקר', 'בבוקר', 'לומדים בכיתה', 300, 0, 600],
  ['12:00', 'צהריים', 'בצהריים', 'אוכלים ארוחת צהריים', 0, 0, 720],
  ['1:30', 'צהריים', 'בצהריים', 'חוזרים מבית הספר', 45, 180, 810],
  ['4:00', 'אחר הצהריים', 'אחר הצהריים', 'הולכים לחוג', 120, 0, 960],
  ['5:30', 'אחר הצהריים', 'אחר הצהריים', 'משחקים', 165, 180, 1050],
  ['7:00', 'ערב', 'בערב', 'אוכלים ארוחת ערב', 210, 0, 1140],
  ['8:30', 'ערב', 'בערב', 'מתכוננים לשינה', 255, 180, 1230],
  ['10:00', 'לילה', 'בלילה', 'ישנים', 300, 0, 1320],
  ['2:00', 'לילה', 'בלילה', 'עדיין ישנים', 60, 0, 120],
] as const;
function hands(element: Element) {
  return ['hour', 'minute'].map(hand => element.querySelector(`[data-hand="${hand}"]`)?.getAttribute('transform'));
}

describe('parts-of-day lesson', () => {
  it('shows all ten specified examples with exact clocks, context, accessible names and navigation', () => {
    click('לימוד חלקי היום');
    expect(dayExamples).toHaveLength(10);
    expect(queryVisible(container, 'main')?.getAttribute('dir')).toBe('rtl');
    expect(button('הדוגמה הקודמת').disabled).toBe(true);
    click('הדוגמה הקודמת');
    expect(visibleText(container)).toContain('אצל משפחות שונות עושים דברים בשעות שונות');
    for (let i = 0; i < fixtures.length; i++) {
      const [time, name, context, activity, hourAngle, minuteAngle, minutes] = fixtures[i];
      const card = queryVisible(container, '.day-example')!;
      expect(dayExamples[i].minutes).toBe(minutes);
      expect(card.querySelector('h2')?.textContent).toBe(`דוגמה ${i + 1} מתוך 10`);
      expect(document.activeElement).toBe(card.querySelector('h2'));
      expect(card.querySelector('.digital-time')?.textContent).toBe(time);
      expect(card.querySelector('.digital-time')?.getAttribute('dir')).toBe('ltr');
      expect(card.querySelector('.day-time > span')?.textContent).toBe(context);
      expect(card.querySelector('.day-period')?.textContent).toContain(name);
      expect(card.querySelector('.clock-caption')?.textContent).toBe(activity);
      expect(card.querySelector('.day-story')?.textContent).toContain('נועה');
      expect(card.querySelector('svg title')?.textContent).toBe(`${time} ${context}`);
      expect(card.querySelector('svg')?.getAttribute('role')).toBe('img');
      expect(hands(card)).toEqual([`rotate(${hourAngle} 150 150)`, minuteAngle ? `rotate(${minuteAngle} 150 150)` : null]);
      expect(queryVisible(container, '.day-sequence [aria-current="step"]')?.textContent).toContain(name);
      for (const digital of allVisible(container, 'bdi')) expect(digital.textContent).toMatch(/^(?:[1-9]|1[0-2]):[0-5]\d$/);
      if (i < 9) click('הדוגמה הבאה');
    }
    expect(queryVisible(container, '.day-story')?.textContent).toContain('אחרי חצות');
    expect(queryVisible(container, '.day-story')?.textContent).toContain('הבוקר של יום חדש');
    expect(button('הדוגמה הבאה').disabled).toBe(true);
    click('הדוגמה הבאה'); expect(queryVisible(container, '.day-example h2')?.textContent).toBe('דוגמה 10 מתוך 10');
    for (let i = 8; i >= 0; i--) {
      click('הדוגמה הקודמת');
      expect(queryVisible(container, '.day-example .digital-time')?.textContent).toBe(fixtures[i][0]);
      expect(document.activeElement).toBe(queryVisible(container, '.day-example h2'));
    }
    expect(button('הדוגמה הקודמת').disabled).toBe(true);
    expect(queryVisible(container, '[role="slider"]')).toBeNull();
    expect([...allVisible(container, 'button')].map(item => item.textContent)).toEqual(['הדוגמה הקודמת', 'הדוגמה הבאה',
      'תרגול זיהוי חלק היום', 'תרגול אותה שעה, הקשר שונה', 'תרגול משולב — חלקי היום', 'חזרה לבית']);
    click('חזרה לבית');
    expect(queryVisible(container, 'h1')?.textContent).toBe('לומדים את השעה');
    expect(document.activeElement).toBe(button('לימוד חלקי היום'));
    for (const entry of ['התחל ללמוד', 'נלמד חצי שעה', 'לימוד רבע שעה', 'קפיצות של 5 דקות', 'צעדים של דקה אחת', 'כמה זמן עבר ונשאר?']) expect(button(entry)).toBeDefined();
    click('לימוד חלקי היום'); expect(queryVisible(container, '.day-example h2')?.textContent).toBe('דוגמה 1 מתוך 10');
  });

  it('orders five labeled symbols and arrows, and teaches the next morning', () => {
    click('לימוד חלקי היום');
    const items = [...allVisible(container, '.day-sequence li')];
    expect(items).toHaveLength(5);
    expect(items.map(item => item.childNodes[1].textContent)).toEqual(['בוקר', 'צהריים', 'אחר הצהריים', 'ערב', 'לילה']);
    expect(new Set(items.map(item => item.querySelector('span')?.textContent)).size).toBe(5);
    expect(allVisible(container, '.day-sequence-arrow')).toHaveLength(4);
    expect([...allVisible(container, '.day-sequence-arrow')].every(item => item.textContent === '↓')).toBe(true);
    expect(visibleText(container)).toContain('מתקדמים מלמעלה למטה לפי החצים');
    expect(visibleText(container)).toContain('אחרי הלילה מגיע הבוקר של יום חדש');
  });

  it('compares both identical hand pairs with different periods, stories, activities and symbols', () => {
    click('לימוד חלקי היום');
    const pairs = [...allVisible(container, '.day-comparison')];
    expect(pairs).toHaveLength(2);
    for (const [i, pair] of pairs.entries()) {
      const figures = [...pair.querySelectorAll('figure')];
      expect(figures).toHaveLength(2);
      expect(hands(figures[0])).toEqual(hands(figures[1]));
      expect(hands(figures[0])).toEqual([`rotate(${i === 0 ? 210 : 300} 150 150)`, null]);
      expect(figures.map(figure => figure.querySelector('bdi')?.textContent)).toEqual(i === 0 ? ['7:00', '7:00'] : ['10:00', '10:00']);
      expect(figures.map(figure => figure.querySelector('.day-time > span')?.textContent)).toEqual(i === 0 ? ['בבוקר', 'בערב'] : ['בבוקר', 'בלילה']);
      for (const selector of ['.day-period span', '.clock-caption', 'title']) expect(figures[0].querySelector(selector)?.textContent).not.toBe(figures[1].querySelector(selector)?.textContent);
      const stories = [...pair.querySelectorAll('.day-comparison-grid > div > p')];
      expect(stories[0].textContent).not.toBe(stories[1].textContent);
    }
    expect(visibleText(container)).toContain('השעון לבדו לא אומר אם זו שעה בבוקר או בערב. צריך לדעת גם את חלק היום');
  });
});
