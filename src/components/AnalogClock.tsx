import { useEffect, useId, useRef, type PointerEvent } from 'react';
import { fullHourFromPoint } from '../learning/fullHour';

import { angleDelta, formatTime, minuteAngleFromPoint, minutesFromTime, timeFromMinutes, type ClockTime } from '../learning/clockTime';

import { hourNames } from '../learning/examples';

/** Each interaction mode keeps both hands tied to a single time. */
export function AnalogClock({ hour = 7, minute = 0, onHourChange, onTimeChange, minuteStep = 30, showMinuteLabels = false, timeDescription }: { hour?: number; minute?: number; onHourChange?: (hour: number) => void; onTimeChange?: (time: ClockTime) => void; minuteStep?: 5 | 15 | 30; showMinuteLabels?: boolean; timeDescription?: string }) {
  const titleId = useId();
  const draggingPointer = useRef<number | null>(null);
  const clock = useRef<SVGSVGElement>(null);
  const dragAngle = useRef<number | null>(null);
  const dragMinutes = useRef(0);
  const time = { hour, minute: minute as ClockTime['minute'] };
  const interactive = Boolean(onHourChange || onTimeChange);
  // Chromium touch gestures must be cancelled at the start of a valid drag.
  useEffect(() => {
    const svg = clock.current!;
    function preventGesture(event: TouchEvent) {
      if (event.touches.length === 1 && event.target instanceof Element && event.target.closest('[role="slider"]')) event.preventDefault();
    }
    if (interactive) svg.addEventListener('touchstart', preventGesture, { passive: false });
    return () => svg.removeEventListener('touchstart', preventGesture);
  }, [interactive]);
  function pointAngle(event: PointerEvent<SVGElement>) {
    const bounds = clock.current!.getBoundingClientRect();
    if (!bounds.width || !bounds.height) return null;
    return minuteAngleFromPoint((event.clientX - bounds.left) * 300 / bounds.width - 150,
      (event.clientY - bounds.top) * 300 / bounds.height - 150);
  }
  function updateTime(event: PointerEvent<SVGElement>) {
    const angle = pointAngle(event);
    if (angle === null) return;
    if (dragAngle.current !== null) {
      dragMinutes.current += angleDelta(dragAngle.current, angle) / 6;
      onTimeChange?.(timeFromMinutes(dragMinutes.current, minuteStep));
    }
    dragAngle.current = angle;
  }
  function updateDrag(event: PointerEvent<SVGElement>) {
    if (onTimeChange) updateTime(event);
    else updateHour(event);
  }
  function updateHour(event: PointerEvent<SVGElement>) {
    const bounds = clock.current!.getBoundingClientRect();
    if (!bounds.width || !bounds.height) return;
    const selected = fullHourFromPoint(
      (event.clientX - bounds.left) * 300 / bounds.width - 150,
      (event.clientY - bounds.top) * 300 / bounds.height - 150,
    );
    if (selected !== null) onHourChange?.(selected);
  }
  function endDrag(event: PointerEvent<SVGSVGElement>) {
    if (draggingPointer.current !== event.pointerId) return;
    draggingPointer.current = null;
    dragAngle.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  }

  return (
    <svg ref={clock} className={`analog-clock${interactive ? ' interactive-clock' : ''}`} viewBox="0 0 300 300"
      role={interactive ? 'group' : 'img'} aria-labelledby={titleId}
      onPointerMove={event => { if (draggingPointer.current === event.pointerId) updateDrag(event); }}
      onPointerUp={event => { if (draggingPointer.current === event.pointerId) updateDrag(event); endDrag(event); }} onPointerCancel={endDrag}
      onLostPointerCapture={() => { draggingPointer.current = null; }}>

      <title id={titleId}>{timeDescription ?? `שעון אנלוגי המציג את השעה ${hourNames[hour % 12]}${minute === 45 ? " ארבעים וחמש" : minute === 30 ? " וחצי" : minute === 0 ? "" : ` ו־${minute} דקות`}`}</title>
      <circle cx="150" cy="150" r="143" fill="#fff" stroke="#dbe4f1" strokeWidth="8" />
      {Array.from({ length: 60 }, (_, index) => (
        <line key={index} x1="150" y1="18" x2="150" y2={index % 5 === 0 ? '30' : '23'}
          transform={`rotate(${index * 6} 150 150)`} stroke="#b6c4d8" strokeWidth={index % 5 === 0 ? 3 : 1.5} />
      ))}
      {Array.from({ length: 12 }, (_, index) => {
        const hour = index + 1;
        const angle = hour * Math.PI / 6;
        return <text key={hour} x={150 + Math.sin(angle) * 106} y={150 - Math.cos(angle) * 106}
          textAnchor="middle" dominantBaseline="central" fill="#243450" fontSize="24" fontWeight="700">{hour}</text>;
      })}
      {showMinuteLabels && Array.from({ length: 12 }, (_, index) => {
        const number = index + 1;
        const angle = number * Math.PI / 6;
        return <text key={number} data-minute-label={number} x={150 + Math.sin(angle) * 128} y={150 - Math.cos(angle) * 128}
          textAnchor="middle" dominantBaseline="central" fill="#167d87" fontSize="12" fontWeight="700">{number === 12 ? '60/00' : number * 5}</text>;
      })}
      <line data-hand="hour" x1="150" y1="150" x2="150" y2="78" transform={`rotate(${(hour % 12) * 30 + minute * 0.5} 150 150)`}
        stroke="#7357c8" strokeWidth="12" strokeLinecap="round" />
      <line data-hand="minute" transform={minute === 0 ? undefined : `rotate(${minute * 6} 150 150)`} x1="150" y1="150" x2="150" y2="60"
        stroke="#167d87" strokeWidth="8" strokeLinecap="round" />
      <circle cx="150" cy="150" r="9" fill="#243450" />
      {onHourChange && !onTimeChange && <g className="hour-control" role="slider" tabIndex={0}
        aria-label="מחוג השעות" aria-valuemin={1} aria-valuemax={12} aria-valuenow={hour}
        aria-valuetext={`השעה ${hourNames[hour % 12]}, ${hour}:00`} aria-orientation="horizontal"
        onPointerDown={event => {
          if (!event.isPrimary || event.button !== 0 || draggingPointer.current !== null) return;
          event.preventDefault();
          event.currentTarget.focus();
          draggingPointer.current = event.pointerId;
          clock.current!.setPointerCapture(event.pointerId);
          updateHour(event);
        }}
        onKeyDown={event => {
          let next: number;
          if (event.key === 'ArrowRight' || event.key === 'ArrowUp') next = hour % 12 + 1;
          else if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') next = (hour + 10) % 12 + 1;
          else if (event.key === 'Home') next = 1;
          else if (event.key === 'End') next = 12;
          else return;
          event.preventDefault();
          onHourChange(next);
        }}>
        <line x1="150" y1="150" x2="150" y2="78" transform={`rotate(${(hour % 12) * 30 + minute * 0.5} 150 150)`}
          stroke="transparent" strokeWidth="52" strokeLinecap="round" />
        <circle className="hour-grip" cx="150" cy="78" r="12" transform={`rotate(${(hour % 12) * 30 + minute * 0.5} 150 150)`}
          fill="#7357c8" stroke="#fff" strokeWidth="3" />
      </g>}
      {onTimeChange && <g className="hour-control" role="slider" tabIndex={0}
        aria-label="מחוג הדקות" aria-valuemin={0} aria-valuemax={720 - minuteStep} aria-valuenow={minutesFromTime(time)}
        aria-valuetext={`השעה ${formatTime(time)}`} aria-orientation="horizontal"
        onPointerDown={event => {
          if (!event.isPrimary || event.button !== 0 || draggingPointer.current !== null) return;
          const angle = pointAngle(event);
          if (angle === null) return;
          event.preventDefault();
          event.currentTarget.focus({ preventScroll: true });
          draggingPointer.current = event.pointerId;
          dragAngle.current = angle;
          dragMinutes.current = minutesFromTime(time);
          clock.current!.setPointerCapture(event.pointerId);
        }}
        onKeyDown={event => {
          let next: number;
          if (event.key === 'ArrowRight' || event.key === 'ArrowUp') next = minutesFromTime(time) + minuteStep;
          else if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') next = minutesFromTime(time) - minuteStep;
          else if (event.key === 'Home') next = 0;
          else if (event.key === 'End') next = 720 - minuteStep;
          else return;
          event.preventDefault();
          onTimeChange(timeFromMinutes(next, minuteStep));
        }}>
        <line x1="150" y1="150" x2="150" y2="60" transform={`rotate(${minute * 6} 150 150)`}
          stroke="transparent" strokeWidth="52" strokeLinecap="round" />
        <circle className="hour-grip" cx="150" cy="60" r="12" transform={`rotate(${minute * 6} 150 150)`}
          fill="#167d87" stroke="#fff" strokeWidth="3" />
      </g>}

    </svg>
  );
}
