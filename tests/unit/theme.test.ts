import { describe, expect, it } from 'vitest';
import { dailyThemes, getThemeForDay } from '@/lib/theme';

describe('dailyThemes', () => {
  it('has 7 entries keyed 0..6', () => {
    expect(Object.keys(dailyThemes).sort()).toEqual(['0', '1', '2', '3', '4', '5', '6']);
  });
  it('each entry has accent, label, bg', () => {
    for (const day of [0, 1, 2, 3, 4, 5, 6] as const) {
      const t = dailyThemes[day];
      expect(t.accent).toMatch(/^#[0-9A-F]{6}$/i);
      expect(t.label).toBeTruthy();
      expect(t.bg).toMatch(/\.(webp|svg)$/);
    }
  });
});

describe('getThemeForDay', () => {
  it('normalizes day index', () => {
    expect(getThemeForDay(0)).toBe(dailyThemes[0]);
    expect(getThemeForDay(7)).toBe(dailyThemes[0]);
    expect(getThemeForDay(-1)).toBe(dailyThemes[6]);
  });
});
