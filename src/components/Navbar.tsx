'use client';
import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import { Icon } from '@/components/ui/Icon';

export function Navbar() {
  const { data: session } = useSession();
  return (
    <nav className="relative border-b border-accent/20 px-6 py-3 flex justify-between items-center backdrop-blur-sm bg-[#0a0a0a]/70">
      <Link
        href="/dashboard"
        className="flex items-center gap-3 group"
      >
        <Icon name="winged-dagger" size={22} className="drop-glow transition-transform group-hover:scale-110" />
        <div className="leading-none">
          <div className="font-mono text-[9px] tracking-system uppercase text-text-muted">[ THE SYSTEM ]</div>
          <div className="font-display text-accent text-glow tracking-system uppercase text-sm font-bold mt-0.5">
            SHADOW LEVELING
          </div>
        </div>
      </Link>

      <div className="flex items-center gap-5 font-mono text-[10px] tracking-system uppercase">
        {session?.user?.email && (
          <span className="hidden sm:inline-flex items-center gap-2 text-text-muted">
            <span className="text-accent animate-pulse">◆</span>
            {session.user.email.split('@')[0]}
          </span>
        )}
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="text-text-muted hover:text-danger transition-colors border border-transparent hover:border-danger/40 px-2 py-1"
        >
          ⎋&nbsp;LOGOUT
        </button>
      </div>
    </nav>
  );
}
