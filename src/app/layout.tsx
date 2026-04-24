import './globals.css';
import type { Metadata } from 'next';
import { Orbitron, Inter, JetBrains_Mono } from 'next/font/google';
import { ThemeProvider } from '@/components/ThemeProvider';
import { SessionClientProvider } from '@/components/SessionClientProvider';

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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="uk"
      className={`${orbitron.variable} ${inter.variable} ${jetbrains.variable}`}
    >
      <body className="font-body antialiased">
        <div className="scanlines pointer-events-none fixed inset-0 z-[100]" aria-hidden />
        <div className="grain pointer-events-none fixed inset-0 z-[99]" aria-hidden />
        <SessionClientProvider>
          <ThemeProvider>{children}</ThemeProvider>
        </SessionClientProvider>
      </body>
    </html>
  );
}
