'use client';
import { useEffect, useState } from 'react';
import { useRunStore } from '@/store/useRunStore';

const LOCKOUT_MS = 3000;

export function PenaltyOverlay() {
  const status = useRunStore((s) => s.status);
  const [remaining, setRemaining] = useState(LOCKOUT_MS);

  useEffect(() => {
    if (status !== 'penalty') return;
    setRemaining(LOCKOUT_MS);
    const started = Date.now();
    const interval = setInterval(() => {
      setRemaining(Math.max(0, LOCKOUT_MS - (Date.now() - started)));
    }, 100);
    const timeout = setTimeout(() => {
      useRunStore.setState({ status: 'explaining' });
    }, LOCKOUT_MS);
    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [status]);

  if (status !== 'penalty') return null;
  const pct = (remaining / LOCKOUT_MS) * 100;

  return (
    <div className="fixed inset-0 z-40 backdrop-blur-md bg-black/80 flex flex-col items-center justify-center font-display animate-scan-in">
      <div className="font-mono text-[10px] tracking-system uppercase text-danger/80 mb-3 flex items-center gap-2">
        <span className="h-px w-10 bg-danger" />
        [ SYSTEM WARNING ]
        <span className="h-px w-10 bg-danger" />
      </div>
      <div className="relative">
        <div
          className="font-bold text-danger text-[84px] leading-none animate-pulse"
          style={{ letterSpacing: '0.32em', textShadow: '0 0 30px #FF005C, 0 0 60px rgba(255,0,92,0.55)' }}
        >
          PENALTY
        </div>
        <div
          aria-hidden
          className="absolute inset-0 font-bold text-danger/30 text-[84px] leading-none blur-sm pointer-events-none"
          style={{ letterSpacing: '0.32em' }}
        >
          PENALTY
        </div>
      </div>
      <div className="mt-4 font-mono text-danger text-sm tracking-system">
        −1 XP · 3 SEC LOCKOUT
      </div>
      <div className="mt-5 w-60 h-[3px] bg-danger/15 relative overflow-hidden">
        <span
          className="absolute inset-y-0 left-0 bg-danger shadow-[0_0_10px_#FF005C]"
          style={{ width: `${pct}%`, transition: 'width 100ms linear' }}
        />
      </div>
    </div>
  );
}
