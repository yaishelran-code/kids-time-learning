import { useId, useRef, type PointerEvent } from 'react';
import { fullHourFromPoint } from '../learning/fullHour';

import { hourNames } from '../learning/examples';

/** Full-hour clock: the minute hand stays at twelve. */
export function AnalogClock({ hour = 7, onHourChange }: { hour?: number; onHourChange?: (hour: number) => void }) {
  const titleId = useId();
  const draggingPointer = useRef<number | null>(null);
  const clock = useRef<SVGSVGElement>(null);
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
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  }

  return (
    <svg ref={clock} className={`analog-clock${onHourChange ? ' interactive-clock' : ''}`} viewBox="0 0 300 300"
      role={onHourChange ? 'group' : 'img'} aria-labelledby={titleId}
      onPointerMove={event => { if (draggingPointer.current === event.pointerId) updateHour(event); }}
      onPointerUp={event => { if (draggingPointer.current === event.pointerId) updateHour(event); endDrag(event); }} onPointerCancel={endDrag}
      onLostPointerCapture={() => { draggingPointer.current = null; }}>

      <title id={titleId}>{`שעון אנלוגי המציג את השעה ${hourNames[hour % 12]}`}</title>
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
      <line data-hand="hour" x1="150" y1="150" x2="150" y2="78" transform={`rotate(${(hour % 12) * 30} 150 150)`}
        stroke="#7357c8" strokeWidth="12" strokeLinecap="round" />
      <line data-hand="minute" x1="150" y1="150" x2="150" y2="60"
        stroke="#167d87" strokeWidth="8" strokeLinecap="round" />
      <circle cx="150" cy="150" r="9" fill="#243450" />
      {onHourChange && <g className="hour-control" role="slider" tabIndex={0}
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
        <line x1="150" y1="150" x2="150" y2="78" transform={`rotate(${(hour % 12) * 30} 150 150)`}
          stroke="transparent" strokeWidth="52" strokeLinecap="round" />
        <circle className="hour-grip" cx="150" cy="78" r="12" transform={`rotate(${(hour % 12) * 30} 150 150)`}
          fill="#7357c8" stroke="#fff" strokeWidth="3" />
      </g>}

    </svg>
  );
}
