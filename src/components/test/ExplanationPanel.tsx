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
    <div className="relative mt-5 border border-accent bg-[color:var(--accent-color)]/[0.05] animate-scan-in">
      <div className="px-4 py-2 border-b border-accent/30 flex items-center justify-between">
        <span className="font-mono text-[10px] tracking-system uppercase text-accent">
          ▸ SYSTEM EXPLANATION
        </span>
        <span className="font-mono text-[9px] tracking-system text-text-subtle">#{q.id}</span>
      </div>
      <div className="p-4">
        <div className="font-body text-[14px] leading-relaxed text-text">
          <strong className="text-accent text-glow font-display tracking-wide">
            {q.correct_answer}
          </strong>
          <span className="text-text-muted"> — </span>
          {q.explanation}
        </div>
        <div className="mt-4 flex justify-end">
          <NeonButton onClick={advance}>◢&nbsp;&nbsp;NEXT QUERY</NeonButton>
        </div>
      </div>
    </div>
  );
}
