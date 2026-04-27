import type { Db, ObjectId } from 'mongodb';
import {
  STREAK_BONUS,
  STREAK_MILESTONES,
  type UserStatsDoc,
  type VisitResult,
} from '@/types/userStats';

export function todayUTC(now: Date = new Date()): string {
  return now.toISOString().slice(0, 10);
}

export function dayBefore(date: string): string {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
}

export interface StreakState {
  currentStreak: number;
  longestStreak: number;
  lastVisitDate: string | null;
}

export interface StreakStep {
  alreadyToday: boolean;
  nextStreak: number;
  nextLongest: number;
  awarded: { daily: number; weekly: number; quarterly: number };
}

export function computeStreakStep(state: StreakState, today: string): StreakStep {
  if (state.lastVisitDate === today) {
    return {
      alreadyToday: true,
      nextStreak: state.currentStreak,
      nextLongest: state.longestStreak,
      awarded: { daily: 0, weekly: 0, quarterly: 0 },
    };
  }

  const yesterday = dayBefore(today);
  const continued = state.lastVisitDate === yesterday;
  const nextStreak = continued ? state.currentStreak + 1 : 1;

  const weekly =
    nextStreak >= STREAK_MILESTONES.WEEKLY && nextStreak % STREAK_MILESTONES.WEEKLY === 0
      ? STREAK_BONUS.WEEKLY
      : 0;
  const quarterly =
    nextStreak >= STREAK_MILESTONES.QUARTERLY && nextStreak % STREAK_MILESTONES.QUARTERLY === 0
      ? STREAK_BONUS.QUARTERLY
      : 0;

  return {
    alreadyToday: false,
    nextStreak,
    nextLongest: Math.max(state.longestStreak, nextStreak),
    awarded: { daily: STREAK_BONUS.DAILY, weekly, quarterly },
  };
}

export function daysUntilNextMilestone(currentStreak: number, multiple: number): number {
  if (currentStreak <= 0) return multiple;
  const next = (Math.floor(currentStreak / multiple) + 1) * multiple;
  return next - currentStreak;
}

export async function getOrInitUserStats(
  db: Db,
  userId: ObjectId,
): Promise<UserStatsDoc> {
  const coll = db.collection<UserStatsDoc>('userStats');
  const now = new Date();
  const before = await coll.findOneAndUpdate(
    { _id: userId },
    {
      $setOnInsert: {
        accountXP: 0,
        currentStreak: 0,
        longestStreak: 0,
        lastVisitDate: null,
        totalVisits: 0,
        createdAt: now,
        updatedAt: now,
      },
    },
    { upsert: true, returnDocument: 'before' },
  );

  if (!before) {
    const progressRows = await db
      .collection('progress')
      .find({ userId })
      .toArray();
    const backfillXP = progressRows.reduce<number>((a, p) => a + (p.totalXP ?? 0), 0);
    if (backfillXP > 0) {
      await coll.updateOne({ _id: userId }, { $inc: { accountXP: backfillXP } });
    }
    const fresh = await coll.findOne({ _id: userId });
    if (!fresh) throw new Error('userStats vanished after upsert');
    return fresh;
  }
  return before;
}

export async function recordDailyVisit(
  db: Db,
  userId: ObjectId,
  now: Date = new Date(),
): Promise<VisitResult> {
  const stats = await getOrInitUserStats(db, userId);
  const today = todayUTC(now);
  const step = computeStreakStep(stats, today);

  if (step.alreadyToday) {
    return {
      alreadyToday: true,
      currentStreak: stats.currentStreak,
      longestStreak: stats.longestStreak,
      accountXP: stats.accountXP,
      awarded: step.awarded,
    };
  }

  const totalAward = step.awarded.daily + step.awarded.weekly + step.awarded.quarterly;
  const updated = await db.collection<UserStatsDoc>('userStats').findOneAndUpdate(
    { _id: userId, lastVisitDate: stats.lastVisitDate },
    {
      $set: {
        currentStreak: step.nextStreak,
        longestStreak: step.nextLongest,
        lastVisitDate: today,
        updatedAt: now,
      },
      $inc: { totalVisits: 1, accountXP: totalAward },
    },
    { returnDocument: 'after' },
  );

  if (!updated) {
    const current = await db.collection<UserStatsDoc>('userStats').findOne({ _id: userId });
    return {
      alreadyToday: true,
      currentStreak: current?.currentStreak ?? stats.currentStreak,
      longestStreak: current?.longestStreak ?? stats.longestStreak,
      accountXP: current?.accountXP ?? stats.accountXP,
      awarded: { daily: 0, weekly: 0, quarterly: 0 },
    };
  }

  return {
    alreadyToday: false,
    currentStreak: updated.currentStreak,
    longestStreak: updated.longestStreak,
    accountXP: updated.accountXP,
    awarded: step.awarded,
  };
}

export async function bumpAccountXP(
  db: Db,
  userId: ObjectId,
  delta: number,
): Promise<void> {
  if (delta === 0) return;
  await db.collection<UserStatsDoc>('userStats').updateOne(
    { _id: userId },
    [
      {
        $set: {
          accountXP: {
            $max: [0, { $add: [{ $ifNull: ['$accountXP', 0] }, delta] }],
          },
          updatedAt: '$$NOW',
        },
      },
    ],
  );
}
