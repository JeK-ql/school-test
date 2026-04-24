import { describe, expect, it } from 'vitest';
import { generateAnswerSet, NO_CORRECT_PROBABILITY } from '@/lib/randomize';
import type { Question } from '@/types/skill';

const q: Question = {
  id: 'q1',
  question: 'x?',
  correct_answer: 'CORRECT',
  explanation: 'e',
  fake_answers: ['F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11'],
};

describe('generateAnswerSet', () => {
  it('always returns 4 options', () => {
    for (let i = 0; i < 50; i++) {
      const { options } = generateAnswerSet(q);
      expect(options).toHaveLength(4);
    }
  });

  it('options are unique', () => {
    for (let i = 0; i < 50; i++) {
      const { options } = generateAnswerSet(q);
      expect(new Set(options).size).toBe(4);
    }
  });

  it('when hasCorrect=true, CORRECT is included', () => {
    const results = Array.from({ length: 200 }, () => generateAnswerSet(q));
    const withCorrect = results.filter((r) => r.hasCorrect);
    expect(withCorrect.length).toBeGreaterThan(0);
    for (const r of withCorrect) {
      expect(r.options).toContain('CORRECT');
    }
  });

  it('when hasCorrect=false, CORRECT is not included', () => {
    const results = Array.from({ length: 200 }, () => generateAnswerSet(q));
    const withoutCorrect = results.filter((r) => !r.hasCorrect);
    for (const r of withoutCorrect) {
      expect(r.options).not.toContain('CORRECT');
    }
  });

  it('no-correct case fires at configured probability (±5pp over 5000 iters)', () => {
    const N = 5000;
    let noCorrectCount = 0;
    for (let i = 0; i < N; i++) {
      const r = generateAnswerSet(q);
      if (!r.hasCorrect) noCorrectCount++;
    }
    const rate = noCorrectCount / N;
    expect(rate).toBeGreaterThan(NO_CORRECT_PROBABILITY - 0.05);
    expect(rate).toBeLessThan(NO_CORRECT_PROBABILITY + 0.05);
  });
});
