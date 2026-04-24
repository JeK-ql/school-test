import { describe, expect, it } from 'vitest';
import { validateSkill } from '@/lib/validate-skills';

const valid = {
  skill_id: 'x',
  skill_name: 'X',
  difficulty: 'B-Rank',
  questions: [
    {
      id: 'q1',
      question: 'Q?',
      correct_answer: 'A',
      explanation: 'e',
      fake_answers: ['B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'],
    },
  ],
};

describe('validateSkill', () => {
  it('accepts valid', () => {
    expect(() => validateSkill(valid)).not.toThrow();
  });
  it('rejects < 11 fake_answers', () => {
    expect(() => validateSkill({ ...valid, questions: [{ ...valid.questions[0], fake_answers: ['B'] }] })).toThrow();
  });
  it('rejects duplicate question ids', () => {
    expect(() =>
      validateSkill({
        ...valid,
        questions: [valid.questions[0], { ...valid.questions[0] }],
      }),
    ).toThrow(/Duplicate question id/);
  });
  it('rejects duplicate answer inside a question', () => {
    expect(() =>
      validateSkill({
        ...valid,
        questions: [
          {
            ...valid.questions[0],
            fake_answers: ['A', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'],
          },
        ],
      }),
    ).toThrow(/Duplicate answer/);
  });
});
