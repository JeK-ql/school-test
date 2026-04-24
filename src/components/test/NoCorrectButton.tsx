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
    <NeonButton
      variant="dashed-danger"
      size="md"
      className="w-full mt-2.5"
      onClick={handle}
      disabled={status !== 'running'}
    >
      ⚠ ВІРНОЇ ВІДПОВІДІ НЕМАЄ
    </NeonButton>
  );
}
