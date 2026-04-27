'use client';
import { SystemModal } from '@/components/ui/SystemModal';
import { NeonButton } from '@/components/ui/NeonButton';
import { Icon } from '@/components/ui/Icon';
import { useRouter } from 'next/navigation';

interface Props {
  open: boolean;
  onClose: () => void;
  skillId: string;
  skillName: string;
  description?: string;
}

export function DifficultyModal({ open, onClose, skillId, skillName, description }: Props) {
  const router = useRouter();

  function start(mode: 'normal' | 'hardcore') {
    router.push(`/test/${skillId}?mode=${mode}`);
  }

  return (
    <SystemModal open={open} onClose={onClose} title={`▶ ${skillName}`}>
      {description && (
        <div className="mb-5 border-l-2 border-accent/50 pl-3">
          <div className="font-mono text-[9px] tracking-system text-accent/80 uppercase mb-1.5">
            ◢ INTEL
          </div>
          <p className="font-mono text-[11px] leading-relaxed text-text">
            {description}
          </p>
        </div>
      )}
      <p className="font-mono text-[10px] tracking-system text-text-muted mb-5 uppercase">
        SELECT DIFFICULTY
      </p>

      <div className="space-y-3">
        <button
          onClick={() => start('normal')}
          className="hud-target hud-target-active group block w-full text-left p-4"
        >
          <span className="hud-scan" aria-hidden />
          <div className="relative z-[3] flex items-center gap-4">
            <Icon name="sword-staff" size={40} className="shrink-0 drop-glow" />
            <div className="min-w-0 flex-1">
              <div className="font-display tracking-system uppercase text-accent text-[15px] text-glow">
                NORMAL
              </div>
              <div className="font-mono text-[10px] tracking-[0.14em] text-text-muted mt-2 uppercase flex items-center gap-2">
                <span>30s</span>
                <span className="text-text-subtle">//</span>
                <span className="text-accent/70">STANDARD</span>
              </div>
            </div>
            <Icon
              name="gate-portal"
              size={40}
              className="shrink-0 drop-glow transition-transform duration-300 group-hover:translate-x-1"
            />
          </div>
        </button>

        <button
          onClick={() => start('hardcore')}
          className="hud-target hud-target-danger group block w-full text-left p-4"
        >
          <span className="hud-scan" aria-hidden />
          <div className="relative z-[3] flex items-center gap-4">
            <Icon
              name="glowing-skull"
              size={40}
              className="shrink-0 [filter:drop-shadow(0_0_10px_rgba(255,0,92,0.55))]"
            />
            <div className="min-w-0 flex-1">
              <div className="font-display tracking-system uppercase text-danger text-[15px] [text-shadow:0_0_10px_rgba(255,0,92,0.5)]">
                HARDCORE
              </div>
              <div className="font-mono text-[10px] tracking-[0.14em] text-text-muted mt-2 uppercase flex items-center gap-2">
                <span>10s</span>
                <span className="text-text-subtle">//</span>
                <span className="text-danger/80">NO MERCY</span>
              </div>
            </div>
            <Icon
              name="gate-portal"
              size={40}
              className="shrink-0 opacity-55 transition-[opacity,transform,filter] duration-300 group-hover:opacity-100 group-hover:translate-x-1 group-hover:[filter:drop-shadow(0_0_10px_#FF005C)]"
            />
          </div>
        </button>
      </div>

      <div className="mt-6 flex justify-center">
        <NeonButton variant="ghost" size="sm" onClick={onClose}>
          ⎋&nbsp;&nbsp;CANCEL
        </NeonButton>
      </div>
    </SystemModal>
  );
}
