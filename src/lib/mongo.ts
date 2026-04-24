import { MongoClient, type Db } from 'mongodb';

const uri = process.env.MONGODB_URI;
if (!uri) throw new Error('MONGODB_URI is required');

declare global {
  // eslint-disable-next-line no-var
  var _mongoClient: Promise<MongoClient> | undefined;
}

const client =
  global._mongoClient ?? (global._mongoClient = new MongoClient(uri).connect());

export async function getDb(): Promise<Db> {
  return (await client).db('shadow-leveling');
}

export async function ensureIndexes(): Promise<void> {
  const db = await getDb();
  await db.collection('users').createIndex({ email: 1 }, { unique: true });
  await db.collection('progress').createIndex({ userId: 1, skillId: 1 }, { unique: true });
  await db.collection('runs').createIndex({ userId: 1, skillId: 1, finishedAt: -1 });
}
