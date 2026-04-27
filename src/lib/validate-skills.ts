import { z } from 'zod';
import type { Skill } from '@/types/skill';

export const questionSchema = z.object({
  id: z.string().min(1),
  question: z.string().min(1),
  correct_answer: z.string().min(1),
  explanation: z.string().min(1),
  fake_answers: z.array(z.string().min(1)).min(11),
});

export const skillSchema = z.object({
  skill_id: z.string().min(1),
  skill_name: z.string().min(1),
  difficulty: z.enum(['E-Rank', 'D-Rank', 'C-Rank', 'B-Rank', 'A-Rank', 'S-Rank']),
  description: z.string().min(1),
  questions: z.array(questionSchema).min(1),
});

export function validateSkill(data: unknown): Skill {
  const skill = skillSchema.parse(data);
  const ids = new Set<string>();
  for (const q of skill.questions) {
    if (ids.has(q.id)) {
      throw new Error(`Duplicate question id "${q.id}" in skill "${skill.skill_id}"`);
    }
    ids.add(q.id);
    const combined = [q.correct_answer, ...q.fake_answers];
    if (new Set(combined).size !== combined.length) {
      throw new Error(`Duplicate answer in question "${q.id}"`);
    }
  }
  return skill as Skill;
}
