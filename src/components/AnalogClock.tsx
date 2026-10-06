import { useId } from 'react';

import { hourNames } from '../learning/examples';

/** Full-hour clock: the minute hand stays at twelve. */
export function AnalogClock({ hour = 7 }: { hour?: number }) {
  const titleId = useId();

  return (
    <svg className="analog-clock" viewBox="0 0 300 300" role="img" aria-labelledby={titleId}>
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
    </svg>
  );
}
