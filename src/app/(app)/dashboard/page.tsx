import { SkillGrid } from '@/components/dashboard/SkillGrid';
import { HunterStatusPanel } from '@/components/dashboard/HunterStatusPanel';
import { auth } from '@/lib/auth';
import { getDb } from '@/lib/mongo';
import { ObjectId } from 'mongodb';
import { getSkillMetadata } from '@/lib/skills-loader';
import { levelFromXP, xpProgressWithinLevel } from '@/lib/level';
import { recordDailyVisit } from '@/lib/streak';
import { getThemeForDay } from '@/lib/theme';
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
      description: meta.description,
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
  const userId = new ObjectId(session!.user.id!);
  const db = await getDb();
  const visit = await recordDailyVisit(db, userId);
  const progress = await fetchProgress(session!.user.id!);
  const theme = getThemeForDay(new Date().getDay());
  const totalRuns = progress.filter((p) => p.lastRunAt).length;
  const avgLevel = Math.round(
    progress.reduce((a, p) => a + p.level, 0) / Math.max(progress.length, 1),
  );

  return (
    <div className="space-y-10">
      {/* Status header */}
      <header className="relative animate-scan-in">
        <div className="flex items-baseline gap-3 font-mono text-[10px] tracking-system text-text-muted uppercase mb-3">
          <span className="text-accent">●</span>
          <span>SYSTEM ONLINE</span>
          <span className="text-text-subtle">//</span>
          <span>THEME · {theme.label.toUpperCase()}</span>
          <span className="text-text-subtle">//</span>
          <span>HUNTER · {session!.user.email?.split('@')[0]}</span>
        </div>

        <h1 className="font-display font-bold text-center tracking-[0.14em] uppercase text-accent text-glow-lg leading-none text-[clamp(2.5rem,6vw,4.5rem)]">
          Skill&nbsp;Matrix
        </h1>

        <div className="mt-4 flex flex-wrap gap-x-10 gap-y-2 font-mono text-[11px] tracking-wider">
          <Stat label="SKILLS" value={progress.length} />
          <Stat label="AVG LVL" value={avgLevel} />
          <Stat label="ACTIVE" value={totalRuns} />
        </div>
      </header>

      <HunterStatusPanel
        accountXP={visit.accountXP}
        currentStreak={visit.currentStreak}
        longestStreak={visit.longestStreak}
        awarded={visit.awarded}
        alreadyToday={visit.alreadyToday}
      />

      <div>
        <div className="mb-5 flex items-center gap-2 text-text-subtle font-mono text-[10px] tracking-system">
          <span className="h-px flex-1 bg-accent/25" />
          <span className="caret">SELECT A DUNGEON TO ENTER</span>
          <span className="h-px flex-1 bg-accent/25" />
        </div>

        <SkillGrid progress={progress} />
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div>
      <div className="text-text-subtle text-[9px] tracking-system uppercase">{label}</div>
      <div className="text-accent font-display text-xl leading-none tabular-nums mt-1">
        {value}
      </div>
    </div>
  );
}
