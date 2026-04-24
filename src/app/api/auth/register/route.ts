import { NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { getDb, ensureIndexes } from '@/lib/mongo';

const bodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: parsed.error.issues[0]?.message ?? 'invalid input', code: 'invalid_input' },
      { status: 400 },
    );
  }
  const { email, password } = parsed.data;
  const normalizedEmail = email.toLowerCase().trim();
  await ensureIndexes();
  const db = await getDb();
  const existing = await db.collection('users').findOne({ email: normalizedEmail });
  if (existing) {
    return NextResponse.json({ ok: false, error: 'Email already registered', code: 'email_taken' }, { status: 409 });
  }
  const passwordHash = await bcrypt.hash(password, 12);
  const result = await db.collection('users').insertOne({
    email: normalizedEmail,
    passwordHash,
    createdAt: new Date(),
  });
  return NextResponse.json({ ok: true, userId: result.insertedId.toString() });
}
