// @vitest-environment jsdom
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { RewardsProvider, useRewards } from './Rewards';
import { App } from '../App';
import { baselineStorageKey } from '../baseline/assessment';
import { activityStorageKey } from '../myDay/activities';
import { grant, emptyLedger, characters, practiceSizes, readLedger, restartRun, rewardStorageKey, validLedger, writeLedger, type PracticeId } from './ledger';
let container: HTMLDivElement, root: Root;
Object.assign(globalThis, {IS_REACT_ACT_ENVIRONMENT:true});
beforeEach(()=>{localStorage.clear();container=document.createElement('div');document.body.append(container);root=createRoot(container);act(()=>root.render(<App/>));});
afterEach(()=>{act(()=>root.unmount());container.remove();vi.restoreAllMocks();});
function click(label:string){const b=[...container.querySelectorAll('button')].find(b=>b.textContent===label)!;expect(b).toBeDefined();act(()=>b.click());}
function key(key:string){act(()=>container.querySelector('[role="slider"]')!.dispatchEvent(new KeyboardEvent('keydown',{key,bubbles:true})));}
function remount(){act(()=>root.unmount());root=createRoot(container);act(()=>root.render(<App/>));}
function openReading(){click('התחל ללמוד');click('נתרגל קריאת שעון');}
const saved=()=>readLedger().ledger;
describe('reward ledger',()=>{
  it('grants each of the 224 questions across 20 modes only once, with independent restarted runs',()=>{
    let ledger=emptyLedger();let count=0;
    expect(Object.keys(practiceSizes)).toHaveLength(20);
    for(const [practice,size] of Object.entries(practiceSizes))for(let i=0;i<size;i++){
      const result=grant(ledger,practice as PracticeId,i);expect(result.awarded).toBe(true);ledger=result.ledger;count++;
      expect(grant(ledger,practice as PracticeId,i)).toMatchObject({awarded:false,ledger});expect(ledger.stars).toBe(count);expect(ledger.points).toBe(count*10);expect(validLedger(ledger)).toBe(true);
    }
    expect(count).toBe(224);const id=ledger.runs['day-compare']!.id;ledger=restartRun(ledger,'day-compare');expect(ledger.runs['day-compare']!.id).not.toBe(id);expect(ledger.stars).toBe(224);
    ledger=grant(ledger,'day-compare',0).ledger;expect(ledger.stars).toBe(225);expect(ledger.runs['full-reading']!.awarded).toHaveLength(6);
  });
  it('opens exactly at 10,20,30 stars without consuming stars and keeps all characters after restart',()=>{
    let ledger=emptyLedger();
    for(let n=1;n<=31;n++){
      ledger=restartRun(ledger,'full-reading');const result=grant(ledger,'full-reading',0);ledger=result.ledger;
      expect(ledger.stars).toBe(n);expect(ledger.points).toBe(n*10);
      expect(ledger.unlocked).toEqual(n<10?[]:n<20?['spark']:n<30?['spark','dew']:['spark','dew','glow']);
      expect(result.opened).toEqual(n===10?['spark']:n===20?['dew']:n===30?['glow']:[]);
    }
    expect(restartRun(ledger,'full-reading').unlocked).toEqual(['spark','dew','glow']);
  });
  it('rejects corrupt totals, unlocks, duplicate questions, invalid runs and versions while preserving raw data',()=>{
    const ledger=grant(emptyLedger(),'full-reading',0).ledger;
    const cases=['{','null','{}',JSON.stringify({...ledger,version:2}),JSON.stringify({...ledger,points:5}),JSON.stringify({...ledger,stars:-1}),JSON.stringify({...ledger,unlocked:['spark']}),JSON.stringify({...ledger,runs:{'full-reading':{id:'a',awarded:[0,0]}}}),JSON.stringify({...ledger,runs:{'full-reading':{id:'a',awarded:[6]}}}),JSON.stringify({...ledger,runs:{'fake':{id:'a',awarded:[]}}}),JSON.stringify({...ledger,runs:[]})];
    for(const raw of cases){localStorage.setItem(rewardStorageKey,raw);expect(readLedger().blocked).toBe(true);expect(localStorage.getItem(rewardStorageKey)).toBe(raw);}
    vi.spyOn(Storage.prototype,'getItem').mockImplementation(()=>{throw new Error('blocked');});expect(readLedger().blocked).toBe(true);
  });
});
describe('reward UI and persistence',()=>{
  it('handles two award requests before React renders without doubling the transaction',()=>{
    function DoubleAward(){const rewards=useRewards();return <button onClick={()=>{rewards.award('full-reading',0);rewards.award('full-reading',0);}}>double</button>;}
    act(()=>root.render(<RewardsProvider><DoubleAward/></RewardsProvider>));click('double');expect(saved().stars).toBe(1);expect(saved().points).toBe(10);expect(saved().runs['full-reading']!.awarded).toEqual([0]);
  });
  const modes: [PracticeId,string,string,string|null][] = [
    ['full-setting','התחל ללמוד','נתרגל עם המחוג',null],['full-reading','התחל ללמוד','נתרגל קריאת שעון','1:00'],
    ['half-setting','נלמד חצי שעה','תרגול כיוון חצי שעה',null],['half-reading','נלמד חצי שעה','תרגול קריאת חצי שעה','1:30'],['half-mixed','נלמד חצי שעה','תרגול משולב','4:00'],
    ['quarter-setting','לימוד רבע שעה','תרגול כיוון רבעי שעות',null],['quarter-reading','לימוד רבע שעה','תרגול קריאת רבעי שעות','7:15'],['quarter-mixed','לימוד רבע שעה','תרגול משולב — שעות שלמות, חצאים ורבעים',null],
    ['five-setting','לימוד דקות','תרגול כיוון דקות',null],['five-reading','לימוד דקות','תרגול קריאת דקות','12:05'],['five-mixed','לימוד דקות','תרגול משולב — כל כפולות ה־5',null],
    ['exact-setting','לימוד דקות מדויקות','תרגול כיוון דקות מדויקות',null],['exact-reading','לימוד דקות מדויקות','תרגול קריאת דקות מדויקות','8:01'],['exact-mixed','לימוד דקות מדויקות','תרגול משולב — כל הדקות',null],
    ['relative-elapsed','כמה זמן עבר ונשאר?','תרגול זמן שעבר','3 שעות'],['relative-remaining','כמה זמן עבר ונשאר?','תרגול זמן שנותר','3 שעות'],['relative-mixed','כמה זמן עבר ונשאר?','תרגול משולב — זמן שעבר ונשאר','3 שעות'],
    ['day-identify','לימוד חלקי היום','תרגול זיהוי חלק היום','בוקר'],['day-compare','לימוד חלקי היום','תרגול אותה שעה, הקשר שונה','בוקר'],['day-mixed','לימוד חלקי היום','תרגול משולב — חלקי היום','בוקר'],
  ];
  it.each(modes)('connects %s to the shared reward rules', (practice,home,entry,answer)=>{
    click(home);click(entry);expect(saved().stars).toBe(0);
    if(practice==='day-compare'){
      for(const [i,label] of ['בוקר','ערב'].entries()) {const b=[...container.querySelectorAll('.day-period-answers')[i].querySelectorAll('button')].find(b=>b.textContent===label)!;act(()=>b.click());}
    }else if(answer)click(answer);else for(let i=0;i<(practice==='full-setting'?5:1);i++)key('ArrowRight');
    if(container.querySelector('button') && [...container.querySelectorAll('button')].some(b=>b.textContent==='בדיקה'))click('בדיקה');
    expect(saved().stars).toBe(1);expect(saved().points).toBe(10);expect(saved().runs[practice]!.awarded).toEqual([0]);
    expect(container.querySelector('[role="status"]')?.textContent).toBe('כל הכבוד! קיבלת כוכב ו־10 נקודות');
  });

  it('awards after retry, prevents repeated clicks/navigation/remount duplicates, allows explicit restart and summarizes the run',()=>{
    openReading();click('3:00');expect(saved().stars).toBe(0);click('1:00');expect(saved().stars).toBe(1);expect(container.querySelector('[role="status"]')?.textContent).toBe('כל הכבוד! קיבלת כוכב ו־10 נקודות');
    const disabled=container.querySelector('.reading-answers button') as HTMLButtonElement;act(()=>disabled.click());expect(saved().stars).toBe(1);
    const id=saved().runs['full-reading']!.id;click('חזרה לבית');expect(container.querySelector('.reward-totals')?.textContent).toContain('10 נקודות ו־כוכב אחד');openReading();click('1:00');expect(saved().stars).toBe(1);expect(container.querySelector('[role="status"]')?.textContent).toContain('כבר קיבלת');
    remount();openReading();click('1:00');expect(saved().stars).toBe(1);expect(saved().runs['full-reading']!.id).toBe(id);
    click('התחלה מחדש — רצף תגמולים חדש');click('1:00');expect(saved().stars).toBe(2);expect(saved().runs['full-reading']!.id).not.toBe(id);
    for(const h of [3,6,8,10,12]){click('התרגיל הבא');click(`${h}:00`);}click('התרגיל הבא');expect(container.querySelector('.reward-summary')?.textContent).toBe('ברצף הזה צברת 60 נקודות ו־6 כוכבים.');expect(saved().stars).toBe(7);
    click('תרגלו שוב');click('1:00');expect(saved().stars).toBe(8);
  });
  it('does not reward repeated setting success after moving the same hand again',()=>{
    click('התחל ללמוד');click('נתרגל עם המחוג');for(let i=0;i<5;i++)key('ArrowRight');click('בדיקה');expect(saved().stars).toBe(1);
    key('ArrowRight');click('בדיקה');expect(saved().stars).toBe(1);key('ArrowLeft');click('בדיקה');expect(saved().stars).toBe(1);
  });
  it('rewards comparisons only when both selections are right, as one question',()=>{
    click('לימוד חלקי היום');click('תרגול אותה שעה, הקשר שונה');
    const choose=(i:number,label:string)=>{const b=[...container.querySelectorAll('.day-period-answers')[i].querySelectorAll('button')].find(e=>e.textContent===label)!;act(()=>b.click());};
    choose(0,'בוקר');const wrong=[...container.querySelectorAll('.day-period-answers')[1].querySelectorAll('button')].find(b=>b.textContent!=='ערב')!.textContent!;choose(1,wrong);click('בדיקה');expect(saved().stars).toBe(0);choose(1,'ערב');click('בדיקה');expect(saved().stars).toBe(1);expect(saved().runs['day-compare']!.awarded).toEqual([0]);
  });
  it('shows unlocks without blocking Next and renders all three actual illustrations, locked states and remaining stars',()=>{
    const ledger=emptyLedger();ledger.stars=9;ledger.points=90;writeLedger(ledger);remount();openReading();click('1:00');expect(container.querySelector('.reward-unlock')?.textContent).toContain('ניצוץ');expect(container.querySelector('[role="dialog"]')).toBeNull();click('התרגיל הבא');click('חזרה לבית');click('האוסף שלי');
    expect(container.querySelectorAll('.character-card img')).toHaveLength(3);expect(container.querySelectorAll('.character-locked')).toHaveLength(2);expect(container.textContent).toContain('עוד 10 כוכבים לפתיחת טל');expect(container.querySelector('h1')).toBe(document.activeElement);click('חזרה לבית');expect(document.activeElement?.textContent).toBe('האוסף שלי');
    const all={...saved(),stars:30,points:300,unlocked:characters.map(c=>c.id)};writeLedger(all);remount();click('האוסף שלי');expect(container.querySelectorAll('.character-locked')).toHaveLength(0);expect(container.textContent).toContain('כל שלוש הדמויות נפתחו');
  });
  it('keeps pending awards across navigation and saves retries without duplicating them',()=>{
    const spy=vi.spyOn(Storage.prototype,'setItem').mockImplementation(()=>{throw new Error('quota');});openReading();click('1:00');expect(container.querySelector('[role="alert"]')?.textContent).toContain('לא הצלחנו לשמור');click('נסו לשמור תגמולים שוב');click('חזרה לבית');expect(container.querySelector('.reward-totals')?.textContent).toContain('10 נקודות');openReading();click('1:00');expect(container.querySelector('[role="status"]')?.textContent).toContain('כבר קיבלת');
    spy.mockRestore();click('נסו לשמור תגמולים שוב');expect(saved().stars).toBe(1);expect(saved().runs['full-reading']!.awarded).toEqual([0]);expect(container.querySelector('[role="alert"]')).toBeNull();
    remount();openReading();click('1:00');expect(saved().stars).toBe(1);
  });
  it('protects corrupt data even after success or restart, and lessons/Baseline/My Day never earn rewards',()=>{
    localStorage.setItem(rewardStorageKey,'broken');localStorage.setItem(baselineStorageKey,'baseline');localStorage.setItem(activityStorageKey,'activities');remount();openReading();click('1:00');click('התחלה מחדש — רצף תגמולים חדש');click('חזרה לבית');expect(localStorage.getItem(rewardStorageKey)).toBe('broken');expect(container.querySelector('.reward-totals')?.textContent).toContain('10 נקודות');
    localStorage.clear();remount();click('מאיפה מתחילים?');click('בואו נתחיל');click('עדיין לא יודע/ת');click('השאלה הבאה');click('יציאה בלי לשמור בדיקה חלקית');click('מבנה השעון');click('עוד 15 דקות');click('חזרה לבית');click('היום שלי');click('חזרה לבית');expect(saved().stars).toBe(0);expect(localStorage.getItem(rewardStorageKey)).toBeNull();
  });
});
