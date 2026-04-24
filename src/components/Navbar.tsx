'use client';
import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import { Icon } from '@/components/ui/Icon';

export function Navbar() {
  const { data: session } = useSession();
  return (
    <nav className="border-b border-[color:var(--accent-color)]/20 p-4 flex justify-between items-center">
      <Link href="/dashboard" className="text-accent text-glow tracking-widest font-bold flex items-center gap-2">
        <Icon name="winged-dagger" size={20} />
        SHADOW LEVELING
      </Link>
      <div className="flex items-center gap-4 text-[11px] tracking-widest text-muted">
        <span>{session?.user?.email}</span>
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="text-accent hover:text-glow uppercase"
        >
          ⎋ LOGOUT
        </button>
      </div>
    </nav>
  );
}
