import registry from '@/data/icons-registry.json';

type Entry = { id: string; label: string; purpose: string; status: 'stub' | 'ready' };
const allIcons: Entry[] = [
  ...(registry.categories.navigation as Entry[]),
  ...(registry.categories.gameplay as Entry[]),
  ...(registry.categories.system as Entry[]),
];
const byId = new Map(allIcons.map((e) => [e.id, e]));

interface Props {
  name: string;
  size?: number;
  className?: string;
}

export function Icon({ name, size = 24, className }: Props) {
  const entry = byId.get(name);
  if (!entry) return null;
  if (entry.status === 'ready') {
    return (
      <img
        src={`/icons/${entry.id}.svg`}
        alt={entry.label}
        title={entry.label}
        width={size}
        height={size}
        className={className}
      />
    );
  }
  const letters = entry.id
    .split('-')
    .map((w) => w.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('');
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      data-icon={entry.id}
      aria-label={entry.label}
      className={className}
      style={{ color: 'var(--accent-color)' }}
    >
      <title>{entry.label}</title>
      <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 2" />
      <text x="12" y="16" textAnchor="middle" fontSize="10" fill="currentColor" fontFamily="monospace">
        {letters}
      </text>
    </svg>
  );
}
