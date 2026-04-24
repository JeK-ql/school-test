interface Props {
  rank: string;
  size?: number;
}

const rankFile: Record<string, string> = {
  E: 'e-rang',
  D: 'd-rang',
  C: 'c-rang',
  B: 'b-rang',
  A: 'a-rang',
  S: 's-rang',
};

export function HexBadge({ rank, size = 44 }: Props) {
  const letter = rank.charAt(0).toUpperCase();
  const file = rankFile[letter];

  if (file) {
    return (
      <div
        className="relative drop-glow"
        style={{ width: size, height: size * 1.15 }}
      >
        <span
          aria-hidden
          className="absolute inset-[-6px] animate-glow-pulse"
          style={{
            background:
              'radial-gradient(circle at center, color-mix(in srgb, var(--accent-color) 28%, transparent) 0%, transparent 60%)',
          }}
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`/icon/${file}.png`}
          alt={`${letter}-Rank`}
          title={`${letter}-Rank`}
          width={size}
          height={size * 1.15}
          className="relative"
        />
      </div>
    );
  }

  return (
    <div
      className="flex items-center justify-center text-accent font-display font-bold text-glow"
      style={{
        width: size,
        height: size * 1.15,
        clipPath: 'polygon(50% 0, 100% 25%, 100% 75%, 50% 100%, 0 75%, 0 25%)',
        background:
          'linear-gradient(180deg, color-mix(in srgb, var(--accent-color) 20%, transparent), color-mix(in srgb, var(--accent-color) 2%, transparent))',
        border: '1px solid var(--accent-color)',
      }}
    >
      {letter}
    </div>
  );
}
