import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { MongoClient } from 'mongodb';

let mongod: MongoMemoryServer;
let client: MongoClient;

process.env.AUTH_SECRET = 'test-secret-at-least-32-chars-for-next-auth';

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
  await client.db('shadow-leveling').collection('users').deleteMany({});
});

describe('POST /api/auth/register', () => {
  it('rejects missing email', async () => {
    const { POST } = await import('@/app/api/auth/register/route');
    const res = await POST(new Request('http://x/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ password: 'longenough' }),
    }));
    expect(res.status).toBe(400);
  });

  it('rejects short password', async () => {
    const { POST } = await import('@/app/api/auth/register/route');
    const res = await POST(new Request('http://x/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email: 'a@b.com', password: '123' }),
    }));
    expect(res.status).toBe(400);
  });

  it('creates user and rejects duplicate', async () => {
    const { POST } = await import('@/app/api/auth/register/route');
    const res1 = await POST(new Request('http://x/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email: 'a@b.com', password: 'longenough' }),
    }));
    expect(res1.status).toBe(200);
    const res2 = await POST(new Request('http://x/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email: 'a@b.com', password: 'longenough' }),
    }));
    expect(res2.status).toBe(409);
  });
});
