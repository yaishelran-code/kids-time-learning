import { useEffect, useRef, type ReactNode } from 'react';
/** Back and Escape cancel; no destructive action is attached to history traversal. */
export function ConfirmDialog({children,onCancel}: {children:ReactNode;onCancel:()=>void}) {
 const dialog=useRef<HTMLDialogElement>(null);
 const cancel=useRef(onCancel);cancel.current=onCancel;
 useEffect(()=>{
  const previous=document.activeElement as HTMLElement|null;
  const element=dialog.current!;element.showModal?.();
  const back=(event:PopStateEvent)=>{event.stopImmediatePropagation();cancel.current();};
  window.addEventListener('popstate',back,true);
  return ()=>{window.removeEventListener('popstate',back,true);element.close?.();previous?.focus();};
 },[]);
 return <dialog ref={dialog} open={typeof HTMLDialogElement.prototype.showModal!=='function'} className="help-dialog" aria-label="אישור פעולה" dir="rtl" onCancel={e=>{e.preventDefault();onCancel();}}>{children}</dialog>;
}
