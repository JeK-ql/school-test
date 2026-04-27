import { MongoClient } from 'mongodb';

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI is missing in .env');
    process.exit(1);
  }
  const masked = uri.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@');
  console.log('URI:', masked);

  const client = new MongoClient(uri, { serverSelectionTimeoutMS: 5000 });
  try {
    await client.connect();
    const admin = client.db().admin();
    const info = await admin.ping();
    console.log('OK ping:', info);
    const dbs = await admin.listDatabases();
    console.log('Databases:', dbs.databases.map((d) => d.name).join(', '));
  } catch (err) {
    console.error('FAIL:', (err as Error).message);
    process.exitCode = 1;
  } finally {
    await client.close();
  }
}

main();
