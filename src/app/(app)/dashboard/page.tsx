import { SkillCard } from '@/components/dashboard/SkillCard';
import { auth } from '@/lib/auth';
import { getDb } from '@/lib/mongo';
import { ObjectId } from 'mongodb';
import { getSkillMetadata } from '@/lib/skills-loader';
import { levelFromXP, xpProgressWithinLevel } from '@/lib/level';
import type { DashboardProgress } from '@/types/progress';

async function fetchProgress(userId: string): Promise<DashboardProgress[]> {
  const db = await getDb();
  const rows = await db.collection('progress').find({ userId: new ObjectId(userId) }).toArray();
  return getSkillMetadata().map((meta) => {
    const row = rows.find((r) => r.skillId === meta.skill_id);
    const totalXP = row?.totalXP ?? 0;
    const { current, next } = xpProgressWithinLevel(totalXP);
    return {
      skillId: meta.skill_id,
      skillName: meta.skill_name,
      difficulty: meta.difficulty,
      totalXP,
      level: levelFromXP(totalXP),
      lastRunAccuracy: row?.lastRunAccuracy ?? 0,
      lastRunAt: row?.lastRunAt ?? null,
      bestStreak: row?.bestStreak ?? 0,
      xpForCurrentLevel: current,
      xpForNextLevel: next,
    };
  });
}

export default async function DashboardPage() {
  const session = await auth();
  const progress = await fetchProgress(session!.user.id!);
  return (
    <div>
      <div className="text-[10px] tracking-widest text-muted uppercase mb-2">[ SKILL MATRIX ]</div>
      <h1 className="text-accent text-glow text-2xl tracking-widest uppercase mb-6">DUNGEONS</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {progress.map((p) => (
          <SkillCard key={p.skillId} p={p} />
        ))}
      </div>
    </div>
  );
}
