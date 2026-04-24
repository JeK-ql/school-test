'use client';
import { useEffect } from 'react';
import { useRunStore } from '@/store/useRunStore';

const LOCKOUT_MS = 3000;

export function PenaltyOverlay() {
  const status = useRunStore((s) => s.status);

  useEffect(() => {
    if (status !== 'penalty') return;
    const id = setTimeout(() => {
      useRunStore.setState({ status: 'explaining' });
    }, LOCKOUT_MS);
    return () => clearTimeout(id);
  }, [status]);

  if (status !== 'penalty') return null;
  return (
    <div className="fixed inset-0 z-40 backdrop-blur-sm bg-black/70 flex flex-col items-center justify-center">
      <div className="text-5xl tracking-[8px] font-bold text-danger [text-shadow:0_0_20px_#FF005C] animate-pulse">
        PENALTY
      </div>
      <div className="text-danger text-xs tracking-[3px] mt-2">-1 XP · 3 SEC LOCKOUT</div>
    </div>
  );
}
