export interface ProgressDoc {
  _id: string;
  userId: string;
  skillId: string;
  totalXP: number;
  level: number;
  bestStreak: number;
  lastRunAccuracy: number;
  lastRunAt: Date | null;
  updatedAt: Date;
}

export interface DashboardProgress {
  skillId: string;
  skillName: string;
  difficulty: string;
  totalXP: number;
  level: number;
  lastRunAccuracy: number;
  lastRunAt: Date | null;
  bestStreak: number;
  xpForCurrentLevel: number;
  xpForNextLevel: number;
}
