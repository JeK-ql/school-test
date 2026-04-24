'use client';
import { useEffect } from 'react';
import { useRunStore } from '@/store/useRunStore';

export function Timer() {
  const remainingMs = useRunStore((s) => s.remainingMs);
  const status = useRunStore((s) => s.status);
  const tick = useRunStore((s) => s.tick);

  useEffect(() => {
    if (status !== 'running') return;
    const id = setInterval(() => tick(1000), 1000);
    return () => clearInterval(id);
  }, [status, tick]);

  const seconds = Math.max(0, Math.ceil(remainingMs / 1000));
  const warn = seconds <= 5;

  return (
    <div className="relative flex flex-col items-end">
      <span className="font-mono text-[9px] tracking-system uppercase text-text-muted mb-0.5">
        TIME LEFT
      </span>
      <div className="flex items-center gap-1 font-display font-bold tabular-nums leading-none">
        <span className={warn ? 'text-danger text-[10px]' : 'text-accent/40 text-[10px]'}>◥</span>
        <span
          className={
            warn
              ? 'text-[34px] text-danger [text-shadow:0_0_18px_#FF005C] animate-pulse'
              : 'text-[34px] text-accent text-glow-lg'
          }
          style={{ letterSpacing: '0.12em' }}
        >
          {String(seconds).padStart(2, '0')}
        </span>
        <span className={warn ? 'text-danger text-[10px]' : 'text-accent/40 text-[10px]'}>◤</span>
      </div>
    </div>
  );
}
