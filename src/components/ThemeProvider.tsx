'use client';
import { useEffect } from 'react';
import { getThemeForDay } from '@/lib/theme';

function hexToRgba(hex: string, alpha: number) {
  const m = hex.replace('#', '').match(/.{2}/g);
  if (!m) return hex;
  const [r, g, b] = m.map((h) => parseInt(h, 16));
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const apply = () => {
      const theme = getThemeForDay(new Date().getDay());
      const root = document.documentElement;
      root.style.setProperty('--accent-color', theme.accent);
      root.style.setProperty('--accent-dim', hexToRgba(theme.accent, 0.55));
      document.body.style.backgroundImage =
        `linear-gradient(rgba(10,10,10,0.82), rgba(10,10,10,0.96)), url(${theme.bg})`;
      document.body.style.backgroundSize = 'cover';
      document.body.style.backgroundPosition = 'center';
      document.body.style.backgroundAttachment = 'fixed';
    };
    apply();
    const interval = setInterval(apply, 60_000 * 30);
    return () => clearInterval(interval);
  }, []);
  return <>{children}</>;
}
