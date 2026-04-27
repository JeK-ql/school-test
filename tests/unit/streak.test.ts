import { describe, expect, it } from 'vitest';
import {
  computeStreakStep,
  daysUntilNextMilestone,
  dayBefore,
  todayUTC,
} from '@/lib/streak';

describe('todayUTC / dayBefore', () => {
  it('formats UTC date as YYYY-MM-DD', () => {
    expect(todayUTC(new Date('2026-04-25T03:00:00Z'))).toBe('2026-04-25');
    expect(todayUTC(new Date('2026-04-25T23:59:59Z'))).toBe('2026-04-25');
  });

  it('dayBefore returns previous UTC day', () => {
    expect(dayBefore('2026-04-25')).toBe('2026-04-24');
    expect(dayBefore('2026-01-01')).toBe('2025-12-31');
    expect(dayBefore('2026-03-01')).toBe('2026-02-28');
  });
});

describe('computeStreakStep', () => {
  const today = '2026-04-25';

  it('first-ever visit starts streak at 1 with daily bonus', () => {
    const step = computeStreakStep(
      { currentStreak: 0, longestStreak: 0, lastVisitDate: null },
      today,
    );
    expect(step.alreadyToday).toBe(false);
    expect(step.nextStreak).toBe(1);
    expect(step.nextLongest).toBe(1);
    expect(step.awarded).toEqual({ daily: 5, weekly: 0, quarterly: 0 });
  });

  it('continues streak when last visit was yesterday', () => {
    const step = computeStreakStep(
      { currentStreak: 3, longestStreak: 3, lastVisitDate: '2026-04-24' },
      today,
    );
    expect(step.nextStreak).toBe(4);
    expect(step.nextLongest).toBe(4);
    expect(step.awarded).toEqual({ daily: 5, weekly: 0, quarterly: 0 });
  });

  it('resets streak to 1 when there was a gap', () => {
    const step = computeStreakStep(
      { currentStreak: 12, longestStreak: 12, lastVisitDate: '2026-04-20' },
      today,
    );
    expect(step.nextStreak).toBe(1);
    expect(step.nextLongest).toBe(12);
    expect(step.awarded).toEqual({ daily: 5, weekly: 0, quarterly: 0 });
  });

  it('skips when already visited today', () => {
    const step = computeStreakStep(
      { currentStreak: 3, longestStreak: 3, lastVisitDate: today },
      today,
    );
    expect(step.alreadyToday).toBe(true);
    expect(step.nextStreak).toBe(3);
    expect(step.awarded).toEqual({ daily: 0, weekly: 0, quarterly: 0 });
  });

  it('awards weekly bonus on streak day 7', () => {
    const step = computeStreakStep(
      { currentStreak: 6, longestStreak: 6, lastVisitDate: '2026-04-24' },
      today,
    );
    expect(step.nextStreak).toBe(7);
    expect(step.awarded).toEqual({ daily: 5, weekly: 20, quarterly: 0 });
  });

  it('awards weekly bonus every 7 days (recurring)', () => {
    const step = computeStreakStep(
      { currentStreak: 13, longestStreak: 13, lastVisitDate: '2026-04-24' },
      today,
    );
    expect(step.nextStreak).toBe(14);
    expect(step.awarded).toEqual({ daily: 5, weekly: 20, quarterly: 0 });
  });

  it('awards quarterly bonus on streak day 90', () => {
    const step = computeStreakStep(
      { currentStreak: 89, longestStreak: 89, lastVisitDate: '2026-04-24' },
      today,
    );
    expect(step.nextStreak).toBe(90);
    expect(step.awarded).toEqual({ daily: 5, weekly: 0, quarterly: 100 });
  });

  it('updates longest streak only when surpassed', () => {
    const step = computeStreakStep(
      { currentStreak: 2, longestStreak: 47, lastVisitDate: '2026-04-24' },
      today,
    );
    expect(step.nextStreak).toBe(3);
    expect(step.nextLongest).toBe(47);
  });
});

describe('daysUntilNextMilestone', () => {
  it('returns the multiple from zero', () => {
    expect(daysUntilNextMilestone(0, 7)).toBe(7);
    expect(daysUntilNextMilestone(0, 90)).toBe(90);
  });

  it('counts days until the next multiple', () => {
    expect(daysUntilNextMilestone(1, 7)).toBe(6);
    expect(daysUntilNextMilestone(6, 7)).toBe(1);
    expect(daysUntilNextMilestone(12, 7)).toBe(2);
  });

  it('returns the full multiple just after a hit', () => {
    expect(daysUntilNextMilestone(7, 7)).toBe(7);
    expect(daysUntilNextMilestone(90, 90)).toBe(90);
  });
});
