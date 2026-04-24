export type Difficulty = 'normal' | 'hardcore';
export type AnswerResult = 'correct' | 'wrong' | 'bonus' | 'timeout';

export interface RunAnswer {
  questionId: string;
  result: AnswerResult;
}

export interface RunStats {
  correct: number;
  wrong: number;
  bonus: number;
  xpDelta: number;
  totalQuestions: number;
  accuracy: number;
}

export interface RunDoc {
  _id: string;
  userId: string;
  skillId: string;
  difficulty: Difficulty;
  startedAt: Date;
  finishedAt: Date;
  stats: RunStats;
  leveledUp: boolean;
}
