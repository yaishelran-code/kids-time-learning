import { timeFromMinutes, type ClockTime } from './clockTime';

export const dayPeriods = [
  { id: 'morning', name: 'בוקר', context: 'בבוקר', icon: '🌅' },
  { id: 'noon', name: 'צהריים', context: 'בצהריים', icon: '☀️' },
  { id: 'afternoon', name: 'אחר הצהריים', context: 'אחר הצהריים', icon: '🌤️' },
  { id: 'evening', name: 'ערב', context: 'בערב', icon: '🌇' },
  { id: 'night', name: 'לילה', context: 'בלילה', icon: '🌙' },
] as const;

/** Minutes since midnight, normalized across days. Never shown to children. */
export function dayPeriodAt(totalMinutes: number) {
  const minute = ((totalMinutes % 1440) + 1440) % 1440;
  if (minute >= 300 && minute < 720) return dayPeriods[0];
  if (minute >= 720 && minute < 900) return dayPeriods[1];
  if (minute >= 900 && minute < 1080) return dayPeriods[2];
  if (minute >= 1080 && minute < 1260) return dayPeriods[3];
  return dayPeriods[4];
}

export type DayExample = { minutes: number; time: ClockTime; activity: string; story: string };
function example(hour: number, minute: number, activity: string, story: string): DayExample {
  const minutes = hour * 60 + minute;
  return { minutes, time: timeFromMinutes(minutes, 1), activity, story };
}

export const dayExamples = [
  example(7, 0, 'מתארגנים לבית הספר', 'נועה קמה בבוקר, אוכלת ומתארגנת לבית הספר.'),
  example(10, 0, 'לומדים בכיתה', 'בבוקר נועה וחבריה לומדים בכיתה.'),
  example(12, 0, 'אוכלים ארוחת צהריים', 'בצהריים נועה עוצרת לאכול ארוחת צהריים.'),
  example(13, 30, 'חוזרים מבית הספר', 'בצהריים נועה חוזרת מבית הספר הביתה.'),
  example(16, 0, 'הולכים לחוג', 'אחר הצהריים נועה הולכת לחוג שהיא אוהבת.'),
  example(17, 30, 'משחקים', 'אחר הצהריים נועה משחקת עם חברים.'),
  example(19, 0, 'אוכלים ארוחת ערב', 'בערב נועה אוכלת ארוחת ערב עם המשפחה.'),
  example(20, 30, 'מתכוננים לשינה', 'בערב נועה מצחצחת שיניים ומתכוננת לשינה.'),
  example(22, 0, 'ישנים', 'בלילה נועה ישנה במיטה שלה.'),
  example(2, 0, 'עדיין ישנים', 'אחרי חצות נועה עדיין ישנה. זה עדיין לילה, ובהמשך יגיע הבוקר של יום חדש.'),
];

export const sameClockPairs = [[dayExamples[0], dayExamples[6]], [dayExamples[1], dayExamples[8]]] as const;
