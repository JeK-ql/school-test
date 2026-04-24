import { describe, expect, it } from 'vitest';
import {
  xpScoring,
  xpRequiredForLevel,
  levelFromXP,
  clampXP,
  xpProgressWithinLevel,
} from '@/lib/level';

describe('xpScoring', () => {
  it('defines correct/wrong/bonus deltas', () => {
    expect(xpScoring.correct).toBe(1);
    expect(xpScoring.wrong).toBe(-1);
    expect(xpScoring.bonusNoCorrect).toBe(2);
  });
});

describe('xpRequiredForLevel', () => {
  it('n*(n-1)*5 formula', () => {
    expect(xpRequiredForLevel(1)).toBe(0);
    expect(xpRequiredForLevel(2)).toBe(10);
    expect(xpRequiredForLevel(3)).toBe(30);
    expect(xpRequiredForLevel(4)).toBe(60);
    expect(xpRequiredForLevel(5)).toBe(100);
    expect(xpRequiredForLevel(10)).toBe(450);
  });
});

describe('levelFromXP', () => {
  it('level 1 at 0 XP', () => {
    expect(levelFromXP(0)).toBe(1);
  });
  it('level 1 just below threshold', () => {
    expect(levelFromXP(9)).toBe(1);
  });
  it('level 2 at exactly 10 XP', () => {
    expect(levelFromXP(10)).toBe(2);
  });
  it('level 3 at 30', () => {
    expect(levelFromXP(30)).toBe(3);
  });
  it('level 5 at 100', () => {
    expect(levelFromXP(100)).toBe(5);
  });
  it('level 10 at 450', () => {
    expect(levelFromXP(450)).toBe(10);
  });
  it('level 10 just below Lv 11 threshold (11*10*5 = 550)', () => {
    expect(levelFromXP(549)).toBe(10);
  });
});

describe('clampXP', () => {
  it('never negative', () => {
    expect(clampXP(-5)).toBe(0);
    expect(clampXP(0)).toBe(0);
    expect(clampXP(42)).toBe(42);
  });
});

describe('xpProgressWithinLevel', () => {
  it('returns 0 when exactly at level threshold', () => {
    const { current, next } = xpProgressWithinLevel(10);
    expect(current).toBe(10);
    expect(next).toBe(30);
  });
  it('progresses between thresholds', () => {
    const { current, next } = xpProgressWithinLevel(20);
    expect(current).toBe(10);
    expect(next).toBe(30);
  });
});
