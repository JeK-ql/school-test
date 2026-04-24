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
        className="group relative overflow-hidden transition-shadow hover:shadow-glow animate-scan-in"
      >
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
      />
    </>
  );
}
