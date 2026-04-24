interface Props {
  value: number;
  showTicks?: boolean;
}

export function ProgressBar({ value, showTicks = true }: Props) {
  const pct = Math.max(0, Math.min(1, value)) * 100;
  return (
    <div className="relative h-[8px] bg-white/[0.04] border border-white/5 overflow-hidden">
      <span
        className="block h-full bg-accent shadow-[0_0_14px_var(--accent-dim)] transition-[width] duration-500"
        style={{ width: `${pct}%` }}
      />
      {showTicks && (
        <div className="pointer-events-none absolute inset-0 progress-ticks opacity-80" aria-hidden />
      )}
    </div>
  );
}
