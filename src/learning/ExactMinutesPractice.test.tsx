// @vitest-environment jsdom
import { act, useState } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { App } from '../App';
import { AnalogClock } from '../components/AnalogClock';
import { formatTime, timeFromMinutes, type ClockTime } from './clockTime';
import { exactMinutesExercises, exactMinutesPracticeTitles, type ExactMinutesPracticeMode } from './ExactMinutesPractice';

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
let container: HTMLDivElement;
let root: Root;
beforeEach(() => { container = document.createElement('div'); document.body.append(container); root = createRoot(container); act(() => root.render(<App />)); });
afterEach(() => { act(() => root.unmount()); container.remove(); vi.restoreAllMocks(); });
function button(label: string) { const b = [...container.querySelectorAll('button')].find(el => el.textContent === label); expect(b).toBeDefined(); return b!; }
function click(label: string) { act(() => button(label).click()); }
function key(key: string) { act(() => container.querySelector('[role="slider"]')!.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }))); }
function hands(hour: number, minute: number) {
  expect(container.querySelector('[data-hand="hour"]')?.getAttribute('transform')).toBe(`rotate(${hour % 12 * 30 + minute * .5} 150 150)`);
  expect(container.querySelector('[data-hand="minute"]')?.getAttribute('transform')).toBe(minute ? `rotate(${minute * 6} 150 150)` : null);
}
const status = () => container.querySelector('[role="status"]')?.textContent;
function open(mode: ExactMinutesPracticeMode) { click('לימוד דקות מדויקות'); click('הדוגמה הבאה'); click(exactMinutesPracticeTitles[mode]); }

