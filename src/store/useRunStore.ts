'use client';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Question } from '@/types/skill';
import type { Difficulty, AnswerResult, RunAnswer } from '@/types/run';
import { generateAnswerSet } from '@/lib/randomize';
import { shuffle } from '@/lib/shuffle';

export interface CurrentAnswerSet {
  options: string[];
  hasCorrect: boolean;
}

interface RunState {
  skillId: string | null;
  difficulty: Difficulty;
  queue: Question[];
  currentIndex: number;
  currentAnswerSet: CurrentAnswerSet | null;
  answers: RunAnswer[];
  correctCount: number;
  wrongCount: number;
  bonusCount: number;
  xpDelta: number;
  startedAt: string | null;
  remainingMs: number;
  pausedAt: number | null;
  status: 'idle' | 'running' | 'penalty' | 'explaining' | 'finished';

  startRun: (args: { skillId: string; difficulty: Difficulty; questions: Question[] }) => void;
  tick: (deltaMs: number) => void;
  pause: () => void;
  resume: () => void;
  registerAnswer: (result: AnswerResult) => void;
  advance: () => void;
  reset: () => void;
}

function timerFor(diff: Difficulty) {
  return diff === 'hardcore' ? 10_000 : 30_000;
}

export const useRunStore = create<RunState>()(
  persist(
    (set, get) => ({
      skillId: null,
      difficulty: 'normal',
      queue: [],
      currentIndex: 0,
      currentAnswerSet: null,
      answers: [],
      correctCount: 0,
      wrongCount: 0,
      bonusCount: 0,
      xpDelta: 0,
      startedAt: null,
      remainingMs: 0,
      pausedAt: null,
      status: 'idle',

      startRun: ({ skillId, difficulty, questions }) => {
        const shuffled = shuffle(questions);
        const first = shuffled[0];
        set({
          skillId,
          difficulty,
          queue: shuffled,
          currentIndex: 0,
          currentAnswerSet: first ? generateAnswerSet(first) : null,
          answers: [],
          correctCount: 0,
          wrongCount: 0,
          bonusCount: 0,
          xpDelta: 0,
          startedAt: new Date().toISOString(),
          remainingMs: timerFor(difficulty),
          pausedAt: null,
          status: 'running',
        });
      },

      tick: (deltaMs) => {
        const { status, remainingMs } = get();
        if (status !== 'running') return;
        const next = remainingMs - deltaMs;
        if (next <= 0) {
          set({ remainingMs: 0 });
          get().registerAnswer('timeout');
        } else {
          set({ remainingMs: next });
        }
      },

      pause: () => set({ pausedAt: Date.now() }),
      resume: () => set({ pausedAt: null }),

      registerAnswer: (result) => {
        const { queue, currentIndex, correctCount, wrongCount, bonusCount, xpDelta, answers } = get();
        const q = queue[currentIndex];
        if (!q) return;
        const delta = result === 'correct' ? 1 : result === 'bonus' ? 2 : -1;
        const nextStatus: RunState['status'] = result === 'correct' || result === 'bonus' ? 'explaining' : 'penalty';
        set({
          answers: [...answers, { questionId: q.id, result }],
          correctCount: correctCount + (result === 'correct' ? 1 : 0),
          wrongCount: wrongCount + (result === 'wrong' || result === 'timeout' ? 1 : 0),
          bonusCount: bonusCount + (result === 'bonus' ? 1 : 0),
          xpDelta: xpDelta + delta,
          status: nextStatus,
        });
      },

      advance: () => {
        const { queue, currentIndex, difficulty } = get();
        const nextIndex = currentIndex + 1;
        if (nextIndex >= queue.length) {
          set({ status: 'finished' });
          return;
        }
        const q = queue[nextIndex];
        set({
          currentIndex: nextIndex,
          currentAnswerSet: generateAnswerSet(q),
          remainingMs: timerFor(difficulty),
          status: 'running',
        });
      },

      reset: () =>
        set({
          skillId: null,
          queue: [],
          currentIndex: 0,
          currentAnswerSet: null,
          answers: [],
          correctCount: 0,
          wrongCount: 0,
          bonusCount: 0,
          xpDelta: 0,
          startedAt: null,
          remainingMs: 0,
          status: 'idle',
        }),
    }),
    {
      name: 'shadow-leveling-run',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (s) => ({
        skillId: s.skillId,
        difficulty: s.difficulty,
        queue: s.queue,
        currentIndex: s.currentIndex,
        currentAnswerSet: s.currentAnswerSet,
        answers: s.answers,
        correctCount: s.correctCount,
        wrongCount: s.wrongCount,
        bonusCount: s.bonusCount,
        xpDelta: s.xpDelta,
        startedAt: s.startedAt,
        remainingMs: s.remainingMs,
        status: s.status,
      }),
    },
  ),
);
