import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getDb } from '@/lib/mongo';
import { ObjectId } from 'mongodb';
import { getSkillMetadata } from '@/lib/skills-loader';
import { levelFromXP, xpProgressWithinLevel } from '@/lib/level';
import type { DashboardProgress } from '@/types/progress';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ ok: false, error: 'Unauthorized', code: 'unauthorized' }, { status: 401 });
  }
  const userId = new ObjectId(session.user.id);
  const db = await getDb();
  const rows = await db.collection('progress').find({ userId }).toArray();
  const metadata = getSkillMetadata();

  const progress: DashboardProgress[] = metadata.map((meta) => {
    const row = rows.find((r) => r.skillId === meta.skill_id);
    const totalXP = row?.totalXP ?? 0;
    const level = levelFromXP(totalXP);
    const { current, next } = xpProgressWithinLevel(totalXP);
    return {
      skillId: meta.skill_id,
      skillName: meta.skill_name,
      difficulty: meta.difficulty,
      description: meta.description,
      totalXP,
      level,
      lastRunAccuracy: row?.lastRunAccuracy ?? 0,
      lastRunAt: row?.lastRunAt ?? null,
      bestStreak: row?.bestStreak ?? 0,
      xpForCurrentLevel: current,
      xpForNextLevel: next,
    };
  });
  return NextResponse.json({ ok: true, progress });
}
