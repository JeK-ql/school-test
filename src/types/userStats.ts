import type { ObjectId } from 'mongodb';

export interface UserStatsDoc {
  _id: ObjectId;
  accountXP: number;
  currentStreak: number;
  longestStreak: number;
  lastVisitDate: string | null;
  totalVisits: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface VisitResult {
  alreadyToday: boolean;
  currentStreak: number;
  longestStreak: number;
  accountXP: number;
  awarded: { daily: number; weekly: number; quarterly: number };
}

export const STREAK_BONUS = {
  DAILY: 5,
  WEEKLY: 20,
  QUARTERLY: 100,
} as const;

export const STREAK_MILESTONES = {
  WEEKLY: 7,
  QUARTERLY: 90,
} as const;
