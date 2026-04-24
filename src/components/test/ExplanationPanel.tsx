'use client';
import { NeonButton } from '@/components/ui/NeonButton';
import { useRunStore } from '@/store/useRunStore';

export function ExplanationPanel() {
  const queue = useRunStore((s) => s.queue);
  const idx = useRunStore((s) => s.currentIndex);
  const status = useRunStore((s) => s.status);
  const advance = useRunStore((s) => s.advance);
  const q = queue[idx];
  if (status !== 'explaining' || !q) return null;
  return (
    <div className="mt-4 border border-accent bg-[rgba(0,255,133,0.04)] p-4">
      <div className="text-[10px] tracking-widest text-muted uppercase mb-1">EXPLANATION</div>
      <div className="text-sm text-text mb-2">
        <strong className="text-accent">{q.correct_answer}</strong> — {q.explanation}
      </div>
      <NeonButton onClick={advance}>◢ NEXT</NeonButton>
    </div>
  );
}
