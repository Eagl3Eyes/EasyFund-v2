import { MongoClient, type Db, type Collection } from 'mongodb';
import { env } from './env';
import logger from '../utils/logger';

let client: MongoClient | null = null;
let db: Db | null = null;

export async function connectToDatabase(): Promise<Db> {
  if (db) return db;

  client = new MongoClient(env.MONGODB_URI, {
    serverApi: {
      version: '1' as any,
      strict: true,
      deprecationErrors: true,
    },
  });

  await client.connect();
  db = client.db(env.MONGODB_DB_NAME);

  logger.info(`Connected to MongoDB: ${env.MONGODB_DB_NAME}`);
  return db;
}

export function getDb(): Db {
  if (!db) {
    throw new Error('Database not connected. Call connectToDatabase() first.');
  }
  return db;
}

export async function closeDatabase(): Promise<void> {
  if (client) {
    await client.close();
    client = null;
    db = null;
    logger.info('MongoDB connection closed');
  }
}

// Collection accessors
export function users(): Collection {
  return getDb().collection('users');
}

export function campaigns(): Collection {
  return getDb().collection('campaigns');
}

export function categories(): Collection {
  return getDb().collection('categories');
}

export function donations(): Collection {
  return getDb().collection('donations');
}

export function withdrawals(): Collection {
  return getDb().collection('withdrawals');
}

export function campaignUpdates(): Collection {
  return getDb().collection('campaign_updates');
}

export function comments(): Collection {
  return getDb().collection('comments');
}

export function notifications(): Collection {
  return getDb().collection('notifications');
}

export function reports(): Collection {
  return getDb().collection('reports');
}

export function verificationRequests(): Collection {
  return getDb().collection('verification_requests');
}

export function savedCampaigns(): Collection {
  return getDb().collection('saved_campaigns');
}

export function follows(): Collection {
  return getDb().collection('follows');
}

export function auditLogs(): Collection {
  return getDb().collection('audit_logs');
}

export function paymentWebhooks(): Collection {
  return getDb().collection('payment_webhooks');
}
