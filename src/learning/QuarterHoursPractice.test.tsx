// @vitest-environment jsdom
import { act, useState } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { App } from '../App';
import { AnalogClock } from '../components/AnalogClock';
import { formatTime, timeFromMinutes, type ClockTime } from './clockTime';
import { quarterExercises, quarterPracticeTitles, type QuarterPracticeMode } from './QuarterHoursPractice';

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
function open(mode: QuarterPracticeMode) { click('לימוד רבע שעה'); click('הדוגמה הבאה'); click(quarterPracticeTitles[mode]); }

describe('quarter-hour practice', () => {
  it('has all required targets and balanced mixed coverage', () => {
    expect(quarterExercises.setting.map(formatTime)).toEqual(['7:15','7:45','1:15','3:45','8:15','10:45','12:15','12:45']);
    expect(quarterExercises.reading.map(formatTime)).toEqual(quarterExercises.setting.map(formatTime));
    expect(quarterExercises.mixed).toHaveLength(12);
    expect(quarterExercises.mixed.filter(t => t.minute === 15 || t.minute === 45).length).toBeGreaterThanOrEqual(6);
    for (const kind of ['setting','reading']) for (const minute of [0,15,30,45]) {
      expect(quarterExercises.mixed.some(t => t.kind === kind && t.minute === minute)).toBe(true);
    }
  });
  it.each(['setting','reading','mixed'] as const)('completes %s with retries, hidden selection, locks, reset and preserved lesson', mode => {
    open(mode);
    const positions: number[] = [];
    for (const [index,target] of quarterExercises[mode].entries()) {
      expect(container.textContent).toContain(`תרגיל ${index+1} מתוך ${quarterExercises[mode].length}`);
      expect(document.activeElement).toBe(container.querySelector('h1'));
      expect(container.querySelector('.digital-time')).toBeNull();
      expect(container.querySelector('main')?.getAttribute('dir')).toBe('rtl');
      expect(status()).toBe('');
      if(target.kind === 'setting') {
        expect(container.querySelector('.exercise-target bdi')?.textContent).toBe(formatTime(target));
        expect(container.querySelector('.exercise-target bdi')?.getAttribute('dir')).toBe('ltr');
        expect(container.querySelector('[role="slider"]')?.getAttribute('aria-valuetext')).not.toBe(`השעה ${formatTime(target)}`);
        click('בדיקה'); expect(status()).toBe('כמעט! נסו שוב');
        key('ArrowRight'); hands(target.hour,target.minute); expect(status()).toBe('');
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
        click(formatTime(target));expect(status()).toBe('');
      }
      expect(container.textContent).not.toContain('התרגיל הבא');
      click('בדיקה');expect(status()).toBe('כל הכבוד! תשובה נכונה 🎉');
      expect(document.activeElement).toBe(button('התרגיל הבא'));
      expect(container.querySelector('[role="slider"]')).toBeNull();
      expect([...container.querySelectorAll('.reading-answers button')].every(el => (el as HTMLButtonElement).disabled)).toBe(true);
      expect(container.textContent).not.toContain('רבע לשמונה');
      click('התרגיל הבא');
    }
    if(mode !== 'setting') expect(new Set(positions).size).toBe(3);
    expect(container.querySelector('h1')?.textContent).toContain('סיימתם');
    expect(container.querySelector('h1')?.textContent).toContain(mode === 'setting' ? 'כיוון' : mode === 'reading' ? 'קריאת' : 'החצאים והרבעים');
    expect(container.textContent).not.toContain('תרגיל 1 מתוך');
    click('תרגלו שוב');expect(status()).toBe('');expect(container.querySelector('[aria-pressed="true"]')).toBeNull();
    expect(container.textContent).toContain(`תרגיל 1 מתוך ${quarterExercises[mode].length}`);
    click('חזרה ללימוד');hands(7,15);
    expect(document.activeElement).toBe(button(quarterPracticeTitles[mode]));
    click(quarterPracticeTitles[mode]);expect(status()).toBe('');click('חזרה לבית');
    expect(document.activeElement).toBe(button('לימוד רבע שעה'));
  });
  it('selects all 48 quarter-hour times and wraps keyboard movement across twelve', () => {
    open('setting');
    key('Home');hands(12,0);
    for(let i=0;i<48;i++) { hands(Math.floor(i/4)||12,i%4*15);key('ArrowRight'); }
    hands(12,0);key('ArrowLeft');hands(11,45);key('End');hands(11,45);
    key('Home');key('ArrowDown');hands(11,45);key('ArrowUp');hands(12,0);
    expect(container.querySelector('[role="slider"]')?.getAttribute('aria-valuemax')).toBe('705');
    expect(timeFromMinutes(7)).toEqual({hour:12,minute:0});
    expect(timeFromMinutes(8,15)).toEqual({hour:12,minute:15});
  });
  it.each(['mouse','touch'])('snaps %s drags to quarters and tracks forward/reverse across twelve', pointerType => {
    function Clock() { const [time,setTime]=useState<ClockTime>({hour:12,minute:45}); return <AnalogClock {...time} minuteStep={15} onTimeChange={setTime} />; }
    act(() => root.render(<Clock />));
    const svg=container.querySelector('svg')!;
    vi.spyOn(svg,'getBoundingClientRect').mockReturnValue({left:0,top:0,width:300,height:300} as DOMRect);
    Object.assign(svg,{setPointerCapture:vi.fn(),hasPointerCapture:()=>true,releasePointerCapture:vi.fn()});
    const dispatch=(el: Element,type:string,angle:number) => {const e=new Event(type,{bubbles:true,cancelable:true});Object.assign(e,{pointerId:1,isPrimary:true,button:0,pointerType,clientX:150+90*Math.sin(angle*Math.PI/180),clientY:150-90*Math.cos(angle*Math.PI/180)});act(()=>el.dispatchEvent(e));};
    dispatch(container.querySelector('[role="slider"]')!,'pointerdown',270);
    dispatch(svg,'pointermove',310);hands(12,45);
    dispatch(svg,'pointermove',340);hands(1,0);
    dispatch(svg,'pointermove',0);hands(1,0);
    dispatch(svg,'pointermove',90);hands(1,15);
    dispatch(svg,'pointermove',0);hands(1,0);
    dispatch(svg,'pointermove',270);hands(12,45);
    dispatch(svg,'pointerup',270);
    expect(svg.releasePointerCapture).toHaveBeenCalledWith(1);
  });
});
