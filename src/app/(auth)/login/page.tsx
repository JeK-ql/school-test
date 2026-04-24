'use client';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { NeonCard } from '@/components/ui/NeonCard';
import { NeonButton } from '@/components/ui/NeonButton';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await signIn('credentials', { email, password, redirect: false });
    setLoading(false);
    if (res?.error) setError('Невірний email або пароль');
    else window.location.href = '/dashboard';
  }

  return (
    <NeonCard className="max-w-sm w-full">
      <div className="text-center mb-5">
        <div className="text-[10px] tracking-widest text-muted uppercase">[ SYSTEM ACCESS ]</div>
        <div className="text-2xl tracking-[0.25em] text-accent text-glow mt-1">SHADOW LEVELING</div>
        <div className="text-[11px] tracking-widest text-muted mt-1">AUTHORIZE TO CONTINUE</div>
      </div>
      <form onSubmit={onSubmit} className="space-y-3">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="EMAIL"
          className="block w-full p-3 bg-transparent border border-[color:var(--accent-color)]/25 text-text focus:border-accent focus:outline-none focus:shadow-glow"
        />
        <input
          type="password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="PASSWORD"
          className="block w-full p-3 bg-transparent border border-[color:var(--accent-color)]/25 text-text focus:border-accent focus:outline-none focus:shadow-glow"
        />
        {error && <div className="text-danger text-xs tracking-wider">{error}</div>}
        <NeonButton type="submit" disabled={loading} size="lg" className="w-full">
          {loading ? 'LOADING...' : '▶ ENTER THE SYSTEM'}
        </NeonButton>
        <div className="text-center text-[11px] tracking-widest text-muted pt-2">
          NO ACCOUNT? <Link href="/register" className="text-accent">REGISTER</Link>
        </div>
      </form>
    </NeonCard>
  );
}
