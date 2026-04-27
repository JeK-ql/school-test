'use client';
import { useState } from 'react';
import { NeonCard } from '@/components/ui/NeonCard';
import { NeonButton } from '@/components/ui/NeonButton';
import { HexBadge } from '@/components/ui/HexBadge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { DifficultyModal } from './DifficultyModal';
import type { DashboardProgress } from '@/types/progress';

export function SkillCard({ p }: { p: DashboardProgress }) {
  const [modalOpen, setModalOpen] = useState(false);
  const inLevel = p.totalXP - p.xpForCurrentLevel;
  const needed = p.xpForNextLevel - p.xpForCurrentLevel;
  const fraction = needed > 0 ? inLevel / needed : 0;

  return (
    <>
      <NeonCard
        variant="bracketed"
        className="hud-panel group relative animate-scan-in"
      >
        {p.description && (
          <div
            role="tooltip"
            className="pointer-events-none absolute left-1/2 -top-3 z-30 w-[min(22rem,90vw)] -translate-x-1/2 -translate-y-full
                       opacity-0 group-hover:opacity-100 group-focus-within:opacity-100
                       transition-opacity duration-150
                       border border-accent/40 bg-bg/95 backdrop-blur-sm
                       px-4 py-3 shadow-[0_0_24px_-6px_rgba(0,200,255,0.45)]"
          >
            <div className="font-mono text-[9px] tracking-system uppercase text-accent/80 mb-1.5">
              ◢ INTEL · {p.difficulty}
            </div>
            <div className="font-display tracking-system uppercase text-[12px] text-accent text-glow leading-tight mb-2">
              {p.skillName}
            </div>
            <p className="font-mono text-[11px] leading-relaxed text-text">
              {p.description}
            </p>
            <span
              aria-hidden
              className="absolute left-1/2 -bottom-1.5 h-3 w-3 -translate-x-1/2 rotate-45
                         border-r border-b border-accent/40 bg-bg/95"
            />
          </div>
        )}
        <div className="flex items-start gap-4">
          <HexBadge rank={p.difficulty} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono text-[10px] tracking-system text-text-muted uppercase">
                {p.difficulty}
              </span>
              <span className="font-mono text-[10px] tracking-system text-accent/80">
                LV.{String(p.level).padStart(2, '0')}
              </span>
            </div>
            <h3 className="font-display tracking-system uppercase text-[17px] text-accent text-glow mt-1 mb-4 leading-tight truncate">
              {p.skillName}
            </h3>
            <ProgressBar value={fraction} />
            <div className="flex justify-between font-mono text-[10px] mt-1.5 tabular-nums">
              <span className="text-text">
                {p.totalXP}
                <span className="text-text-subtle"> / {p.xpForNextLevel}</span>
                <span className="text-text-muted ml-1">XP</span>
              </span>
              <span className="text-text-muted">
                {p.lastRunAt
                  ? `ACC ${Math.round(p.lastRunAccuracy * 100)}%`
                  : 'NO RUNS'}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-5">
          <NeonButton className="w-full" onClick={() => setModalOpen(true)}>
            ◢&nbsp;&nbsp;ENTER DUNGEON
          </NeonButton>
        </div>
      </NeonCard>
      <DifficultyModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        skillId={p.skillId}
        skillName={p.skillName}
        description={p.description}
      />
    </>
  );
}
