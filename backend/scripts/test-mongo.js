import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { resolveMongoUri } from '../src/utils/mongoUri.js';

dotenv.config();

const uri = process.env.MONGO_URI_DIRECT || process.env.MONGO_URI;
if (!uri) {
  console.error('MONGO_URI is not set in .env');
  process.exit(1);
}

const run = async () => {
  let connectUri = uri;
  if (uri.startsWith('mongodb+srv://') && !process.env.MONGO_URI_DIRECT) {
    try {
      connectUri = await resolveMongoUri(uri);
      console.log('Resolved mongodb+srv to standard connection string');
    } catch (err) {
      console.error(`SRV resolve failed: ${err.message}`);
      process.exit(1);
    }
  }

  await mongoose.connect(connectUri, {
    serverSelectionTimeoutMS: 15000,
    family: 4,
  });

  const { host, name, readyState } = mongoose.connection;
  console.log(`Connected: host=${host} db=${name} readyState=${readyState}`);
  await mongoose.disconnect();
  console.log('Disconnected OK');
};

run().catch((err) => {
  console.error('Connection failed:', err.message);
  process.exit(1);
});
