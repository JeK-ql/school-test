'use client';
import { useState } from 'react';
import { SkillCard } from './SkillCard';
import { DungeonModal } from './DungeonModal';
import type { DashboardProgress } from '@/types/progress';

export function SkillGrid({ progress }: { progress: DashboardProgress[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <>
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {progress.map((p, i) => (
          <SkillCard
            key={p.skillId}
            p={p}
            animationDelay={`${80 + i * 60}ms`}
            onEnter={() => setOpenIndex(i)}
          />
        ))}
      </div>
      <DungeonModal
        open={openIndex !== null}
        skills={progress}
        index={openIndex ?? 0}
        onClose={() => setOpenIndex(null)}
        onIndexChange={setOpenIndex}
      />
    </>
  );
}
