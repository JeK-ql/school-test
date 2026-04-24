import type { HTMLAttributes } from 'react';
import clsx from 'clsx';

interface Props extends HTMLAttributes<HTMLDivElement> {
  variant?: 'panel' | 'bracketed' | 'hero';
}

export function NeonCard({ className, variant = 'panel', ...props }: Props) {
  return (
    <div
      className={clsx(
        'relative font-body bg-[#0c0c10]/80 backdrop-blur-sm text-text p-5',
        'border border-[color:var(--accent-color)]/25',
        variant === 'bracketed' && 'bracketed',
        variant === 'hero' && 'bracketed-4 hud-clip',
        className,
      )}
      {...props}
    />
  );
}
