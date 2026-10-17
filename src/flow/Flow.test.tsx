import { allVisible, queryVisible } from '../test/visible';
// @vitest-environment jsdom
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { App } from '../App';
import { readLedger } from '../rewards/ledger';
import { readParentState } from '../parent/state';
let root:Root, container:HTMLDivElement;
Object.assign(globalThis,{IS_REACT_ACT_ENVIRONMENT:true});
beforeEach(()=>{localStorage.clear();container=document.createElement('div');document.body.append(container);root=createRoot(container);act(()=>root.render(<App/>));});
afterEach(()=>{act(()=>root.unmount());container.remove();vi.restoreAllMocks();});
function visible(e:Element){return !e.closest('[hidden]');}
function click(label:string){const buttons=[...allVisible<HTMLButtonElement>(container, 'button')].filter(visible);const b=buttons.find(b=>b.textContent===label);expect(b,label).toBeDefined();act(()=>b!.click());}
function open(topic='שעות שלמות',mode='קריאת שעון'){click('בואו נתרגל');click(topic);click('נתחיל לתרגל');click(mode);}
function back(){act(()=>window.dispatchEvent(new PopStateEvent('popstate',{state:{flow:{page:'practice',topic:'full'}}})));}
function text(){return [...allVisible(container, 'main')].filter(visible).map(e=>e.textContent).join('');}
describe('child trial flow',()=>{
 it('enters practice directly, keeps success locks and rewards across help and Home, and does not reaward',()=>{
  open();click('1:00');expect(readLedger().ledger.stars).toBe(1);click('צריך עזרה?');expect(queryVisible(container, 'dialog')).not.toBeNull();back();
  expect(queryVisible(container, 'dialog')).toBeNull();expect(text()).toContain('קיבלת כוכב');expect([...allVisible<HTMLButtonElement>(container, '.reading-answers button')].every(b=>b.disabled)).toBe(true);
  click('התרגיל הבא');click('חזרה לבית');click('המשך התרגול');expect(text()).toContain('תרגיל 2 מתוך');expect(readLedger().ledger.stars).toBe(1);
 });
 it('preserves incorrect choices and counters through expanded and structural help',()=>{
  open();click('3:00');expect(readParentState().state.mistakes.full).toBe(1);click('צריך עזרה?');click('נלמד עוד');click('נכיר את המחוגים');
  const slider=queryVisible(container, '[role="slider"][aria-label="מחוג הדקות"]')!;act(()=>slider.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowRight',bubbles:true})));back();
  expect(text()).toContain('כמעט');expect(queryVisible(container, '.reading-answers [aria-pressed="true"]')?.textContent).toBe('3:00');expect(readParentState().state.mistakes.full).toBe(1);expect(readLedger().ledger.stars).toBe(0);
 });
 it('does not bypass a third-mistake pause through help, and unlocks the same question with PIN',()=>{
  open();click('3:00');click('3:00');click('3:00');click('צריך עזרה?');back();expect(text()).toContain('בואו נעצור');
  const input=queryVisible<HTMLInputElement>(container, 'input[type="password"]')!;act(()=>{Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value')!.set!.call(input,'1212');input.dispatchEvent(new Event('input',{bubbles:true}));});act(()=>queryVisible(container, 'form')!.dispatchEvent(new Event('submit',{bubbles:true,cancelable:true})));
  expect(text()).toContain('תרגיל 1 מתוך');click('1:00');expect(readLedger().ledger.stars).toBe(1);
 });
 it('requires confirmation before replacing an unfinished practice and permits cancel',()=>{
  open();click('חזרה לבית');click('בואו נתרגל');click('חצי שעה');click('נתחיל לתרגל');click('כיוון שעון');expect(queryVisible(container, 'dialog')).not.toBeNull();click('להישאר עם התרגול שלי');click('חזרה לבית');click('המשך התרגול');expect(text()).toContain('קוראים את השעון');
 });
 it('learns first then enters a selected mode, uses approved names and explanations',()=>{
  click('בואו נתרגל');click('קפיצות של 5 דקות');expect(text()).toContain('בין מספר למספר בשעון עוברות 5 דקות');click('נלמד קודם');click('נתחיל לתרגל');click('כיוון שעון');expect(queryVisible(container, '[role="slider"]')).not.toBeNull();
 });
 it('offers next topic after completion without automatically starting a new reward run',()=>{
  open();for(const h of [1,3,6,8,10,12]){click(`${h}:00`);click('התרגיל הבא');}expect(text()).toContain('סיימתם');click('לנושא הבא');expect(text()).toContain('חצי שעה');expect(text()).toContain('נלמד קודם');expect(readLedger().ledger.stars).toBe(6);
 });
 it('moves both hands with independent keyboard controls including rollover without earning rewards',()=>{
  click('מבנה השעון');const sliders=allVisible(container, '[role="slider"]');expect(sliders).toHaveLength(2);
  for(const key of ['End','ArrowRight'])act(()=>sliders[1].dispatchEvent(new KeyboardEvent('keydown',{key,bubbles:true})));
  expect(queryVisible(container, '.play-time')?.textContent).toBe('12:00');act(()=>sliders[0].dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowLeft',bubbles:true})));expect(queryVisible(container, '.play-time')?.textContent).toBe('11:00');expect(readLedger().ledger.stars).toBe(0);expect(readParentState().state.mistakes.full).toBe(0);
 });
 it('protects unsaved My Day changes and leaves only after confirmation',()=>{
  click('היום שלי');click('הוספת פעילות');const input=queryVisible(container, 'input')!;act(()=>{Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value')!.set!.call(input,'משחק');input.dispatchEvent(new Event('input',{bubbles:true}));});click('חזרה לבית');click('להישאר ולערוך');expect(queryVisible(container, 'input')?.value).toBe('משחק');click('חזרה לבית');click('לעזוב בלי לשמור');expect(text()).toContain('לומדים את השעה');
 });
 it('uses one resumable practice for lesson entry, direct entry and next-topic completion',()=>{
  click('התחל ללמוד');click('הדוגמה הבאה');click('נתרגל קריאת שעון');click('1:00');click('התרגיל הבא');
  click('חזרה ללימוד');expect(queryVisible(container,'.digital-time')?.textContent).toBe('7:00');
  click('נתרגל קריאת שעון');expect(text()).toContain('תרגיל 2 מתוך');click('חזרה לבית');click('המשך התרגול');
  for(const h of [3,6,8,10,12]){click(`${h}:00`);click('התרגיל הבא');}
  expect(readLedger().ledger.stars).toBe(6);click('לנושא הבא');expect(text()).toContain('חצי שעה');
 });

});
