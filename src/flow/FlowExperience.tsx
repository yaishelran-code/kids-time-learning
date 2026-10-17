import { ConfirmDialog } from './ConfirmDialog';
import { useCallback, useEffect, useRef, useState } from 'react';
import { FlowContext, LessonContext, type PracticeMeta } from './context';
import { ClockStructureLesson } from '../learning/ClockStructureLesson';
import { FullHoursLesson } from '../learning/FullHoursLesson';
import { HalfHoursLesson } from '../learning/HalfHoursLesson';
import { QuarterHoursLesson } from '../learning/QuarterHoursLesson';
import { FiveMinutesLesson } from '../learning/FiveMinutesLesson';
import { ExactMinutesLesson } from '../learning/ExactMinutesLesson';
import { RelativeTimeLesson } from '../learning/RelativeTimeLesson';
import { DayPeriodsLesson } from '../learning/DayPeriodsLesson';
import { FullHoursExercise } from '../learning/FullHoursExercise';
import { FullHoursReadingExercise } from '../learning/FullHoursReadingExercise';
import { HalfHoursPractice, type PracticeMode } from '../learning/HalfHoursPractice';
import { QuarterHoursPractice } from '../learning/QuarterHoursPractice';
import { FiveMinutesPractice } from '../learning/FiveMinutesPractice';
import { ExactMinutesPractice } from '../learning/ExactMinutesPractice';
import { RelativeTimePractice, type RelativeTimePracticeMode } from '../learning/RelativeTimePractice';
import { DayPeriodsPractice } from '../learning/DayPeriodsPractice';
import type { DayPracticeMode } from '../learning/dayPeriodPractice';
import { useRewards } from '../rewards/Rewards';
export const topics = ['structure','full','half','quarter','five','exact','relative','day'] as const;
export type FlowTopic = typeof topics[number];
type Topic = FlowTopic;
export type FlowCommand = {id:number; topic?:Topic; resume?:boolean; mode?:string; fromLesson?:boolean};
export const names: Record<Topic,string> = {structure:'מבנה השעון',full:'שעות שלמות',half:'חצי שעה',quarter:'רבע שעה',five:'קפיצות של 5 דקות',exact:'צעדים של דקה אחת',relative:'כמה זמן עבר ונשאר?',day:'חלקי היום'};
const descriptions: Partial<Record<Topic,string>> = {five:'בין מספר למספר בשעון עוברות 5 דקות',exact:'בין שני סימונים קטנים בשעון עוברת דקה אחת'};
type Route = {page:'topics'|'intro'|'modes'|'lesson'|'practice'; topic:Topic; fromPractice?: boolean};
type Session = {topic:Topic;mode:string;id:number;fromLesson?:boolean};
export function FlowExperience({ active, command, onHome, onSession, onLessonReturn }: {active:boolean; command:FlowCommand;onHome:()=>void;onSession:(exists:boolean)=>void;onLessonReturn:(topic:FlowTopic)=>boolean}) {
 const [route,setRoute]=useState<Route>({page:'topics',topic:'structure'});
 const [session,setSession]=useState<Session|null>(null);
 const [meta,setMeta]=useState<PracticeMeta|null>(null);
 const [pending,setPending]=useState<Session|null>(null);
 const sequence=useRef(0);
 const current=useRef({route,active});current.current={route,active};
 const report=useCallback((value:PracticeMeta)=>setMeta(value),[]);
 const {resetVersion}=useRewards();
 const seenReset=useRef(resetVersion);
 useEffect(()=>{if(seenReset.current!==resetVersion){seenReset.current=resetVersion;setSession(null);setMeta(null);setPending(null);onSession(false);if(route.page==='practice')setRoute({page:'topics',topic:'structure'});}},[resetVersion,onSession,route.page]);
 function go(next:Route){history.pushState({flow:next},'');setRoute(next);}
 useEffect(()=>{
  if(!command.id)return;
  if(command.mode && command.topic){start(command.mode,command.topic,true);}
  else if(command.resume){setRoute(r=>({...r,page:'practice'}));history.pushState({flow:{page:'practice',topic:session?.topic??'full'}},'');}
  else {const next:Route={page:command.topic?'intro':'topics',topic:command.topic??'structure'};setRoute(next);history.pushState({flow:next},'');}
 // Commands are intentional entry requests, not a response to session updates.
 // eslint-disable-next-line react-hooks/exhaustive-deps
 },[command.id]);
 useEffect(()=>{const back=(event:PopStateEvent)=>{
  if(event.state?.help)return;
  if(event.state?.flow){const next=event.state.flow as Route;setRoute(next.page==='practice'?(session?{page:'practice',topic:session.topic}:{page:'topics',topic:'structure'}):next);setPending(null);}else if(current.current.active) onHome();
 };window.addEventListener('popstate',back);return()=>window.removeEventListener('popstate',back);},[onHome,session]);
 useEffect(()=>{
  if(!active)return;
  const root=document.querySelector<HTMLElement>('[data-flow-visible="true"]');
  const target=route.page==='practice'?(root?.querySelector<HTMLElement>('input[type="password"], button:not([disabled]).next-question')??root?.querySelector<HTMLElement>('.exercise-feedback + button:not([disabled]), [role="slider"], .reading-answers button:not([disabled]), main h1')):root?.querySelector<HTMLElement>('h1');target?.focus();
 },[active,route]);
 function start(mode:string,topic:Topic = route.topic,fromLesson = false){
  if(session?.topic===topic && session.mode===mode){go({page:'practice',topic});return;}
  const next={topic,mode,id:++sequence.current,fromLesson};
  if(session && !meta?.completed){setRoute({page:'modes',topic});setPending(next);return;}
  install(next);
 }
 function install(next:Session){setSession(next);setMeta(null);setPending(null);onSession(true);go({page:'practice',topic:next.topic});}
 const nextTopic=()=>{const i=topics.indexOf(session?.topic??route.topic);go(i===topics.length-1?{page:'topics',topic:'structure'}:{page:'intro',topic:topics[i+1]});};
 const home=()=>{history.pushState({home:true},'');onHome();};
 const lesson=route.topic==='structure'?<ClockStructureLesson onHome={home} onFullHours={()=>go({page:'intro',topic:'full'})}/>:route.topic==='full'?<FullHoursLesson onHome={home}/>:route.topic==='half'?<HalfHoursLesson onHome={home}/>:route.topic==='quarter'?<QuarterHoursLesson onHome={home}/>:route.topic==='five'?<FiveMinutesLesson onHome={home}/>:route.topic==='exact'?<ExactMinutesLesson onHome={home}/>:route.topic==='relative'?<RelativeTimeLesson onHome={home}/>:<DayPeriodsLesson onHome={home}/>;
 const props={onHome:home,onLesson:()=>{if(session?.fromLesson && onLessonReturn(session.topic))return;go({page:'lesson',topic:session?.topic??route.topic,fromPractice:true});}};
 const practice=!session?null:session.topic==='full'?(session.mode==='setting'?<FullHoursExercise {...props}/>:<FullHoursReadingExercise {...props}/>):session.topic==='half'?<HalfHoursPractice mode={session.mode as PracticeMode} {...props}/>:session.topic==='quarter'?<QuarterHoursPractice mode={session.mode as PracticeMode} {...props}/>:session.topic==='five'?<FiveMinutesPractice mode={session.mode as PracticeMode} {...props}/>:session.topic==='exact'?<ExactMinutesPractice mode={session.mode as PracticeMode} {...props}/>:session.topic==='relative'?<RelativeTimePractice mode={session.mode as RelativeTimePracticeMode} {...props}/>:<DayPeriodsPractice mode={session.mode as DayPracticeMode} {...props}/>;
 const modes=route.topic==='relative'?[['elapsed','זמן שעבר'],['remaining','זמן שנותר'],['mixed','תרגול משולב']]:route.topic==='day'?[['identify','זיהוי חלק היום'],['compare','השוואה'],['mixed','תרגול משולב']]:[['setting','כיוון שעון'],['reading','קריאת שעון'],...(route.topic==='full'?[]:[['mixed','תרגול משולב']])];
 if (!active && !session) return null;
 return <div hidden={!active} data-flow-visible={active} dir="rtl">
  {route.page!=='practice' && <>
   {route.page==='lesson'?<LessonContext.Provider value={mode=>start(mode)}><div className="flow-lesson"><nav className="home lesson-controls" aria-label="המשך מהלימוד"><button type="button" className="start-button" onClick={()=>route.fromPractice&&session?go({page:'practice',topic:session.topic}):go({page:'modes',topic:route.topic==='structure'?'full':route.topic})}>{route.fromPractice&&session?'חזרה לשאלה':'נתחיל לתרגל'}</button></nav>{lesson}</div></LessonContext.Provider>:<main className="home" dir="rtl"><h1 tabIndex={-1}>{route.page==='topics'?'מה נתרגל היום?':names[route.topic]}</h1>
    {route.page==='topics'?<div className="topic-grid">{topics.map(t=><section key={t}><button type="button" className="secondary-button" aria-describedby={descriptions[t]?`topic-${t}`:undefined} onClick={()=>go({page:'intro',topic:t})}>{names[t]}</button>{descriptions[t]&&<p id={`topic-${t}`}>{descriptions[t]}</p>}</section>)}</div>:<>
     {descriptions[route.topic]&&<p>{descriptions[route.topic]}</p>}
     {route.page==='intro'?<div className="lesson-controls">{route.topic!=='structure'&&<button type="button" className="start-button" onClick={()=>go({page:'modes',topic:route.topic})}>נתחיל לתרגל</button>}<button type="button" className="secondary-button" onClick={()=>go({page:'lesson',topic:route.topic})}>נלמד קודם</button></div>:<div className="lesson-controls">{modes.map(([mode,label])=><button key={mode} type="button" className="start-button" onClick={()=>start(mode)}>{label}</button>)}</div>}
    </>}
    <button type="button" className="secondary-button home-button" onClick={home}>חזרה לבית</button>
   </main>}
  </>}
  <FlowContext.Provider value={{report,nextTopic,nextLabel:session?.topic==='day'?'בחירת נושא':'לנושא הבא'}}><div hidden={route.page!=='practice'} key={session?.id??0}>{practice}</div></FlowContext.Provider>
  {pending&&<ConfirmDialog onCancel={()=>{if(pending?.fromLesson)onLessonReturn(pending.topic);setPending(null);}}><section aria-label="החלפת תרגול"><h2 tabIndex={-1} ref={el=>el?.focus()}>להחליף את התרגול שלא הסתיים?</h2><p>השאלה הפעילה לא תישמר. הכוכבים, הנקודות ומוני הטעויות נשארים.</p><button type="button" className="start-button" onClick={()=>install(pending)}>כן, להחליף תרגול</button><button type="button" className="secondary-button" onClick={()=>{if(pending?.fromLesson)onLessonReturn(pending.topic);setPending(null);}}>להישאר עם התרגול שלי</button></section></ConfirmDialog>}
 </div>;
}
