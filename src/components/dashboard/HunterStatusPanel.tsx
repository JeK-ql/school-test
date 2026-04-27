import { NeonCard } from '@/components/ui/NeonCard';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Icon } from '@/components/ui/Icon';
import { levelFromXP, xpProgressWithinLevel } from '@/lib/level';
import { daysUntilNextMilestone } from '@/lib/streak';
import { STREAK_BONUS, STREAK_MILESTONES, type VisitResult } from '@/types/userStats';

interface Props {
  accountXP: number;
  currentStreak: number;
  longestStreak: number;
  awarded: VisitResult['awarded'];
  alreadyToday: boolean;
}

export function HunterStatusPanel({
  accountXP,
  currentStreak,
  longestStreak,
  awarded,
  alreadyToday,
}: Props) {
  const level = levelFromXP(accountXP);
  const { current, next } = xpProgressWithinLevel(accountXP);
  const span = Math.max(1, next - current);
  const fraction = Math.min(1, Math.max(0, (accountXP - current) / span));
  const intoLevel = accountXP - current;

  const daysToWeekly = daysUntilNextMilestone(currentStreak, STREAK_MILESTONES.WEEKLY);
  const daysToQuarterly = daysUntilNextMilestone(currentStreak, STREAK_MILESTONES.QUARTERLY);
  const justAwarded = !alreadyToday && (awarded.daily + awarded.weekly + awarded.quarterly) > 0;
  const totalAwardedToday = awarded.daily + awarded.weekly + awarded.quarterly;

  return (
    <NeonCard variant="bracketed" className="relative animate-scan-in">
      <div className="flex items-center justify-between mb-4">
        <span className="font-mono text-[10px] tracking-system text-text-muted uppercase">
          [ HUNTER STATUS ]
        </span>
        <span className="font-mono text-[10px] tracking-system text-text-subtle uppercase">
          ACCOUNT // GLOBAL
        </span>
      </div>

      <div className="grid gap-5 md:grid-cols-[auto_1fr] md:items-end">
        <div className="flex items-center gap-3">
          <Icon name="rising-chart" size={48} className="drop-glow shrink-0" />
          <div className="flex items-baseline gap-3">
            <span className="font-mono text-[10px] tracking-system text-text-muted uppercase">
              LEVEL
            </span>
            <span className="font-display tracking-system text-accent text-glow-lg text-[44px] leading-none tabular-nums">
              {String(level).padStart(2, '0')}
            </span>
          </div>
        </div>

        <div className="min-w-0">
          <div className="flex items-baseline justify-between font-mono text-[10px] tracking-system uppercase mb-2">
            <span className="text-text-muted">XP · CURRENT TIER</span>
            <span className="tabular-nums text-text">
              <span className="text-accent">{intoLevel.toLocaleString()}</span>
              <span className="text-text-subtle"> / {span.toLocaleString()}</span>
            </span>
          </div>
          <ProgressBar value={fraction} />
          <div className="flex items-baseline justify-between font-mono text-[10px] tracking-system mt-2 tabular-nums">
            <span className="text-text-subtle uppercase">TOTAL · {accountXP.toLocaleString()} XP</span>
            <span className="text-text-muted uppercase">NEXT TIER · {next.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className="mt-5 h-px bg-accent/15" aria-hidden />

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <StreakCell
          label="STREAK"
          value={currentStreak}
          unit="DAYS"
          accent
          iconName="flame"
          dim={currentStreak <= 0}
        />
        <StreakCell
          label="BEST"
          value={longestStreak}
          unit="DAYS"
          iconName="trophy-aura"
          dim={longestStreak <= 0}
        />
        <NextBonusCell
          daysToWeekly={daysToWeekly}
          daysToQuarterly={daysToQuarterly}
          currentStreak={currentStreak}
        />
      </div>

      <div className="mt-4 font-mono text-[10px] tracking-system text-text-subtle uppercase flex flex-wrap items-center gap-x-3 gap-y-1">
        <span className="text-text-muted">DAILY GRANT</span>
        <span className="text-accent/80">+{STREAK_BONUS.DAILY}</span>
        <span className="text-text-subtle">//</span>
        <span className="text-text-muted">7d STREAK</span>
        <span className="text-accent/80">+{STREAK_BONUS.WEEKLY}</span>
        <span className="text-text-subtle">//</span>
        <span className="text-text-muted">90d STREAK</span>
        <span className="text-accent/80">+{STREAK_BONUS.QUARTERLY}</span>
      </div>

      {justAwarded && (
        <div
          role="status"
          className="mt-5 border border-accent/40 bg-[color:var(--accent-color)]/[0.06] px-4 py-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 animate-scan-in"
        >
          <Icon name="treasure-chest" size={40} className="drop-glow shrink-0" />
          <span className="font-display tracking-system uppercase text-accent text-glow text-xs">
            DAILY CHECK-IN
          </span>
          <span className="font-mono text-[11px] tracking-system text-accent tabular-nums">
            +{totalAwardedToday} XP
          </span>
          <span className="text-text-subtle font-mono text-[10px] tracking-system">//</span>
          <span className="font-mono text-[10px] tracking-system text-text-muted uppercase">
            <span className="text-accent/80">+{awarded.daily}</span> DAILY
            {awarded.weekly > 0 && (
              <>
                <span className="text-text-subtle mx-2">·</span>
                <span className="text-accent/80">+{awarded.weekly}</span> 7d
              </>
            )}
            {awarded.quarterly > 0 && (
              <>
                <span className="text-text-subtle mx-2">·</span>
                <span className="text-accent/80">+{awarded.quarterly}</span> 90d
              </>
            )}
          </span>
        </div>
      )}
    </NeonCard>
  );
}

function StreakCell({
  label,
  value,
  unit,
  accent,
  iconName,
  dim,
}: {
  label: string;
  value: number;
  unit: string;
  accent?: boolean;
  iconName: string;
  dim?: boolean;
}) {
  return (
    <div className="border-l border-accent/20 pl-3">
      <div className="font-mono text-[9px] tracking-system text-text-subtle uppercase">{label}</div>
      <div className="mt-1 flex items-center gap-2.5">
        <Icon
          name={iconName}
          size={40}
          className={
            'shrink-0 ' +
            (dim ? 'opacity-35 grayscale' : accent ? 'drop-glow' : 'opacity-80')
          }
        />
        <div className="flex items-baseline gap-2">
          <span
            className={
              'font-display tabular-nums leading-none ' +
              (accent ? 'text-accent text-glow text-2xl' : 'text-text text-xl')
            }
          >
            {value}
          </span>
          <span className="font-mono text-[9px] tracking-system text-text-muted uppercase">
            {unit}
          </span>
        </div>
      </div>
    </div>
  );
}

function NextBonusCell({
  daysToWeekly,
  daysToQuarterly,
  currentStreak,
}: {
  daysToWeekly: number;
  daysToQuarterly: number;
  currentStreak: number;
}) {
  if (currentStreak <= 0) {
    return (
      <div className="border-l border-accent/20 pl-3">
        <div className="font-mono text-[9px] tracking-system text-text-subtle uppercase">
          NEXT BONUS
        </div>
        <div className="mt-1 flex items-center gap-2.5">
          <Icon name="glowing-key" size={40} className="shrink-0 opacity-40 grayscale" />
          <span className="font-mono text-[11px] tracking-system text-text-muted uppercase">
            BEGIN A STREAK
          </span>
        </div>
      </div>
    );
  }

  const useQuarterly = daysToQuarterly <= daysToWeekly;
  const days = useQuarterly ? daysToQuarterly : daysToWeekly;
  const amount = useQuarterly ? STREAK_BONUS.QUARTERLY : STREAK_BONUS.WEEKLY;
  const tag = useQuarterly ? '90d' : '7d';

  return (
    <div className="border-l border-accent/20 pl-3">
      <div className="font-mono text-[9px] tracking-system text-text-subtle uppercase">
        NEXT BONUS
      </div>
      <div className="mt-1 flex items-center gap-2.5">
        <Icon name="glowing-key" size={40} className="shrink-0 drop-glow" />
        <div className="flex items-baseline gap-2">
          <span className="font-display tabular-nums leading-none text-accent text-glow text-xl">
            +{amount}
          </span>
          <span className="font-mono text-[10px] tracking-system text-text-muted uppercase">
            IN {days}d <span className="text-text-subtle">·</span> {tag}
          </span>
        </div>
      </div>
    </div>
  );
}
