'use client';
import { useState } from 'react';
import Link from 'next/link';
import { NeonCard } from '@/components/ui/NeonCard';
import { NeonButton } from '@/components/ui/NeonButton';
import { signIn } from 'next-auth/react';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!data.ok) {
      setError(data.error ?? 'Registration failed');
      setLoading(false);
      return;
    }
    await signIn('credentials', { email, password, redirect: false });
    window.location.href = '/dashboard';
  }

  return (
    <NeonCard className="max-w-sm w-full">
      <div className="text-center mb-5">
        <div className="text-[10px] tracking-widest text-muted uppercase">[ NEW HUNTER REGISTRATION ]</div>
        <div className="text-2xl tracking-[0.25em] text-accent text-glow mt-1">SHADOW LEVELING</div>
      </div>
      <form onSubmit={onSubmit} className="space-y-3">
        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="EMAIL"
          className="block w-full p-3 bg-transparent border border-[color:var(--accent-color)]/25 text-text focus:border-accent focus:outline-none focus:shadow-glow" />
        <input type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="PASSWORD (≥8)"
          className="block w-full p-3 bg-transparent border border-[color:var(--accent-color)]/25 text-text focus:border-accent focus:outline-none focus:shadow-glow" />
        {error && <div className="text-danger text-xs tracking-wider">{error}</div>}
        <NeonButton type="submit" disabled={loading} size="lg" className="w-full">
          {loading ? 'LOADING...' : '◢ CREATE ACCOUNT'}
        </NeonButton>
        <div className="text-center text-[11px] tracking-widest text-muted pt-2">
          HAVE ACCOUNT? <Link href="/login" className="text-accent">LOGIN</Link>
        </div>
      </form>
    </NeonCard>
  );
}
