import { Navbar } from '@/components/Navbar';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-10">{children}</main>
      <footer className="border-t border-accent/15 px-6 py-3 font-mono text-[9px] tracking-system text-text-subtle uppercase flex justify-between">
        <span>SHADOW LEVELING // THE SYSTEM v0.1</span>
        <span>{new Date().getFullYear()} · ARISE</span>
      </footer>
    </div>
  );
}
