'use client';
import Link from 'next/link';
import { NeonButton } from '@/components/ui/NeonButton';

interface Props {
  previousLevel: number;
  newLevel: number;
  skillName: string;
  correct: number;
  wrong: number;
  bonus: number;
  accuracy: number;
}

export function LevelUpOverlay({
  previousLevel,
  newLevel,
  skillName,
  correct,
  wrong,
  bonus,
  accuracy,
}: Props) {
  return (
    <div className="fixed inset-0 z-40 backdrop-blur-md bg-black/80 flex flex-col items-center justify-center font-body animate-scan-in">
      <div className="font-mono text-[10px] tracking-system uppercase text-accent/80 mb-4 flex items-center gap-2">
        <span className="h-px w-10 bg-accent" />
        [ NOTIFICATION ]
        <span className="h-px w-10 bg-accent" />
      </div>

      <div className="relative">
        <div
          className="font-display font-bold text-accent text-[72px] md:text-[96px] leading-none text-glow-lg"
          style={{ letterSpacing: '0.24em' }}
        >
          LEVEL UP
        </div>
        <div
          aria-hidden
          className="absolute inset-0 font-display font-bold text-accent/30 text-[72px] md:text-[96px] leading-none blur-sm pointer-events-none"
          style={{ letterSpacing: '0.24em' }}
        >
          LEVEL UP
        </div>
      </div>

      <div className="mt-5 flex items-center gap-4 font-display tracking-system uppercase text-accent">
        <span className="text-text-subtle text-xl tabular-nums">Lv.{previousLevel}</span>
        <span className="text-accent text-glow text-xl">→</span>
        <span className="text-3xl text-glow-lg tabular-nums">Lv.{newLevel}</span>
      </div>

      <div className="mt-2 font-mono text-[10px] tracking-system uppercase text-text-muted">
        {skillName}
      </div>

      <div className="mt-8 grid grid-cols-4 gap-6 font-mono text-center">
        <StatTile label="CORRECT" value={correct} accent />
        <StatTile label="WRONG" value={wrong} />
        <StatTile label="BONUS" value={bonus} accent />
        <StatTile label="ACC" value={`${Math.round(accuracy * 100)}%`} accent />
      </div>

      <Link href="/dashboard">
        <NeonButton size="lg" className="mt-10">
          ◢&nbsp;&nbsp;RETURN TO MATRIX
        </NeonButton>
      </Link>
    </div>
  );
}

function StatTile({ label, value, accent }: { label: string; value: number | string; accent?: boolean }) {
  return (
    <div>
      <div className="text-text-subtle text-[9px] tracking-system uppercase">{label}</div>
      <div
        className={`font-display text-2xl leading-none tabular-nums mt-1 ${
          accent ? 'text-accent text-glow' : 'text-text-muted'
        }`}
      >
        {value}
      </div>
    </div>
  );
}
