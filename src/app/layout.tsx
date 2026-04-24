import './globals.css';
import type { Metadata } from 'next';
import { ThemeProvider } from '@/components/ThemeProvider';
import { SessionClientProvider } from '@/components/SessionClientProvider';

export const metadata: Metadata = {
  title: 'Shadow Leveling',
  description: 'Train your skills. Level up.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uk">
      <body>
        <SessionClientProvider>
          <ThemeProvider>{children}</ThemeProvider>
        </SessionClientProvider>
      </body>
    </html>
  );
}
