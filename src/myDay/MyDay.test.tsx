// @vitest-environment jsdom
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { App } from '../App';
import { activityStorageKey, loadActivities, resolveActivityTime, saveActivities, sortedActivities } from './activities';
let container: HTMLDivElement, root: Root;
Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
beforeEach(() => { localStorage.clear(); container = document.createElement('div'); document.body.append(container); root = createRoot(container); act(() => root.render(<App />)); });
afterEach(() => { act(() => root.unmount()); container.remove(); vi.restoreAllMocks(); });
function click(label: string) { const b = [...container.querySelectorAll('button')].find(x => x.textContent === label || x.getAttribute('aria-label') === label)!; expect(b).toBeDefined(); act(() => b.click()); }
function field(label: string, value: string) {
  const l = [...container.querySelectorAll('label')].find(x => x.firstChild?.textContent === label)!;
  const e = l.querySelector('input, select') as HTMLInputElement;
  act(() => { Object.getOwnPropertyDescriptor(e.tagName === 'INPUT' ? HTMLInputElement.prototype : HTMLSelectElement.prototype, 'value')!.set!.call(e, value); e.dispatchEvent(new Event(e.tagName === 'INPUT' ? 'input' : 'change', { bubbles: true })); });
}
function add(name: string, hour: number, minute: number, period: string) { click('הוספת פעילות'); field('שם הפעילות', name); field('שעה', String(hour)); field('דקות', String(minute)); field('חלק ביום', period); click('שמירת פעילות'); }
function names() { return [...container.querySelectorAll('.activity-list h2')].map(x => x.textContent); }

describe('activity time and storage', () => {
  it('resolves noon, midnight and every period boundary without accepting incompatible choices', () => {
    for (const [h,m,p,total] of [[12,0,'night',0],[12,0,'noon',720],[4,59,'night',299],[5,0,'morning',300],[11,59,'morning',719],[2,59,'noon',899],[3,0,'afternoon',900],[5,59,'afternoon',1079],[6,0,'evening',1080],[8,59,'evening',1259],[9,0,'night',1260]] as const) expect(resolveActivityTime(h,m,p)).toBe(total);
    expect(resolveActivityTime(7,0,'noon')).toBeNull(); expect(resolveActivityTime(12,0,'morning')).toBeNull();
    expect(resolveActivityTime(0,0,'night')).toBeNull(); expect(resolveActivityTime(7,60,'morning')).toBeNull();
  });
  it('sorts from midnight with stable equal times without mutating saved insertion order', () => {
    const a = [{id:'a',name:'a',minutes:720},{id:'b',name:'b',minutes:0},{id:'c',name:'c',minutes:720},{id:'d',name:'d',minutes:120}];
    expect(sortedActivities(a).map(x=>x.id)).toEqual(['b','d','a','c']); expect(a.map(x=>x.id)).toEqual(['a','b','c','d']);
  });
  it('rejects corrupt or invalid storage and preserves the original data', () => {
    for (const raw of ['{','{}','[null]','[{"id":"a","name":" ","minutes":2}]','[{"id":"a","name":"ok","minutes":1440}]','[{"id":"a","name":"ok","minutes":0},{"id":"a","name":"other","minutes":1}]']) {
      localStorage.setItem(activityStorageKey,raw); expect(loadActivities()).toEqual({activities:[],error:true}); expect(localStorage.getItem(activityStorageKey)).toBe(raw);
    }
  });
  it('handles unavailable storage reads and writes without throwing', () => {
    vi.spyOn(Storage.prototype,'getItem').mockImplementation(() => { throw new Error('blocked'); });
    vi.spyOn(Storage.prototype,'setItem').mockImplementation(() => { throw new Error('quota'); });
    expect(loadActivities().error).toBe(true); expect(saveActivities([])).toBe(false);
  });
});
describe('My Day', () => {
  it('adds, edits, confirms/cancels deletion, persists and restores Home focus', () => {
    click('היום שלי'); expect(container.textContent).toContain('עדיין אין פעילויות');
    add('משחק',7,30,'evening'); add('חצות',12,0,'night'); add('ארוחה',12,0,'noon'); add('עוד ארוחה',12,0,'noon'); add('אחרי חצות',2,1,'night');
    expect(names()).toEqual(['חצות','אחרי חצות','ארוחה','עוד ארוחה','משחק']);
    const clocks = [...container.querySelectorAll('.activity-list svg')];
    expect(clocks[0].querySelector('[data-hand="hour"]')?.getAttribute('transform')).toBe('rotate(0 150 150)');
    expect(clocks[1].querySelector('[data-hand="hour"]')?.getAttribute('transform')).toBe('rotate(60.5 150 150)');
    expect(clocks[1].querySelector('[data-hand="minute"]')?.getAttribute('transform')).toBe('rotate(6 150 150)');
    expect([...container.querySelectorAll('.activity-list bdi')].map(x=>x.textContent)).toEqual(['12:00','2:01','12:00','12:00','7:30']);
    click('עריכת משחק'); field('שם הפעילות','משחק חדש'); field('שעה','7'); field('דקות','5'); field('חלק ביום','morning'); click('שמירת פעילות');
    expect(names()).toEqual(['חצות','אחרי חצות','משחק חדש','ארוחה','עוד ארוחה']);
    click('מחיקת ארוחה'); expect(container.querySelector('[role="alertdialog"]')).not.toBeNull(); click('ביטול מחיקה'); expect(names()).toContain('ארוחה');
    click('מחיקת ארוחה'); click('כן, למחוק'); expect(names()).not.toContain('ארוחה');
    expect(JSON.parse(localStorage.getItem(activityStorageKey)!).length).toBe(4);
    click('חזרה לבית'); expect(document.activeElement?.textContent).toBe('היום שלי'); click('היום שלי'); expect(names()).toEqual(['חצות','אחרי חצות','משחק חדש','עוד ארוחה']);
    expect(container.querySelector('main')?.dir).toBe('rtl');
  });
  it('explains invalid names and period combinations, and supports cancelling edits', () => {
    click('היום שלי'); click('הוספת פעילות'); field('שם הפעילות','  '); click('שמירת פעילות'); expect(container.querySelector('[role="alert"]')?.textContent).toContain('כתבו שם');
    field('שם הפעילות','פעילות'); field('חלק ביום','noon'); click('שמירת פעילות'); expect(container.querySelector('[role="alert"]')?.textContent).toContain('לא מתאימים'); expect(names()).toHaveLength(0);
    field('חלק ביום','morning'); click('שמירת פעילות'); click('עריכת פעילות'); field('שם הפעילות','לא נשמר'); click('ביטול'); expect(names()).toEqual(['פעילות']);
  });
  it('keeps in-memory changes on write failure and lets saving recover', () => {
    click('היום שלי'); const spy=vi.spyOn(Storage.prototype,'setItem').mockImplementation(() => {throw new Error('quota');});
    add('לא אבד',7,0,'morning'); expect(names()).toEqual(['לא אבד']); expect(container.querySelector('[role="alert"]')?.textContent).toContain('לא הצלחנו לשמור');
    spy.mockRestore(); click('נסו לשמור שוב'); expect(container.querySelector('[role="alert"]')).toBeNull(); expect(loadActivities().activities[0].name).toBe('לא אבד');
  });
  it('shows corrupted-data warning without automatically overwriting it', () => {
    localStorage.setItem(activityStorageKey,'broken'); click('היום שלי'); expect(container.querySelector('[role="alert"]')?.textContent).toContain('לא הצלחנו לטעון'); expect(localStorage.getItem(activityStorageKey)).toBe('broken');
  });
});
