import mongoose from 'mongoose';

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var _mongooseCache: MongooseCache | undefined;
}

const cache: MongooseCache = global._mongooseCache ?? { conn: null, promise: null };
global._mongooseCache = cache;

const DEFAULT_MONGODB_URI =
  'mongodb+srv://okikevictorodinaka_db_user:mSdt1ixJnKBKuM1U@r8wc1hb.mongodb.net/DigitalSignature?authSource=admin&retryWrites=true&w=majority&appName=DigitalSignature';

export function getMongoUri(): string {
  let uri = process.env.MONGODB_URI?.trim() || DEFAULT_MONGODB_URI;
  if (uri.startsWith('mongodb') && !uri.includes('authSource=')) {
    const sep = uri.includes('?') ? '&' : '?';
    uri = `${uri}${sep}authSource=admin`;
  }
  return uri;
}

export async function connectDb(): Promise<typeof mongoose> {
  if (cache.conn && mongoose.connection.readyState === 1) {
    return cache.conn;
  }

  const uri = getMongoUri();

  if (!cache.promise) {
    cache.promise = mongoose.connect(uri, {
      serverSelectionTimeoutMS: 8000,
      bufferCommands: false,
    });
  }

  try {
    cache.conn = await cache.promise;
    return cache.conn;
  } catch (err) {
    cache.promise = null;
    throw err;
  }
}
