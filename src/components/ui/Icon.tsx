import registry from '@/data/icons-registry.json';

type Entry = { id: string; label: string; purpose: string; status: 'stub' | 'ready' };

const allIcons: Entry[] = [
  ...(registry.categories.navigation as Entry[]),
  ...(registry.categories.gameplay as Entry[]),
  ...(registry.categories.system as Entry[]),
];
const byId = new Map(allIcons.map((e) => [e.id, e]));

// Maps registry id → actual filename in /public/icon/ (without extension).
// User provided PNGs with mixed casing; we map explicitly to avoid 404s.
const iconFile: Record<string, string> = {
  'winged-dagger': 'Winged-Dagger',
  'open-ancient-book': 'Open-Ancient-Book',
  'gate-portal': 'Gate-Portal',
  'trophy-aura': 'Trophy-with-Aura',
  'stopwatch': 'Stopwatch',
  'rising-chart': 'Rising-Bar-Chart',
  'settings-gear': 'Settings-Gear',
  'mana-potion': 'Crystal-Mana-Potion',
  'sword-staff': 'Sword-with-staff',
  'spike-shield': 'Shield-with-Spikes',
  'glowing-key': 'Glowing-Key',
  'treasure-chest': 'Treasure-Chest',
  'shadow-soldier': 'Shadow-Soldier',
  'lightning-bolt': 'Lightning-Bolt',
  'question-aura': 'Question-Mark',
  'glowing-skull': 'Skull',
  'magic-bell': 'Bell',
  'flame': 'Flame',
  'search-magnifier': 'Search-Magnifier',
};

interface Props {
  name: string;
  size?: number;
  className?: string;
  tint?: boolean;
}

export function Icon({ name, size = 40, className, tint = true }: Props) {
  const entry = byId.get(name);
  if (!entry) return null;

  const file = iconFile[entry.id];
  if (file) {
    const src = `/icon/${file}.png`;
    if (tint) {
      return (
        <span
          role="img"
          aria-label={entry.label}
          title={entry.label}
          className={className}
          style={{
            display: 'inline-block',
            width: size,
            height: size,
            backgroundColor: 'var(--accent-color)',
            WebkitMaskImage: `url(${src})`,
            maskImage: `url(${src})`,
            WebkitMaskRepeat: 'no-repeat',
            maskRepeat: 'no-repeat',
            WebkitMaskPosition: 'center',
            maskPosition: 'center',
            WebkitMaskSize: 'contain',
            maskSize: 'contain',
          }}
        />
      );
    }
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
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
