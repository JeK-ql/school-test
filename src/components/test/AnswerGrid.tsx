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

  const labels = ['A', 'B', 'C', 'D'];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
      {set.options.map((opt, i) => (
        <button
          key={opt}
          onClick={() => handle(opt)}
          disabled={status !== 'running'}
          className="group relative flex items-center gap-3 p-3.5 bg-white/[0.015] text-text text-left border border-white/10 hover:border-accent hover:bg-[color:var(--accent-color)]/5 hover:shadow-[inset_0_0_18px_-4px_var(--accent-dim)] transition-[border-color,background-color,box-shadow] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="font-display font-bold text-accent/70 text-sm tracking-system w-6 shrink-0 group-hover:text-accent group-hover:text-glow">
            {labels[i] ?? ''}
          </span>
          <span className="font-body text-[14px] leading-snug flex-1">{opt}</span>
          <span className="font-mono text-[10px] text-text-subtle group-hover:text-accent transition-opacity opacity-0 group-hover:opacity-100">
            ENTER ◢
          </span>
        </button>
      ))}
    </div>
  );
}
