import { forwardRef, type ButtonHTMLAttributes } from 'react';
import clsx from 'clsx';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'accent' | 'danger' | 'dashed-danger';
  size?: 'sm' | 'md' | 'lg';
}

export const NeonButton = forwardRef<HTMLButtonElement, Props>(function NeonButton(
  { className, variant = 'accent', size = 'md', ...props },
  ref,
) {
  const base = 'font-mono uppercase tracking-widest transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed';
  const sizes = { sm: 'text-[10px] px-2 py-1', md: 'text-xs px-3 py-2', lg: 'text-sm px-4 py-3' };
  const variants = {
    accent: 'bg-transparent border border-accent text-accent hover:shadow-glow hover:bg-[rgba(255,255,255,0.04)]',
    danger: 'bg-transparent border border-danger text-danger hover:shadow-[0_0_14px_#FF005C]',
    'dashed-danger': 'bg-transparent border border-dashed border-danger text-danger hover:bg-[rgba(255,0,92,0.06)]',
  };
  return <button ref={ref} className={clsx(base, sizes[size], variants[variant], className)} {...props} />;
});
