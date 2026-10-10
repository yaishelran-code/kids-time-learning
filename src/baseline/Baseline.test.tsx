// @vitest-environment jsdom
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { App } from '../App';
import { activityStorageKey } from '../myDay/activities';
import { baselineStorageKey, completedAssessment, lessonNames, loadAssessment, questions, recommend, saveAssessment, skills, type Results, type StartingPoint } from './assessment';
const correct = ['המחוג הסגול','המחוג הירוק','7:00','2:30','7:15','שמונה בדיוק','המחוג הסגול','המחוג הירוק','12:00','11:30','12:45','שלוש וחצי'];
let container: HTMLDivElement, root: Root;
Object.assign(globalThis,{IS_REACT_ACT_ENVIRONMENT:true});
beforeEach(()=>{localStorage.clear();container=document.createElement('div');document.body.append(container);root=createRoot(container);act(()=>root.render(<App/>));});
afterEach(()=>{act(()=>root.unmount());container.remove();vi.restoreAllMocks();});
function click(label:string){const button=[...container.querySelectorAll('button')].find(e=>e.textContent===label)!;expect(button).toBeDefined();act(()=>button.click());}
function open(){click('מאיפה מתחילים?');click('בואו נתחיל');}
function finish(answers:(string|null)[]=correct){for(let i=0;i<12;i++){click(answers[i]??'עדיין לא יודע/ת');click(i===11?'לנקודת ההתחלה שלי':'השאלה הבאה');}}
function rerender(){act(()=>root.unmount());root=createRoot(container);act(()=>root.render(<App/>));}
describe('baseline content and recommendations',()=>{
  it('covers all six skills twice with unique correct answers and separated clock choices',()=>{
    expect(questions).toHaveLength(12);
    const spokenTimes: Record<string,number> = {'שש בדיוק':360,'שמונה בדיוק':480,'עשר בדיוק':600,'שלוש בדיוק':180,'ארבע וחצי':270,'שלוש וחצי':210};
    skills.forEach(skill=>expect(questions.filter(q=>q.skill===skill)).toHaveLength(2));
    questions.forEach((q,i)=>{expect(q.answer).toBe(correct[i]);expect(q.choices.filter(c=>c===correct[i])).toHaveLength(1);expect(new Set(q.choices).size).toBe(q.choices.length);
      if(q.kind!=='hand'){const minutes=q.choices.map(c=>{if(q.kind==='digital')return spokenTimes[c];const [h,m]=c.split(':').map(Number);return h%12*60+m;});for(let a=0;a<minutes.length;a++)for(let b=a+1;b<minutes.length;b++){const d=Math.abs(minutes[a]-minutes[b]);expect(Math.min(d,720-d)).toBeGreaterThanOrEqual(7);}}
    });
  });
  it('checks all 4096 correct/incorrect answer patterns against independent recommendation rules',()=>{
    for(let mask=0;mask<4096;mask++){
      const answers=correct.map((a,i)=>mask&(1<<i)?a:null);const result=completedAssessment(answers);
      const known=[0,1,2,3,4,5].map(i=>!!(mask&(1<<i))&&!!(mask&(1<<(i+6))));
      const expected=!known[0]||!known[1]||!known[5]?'structure':!known[2]?'fullHours':!known[3]?'halfHours':!known[4]?'quarterHours':'fiveMinutes';
      expect(result.recommendation).toBe(expected);skills.forEach((s,i)=>expect(result.results[s]).toBe(known[i]));
    }
    expect(()=>completedAssessment(correct.slice(1))).toThrow('incomplete');
    expect(completedAssessment(correct.map((_,i)=>questions[i].choices.find(c=>c!==correct[i])!)).recommendation).toBe('structure');
  });
  it('rejects corrupt, partial and inconsistent saved results without overwriting them',()=>{
    const result=completedAssessment(correct);
    for(const raw of ['{','null','{}',JSON.stringify({...result,version:2}),JSON.stringify({...result,recommendation:'structure'}),JSON.stringify({...result,results:{}})]){
      localStorage.setItem(baselineStorageKey,raw);expect(loadAssessment()).toEqual({assessment:null,error:true});expect(localStorage.getItem(baselineStorageKey)).toBe(raw);
    }
    expect(saveAssessment(result)).toBe(true);expect(loadAssessment().assessment).toEqual(result);
    vi.spyOn(Storage.prototype,'getItem').mockImplementation(()=>{throw new Error('blocked');});expect(loadAssessment().error).toBe(true);
  });
});
describe('baseline assessment flow',()=>{
  it('locks each response, gives neutral feedback, hides answers in clock titles and saves only on completion',()=>{
    localStorage.setItem(activityStorageKey,'untouched');open();
    questions.forEach((q,i)=>{
      expect(container.textContent).toContain(`שאלה ${i+1} מתוך 12`);
      expect(container.querySelector('svg title')?.textContent).toBe(q.kind==='digital'?undefined:'השעון בשאלה');
      if(q.kind!=='digital'){
        expect(container.querySelector('[data-hand="hour"]')?.getAttribute('transform')).toBe(`rotate(${q.time.hour%12*30+q.time.minute*.5} 150 150)`);
        expect(container.querySelector('[data-hand="minute"]')?.getAttribute('transform')).toBe(q.time.minute===0?null:`rotate(${q.time.minute*6} 150 150)`);
      }
      click(i===0?'המחוג הירוק':correct[i]);expect(container.querySelector('[role="status"]')?.textContent).toBe('תודה, ממשיכים');
      expect([...container.querySelectorAll('.baseline-answers button')].every(b=>(b as HTMLButtonElement).disabled)).toBe(true);
      expect(container.querySelector('[aria-pressed]')).toBeNull();expect(localStorage.getItem(baselineStorageKey)).toBeNull();
      expect(document.activeElement?.textContent).toBe(i===11?'לנקודת ההתחלה שלי':'השאלה הבאה');click(i===11?'לנקודת ההתחלה שלי':'השאלה הבאה');
    });
    expect(container.textContent).toContain('כדאי להתחיל במבנה השעון');expect(container.textContent).not.toContain('ציון');
    expect(loadAssessment().assessment?.results.hourHand).toBe(false);expect(localStorage.getItem(activityStorageKey)).toBe('untouched');
    click('לשיעור המומלץ');expect(container.querySelector('h1')?.textContent).toBe('מבנה השעון');click('חזרה לבית');expect(document.activeElement?.textContent).toBe('מאיפה מתחילים?');
  });
  it.each(['structure','fullHours','halfHours','quarterHours','fiveMinutes'] as StartingPoint[])('opens the %s recommended lesson and lets Home offer another topic',point=>{
    const results=Object.fromEntries(skills.map(s=>[s,true])) as Results;
    if(point==='structure')results.digital=false;else if(point!=='fiveMinutes')results[point]=false;
    expect(recommend(results)).toBe(point);saveAssessment({version:1,results,recommendation:point});
    click('מאיפה מתחילים?');expect(container.textContent).toContain(lessonNames[point]);click('לשיעור המומלץ');
    expect(container.querySelector('h1')?.textContent).toBe({structure:'מבנה השעון',fullHours:'שעות שלמות',halfHours:'חצי שעה',quarterHours:'לימוד רבע שעה',fiveMinutes:'לימוד דקות'}[point]);
    click('חזרה לבית');click('היום שלי');expect(container.textContent).toContain('עדיין אין פעילויות');
  });
  it('restores completion on remount, preserves the previous result on partial exit, replaces it after a new completion',()=>{
    open();finish();const previous=localStorage.getItem(baselineStorageKey);rerender();click('מאיפה מתחילים?');expect(container.textContent).toContain('דקות בקפיצות של חמש');
    click('בדיקה חדשה');click('עדיין לא יודע/ת');click('השאלה הבאה');click('יציאה בלי לשמור בדיקה חלקית');expect(localStorage.getItem(baselineStorageKey)).toBe(previous);
    click('מאיפה מתחילים?');expect(container.textContent).toContain('דקות בקפיצות של חמש');click('בדיקה חדשה');finish(Array(12).fill(null));expect(loadAssessment().assessment?.recommendation).toBe('structure');
  });
  it('keeps the previous saved result on write failure and supports retry without losing the new recommendation',()=>{
    saveAssessment(completedAssessment(correct));const previous=localStorage.getItem(baselineStorageKey);click('מאיפה מתחילים?');click('בדיקה חדשה');
    const spy=vi.spyOn(Storage.prototype,'setItem').mockImplementation(()=>{throw new Error('quota');});finish(Array(12).fill(null));
    expect(container.textContent).toContain('כדאי להתחיל במבנה השעון');expect(container.querySelector('[role="alert"]')?.textContent).toContain('לא הצלחנו לשמור');expect(localStorage.getItem(baselineStorageKey)).toBe(previous);
    spy.mockRestore();click('נסו לשמור שוב');expect(container.querySelector('[role="alert"]')).toBeNull();expect(loadAssessment().assessment?.recommendation).toBe('structure');
  });
  it('shows a corrupt-read warning without changing stored data on partial exit',()=>{
    localStorage.setItem(baselineStorageKey,'broken');click('מאיפה מתחילים?');expect(container.querySelector('[role="alert"]')).not.toBeNull();click('בואו נתחיל');click('יציאה בלי לשמור בדיקה חלקית');expect(localStorage.getItem(baselineStorageKey)).toBe('broken');
  });
  it('teaches both hands, 12 clock numbers, 12 hours and a complete 60-minute rotation',()=>{
    click('מבנה השעון');expect(container.textContent).toContain('12 שעות');expect(container.textContent).toContain('60 דקות');expect(container.textContent).toContain('המחוג הקצר');expect(container.textContent).toContain('המחוג הארוך');
    for(let i=0;i<=4;i++){
      expect(container.querySelector('.digital-time')?.textContent).toBe(['7:00','7:15','7:30','7:45','8:00'][i]);expect(container.querySelector('[role="status"]')?.textContent).toContain(`עברו ${i*15} דקות`);
      expect(container.querySelector('[data-hand="hour"]')?.getAttribute('transform')).toBe(`rotate(${210+i*7.5} 150 150)`);
      expect(container.querySelector('[data-hand="minute"]')?.getAttribute('transform')).toBe(i===0||i===4?null:`rotate(${i*90} 150 150)`);
      if(i<4)click('עוד 15 דקות');
    }
    click('נראה שוב את הסיבוב');expect(container.querySelector('.digital-time')?.textContent).toBe('7:00');click('נמשיך לשעות שלמות');expect(container.querySelector('h1')?.textContent).toBe('שעות שלמות');
  });
});
