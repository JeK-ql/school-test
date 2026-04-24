import { SkillCard } from '@/components/dashboard/SkillCard';
import { auth } from '@/lib/auth';
import { getDb } from '@/lib/mongo';
import { ObjectId } from 'mongodb';
import { getSkillMetadata } from '@/lib/skills-loader';
import { levelFromXP, xpProgressWithinLevel } from '@/lib/level';
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
  const theme = getThemeForDay(new Date().getDay());
  const totalXP = progress.reduce((a, p) => a + p.totalXP, 0);
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

        <h1 className="font-display font-bold tracking-[0.14em] uppercase text-accent text-glow-lg leading-none text-[clamp(2.5rem,6vw,4.5rem)]">
          Skill&nbsp;Matrix
        </h1>

        <div className="mt-4 flex flex-wrap gap-x-10 gap-y-2 font-mono text-[11px] tracking-wider">
          <Stat label="SKILLS" value={progress.length} />
          <Stat label="AVG LVL" value={avgLevel} />
          <Stat label="TOTAL XP" value={totalXP} />
          <Stat label="RUNS" value={totalRuns} />
        </div>

        <div className="mt-5 flex items-center gap-2 text-text-subtle font-mono text-[10px] tracking-system">
          <span className="h-px flex-1 bg-accent/25" />
          <span className="caret">SELECT A DUNGEON TO ENTER</span>
          <span className="h-px flex-1 bg-accent/25" />
        </div>
      </header>

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {progress.map((p, i) => (
          <div key={p.skillId} style={{ animationDelay: `${80 + i * 60}ms` }} className="animate-scan-in">
            <SkillCard p={p} />
          </div>
        ))}
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
