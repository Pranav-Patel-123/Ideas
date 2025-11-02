const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

function loadEnv(envPath) {
  const content = fs.readFileSync(envPath, 'utf8');
  const lines = content.split(/\r?\n/);
  const env = {};
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx).trim();
    const val = trimmed.slice(idx + 1).trim();
    env[key] = val;
  }
  return env;
}

(async () => {
  try {
    const env = loadEnv(path.resolve(__dirname, '..', '.env'));
    const uri = env.MONGODB_URI;
    const dbName = env.MONGODB_DB;
    if (!uri) {
      console.error('MONGODB_URI not found in .env');
      process.exit(1);
    }
    console.log('Using URI:', uri.replace(/(?<=:\/\/).*@/, '***@'));
    console.log('Configured MONGODB_DB:', dbName);

    const opts = { bufferCommands: false };
    if (dbName) opts.dbName = dbName;

    await mongoose.connect(uri, opts);
    const connDbName = mongoose.connection.db.databaseName;
    console.log('Connected database name (from driver):', connDbName);

    const cols = await mongoose.connection.db.listCollections().toArray();
    console.log('Collections in this DB:');
    cols.forEach(c => console.log(' -', c.name));

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Error connecting:', err);
    process.exit(2);
  }
})();
