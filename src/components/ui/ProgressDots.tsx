import clsx from 'clsx';

interface Props {
  results: Array<'done' | 'wrong' | 'cur' | 'pending'>;
}

export function ProgressDots({ results }: Props) {
  return (
    <div className="flex gap-[3px] my-2 flex-wrap" role="progressbar" aria-label="Question progress">
      {results.map((r, i) => (
        <div
          key={i}
          className={clsx(
            'w-[14px] h-[4px] transition-colors',
            r === 'done' && 'bg-accent shadow-[0_0_8px_var(--accent-dim)]',
            r === 'wrong' && 'bg-danger shadow-[0_0_8px_#FF005C]',
            r === 'cur' && 'bg-accent/60 animate-pulse',
            r === 'pending' && 'bg-white/[0.06]',
          )}
        />
      ))}
    </div>
  );
}
