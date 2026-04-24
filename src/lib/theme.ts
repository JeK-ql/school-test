export interface DailyTheme {
  accent: string;
  label: string;
  bg: string;
}

export const dailyThemes: Record<0 | 1 | 2 | 3 | 4 | 5 | 6, DailyTheme> = {
  0: { accent: '#4F4F4F', label: 'Rest',     bg: '/bg/sun.svg' },
  1: { accent: '#00F2FF', label: 'Energy',   bg: '/bg/mon.svg' },
  2: { accent: '#00FF85', label: 'Growth',   bg: '/bg/tue.svg' },
  3: { accent: '#FFD600', label: 'Focus',    bg: '/bg/wed.svg' },
  4: { accent: '#FF7A00', label: 'Pressure', bg: '/bg/thu.svg' },
  5: { accent: '#FF005C', label: 'Finish',   bg: '/bg/fri.svg' },
  6: { accent: '#BD00FF', label: 'Magic',    bg: '/bg/sat.svg' },
};

export function getThemeForDay(day: number): DailyTheme {
  const normalized = ((day % 7) + 7) % 7;
  return dailyThemes[normalized as 0 | 1 | 2 | 3 | 4 | 5 | 6];
}
