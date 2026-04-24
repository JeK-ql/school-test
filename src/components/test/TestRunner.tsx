'use client';
import { useEffect, useState } from 'react';
import { useRunStore } from '@/store/useRunStore';
import { loadSkill, type SkillId } from '@/lib/skills-loader';
import { NeonCard } from '@/components/ui/NeonCard';
import { HexBadge } from '@/components/ui/HexBadge';
import { ProgressDots } from '@/components/ui/ProgressDots';
import { NeonButton } from '@/components/ui/NeonButton';
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
    if (finished.newLevel > finished.previousLevel) return <LevelUpOverlay {...finished} />;
    return (
      <NeonCard variant="hero" className="max-w-2xl mx-auto text-center py-10 animate-scan-in">
        <div className="font-mono text-[10px] tracking-system text-text-muted uppercase">
          [ RUN COMPLETE ]
        </div>
        <div className="font-display tracking-system uppercase text-3xl text-accent text-glow-lg mt-3">
          {skillName}
        </div>
        <div className="mt-6 grid grid-cols-4 gap-4 max-w-md mx-auto">
          <Stat label="CORRECT" value={finished.correct} />
          <Stat label="WRONG" value={finished.wrong} />
          <Stat label="BONUS" value={finished.bonus} />
          <Stat label="ACC" value={`${Math.round(finished.accuracy * 100)}%`} />
        </div>
        <a href="/dashboard" className="text-accent mt-8 inline-block font-display tracking-system uppercase text-xs hover:text-glow">
          ◢&nbsp;&nbsp;RETURN TO MATRIX
        </a>
      </NeonCard>
    );
  }

  const q = state.queue[state.currentIndex];
  if (!q) {
    return (
      <div className="text-text-muted font-mono text-xs tracking-system uppercase animate-pulse">
        ◌&nbsp;&nbsp;LOADING DUNGEON
        <span className="caret" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-4 animate-scan-in">
      <div className="flex items-center gap-2 font-mono text-[10px] tracking-system uppercase text-text-muted">
        <span className="text-accent">●</span>
        <span>DUNGEON ACTIVE</span>
        <span className="text-text-subtle">//</span>
        <span>{state.difficulty === 'hardcore' ? 'HARDCORE · 10S/Q' : 'NORMAL · 30S/Q'}</span>
      </div>

      <NeonCard variant="bracketed" className="relative">
        <div className="flex justify-between items-start mb-5 gap-4">
          <div className="flex gap-3 items-center">
            <HexBadge rank={difficulty} />
            <div className="min-w-0">
              <div className="font-mono text-[10px] tracking-system text-text-muted uppercase truncate">
                {skillName}
              </div>
              <div className="font-display text-accent text-glow tracking-system uppercase text-lg leading-tight mt-0.5 tabular-nums">
                Q.{String(state.currentIndex + 1).padStart(2, '0')}
                <span className="text-text-subtle"> / {String(state.queue.length).padStart(2, '0')}</span>
              </div>
            </div>
          </div>
          <Timer />
        </div>

        <ProgressDots results={progressDots} />

        <div className="relative mt-4 mb-5 p-5 pl-6 border-l-2 border-accent bg-[color:var(--accent-color)]/[0.035] font-body text-[15px] leading-relaxed text-text">
          <span className="absolute top-2 left-2 font-mono text-[9px] tracking-system text-text-muted uppercase">
            QUERY
          </span>
          <span className="absolute top-2 right-3 font-mono text-[9px] tracking-system text-text-subtle">
            #{q.id}
          </span>
          <div className="mt-5">{q.question}</div>
        </div>

        <AnswerGrid onAnswer={(r) => state.registerAnswer(r)} />
        <NoCorrectButton onAnswer={(r) => state.registerAnswer(r)} />
        <ExplanationPanel />
        <PenaltyOverlay />
        {error && (
          <div className="text-danger font-mono text-[11px] tracking-wider mt-3 border-l-2 border-danger pl-2">
            ⚠ {error}
          </div>
        )}
      </NeonCard>

      <div className="flex justify-center">
        <NeonButton
          variant="ghost"
          size="sm"
          onClick={() => {
            if (confirm('Вийти із забігу? Прогрес сесії буде скинутий.')) {
              state.reset();
              window.location.href = '/dashboard';
            }
          }}
        >
          ⎋&nbsp;&nbsp;ABORT RUN
        </NeonButton>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div>
      <div className="text-text-subtle text-[9px] tracking-system font-mono uppercase">{label}</div>
      <div className="text-accent font-display text-xl leading-none tabular-nums mt-1">{value}</div>
    </div>
  );
}
