'use client';
import { use } from 'react';
import { useSearchParams } from 'next/navigation';
import { TestRunner } from '@/components/test/TestRunner';
import type { Difficulty } from '@/types/run';
import { SKILL_IDS, type SkillId } from '@/data/skills-manifest';

export default function TestPage({ params }: { params: Promise<{ skillId: string }> }) {
  const { skillId } = use(params);
  const search = useSearchParams();
  const mode = (search.get('mode') === 'hardcore' ? 'hardcore' : 'normal') as Difficulty;

  if (!(SKILL_IDS as readonly string[]).includes(skillId)) {
    return (
      <div className="text-center mt-20">
        <div className="text-danger text-4xl tracking-widest text-glow">SIGNAL LOST</div>
        <div className="text-muted text-xs tracking-widest mt-2">Unknown skill id: {skillId}</div>
        <a className="text-accent mt-6 inline-block" href="/dashboard">◢ RETURN TO DASHBOARD</a>
      </div>
    );
  }

  return <TestRunner skillId={skillId as SkillId} mode={mode} />;
}
