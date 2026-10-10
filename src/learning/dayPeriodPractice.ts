import { timeFromMinutes, type ClockTime } from './clockTime';
import { dayPeriodAt, dayPeriods } from './dayPeriods';

export type DayPracticeMode = 'identify' | 'compare' | 'mixed';
export type DayPeriodId = typeof dayPeriods[number]['id'];
export type DayPracticeStory = { minutes: number; time: ClockTime; story: string; clue: string };
export type DayPracticeQuestion = { kind: 'identify'; stories: [DayPracticeStory] } | { kind: 'compare'; stories: [DayPracticeStory, DayPracticeStory] };
export const dayPracticeTitles = {
  identify: 'תרגול זיהוי חלק היום',
  compare: 'תרגול אותה שעה, הקשר שונה',
  mixed: 'תרגול משולב — חלקי היום',
};
function story(hour: number, minute: number, text: string, clue: string): DayPracticeStory {
  const minutes = hour * 60 + minute;
  return { minutes, time: timeFromMinutes(minutes, 1), story: text, clue };
}

// Context comes from light and event order, never from an activity alone.
const identificationStories = [
  story(7, 0, 'השמש זרחה לא מזמן. נועה התעוררה משנתה ומתארגנת לבית הספר.', 'השמש זרחה ויום חדש התחיל.'),
  story(12, 0, 'השמש גבוהה בשמיים. הגענו לאמצע היום, ונועה עוצרת לאכול.', 'אמצע היום הגיע והשעה שתים עשרה.'),
  story(16, 0, 'אמצע היום כבר עבר. עדיין יש אור בחוץ, השמש עוד לא שקעה, ונועה יוצאת לחוג.', 'אמצע היום עבר, אבל השמש עדיין לא שקעה.'),
  story(19, 0, 'השמש כבר שקעה בסיפור שלנו. נועה אוכלת עם המשפחה, ובהמשך תתכונן לשנתה.', 'השמש שקעה והמשפחה מתכוננת לסוף היום.'),
  story(22, 0, 'בחוץ חשוך. נועה כבר סיימה להתכונן לשינה וכל בני הבית ישנים.', 'היום הסתיים, חשוך ובני הבית כבר ישנים.'),
  story(10, 0, 'נועה קמה אחרי זריחת השמש והגיעה לבית הספר. עכשיו היא לומדת, ואמצע היום עוד לא הגיע.', 'כבר זרחה השמש, אבל אמצע היום עוד לא הגיע.'),
  story(13, 30, 'לא מזמן עבר אמצע היום. נועה אכלה כשהשעון הראה שתים עשרה, ועכשיו היא חוזרת מבית הספר באור יום.', 'השעה אחת וחצי, זמן קצר אחרי שתים עשרה באמצע היום.'),
  story(17, 30, 'אמצע היום עבר מזמן. נועה משחקת בחוץ; עדיין יש אור, והשמש יורדת לקראת השקיעה.', 'השעה חמש וחצי, אחרי אמצע היום ולפני השקיעה בסיפור.'),
  story(20, 30, 'השמש כבר שקעה בסיפור שלנו. נועה סיימה לאכול עם המשפחה, מצחצחת שיניים ומתכוננת לשנתה.', 'אחרי השקיעה, נועה מתכוננת לסוף היום ולשינה.'),
  story(2, 0, 'חצות כבר עבר. נועה עדיין ישנה, בחוץ חשוך והשמש של היום החדש עוד לא זרחה.', 'אחרי חצות עדיין חשוך, לפני זריחת השמש.'),
];
const comparisonStories: [DayPracticeStory, DayPracticeStory][] = [
  [identificationStories[0], identificationStories[3]],
  [story(8, 0, 'השמש זרחה ויום חדש מתחיל. עידו יוצא לבית הספר.', 'השמש זרחה ויום חדש התחיל.'),
    story(20, 0, 'השמש כבר שקעה בסיפור שלנו. עידו סיים לאכול, ובקרוב יתכונן לשנתו.', 'אחרי השקיעה, לפני שנת סוף היום.')],
  [identificationStories[5], identificationStories[4]],
  [story(23, 0, 'חשוך בחוץ. יום הפעילויות הסתיים, וכל בני הבית כבר ישנים.', 'חשוך ובני הבית כבר ישנים אחרי יום הפעילויות.'),
    story(11, 0, 'השמש זרחה לפני כמה שעות. עידו לומד בבית הספר, ואמצע היום עדיין לא הגיע.', 'אחרי הזריחה ולפני אמצע היום.')],
  [identificationStories[1], story(0, 0, 'חצות הגיע. חשוך, כולם כבר ישנים, והשמש של היום החדש תזרח רק בהמשך.', 'חצות הגיע, לפני זריחת השמש הבאה.')],
  [story(1, 30, 'חצות כבר עבר. הבית שקט וחשוך, ועידו עדיין ישן עד שהשמש תזרח.', 'אחרי חצות ולפני הזריחה.'), identificationStories[6]],
  [story(14, 0, 'אמצע היום עבר לא מזמן. עידו אכל כשהשעון הראה שתים עשרה, וכעת הוא קורא באור יום.', 'השעה שתיים, זמן קצר אחרי שתים עשרה באמצע היום.'), identificationStories[9]],
  [story(4, 0, 'חצות עבר לפני כמה שעות. עדיין חשוך, עידו ישן והשמש עוד לא זרחה.', 'אחרי חצות ועדיין לפני הזריחה.'), identificationStories[2]],
];
const identify: DayPracticeQuestion[] = identificationStories.map(item => ({ kind: 'identify', stories: [item] }));
const compare: DayPracticeQuestion[] = comparisonStories.map(items => ({ kind: 'compare', stories: items }));
export const dayPracticeQuestions: Record<DayPracticeMode, DayPracticeQuestion[]> = {
  identify, compare,
  mixed: compare.flatMap((question, index) => [identify[[0, 2, 4, 6, 8, 1, 7, 9][index]], question]),
};

/** Three unique choices, with the correct position rotating independently per story. */
export function dayPracticeChoices(item: DayPracticeStory, index: number, storyIndex: number): typeof dayPeriods[number][] {
  const correct = dayPeriodAt(item.minutes);
  const periodIndex = dayPeriods.findIndex(period => period.id === correct.id);
  const values = [correct, dayPeriods[(periodIndex + 1 + index % 3) % 5], dayPeriods[(periodIndex + 4) % 5]];
  const rotation = (index + storyIndex) % 3;
  return values.map((_, offset) => values[(offset + rotation) % 3]);
}
