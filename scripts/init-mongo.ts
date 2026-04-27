import { ensureIndexes } from '../src/lib/mongo';

ensureIndexes()
  .then(() => {
    console.log('Indexes ensured.');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Failed:', err);
    process.exit(1);
  });
