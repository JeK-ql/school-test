import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0a0a0a',
        surface: '#111216',
        'surface-raised': '#1A1A20',
        border: '#2A2A33',
        text: '#E6F7EE',
        'text-muted': '#8A8A99',
        'text-subtle': '#55555F',
        muted: '#7a8b82',
        accent: 'var(--accent-color)',
        'accent-dim': 'var(--accent-dim)',
        success: '#00FF85',
        warning: '#FFD600',
        danger: '#FF005C',
      },
      fontFamily: {
        display: ['var(--font-display)', 'ui-monospace', 'monospace'],
        body: ['var(--font-body)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        glow: '0 0 14px var(--accent-dim)',
        'glow-lg': '0 0 24px var(--accent-dim)',
        'glow-inset': 'inset 0 0 20px -8px var(--accent-dim)',
      },
      letterSpacing: {
        system: '0.2em',
      },
      animation: {
        'scan-in': 'scanIn 400ms ease-out both',
        'glow-pulse': 'glowPulse 2.4s ease-in-out infinite',
        'flicker': 'flicker 4s linear infinite',
      },
      keyframes: {
        scanIn: {
          '0%': { opacity: '0', transform: 'translateY(8px)', clipPath: 'inset(0 0 100% 0)' },
          '60%': { opacity: '1' },
          '100%': { opacity: '1', transform: 'translateY(0)', clipPath: 'inset(0 0 0 0)' },
        },
        glowPulse: {
          '0%, 100%': { opacity: '0.75' },
          '50%': { opacity: '1' },
        },
        flicker: {
          '0%, 97%, 100%': { opacity: '1' },
          '98%': { opacity: '0.72' },
          '99%': { opacity: '0.95' },
        },
      },
    },
  },
  plugins: [],
};
export default config;
