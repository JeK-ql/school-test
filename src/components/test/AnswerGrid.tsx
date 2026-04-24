'use client';
import { useRunStore } from '@/store/useRunStore';

interface Props {
  onAnswer: (result: 'correct' | 'wrong') => void;
}

export function AnswerGrid({ onAnswer }: Props) {
  const set = useRunStore((s) => s.currentAnswerSet);
  const queue = useRunStore((s) => s.queue);
  const idx = useRunStore((s) => s.currentIndex);
  const status = useRunStore((s) => s.status);
  if (!set) return null;
  const q = queue[idx];
  if (!q) return null;

  function handle(option: string) {
    if (status !== 'running') return;
    const correct = set!.hasCorrect && option === q.correct_answer;
    onAnswer(correct ? 'correct' : 'wrong');
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
      {set.options.map((opt) => (
        <button
          key={opt}
          onClick={() => handle(opt)}
          disabled={status !== 'running'}
          className="p-3 border border-[color:var(--accent-color)]/25 bg-white/[0.02] text-text font-mono text-sm text-left hover:border-accent hover:shadow-[inset_0_0_10px_var(--accent-dim)] disabled:opacity-50"
        >
          {opt}
        </button>
      ))}
    </div>
  );
}
