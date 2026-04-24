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
      <p className="font-mono text-[10px] tracking-system text-text-muted mb-5 uppercase">
        SELECT DIFFICULTY
      </p>
      <div className="space-y-2.5">
        <button
          onClick={() => start('normal')}
          className="group w-full text-left border border-accent/40 hover:border-accent hover:shadow-glow hover:bg-[color:var(--accent-color)]/5 p-4 transition-all"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="font-display tracking-system uppercase text-accent text-sm text-glow">
                ▶ NORMAL
              </div>
              <div className="font-mono text-[10px] tracking-system text-text-muted mt-1">
                30 SEC / QUESTION
              </div>
            </div>
            <span className="font-mono text-[10px] text-text-subtle group-hover:text-accent">
              STANDARD ◢
            </span>
          </div>
        </button>

        <button
          onClick={() => start('hardcore')}
          className="group w-full text-left border border-danger/40 hover:border-danger hover:shadow-[0_0_14px_#FF005C] hover:bg-danger/5 p-4 transition-all"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="font-display tracking-system uppercase text-danger text-sm [text-shadow:0_0_10px_rgba(255,0,92,0.5)]">
                ◈ HARDCORE
              </div>
              <div className="font-mono text-[10px] tracking-system text-text-muted mt-1">
                10 SEC / QUESTION · NO MERCY
              </div>
            </div>
            <span className="font-mono text-[10px] text-text-subtle group-hover:text-danger">
              S-RANK ONLY ◢
            </span>
          </div>
        </button>
      </div>

      <div className="mt-5 flex justify-center">
        <NeonButton variant="ghost" size="sm" onClick={onClose}>
          ⎋&nbsp;&nbsp;CANCEL
        </NeonButton>
      </div>
    </SystemModal>
  );
}
