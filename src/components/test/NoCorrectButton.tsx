'use client';
import { NeonButton } from '@/components/ui/NeonButton';
import { useRunStore } from '@/store/useRunStore';

interface Props {
  onAnswer: (result: 'bonus' | 'wrong') => void;
}

export function NoCorrectButton({ onAnswer }: Props) {
  const set = useRunStore((s) => s.currentAnswerSet);
  const status = useRunStore((s) => s.status);
  if (!set) return null;

  function handle() {
    if (status !== 'running') return;
    onAnswer(!set!.hasCorrect ? 'bonus' : 'wrong');
  }

  return (
    <div className="mt-3 flex items-center gap-3">
      <span className="h-px flex-1 bg-danger/25" />
      <NeonButton
        variant="dashed-danger"
        size="md"
        onClick={handle}
        disabled={status !== 'running'}
      >
        ⚠&nbsp;&nbsp;NO CORRECT ANSWER
      </NeonButton>
      <span className="h-px flex-1 bg-danger/25" />
    </div>
  );
}
