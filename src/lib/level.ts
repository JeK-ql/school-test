export const xpScoring = {
  correct: 1,
  wrong: -1,
  bonusNoCorrect: 2,
} as const;

export function xpRequiredForLevel(n: number): number {
  return n * (n - 1) * 5;
}

export function levelFromXP(totalXP: number): number {
  const xp = clampXP(totalXP);
  return Math.floor((1 + Math.sqrt(1 + (4 * xp) / 5)) / 2);
}

export function clampXP(xp: number): number {
  return xp < 0 ? 0 : xp;
}

export function xpProgressWithinLevel(totalXP: number): {
  current: number;
  next: number;
} {
  const lvl = levelFromXP(totalXP);
  return {
    current: xpRequiredForLevel(lvl),
    next: xpRequiredForLevel(lvl + 1),
  };
}
