'use client';
import { useEffect, useState } from 'react';
import { useRunStore } from '@/store/useRunStore';
import { loadSkill, type SkillId } from '@/lib/skills-loader';
import { NeonCard } from '@/components/ui/NeonCard';
import { HexBadge } from '@/components/ui/HexBadge';
import { ProgressDots } from '@/components/ui/ProgressDots';
import { Timer } from './Timer';
import { AnswerGrid } from './AnswerGrid';
import { NoCorrectButton } from './NoCorrectButton';
import { ExplanationPanel } from './ExplanationPanel';
import { PenaltyOverlay } from './PenaltyOverlay';
import { LevelUpOverlay } from './LevelUpOverlay';
import type { Difficulty } from '@/types/run';

interface FinishedState {
  previousLevel: number;
  newLevel: number;
  skillName: string;
  correct: number;
  wrong: number;
  bonus: number;
  accuracy: number;
}

export function TestRunner({ skillId, mode }: { skillId: SkillId; mode: Difficulty }) {
  const state = useRunStore();
  const [skillName, setSkillName] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [finished, setFinished] = useState<FinishedState | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSkill(skillId).then((skill) => {
      setSkillName(skill.skill_name);
      setDifficulty(skill.difficulty);
      const already =
        state.skillId === skillId && state.status !== 'idle' && state.status !== 'finished';
      if (!already) {
        state.startRun({ skillId, difficulty: mode, questions: skill.questions });
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [skillId, mode]);

  useEffect(() => {
    if (state.status !== 'finished' || submitting || finished) return;
    setSubmitting(true);
    (async () => {
      try {
        const res = await fetch('/api/runs', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            skillId: state.skillId,
            difficulty: state.difficulty,
            startedAt: state.startedAt,
            finishedAt: new Date().toISOString(),
            answers: state.answers,
          }),
        });
        const data = await res.json();
        if (!data.ok) {
          setError(data.error ?? 'Submit failed');
          return;
        }
        setFinished({
          previousLevel: data.previousLevel,
          newLevel: data.newLevel,
          skillName,
          correct: state.correctCount,
          wrong: state.wrongCount,
          bonus: state.bonusCount,
          accuracy: data.run.stats.accuracy,
        });
        state.reset();
      } catch {
        const pending = JSON.parse(localStorage.getItem('pendingRuns') ?? '[]');
        pending.push({
          skillId: state.skillId,
          difficulty: state.difficulty,
          startedAt: state.startedAt,
          finishedAt: new Date().toISOString(),
          answers: state.answers,
        });
        localStorage.setItem('pendingRuns', JSON.stringify(pending));
        setError('Мережа недоступна. Результат збережено локально.');
      } finally {
        setSubmitting(false);
      }
    })();
  }, [state.status, submitting, finished, state, skillName]);

  const progressDots = state.queue.map((_, i) => {
    if (i < state.currentIndex) {
      const ans = state.answers[i];
      if (!ans) return 'pending' as const;
      return ans.result === 'correct' || ans.result === 'bonus' ? 'done' : 'wrong';
    }
    if (i === state.currentIndex) return 'cur' as const;
    return 'pending' as const;
  });

  if (finished) {
    return (
      <>
        {finished.newLevel > finished.previousLevel ? (
          <LevelUpOverlay {...finished} />
        ) : (
          <NeonCard className="text-center">
            <div className="text-[10px] tracking-widest text-muted uppercase">[ RUN COMPLETE ]</div>
            <div className="text-2xl tracking-widest text-accent text-glow mt-2">{skillName}</div>
            <div className="mt-4 text-muted text-[11px] tracking-[2px]">
              CORRECT: {finished.correct} · WRONG: {finished.wrong} · BONUS: {finished.bonus} · ACCURACY:{' '}
              {Math.round(finished.accuracy * 100)}%
            </div>
            <a href="/dashboard" className="text-accent mt-6 inline-block">◢ RETURN</a>
          </NeonCard>
        )}
      </>
    );
  }

  const q = state.queue[state.currentIndex];
  if (!q) return <div className="text-muted">Loading...</div>;

  return (
    <NeonCard>
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-3 items-center">
          <HexBadge rank={difficulty} />
          <div>
            <div className="text-[10px] tracking-widest text-muted uppercase">{skillName} · {state.difficulty}</div>
            <div className="text-accent text-glow">{state.currentIndex + 1} / {state.queue.length}</div>
          </div>
        </div>
        <Timer />
      </div>
      <ProgressDots results={progressDots} />
      <div className="p-3.5 border-l-2 border-accent bg-[rgba(0,255,133,0.03)] mb-4">{q.question}</div>
      <AnswerGrid onAnswer={(r) => state.registerAnswer(r)} />
      <NoCorrectButton onAnswer={(r) => state.registerAnswer(r)} />
      <ExplanationPanel />
      <PenaltyOverlay />
      {error && <div className="text-danger text-xs mt-3">{error}</div>}
    </NeonCard>
  );
}
