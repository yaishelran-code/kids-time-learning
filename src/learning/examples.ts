export const hourNames = ['שתים עשרה', 'אחת', 'שתיים', 'שלוש', 'ארבע', 'חמש', 'שש', 'שבע', 'שמונה', 'תשע', 'עשר', 'אחת עשרה'] as const;

// Each pair keeps the hands in the same position while changing the day context.
export const examples = [
  { hour: 7, period: 'בבוקר', activity: 'מתארגנים לבית הספר', icon: '☀️' },
  { hour: 7, period: 'בערב', activity: 'אוכלים ארוחת ערב', icon: '🌙' },
  { hour: 8, period: 'בבוקר', activity: 'מתחילים את יום הלימודים', icon: '☀️' },
  { hour: 8, period: 'בערב', activity: 'מתכוננים לשינה', icon: '🌙' },
  { hour: 6, period: 'בבוקר', activity: 'קמים ליום חדש', icon: '☀️' },
  { hour: 6, period: 'בערב', activity: 'נפגשים עם המשפחה', icon: '🌙' },
] as const;
