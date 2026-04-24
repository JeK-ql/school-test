interface Props {
  value: number;
}
export function ProgressBar({ value }: Props) {
  const pct = Math.max(0, Math.min(1, value)) * 100;
  return (
    <div className="h-[6px] bg-white/5 relative overflow-hidden">
      <span
        className="block h-full bg-accent shadow-glow"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
