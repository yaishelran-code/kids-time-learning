// @vitest-environment jsdom
import { act, useState } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { App } from '../App';
import { AnalogClock } from '../components/AnalogClock';
import { formatTime, timeFromMinutes, type ClockTime } from './clockTime';
import { fiveMinutesExercises, fiveMinutesPracticeTitles, type FiveMinutesPracticeMode } from './FiveMinutesPractice';

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
function open(mode: FiveMinutesPracticeMode) { click('לימוד דקות'); click('הדוגמה הבאה'); click(fiveMinutesPracticeTitles[mode]); }

describe('five-minute practice', () => {
  it('covers all new minute values, twelve, other hours and mixed practice in both kinds', () => {
    const newMinutes = [5, 10, 20, 25, 35, 40, 50, 55];
    for (const mode of ['setting', 'reading'] as const) {
      expect(fiveMinutesExercises[mode].length).toBeGreaterThanOrEqual(12);
      expect(new Set(fiveMinutesExercises[mode].map(t => t.minute))).toEqual(new Set(newMinutes));
      expect(fiveMinutesExercises[mode].map(formatTime)).toEqual(expect.arrayContaining(['12:05', '12:55']));
      expect(new Set(fiveMinutesExercises[mode].map(t => t.hour)).size).toBeGreaterThan(3);
    }
    const mixed = fiveMinutesExercises.mixed;
    expect(mixed.length).toBeGreaterThanOrEqual(16);
    expect(mixed.filter(t => newMinutes.includes(t.minute)).length).toBeGreaterThanOrEqual(mixed.length / 2);
    for (const kind of ['setting', 'reading']) for (const minute of newMinutes) {
      expect(mixed.some(t => t.kind === kind && t.minute === minute)).toBe(true);
    }
    for (const minute of [0, 15, 30, 45]) expect(mixed.some(t => t.minute === minute)).toBe(true);
    for (const part of [mixed.slice(0, 5), mixed.slice(-5)]) {
      expect(part.some(t => newMinutes.includes(t.minute))).toBe(true);
    }
  });
  it.each(['setting','reading','mixed'] as const)('completes %s with retries, hidden selection, locks, reset and preserved lesson', mode => {
    open(mode);
    const positions: number[] = [];
    const starts: number[] = [];
    const distances: number[] = [];
    let firstStart = 0;
    for (const [index,target] of fiveMinutesExercises[mode].entries()) {
      expect(container.textContent).toContain(`תרגיל ${index+1} מתוך ${fiveMinutesExercises[mode].length}`);
      expect(document.activeElement).toBe(container.querySelector('h1'));
      expect(container.querySelector('.digital-time')).toBeNull();
      expect(container.querySelector('main')?.getAttribute('dir')).toBe('rtl');
      expect(status()).toBe('');
      if(target.kind === 'setting') {
        expect(container.querySelector('.exercise-target bdi')?.textContent).toBe(formatTime(target));
        expect(container.querySelector('.exercise-target bdi')?.getAttribute('dir')).toBe('ltr');
        if (target.hour === 8 && target.minute === 25) expect(container.querySelector('.exercise-target')?.textContent).toContain('שמונה ועשרים וחמש דקות');
        expect(container.querySelector('[role="slider"]')?.getAttribute('aria-valuetext')).not.toBe(`השעה ${formatTime(target)}`);
        const start = Number(container.querySelector('[role="slider"]')!.getAttribute('aria-valuenow'));
        if (index === 0) firstStart = start;
        starts.push(start);
        distances.push(((target.hour % 12 * 60 + target.minute - start + 1080) % 720) - 360);
        click('בדיקה'); expect(status()).toBe('כמעט! נסו שוב');
        expect(status()).not.toContain(formatTime(target));
        key('Home');
        for (let n = 0; n < (target.hour % 12 * 60 + target.minute) / 5; n++) key('ArrowRight');
        hands(target.hour,target.minute); expect(status()).toBe('');
      } else {
        hands(target.hour,target.minute); expect(container.querySelector('[role="slider"]')).toBeNull();
        expect(button('בדיקה').disabled).toBe(true);
        const choices = [...container.querySelectorAll('.reading-answers button')];
        const labels = choices.map(el => el.textContent!);
        expect(new Set(labels).size).toBe(3);
        expect(labels.filter(label => label === formatTime(target))).toHaveLength(1);
        // Compare complete proposed times on the 12-hour cycle, including distractor pairs.
        const totals = labels.map(label => {
          const [hour, minute] = label.split(':').map(Number);
          return hour % 12 * 60 + minute;
        });
        for (let a = 0; a < totals.length; a++) for (let b = a + 1; b < totals.length; b++) {
          const difference = Math.abs(totals[a] - totals[b]);
          expect(Math.min(difference, 720 - difference)).toBeGreaterThanOrEqual(7);
        }
        positions.push(labels.indexOf(formatTime(target)));
        for(const choice of choices) expect(choice.querySelector('bdi')?.getAttribute('dir')).toBe('ltr');
        click(labels.find(label => label !== formatTime(target))!);click('בדיקה');expect(status()).toBe('כמעט! נסו שוב');
        const wrongTimes = labels.filter(label => label !== formatTime(target));
        expect(wrongTimes.some(label => label.split(':')[0] === String(target.hour))).toBe(true);
        expect(wrongTimes.some(label => label.split(':')[1] === String(target.minute).padStart(2, '0'))).toBe(true);
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
    if(mode !== 'setting') expect(new Set(positions).size).toBe(3);
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
    expect(container.textContent).toContain(`תרגיל 1 מתוך ${fiveMinutesExercises[mode].length}`);
    if (mode !== 'reading') expect(Number(container.querySelector('[role="slider"]')!.getAttribute('aria-valuenow'))).toBe(firstStart);
    if (mode === 'reading') expect(button('בדיקה').disabled).toBe(true);
    click('חזרה ללימוד');hands(8,5);
    expect(document.activeElement).toBe(button(fiveMinutesPracticeTitles[mode]));
    click(fiveMinutesPracticeTitles[mode]);expect(status()).toBe('');click('חזרה לבית');
    expect(document.activeElement).toBe(button('לימוד דקות'));
  });
  it('selects all 144 five-minute times and wraps in both directions without changing default snapping', () => {
    open('setting');
    key('Home'); hands(12, 0);
    for (let i = 0; i < 144; i++) { hands(Math.floor(i / 12) || 12, i % 12 * 5); key('ArrowRight'); }
    hands(12, 0); key('ArrowLeft'); hands(11, 55);
    key('ArrowUp'); hands(12, 0); key('ArrowDown'); hands(11, 55);
    key('End'); hands(11, 55); key('Home'); hands(12, 0);
    expect(container.querySelector('[role="slider"]')?.getAttribute('aria-valuemax')).toBe('715');
    expect(timeFromMinutes(8)).toEqual({ hour: 12, minute: 0 });
    expect(timeFromMinutes(8, 15)).toEqual({ hour: 12, minute: 15 });
    for (let total = 0; total < 720; total += 5) for (const offset of [-2, 0, 2]) {
      expect(timeFromMinutes(total + offset, 5)).toEqual(timeFromMinutes(total, 5));
    }
    expect(timeFromMinutes(-5, 5)).toEqual({ hour: 11, minute: 55 });
    expect(timeFromMinutes(725, 5)).toEqual({ hour: 12, minute: 5 });
  });
  it.each(['mouse', 'touch'])('snaps %s drags to five minutes, crosses twelve both ways, and cancels capture', pointerType => {
    function Clock() { const [time, setTime] = useState<ClockTime>({ hour: 12, minute: 55 }); return <AnalogClock {...time} minuteStep={5} onTimeChange={setTime} />; }
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
    dispatch(slider, 'pointerdown', 330, { isPrimary: false });
    dispatch(svg, 'pointermove', 0); hands(12, 55);
    dispatch(slider, 'pointerdown', 330);
    dispatch(svg, 'pointermove', 0, { pointerId: 2 }); hands(12, 55);
    dispatch(svg, 'pointermove', 340); hands(12, 55);
    dispatch(svg, 'pointermove', 350); hands(1, 0);
    dispatch(svg, 'pointermove', 0); hands(1, 0);
    dispatch(svg, 'pointermove', 30); hands(1, 5);
    dispatch(svg, 'pointermove', 0); hands(1, 0);
    dispatch(svg, 'pointermove', 330); hands(12, 55);
    dispatch(svg, 'pointermove', 330, { clientX: 150, clientY: 150 }); hands(12, 55);
    dispatch(svg, 'pointerup', 330);
    expect(svg.releasePointerCapture).toHaveBeenCalledWith(1);
    dispatch(svg, 'pointermove', 0); hands(12, 55);
    dispatch(slider, 'pointerdown', 330);
    dispatch(svg, 'pointercancel', 330);
    dispatch(svg, 'pointermove', 0); hands(12, 55);
    dispatch(slider, 'pointerdown', 330);
    dispatch(svg, 'lostpointercapture', 330);
    dispatch(svg, 'pointermove', 0); hands(12, 55);
  });
  it.each(['setting', 'reading', 'mixed'] as const)('returns home during %s and starts a fresh practice on reentry', mode => {
    open(mode);
    if (mode === 'reading') { click('12:15'); click('בדיקה'); }
    else { key('ArrowLeft'); click('בדיקה'); }
    expect(status()).toBe('כמעט! נסו שוב');
    click('חזרה ללימוד'); hands(8, 5);
    expect(document.activeElement).toBe(button(fiveMinutesPracticeTitles[mode]));
    click(fiveMinutesPracticeTitles[mode]); expect(status()).toBe('');
    expect(container.querySelector('[aria-pressed="true"]')).toBeNull();
    click('חזרה לבית'); expect(document.activeElement).toBe(button('לימוד דקות'));
    click('לימוד דקות'); click(fiveMinutesPracticeTitles[mode]);
    expect(container.textContent).toContain(`תרגיל 1 מתוך ${fiveMinutesExercises[mode].length}`);
    expect(status()).toBe('');
  });
});
