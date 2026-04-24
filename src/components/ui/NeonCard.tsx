import type { HTMLAttributes } from 'react';
import clsx from 'clsx';

export function NeonCard({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={clsx(
        'bg-bg border border-[color:var(--accent-color)]/25 text-text font-mono p-4 relative',
        'before:content-[""] before:absolute before:inset-[-1px] before:border before:border-accent before:opacity-[0.12] before:pointer-events-none',
        className,
      )}
      {...props}
    />
  );
}
