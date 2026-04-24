interface Props {
  results: Array<'done' | 'wrong' | 'cur' | 'pending'>;
}
export function ProgressDots({ results }: Props) {
  return (
    <div className="flex gap-1 my-2">
      {results.map((r, i) => (
        <div
          key={i}
          className={
            r === 'done'
              ? 'w-[18px] h-[3px] bg-accent shadow-[0_0_6px_var(--accent-dim)]'
              : r === 'wrong'
                ? 'w-[18px] h-[3px] bg-danger shadow-[0_0_6px_#FF005C]'
                : r === 'cur'
                  ? 'w-[18px] h-[3px] bg-accent opacity-50'
                  : 'w-[18px] h-[3px] bg-white/5'
          }
        />
      ))}
    </div>
  );
}
