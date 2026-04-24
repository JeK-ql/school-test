import type { Config } from 'tailwindcss';
const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0a0a0a',
        surface: '#111216',
        text: '#E6F7EE',
        muted: '#7a8b82',
        accent: 'var(--accent-color)',
        danger: '#FF005C',
      },
      fontFamily: { mono: ['ui-monospace', 'monospace'] },
      boxShadow: { glow: '0 0 14px var(--accent-color)' },
    },
  },
  plugins: [],
};
export default config;
