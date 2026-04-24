'use client';
import { SystemModal } from '@/components/ui/SystemModal';
import { NeonButton } from '@/components/ui/NeonButton';
import { useRouter } from 'next/navigation';

interface Props {
  open: boolean;
  onClose: () => void;
  skillId: string;
  skillName: string;
}

export function DifficultyModal({ open, onClose, skillId, skillName }: Props) {
  const router = useRouter();

  function start(mode: 'normal' | 'hardcore') {
    router.push(`/test/${skillId}?mode=${mode}`);
  }

  return (
    <SystemModal open={open} onClose={onClose} title={`▶ ${skillName}`}>
      <p className="text-[11px] tracking-widest text-muted mb-4 uppercase">
        SELECT DIFFICULTY
      </p>
      <div className="space-y-2">
        <NeonButton size="lg" className="w-full" onClick={() => start('normal')}>
          NORMAL · 30 SEC / QUESTION
        </NeonButton>
        <NeonButton size="lg" variant="danger" className="w-full" onClick={() => start('hardcore')}>
          HARDCORE · 10 SEC / QUESTION
        </NeonButton>
      </div>
    </SystemModal>
  );
}
