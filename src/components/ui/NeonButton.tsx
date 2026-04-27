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
    'relative font-display uppercase tracking-system transition-[box-shadow,border-color,color,transform] duration-200 cursor-pointer ' +
    'disabled:opacity-40 disabled:cursor-not-allowed active:translate-y-[1px] ' +
    'before:content-[""] before:absolute before:top-0 before:left-0 before:w-2 before:h-2 before:border-t before:border-l before:border-current before:pointer-events-none before:transition-[width,height,top,left] before:duration-200 before:ease-[cubic-bezier(0.2,0.8,0.2,1)] ' +
    'after:content-[""] after:absolute after:bottom-0 after:right-0 after:w-2 after:h-2 after:border-b after:border-r after:border-current after:pointer-events-none after:transition-[width,height,bottom,right] after:duration-200 after:ease-[cubic-bezier(0.2,0.8,0.2,1)] ' +
    'hover:before:w-3 hover:before:h-3 hover:after:w-3 hover:after:h-3';
  const sizes = {
    sm: 'text-[10px] px-2.5 py-1.5',
    md: 'text-[11px] px-3.5 py-2.5',
    lg: 'text-[12px] px-5 py-3.5',
  };
  const variants = {
    accent:
      'bg-transparent border border-accent/60 text-accent hover:border-accent hover:shadow-glow',
    danger:
      'bg-transparent border border-danger/60 text-danger hover:border-danger hover:shadow-[0_0_14px_#FF005C]',
    'dashed-danger':
      'bg-transparent border border-dashed border-danger/70 text-danger hover:border-danger hover:shadow-[0_0_10px_rgba(255,0,92,0.45)]',
    ghost:
      'bg-transparent border border-white/10 text-text hover:border-accent hover:text-accent',
  };
  return (
    <button
      ref={ref}
      className={clsx(base, sizes[size], variants[variant], className)}
      {...props}
    />
  );
});
