import { NextResponse } from 'next/server';
import { z } from 'zod';
import { ObjectId } from 'mongodb';
import { auth } from '@/lib/auth';
import { getDb } from '@/lib/mongo';
import { clampXP, levelFromXP, xpScoring } from '@/lib/level';

const bodySchema = z.object({
  skillId: z.string().min(1),
  difficulty: z.enum(['normal', 'hardcore']),
  startedAt: z.string().datetime(),
  finishedAt: z.string().datetime(),
  answers: z
    .array(
      z.object({
        questionId: z.string().min(1),
        result: z.enum(['correct', 'wrong', 'bonus', 'timeout']),
      }),
    )
    .min(1),
});

function calcDelta(result: 'correct' | 'wrong' | 'bonus' | 'timeout'): number {
  if (result === 'correct') return xpScoring.correct;
  if (result === 'bonus') return xpScoring.bonusNoCorrect;
  return xpScoring.wrong;
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ ok: false, error: 'Unauthorized', code: 'unauthorized' }, { status: 401 });
  }
  const body = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: parsed.error.issues[0]?.message ?? 'invalid input', code: 'invalid_input' },
      { status: 400 },
    );
  }
  const input = parsed.data;
  const userId = new ObjectId(session.user.id);

  let correct = 0,
    wrong = 0,
    bonus = 0,
    xpDelta = 0;
  for (const a of input.answers) {
    xpDelta += calcDelta(a.result);
    if (a.result === 'correct') correct++;
    else if (a.result === 'bonus') bonus++;
    else wrong++;
  }
  const total = input.answers.length;
  const accuracy = (correct + bonus) / total;

  const db = await getDb();
  const existing = await db.collection('progress').findOne({ userId, skillId: input.skillId });
  const prevXP = existing?.totalXP ?? 0;
  const prevLevel = existing ? levelFromXP(prevXP) : 1;
  const newXP = clampXP(prevXP + xpDelta);
  const newLevel = levelFromXP(newXP);
  const leveledUp = newLevel > prevLevel;

  const runDoc = {
    userId,
    skillId: input.skillId,
    difficulty: input.difficulty,
    startedAt: new Date(input.startedAt),
    finishedAt: new Date(input.finishedAt),
    stats: { correct, wrong, bonus, xpDelta, totalQuestions: total, accuracy },
    leveledUp,
  };
  const insertResult = await db.collection('runs').insertOne(runDoc);

  await db.collection('progress').updateOne(
    { userId, skillId: input.skillId },
    {
      $set: {
        totalXP: newXP,
        level: newLevel,
        lastRunAccuracy: accuracy,
        lastRunAt: new Date(),
        updatedAt: new Date(),
      },
      $setOnInsert: { bestStreak: 0 },
    },
    { upsert: true },
  );

  return NextResponse.json({
    ok: true,
    run: { _id: insertResult.insertedId.toString(), ...runDoc, userId: userId.toString() },
    previousLevel: prevLevel,
    newLevel,
    leveledUp,
  });
}
