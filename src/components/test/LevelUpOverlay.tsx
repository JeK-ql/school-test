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

export function LevelUpOverlay({ previousLevel, newLevel, skillName, correct, wrong, bonus, accuracy }: Props) {
  return (
    <div className="fixed inset-0 z-40 backdrop-blur-sm bg-black/70 flex flex-col items-center justify-center font-mono">
      <div className="text-[10px] tracking-widest text-accent">[ NOTIFICATION ]</div>
      <div className="text-4xl tracking-[6px] font-bold text-accent [text-shadow:0_0_20px_var(--accent-color)] mt-2">
        LEVEL UP
      </div>
      <div className="text-accent text-[11px] tracking-[3px] mt-2">
        Lv. {previousLevel} → Lv. {newLevel} · {skillName}
      </div>
      <div className="text-muted text-[11px] tracking-[2px] mt-5">
        CORRECT: {correct} · WRONG: {wrong} · BONUS: {bonus} · ACCURACY: {Math.round(accuracy * 100)}%
      </div>
      <Link href="/dashboard">
        <NeonButton size="lg" className="mt-5">◢ RETURN</NeonButton>
      </Link>
    </div>
  );
}