describe('exact-minute practice', () => {
  it('meets the required fixed sequences, valid times and mixed exact-minute balance', () => {
    for (const mode of ['setting', 'reading'] as const) {
      expect(exactMinutesExercises[mode].length).toBeGreaterThanOrEqual(12);
      expect(exactMinutesExercises[mode].map(formatTime)).toEqual(expect.arrayContaining([
        '8:01', '8:07', '8:23', '8:37', '8:58', '8:59', '12:01', '12:59',
      ]));
      expect(new Set(exactMinutesExercises[mode].map(t => t.hour)).size).toBeGreaterThan(3);
    }
    const reading = exactMinutesExercises.reading;
    expect(reading.some(t => t.minute === 6)).toBe(true);
    expect(reading.some(t => t.minute === 7)).toBe(true);
    const mixed = exactMinutesExercises.mixed;
    expect(mixed.length).toBeGreaterThanOrEqual(20);
    expect(mixed.filter(t => t.minute % 5 !== 0).length).toBeGreaterThanOrEqual(mixed.length / 2);
    for (const kind of ['setting', 'reading']) {
      const exercises = mixed.filter(t => t.kind === kind);
      expect(exercises.filter(t => t.minute % 5 !== 0).length).toBeGreaterThanOrEqual(exercises.length / 2);
      expect(exercises.some(t => t.minute > 0 && t.minute < 5)).toBe(true);
      expect(exercises.some(t => t.minute > 55)).toBe(true);
    }
    for (const minute of [0, 15, 30, 45]) expect(mixed.some(t => t.minute === minute)).toBe(true);
    expect(mixed.some(t => t.minute % 5 === 0 && ![0, 15, 30, 45].includes(t.minute))).toBe(true);
    for (const exercises of Object.values(exactMinutesExercises)) for (const time of exercises) {
      expect(Number.isInteger(time.hour) && time.hour >= 1 && time.hour <= 12).toBe(true);
      expect(Number.isInteger(time.minute) && time.minute >= 0 && time.minute < 60).toBe(true);
    }
  });
  it.each(['setting','reading','mixed'] as const)('completes %s with retries, hidden selection, locks, reset and preserved lesson', mode => {
    open(mode);
    const positions: number[] = [];
    const starts: number[] = [];
    const distances: number[] = [];
    let firstStart = 0;
    const minuteDistances: number[] = [];
    for (const [index,target] of exactMinutesExercises[mode].entries()) {
      expect(container.textContent).toContain(`תרגיל ${index+1} מתוך ${exactMinutesExercises[mode].length}`);
      expect(document.activeElement).toBe(container.querySelector('h1'));
      expect(container.querySelector('.digital-time')).toBeNull();
      expect(container.querySelector('main')?.getAttribute('dir')).toBe('rtl');
      expect(status()).toBe('');
      if(target.kind === 'setting') {
        expect(container.querySelector('.exercise-target bdi')?.textContent).toBe(formatTime(target));
        expect(container.querySelector('.exercise-target bdi')?.getAttribute('dir')).toBe('ltr');
        if (target.minute === 1) expect(container.querySelector('.exercise-target')?.textContent).toContain('ודקה אחת');
        expect(container.querySelector('.exercise-target')?.textContent).not.toContain('undefined');
        expect(container.querySelector('[role="slider"]')?.getAttribute('aria-valuetext')).not.toBe(`השעה ${formatTime(target)}`);
        const start = Number(container.querySelector('[role="slider"]')!.getAttribute('aria-valuenow'));
        if (index === 0) firstStart = start;
        starts.push(start);
        distances.push(((target.hour % 12 * 60 + target.minute - start + 1080) % 720) - 360);
        click('בדיקה'); expect(status()).toBe('כמעט! נסו שוב');
        expect(status()).not.toContain(formatTime(target));
        const delta = ((target.hour % 12 * 60 + target.minute - start + 1080) % 720) - 360;
        for (let n = 0; n < Math.abs(delta); n++) key(delta > 0 ? 'ArrowRight' : 'ArrowLeft');
        hands(target.hour,target.minute); expect(status()).toBe('');
      } else {
        hands(target.hour,target.minute); expect(container.querySelector('[role="slider"]')).toBeNull();
        expect(button('בדיקה').disabled).toBe(true);
        const choices = [...container.querySelectorAll('.reading-answers button')];
        const labels = choices.map(el => el.textContent!);
        expect(new Set(labels).size).toBe(3);
        expect(labels.filter(label => label === formatTime(target))).toHaveLength(1);
        positions.push(labels.indexOf(formatTime(target)));
        for(const choice of choices) expect(choice.querySelector('bdi')?.getAttribute('dir')).toBe('ltr');
        click(labels.find(label => label !== formatTime(target))!);click('בדיקה');expect(status()).toBe('כמעט! נסו שוב');
        const wrongTimes = labels.filter(label => label !== formatTime(target));
        expect(wrongTimes.some(label => label.split(':')[0] === String(target.hour))).toBe(true);
        expect(wrongTimes.some(label => label.split(':')[1] === String(target.minute).padStart(2, '0'))).toBe(true);
        const minuteChoice = wrongTimes.find(label => label.split(':')[0] === String(target.hour))!;
        const difference = Math.abs(Number(minuteChoice.split(':')[1]) - target.minute);
        minuteDistances.push(Math.min(difference, 60 - difference));
        click(formatTime(target));expect(status()).toBe('');
      }
      expect(container.textContent).not.toContain('התרגיל הבא');
      click('בדיקה');expect(status()).toBe('כל הכבוד! תשובה נכונה 🎉');
      expect(document.activeElement).toBe(button('התרגיל הבא'));
      expect(container.querySelector('[role="slider"]')).toBeNull();
      const svg = container.querySelector('svg')!;
      act(() => svg.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true })));
      hands(target.hour, target.minute);
      expect([...container.querySelectorAll('.reading-answers button')].every(el => (el as HTMLButtonElement).disabled)).toBe(true);
      expect(container.textContent).not.toContain('רבע לשמונה');
      click('התרגיל הבא');
    }
    if(mode !== 'setting') {
      expect(new Set(positions).size).toBe(3);
      expect(minuteDistances).toContain(1);
      expect(minuteDistances.some(n => n > 1)).toBe(true);
    }
    if(mode !== 'reading') {
      expect(new Set(starts).size).toBeGreaterThan(3);
      expect(new Set(distances).size).toBeGreaterThan(3);
      expect(distances.some(n => n > 0)).toBe(true);
      expect(distances.some(n => n < 0)).toBe(true);
    }
    expect(container.querySelector('h1')?.textContent).toContain('סיימתם');
    expect(container.querySelector('h1')?.textContent).toContain(mode === 'setting' ? 'כיוון' : mode === 'reading' ? 'קריאת' : 'המשולב');
    expect(container.textContent).not.toContain('תרגיל 1 מתוך');
    click('תרגלו שוב');expect(status()).toBe('');expect(container.querySelector('[aria-pressed="true"]')).toBeNull();
    expect(container.textContent).toContain(`תרגיל 1 מתוך ${exactMinutesExercises[mode].length}`);
    if (mode !== 'reading') expect(Number(container.querySelector('[role="slider"]')!.getAttribute('aria-valuenow'))).toBe(firstStart);
    if (mode === 'reading') expect(button('בדיקה').disabled).toBe(true);
    click('חזרה ללימוד');hands(8,1);
    expect(document.activeElement).toBe(button(exactMinutesPracticeTitles[mode]));
    click(exactMinutesPracticeTitles[mode]);expect(status()).toBe('');click('חזרה לבית');
    expect(document.activeElement).toBe(button('לימוד דקות מדויקות'));
  });
  it('selects every minute, wraps in both directions and preserves earlier snapping', () => {
    open('setting');
    key('Home'); hands(12, 0);
    for (let i = 0; i < 720; i++) { hands(Math.floor(i / 60) || 12, i % 60); key('ArrowRight'); }
    hands(12, 0); key('ArrowLeft'); hands(11, 59);
    key('ArrowUp'); hands(12, 0); key('ArrowDown'); hands(11, 59);
    key('End'); hands(11, 59); key('Home'); hands(12, 0);
    expect(container.querySelector('[role="slider"]')?.getAttribute('aria-valuemax')).toBe('719');
    expect(timeFromMinutes(8)).toEqual({ hour: 12, minute: 0 });
    expect(timeFromMinutes(8, 15)).toEqual({ hour: 12, minute: 15 });
    expect(timeFromMinutes(8, 5)).toEqual({ hour: 12, minute: 10 });
    for (let total = 0; total < 720; total++) {
      expect(timeFromMinutes(total, 1)).toEqual({ hour: Math.floor(total / 60) || 12, minute: total % 60 });
      for (const offset of [-0.49, 0, 0.49]) expect(timeFromMinutes(total + offset, 1)).toEqual(timeFromMinutes(total, 1));
    }
    expect(timeFromMinutes(-1, 1)).toEqual({ hour: 11, minute: 59 });
    expect(timeFromMinutes(721, 1)).toEqual({ hour: 12, minute: 1 });
  });
  it.each(['mouse', 'touch'])('snaps %s drags to one minute, crosses twelve both ways, and cancels capture', pointerType => {
    function Clock() { const [time, setTime] = useState<ClockTime>({ hour: 12, minute: 59 }); return <AnalogClock {...time} minuteStep={1} onTimeChange={setTime} />; }
    act(() => root.render(<Clock />));
    const svg = container.querySelector('svg')!;
    vi.spyOn(svg, 'getBoundingClientRect').mockReturnValue({ left: 0, top: 0, width: 300, height: 300 } as DOMRect);
    Object.assign(svg, { setPointerCapture: vi.fn(), hasPointerCapture: () => true, releasePointerCapture: vi.fn() });
    const dispatch = (el: Element, type: string, angle: number, extra = {}) => {
      const event = new Event(type, { bubbles: true, cancelable: true });
      Object.assign(event, { pointerId: 1, isPrimary: true, button: 0, pointerType,
        clientX: 150 + 90 * Math.sin(angle * Math.PI / 180), clientY: 150 - 90 * Math.cos(angle * Math.PI / 180), ...extra });
      act(() => el.dispatchEvent(event));
    };
    const slider = container.querySelector('[role="slider"]')!;
    dispatch(slider, 'pointerdown', 354, { isPrimary: false });
    dispatch(svg, 'pointermove', 0); hands(12, 59);
    dispatch(slider, 'pointerdown', 354);
    dispatch(svg, 'pointermove', 0, { pointerId: 2 }); hands(12, 59);
    dispatch(svg, 'pointermove', 356.9); hands(12, 59);
    dispatch(svg, 'pointermove', 357.1); hands(1, 0);
    dispatch(svg, 'pointermove', 0); hands(1, 0);
    dispatch(svg, 'pointermove', 6); hands(1, 1);
    dispatch(svg, 'pointermove', 12); hands(1, 2);
    dispatch(svg, 'pointermove', 6); hands(1, 1);
    dispatch(svg, 'pointermove', 0); hands(1, 0);
    dispatch(svg, 'pointermove', 354); hands(12, 59);
    dispatch(svg, 'pointermove', 348); hands(12, 58);
    dispatch(svg, 'pointermove', 354); hands(12, 59);
    dispatch(svg, 'pointermove', 354, { clientX: 150, clientY: 150 }); hands(12, 59);
    dispatch(svg, 'pointerup', 354);
    expect(svg.releasePointerCapture).toHaveBeenCalledWith(1);
    dispatch(svg, 'pointermove', 0); hands(12, 59);
    dispatch(slider, 'pointerdown', 354);
    dispatch(svg, 'pointercancel', 354);
    dispatch(svg, 'pointermove', 0); hands(12, 59);
    dispatch(slider, 'pointerdown', 354);
    dispatch(svg, 'lostpointercapture', 354);
    dispatch(svg, 'pointermove', 0); hands(12, 59);
  });
  it.each(['setting', 'reading', 'mixed'] as const)('returns home during %s and starts a fresh practice on reentry', mode => {
    open(mode);
    if (mode === 'reading') { click('8:02'); click('בדיקה'); }
    else { key('ArrowLeft'); click('בדיקה'); }
    expect(status()).toBe('כמעט! נסו שוב');
    click('חזרה ללימוד'); hands(8, 1);
    expect(document.activeElement).toBe(button(exactMinutesPracticeTitles[mode]));
    click(exactMinutesPracticeTitles[mode]); expect(status()).toBe('');
    expect(container.querySelector('[aria-pressed="true"]')).toBeNull();
    click('חזרה לבית'); expect(document.activeElement).toBe(button('לימוד דקות מדויקות'));
    click('לימוד דקות מדויקות'); click(exactMinutesPracticeTitles[mode]);
    expect(container.textContent).toContain(`תרגיל 1 מתוך ${exactMinutesExercises[mode].length}`);
    expect(status()).toBe('');
  });
});
