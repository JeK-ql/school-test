import type { Question } from '@/types/skill';
import { shuffle } from './shuffle';

export const NO_CORRECT_PROBABILITY = 0.18;

export interface AnswerSet {
  options: string[];
  hasCorrect: boolean;
}

function pickN<T>(arr: T[], n: number): T[] {
  return shuffle(arr).slice(0, n);
}

export function generateAnswerSet(question: Question): AnswerSet {
  const hasCorrect = Math.random() >= NO_CORRECT_PROBABILITY;
  if (hasCorrect) {
    const fakes = pickN(question.fake_answers, 3);
    return { options: shuffle([...fakes, question.correct_answer]), hasCorrect: true };
  }
  const fakes = pickN(question.fake_answers, 4);
  return { options: shuffle(fakes), hasCorrect: false };
}
