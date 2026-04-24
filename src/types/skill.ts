export type SkillRank = 'E-Rank' | 'D-Rank' | 'C-Rank' | 'B-Rank' | 'A-Rank' | 'S-Rank';

export interface Question {
  id: string;
  question: string;
  correct_answer: string;
  explanation: string;
  fake_answers: string[];
}

export interface Skill {
  skill_id: string;
  skill_name: string;
  difficulty: SkillRank;
  questions: Question[];
}
