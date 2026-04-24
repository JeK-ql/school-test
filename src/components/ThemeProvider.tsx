'use client';
import { useEffect } from 'react';
import { getThemeForDay } from '@/lib/theme';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const apply = () => {
      const theme = getThemeForDay(new Date().getDay());
      const root = document.documentElement;
      root.style.setProperty('--accent-color', theme.accent);
      root.style.setProperty('--accent-dim', theme.accent + '8c');
      document.body.style.backgroundImage = `url(${theme.bg})`;
      document.body.style.backgroundSize = 'cover';
      document.body.style.backgroundAttachment = 'fixed';
    };
    apply();
    const interval = setInterval(apply, 60_000 * 30);
    return () => clearInterval(interval);
  }, []);
  return <>{children}</>;
}
