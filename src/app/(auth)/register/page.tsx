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
      setError((data.error ?? 'REGISTRATION FAILED').toUpperCase());
      setLoading(false);
      return;
    }
    await signIn('credentials', { email, password, redirect: false });
    window.location.href = '/dashboard';
  }

  return (
    <div className="max-w-sm w-full animate-scan-in">
      <div className="mb-4 flex items-center gap-2 font-mono text-[10px] tracking-system uppercase text-text-muted">
        <span className="h-px flex-1 bg-accent/30" />
        <span className="text-accent">◆ NEW HUNTER REGISTRATION ◆</span>
        <span className="h-px flex-1 bg-accent/30" />
      </div>

      <NeonCard variant="hero" className="py-8 px-7">
        <div className="text-center mb-7">
          <div className="font-mono text-[10px] tracking-system text-text-muted uppercase">
            [ INITIALIZE PLAYER PROFILE ]
          </div>
          <div className="font-display font-bold tracking-[0.24em] text-accent text-glow-lg mt-2 text-2xl leading-none">
            SHADOW
            <br />
            LEVELING
          </div>
          <div className="font-mono text-[10px] tracking-system text-text-subtle mt-3">
            A PLAYER HAS BEEN SELECTED
          </div>
        </div>

        <form onSubmit={onSubmit} className="space-y-3">
          <Field
            label="EMAIL"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="hunter@system.io"
          />
          <Field
            label="PASSWORD (MIN 8)"
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
          {error && (
            <div className="text-danger font-mono text-[11px] tracking-wider border-l-2 border-danger pl-2">
              ⚠ {error}
            </div>
          )}
          <NeonButton type="submit" disabled={loading} size="lg" className="w-full mt-2">
            {loading ? 'INITIALIZING...' : '◢  CREATE ACCOUNT'}
          </NeonButton>
          <div className="text-center font-mono text-[10px] tracking-system text-text-muted pt-3">
            HAVE ACCOUNT? <Link href="/login" className="text-accent hover:text-glow ml-1">▶ LOGIN</Link>
          </div>
        </form>
      </NeonCard>
    </div>
  );
}

function Field({
  label,
  ...props
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="font-mono text-[9px] tracking-system uppercase text-text-muted block mb-1">
        {label}
      </span>
      <input
        {...props}
        className="block w-full p-3 bg-transparent border border-accent/25 text-text font-mono text-sm focus:border-accent focus:outline-none focus:shadow-glow placeholder:text-text-subtle"
      />
    </label>
  );
}
