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
    if (res?.error) setError('INVALID CREDENTIALS');
    else window.location.href = '/dashboard';
  }

  return (
    <div className="max-w-sm w-full animate-scan-in">
      <div className="mb-4 flex items-center gap-2 font-mono text-[10px] tracking-system uppercase text-text-muted">
        <span className="h-px flex-1 bg-accent/30" />
        <span className="text-accent">◆ SYSTEM ACCESS ◆</span>
        <span className="h-px flex-1 bg-accent/30" />
      </div>

      <NeonCard variant="hero" className="py-8 px-7">
        <div className="text-center mb-7">
          <div className="font-mono text-[10px] tracking-system text-text-muted uppercase">
            [ THE SYSTEM HAS ACKNOWLEDGED YOU ]
          </div>
          <div className="font-display font-bold tracking-[0.24em] text-accent text-glow-lg mt-2 text-2xl leading-none">
            SHADOW
            <br />
            LEVELING
          </div>
          <div className="font-mono text-[10px] tracking-system text-text-subtle mt-3 caret">
            AUTHORIZE TO CONTINUE
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
            label="PASSWORD"
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
            {loading ? 'AUTHORIZING...' : '▶  ENTER THE SYSTEM'}
          </NeonButton>
          <div className="text-center font-mono text-[10px] tracking-system text-text-muted pt-3">
            NO ACCOUNT? <Link href="/register" className="text-accent hover:text-glow ml-1">◢ REGISTER</Link>
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
