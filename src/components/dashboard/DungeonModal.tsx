'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { NeonButton } from '@/components/ui/NeonButton';
import { HexBadge } from '@/components/ui/HexBadge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Icon } from '@/components/ui/Icon';
import type { DashboardProgress } from '@/types/progress';

interface Props {
  open: boolean;
  skills: DashboardProgress[];
  index: number;
  onClose: () => void;
  onIndexChange: (next: number) => void;
}

export function DungeonModal({ open, skills, index, onClose, onIndexChange }: Props) {
  const router = useRouter();
  const skill = open ? skills[index] : null;

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowLeft') onIndexChange((index - 1 + skills.length) % skills.length);
      else if (e.key === 'ArrowRight') onIndexChange((index + 1) % skills.length);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, index, skills.length, onClose, onIndexChange]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open || !skill) return null;

  const inLevel = skill.totalXP - skill.xpForCurrentLevel;
  const needed = skill.xpForNextLevel - skill.xpForCurrentLevel;
  const fraction = needed > 0 ? inLevel / needed : 0;

  const goPrev = () => onIndexChange((index - 1 + skills.length) % skills.length);
  const goNext = () => onIndexChange((index + 1) % skills.length);

  function start(mode: 'normal' | 'hardcore') {
    router.push(`/test/${skill!.skillId}?mode=${mode}`);
  }

  return (
    <div
      className="fixed inset-0 z-50 backdrop-blur-md bg-black/80 flex items-center justify-center px-4 py-6 animate-scan-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Dungeon briefing: ${skill.skillName}`}
    >
      {/* Side carousel arrows — desktop */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          goPrev();
        }}
        aria-label="Previous skill"
        className="hidden md:flex fixed left-6 top-1/2 -translate-y-1/2 z-[51] h-16 w-12
                   items-center justify-center text-accent/70 hover:text-accent
                   border border-accent/30 hover:border-accent
                   bg-[#0c0c10]/70 backdrop-blur-sm
                   transition-[color,border-color,box-shadow,transform] duration-200
                   hover:shadow-glow active:translate-x-[-2px]
                   font-display text-2xl"
      >
        ◀
      </button>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          goNext();
        }}
        aria-label="Next skill"
        className="hidden md:flex fixed right-6 top-1/2 -translate-y-1/2 z-[51] h-16 w-12
                   items-center justify-center text-accent/70 hover:text-accent
                   border border-accent/30 hover:border-accent
                   bg-[#0c0c10]/70 backdrop-blur-sm
                   transition-[color,border-color,box-shadow,transform] duration-200
                   hover:shadow-glow active:translate-x-[2px]
                   font-display text-2xl"
      >
        ▶
      </button>

      {/* Modal panel */}
      <div
        className="bracketed-4 bg-[#0c0c10]/95 border border-accent/60 shadow-glow-lg
                   max-w-2xl w-full font-body relative
                   max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <header className="border-b border-accent/25 px-6 py-4 flex items-start justify-between gap-4 sticky top-0 bg-[#0c0c10]/95 backdrop-blur-sm z-10">
          <div>
            <div className="text-[9px] tracking-system text-text-muted uppercase font-mono mb-0.5">
              [ DUNGEON BRIEFING ]
            </div>
            <div className="text-[10px] tracking-system text-accent/80 font-mono tabular-nums">
              ENTRY {String(index + 1).padStart(2, '0')} / {String(skills.length).padStart(2, '0')}
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close briefing"
            className="h-9 w-9 flex items-center justify-center text-text-muted hover:text-danger
                       border border-white/10 hover:border-danger/60 transition-colors
                       font-display text-base"
          >
            ✕
          </button>
        </header>

        {/* Body — re-keyed for entry animation on switch */}
        <div key={skill.skillId} className="p-6 animate-scan-in">
          <div className="flex items-start gap-4 mb-6">
            <HexBadge rank={skill.difficulty} size={56} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="font-mono text-[10px] tracking-system text-text-muted uppercase">
                  {skill.difficulty}
                </span>
                <span className="font-mono text-[10px] tracking-system text-accent/80 tabular-nums">
                  LV.{String(skill.level).padStart(2, '0')}
                </span>
              </div>
              <h2 className="font-display tracking-system uppercase text-accent text-glow text-[clamp(1.25rem,3vw,1.75rem)] leading-tight">
                {skill.skillName}
              </h2>
            </div>
          </div>

          {skill.description && (
            <div className="mb-6 border-l-2 border-accent/50 pl-4">
              <div className="font-mono text-[9px] tracking-system text-accent/80 uppercase mb-1.5">
                ◢ INTEL
              </div>
              <p className="font-mono text-[12px] leading-relaxed text-text">
                {skill.description}
              </p>
            </div>
          )}

          <div className="mb-6">
            <div className="flex items-baseline justify-between font-mono text-[10px] tracking-system uppercase mb-2">
              <span className="text-text-muted">XP · CURRENT TIER</span>
              <span className="tabular-nums">
                <span className="text-accent">{inLevel.toLocaleString()}</span>
                <span className="text-text-subtle"> / {needed.toLocaleString()}</span>
              </span>
            </div>
            <ProgressBar value={fraction} />
            <div className="flex items-baseline justify-between font-mono text-[10px] tracking-system mt-2 tabular-nums uppercase">
              <span className="text-text-subtle">TOTAL · {skill.totalXP.toLocaleString()} XP</span>
              <span className="text-text-muted">NEXT TIER · {skill.xpForNextLevel.toLocaleString()}</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-6">
            <Stat
              label="LAST ACC"
              value={skill.lastRunAt ? `${Math.round(skill.lastRunAccuracy * 100)}%` : '—'}
            />
            <Stat label="BEST STREAK" value={skill.bestStreak.toString()} />
            <Stat
              label="STATUS"
              value={skill.lastRunAt ? 'ACTIVE' : 'NEW'}
              accent={!skill.lastRunAt}
            />
          </div>

          <div className="mb-4 flex items-center gap-2 text-text-subtle font-mono text-[10px] tracking-system">
            <span className="h-px flex-1 bg-accent/25" />
            <span>SELECT DIFFICULTY</span>
            <span className="h-px flex-1 bg-accent/25" />
          </div>

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

          {/* Mobile carousel controls */}
          <div className="md:hidden mt-6 grid grid-cols-3 gap-2">
            <NeonButton variant="ghost" size="sm" onClick={goPrev}>
              ◀ PREV
            </NeonButton>
            <NeonButton variant="ghost" size="sm" onClick={onClose}>
              ⎋ CLOSE
            </NeonButton>
            <NeonButton variant="ghost" size="sm" onClick={goNext}>
              NEXT ▶
            </NeonButton>
          </div>

          {/* Keyboard hints — desktop */}
          <div className="mt-5 hidden md:flex items-center justify-center gap-3 font-mono text-[9px] tracking-system text-text-subtle uppercase">
            <span>◀ PREV</span>
            <span className="text-text-subtle/60">·</span>
            <span>ESC CLOSE</span>
            <span className="text-text-subtle/60">·</span>
            <span>NEXT ▶</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="border-l border-accent/20 pl-3 py-1">
      <div className="font-mono text-[9px] tracking-system text-text-subtle uppercase">
        {label}
      </div>
      <div
        className={
          'mt-1 font-display tabular-nums leading-none text-base ' +
          (accent ? 'text-accent text-glow' : 'text-text')
        }
      >
        {value}
      </div>
    </div>
  );
}
