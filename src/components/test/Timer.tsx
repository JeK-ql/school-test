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
    <div
      className={
        warn
          ? 'text-[28px] tracking-[4px] text-danger [text-shadow:0_0_14px_#FF005C]'
          : 'text-[28px] tracking-[4px] text-accent text-glow'
      }
    >
      {String(seconds).padStart(2, '0')}
    </div>
  );
}
