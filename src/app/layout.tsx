import './globals.css';
import type { Metadata } from 'next';
import type { CSSProperties } from 'react';
import { Orbitron, Inter, JetBrains_Mono } from 'next/font/google';
import { SessionClientProvider } from '@/components/SessionClientProvider';
import { getThemeForDay } from '@/lib/theme';

const orbitron = Orbitron({
  subsets: ['latin'],
  weight: ['500', '600', '700', '900'],
  variable: '--font-display',
  display: 'swap',
});
const inter = Inter({
  subsets: ['latin', 'cyrillic'],
  weight: ['400', '500', '600'],
  variable: '--font-body',
  display: 'swap',
});
const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Shadow Leveling',
  description: 'Train your skills. Level up.',
};

export const dynamic = 'force-dynamic';

function hexToRgba(hex: string, alpha: number) {
  const m = hex.replace('#', '').match(/.{2}/g);
  if (!m) return hex;
  const [r, g, b] = m.map((h) => parseInt(h, 16));
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const theme = getThemeForDay(new Date().getDay());
  const accent = theme.accent;

  const htmlStyle = {
    '--accent-color': accent,
    '--accent-dim': hexToRgba(accent, 0.55),
  } as CSSProperties;

  const photoStyle: CSSProperties = {
    backgroundImage: `url(${theme.bg})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
  };

  const vignetteStyle: CSSProperties = {
    backgroundImage: [
      `radial-gradient(120% 90% at 50% 45%, transparent 0%, transparent 38%, rgba(10,10,10,0.55) 78%, rgba(10,10,10,0.92) 100%)`,
      `linear-gradient(180deg, rgba(10,10,10,0.10) 0%, rgba(10,10,10,0.32) 100%)`,
    ].join(', '),
  };

  const accentTintStyle: CSSProperties = {
    backgroundImage: [
      `radial-gradient(55% 40% at 12% -10%, ${hexToRgba(accent, 0.85)} 0%, transparent 65%)`,
      `radial-gradient(45% 35% at 95% 110%, ${hexToRgba(accent, 0.7)} 0%, transparent 65%)`,
    ].join(', '),
    mixBlendMode: 'screen',
  };

  return (
    <html
      lang="uk"
      data-day-theme={theme.label.toLowerCase()}
      className={`${orbitron.variable} ${inter.variable} ${jetbrains.variable}`}
      style={htmlStyle}
    >
      <body className="font-body antialiased">
        <div
          className="pointer-events-none fixed inset-0 z-[-3]"
          style={photoStyle}
          aria-hidden
        />
        <div
          className="pointer-events-none fixed inset-0 z-[-2]"
          style={vignetteStyle}
          aria-hidden
        />
        <div
          className="pointer-events-none fixed inset-0 z-[-1]"
          style={accentTintStyle}
          aria-hidden
        />
        <div className="scanlines pointer-events-none fixed inset-0 z-[100]" aria-hidden />
        <div className="grain pointer-events-none fixed inset-0 z-[99]" aria-hidden />
        <SessionClientProvider>{children}</SessionClientProvider>
      </body>
    </html>
  );
}
