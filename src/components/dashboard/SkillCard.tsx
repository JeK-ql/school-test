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
      <NeonCard className="relative pl-[70px]">
        <div className="absolute left-3.5 top-3.5">
          <HexBadge rank={p.difficulty} />
        </div>
        <div className="text-[10px] tracking-widest text-muted uppercase">
          LV.{p.level} · {p.difficulty}
        </div>
        <div className="text-[18px] text-accent text-glow mt-1 mb-2 uppercase">{p.skillName}</div>
        <ProgressBar value={fraction} />
        <div className="flex justify-between text-[11px] mt-1.5">
          <span>
            {p.totalXP} / {p.xpForNextLevel} XP
          </span>
          <span className="text-muted">
            {p.lastRunAt ? `last: ${Math.round(p.lastRunAccuracy * 100)}%` : 'no runs yet'}
          </span>
        </div>
        <div className="mt-3.5">
          <NeonButton className="w-full" onClick={() => setModalOpen(true)}>
            ◢ ENTER DUNGEON
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
