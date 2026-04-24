import { forwardRef, type ButtonHTMLAttributes } from 'react';
import clsx from 'clsx';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'accent' | 'danger' | 'dashed-danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export const NeonButton = forwardRef<HTMLButtonElement, Props>(function NeonButton(
  { className, variant = 'accent', size = 'md', ...props },
  ref,
) {
  const base =
    'relative font-display uppercase tracking-system transition-[box-shadow,background-color,transform] cursor-pointer ' +
    'disabled:opacity-40 disabled:cursor-not-allowed active:translate-y-[1px] ' +
    'before:content-[""] before:absolute before:top-0 before:left-0 before:w-2 before:h-2 before:border-t before:border-l before:border-current ' +
    'after:content-[""] after:absolute after:bottom-0 after:right-0 after:w-2 after:h-2 after:border-b after:border-r after:border-current';
  const sizes = {
    sm: 'text-[10px] px-2.5 py-1.5',
    md: 'text-[11px] px-3.5 py-2.5',
    lg: 'text-[12px] px-5 py-3.5',
  };
  const variants = {
    accent:
      'bg-transparent border border-accent text-accent hover:shadow-glow hover:bg-[color:var(--accent-color)]/5',
    danger:
      'bg-transparent border border-danger text-danger hover:shadow-[0_0_14px_#FF005C] hover:bg-[#FF005C]/5',
    'dashed-danger':
      'bg-transparent border border-dashed border-danger text-danger hover:bg-[rgba(255,0,92,0.06)]',
    ghost: 'bg-transparent border border-white/10 text-text hover:border-accent hover:text-accent',
  };
  return (
    <button
      ref={ref}
      className={clsx(base, sizes[size], variants[variant], className)}
      {...props}
    />
  );
});
