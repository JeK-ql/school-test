import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { MongoClient, ObjectId } from 'mongodb';

let mongod: MongoMemoryServer;
let client: MongoClient;
const USER_ID = new ObjectId();

process.env.AUTH_SECRET = 'test-secret-at-least-32-chars-long-for-next-auth';

vi.mock('@/lib/auth', async () => ({
  auth: async () => ({ user: { id: USER_ID.toString(), email: 't@t.t' } }),
}));

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  process.env.MONGODB_URI = mongod.getUri();
  client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
});

afterAll(async () => {
  await client.close();
  await mongod.stop();
});

beforeEach(async () => {
  const db = client.db('shadow-leveling');
  await db.collection('runs').deleteMany({});
  await db.collection('progress').deleteMany({});
});

function makeBody(overrides: Partial<{ skillId: string; answers: Array<{ questionId: string; result: string }> }> = {}) {
  return {
    skillId: 'js-basics',
    difficulty: 'normal',
    startedAt: new Date(Date.now() - 60_000).toISOString(),
    finishedAt: new Date().toISOString(),
    answers: [
      { questionId: 'q1', result: 'correct' },
      { questionId: 'q2', result: 'correct' },
      { questionId: 'q3', result: 'wrong' },
    ],
    ...overrides,
  };
}

describe('POST /api/runs', () => {
  it('calculates xpDelta and creates progress row', async () => {
    const { POST } = await import('@/app/api/runs/route');
    const res = await POST(
      new Request('http://x/api/runs', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(makeBody()),
      }),
    );
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.ok).toBe(true);
    expect(data.run.stats.xpDelta).toBe(1);
    expect(data.run.stats.accuracy).toBeCloseTo(2 / 3);
    expect(data.newLevel).toBe(1);
    expect(data.leveledUp).toBe(false);
    const db = client.db('shadow-leveling');
    const progress = await db.collection('progress').findOne({ userId: USER_ID, skillId: 'js-basics' });
    expect(progress?.totalXP).toBe(1);
  });

  it('detects level up', async () => {
    const db = client.db('shadow-leveling');
    await db.collection('progress').insertOne({
      userId: USER_ID,
      skillId: 'js-basics',
      totalXP: 9,
      level: 1,
      bestStreak: 0,
      lastRunAccuracy: 0,
      lastRunAt: null,
      updatedAt: new Date(),
    });
    const { POST } = await import('@/app/api/runs/route');
    const body = makeBody({
      answers: [
        { questionId: 'q1', result: 'correct' },
        { questionId: 'q2', result: 'correct' },
      ],
    });
    const res = await POST(
      new Request('http://x/api/runs', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
      }),
    );
    const data = await res.json();
    expect(data.leveledUp).toBe(true);
    expect(data.previousLevel).toBe(1);
    expect(data.newLevel).toBe(2);
  });

  it('clamps totalXP at 0 when losing more than earned', async () => {
    const { POST } = await import('@/app/api/runs/route');
    const body = makeBody({
      answers: [
        { questionId: 'q1', result: 'wrong' },
        { questionId: 'q2', result: 'wrong' },
      ],
    });
    const res = await POST(
      new Request('http://x/api/runs', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
      }),
    );
    const data = await res.json();
    expect(data.newLevel).toBe(1);
    const db = client.db('shadow-leveling');
    const progress = await db.collection('progress').findOne({ userId: USER_ID, skillId: 'js-basics' });
    expect(progress?.totalXP).toBe(0);
  });
});
