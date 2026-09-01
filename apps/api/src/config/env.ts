import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';

dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(5000),
  MONGODB_URI: z.string().min(1, 'MONGODB_URI is required'),
  MONGODB_DB_NAME: z.string().default('EasyFundDB'),
  ACCESS_TOKEN_SECRET: z.string().min(10, 'ACCESS_TOKEN_SECRET is required'),
  ACCESS_TOKEN_EXPIRY: z.string().default('15m'),
  REFRESH_TOKEN_SECRET: z.string().min(10, 'REFRESH_TOKEN_SECRET is required'),
  REFRESH_TOKEN_EXPIRY: z.string().default('7d'),
  STRIPE_SECRET_KEY: z.string().min(1, 'STRIPE_SECRET_KEY is required'),
  STRIPE_WEBHOOK_SECRET: z.string().min(1, 'STRIPE_WEBHOOK_SECRET is required'),
  FIREBASE_PROJECT_ID: z.string().optional(),
  FIREBASE_CLIENT_EMAIL: z.string().optional(),
  FIREBASE_PRIVATE_KEY: z.string().optional(),
  EMAIL_PRIVATE_KEY: z.string().optional(),
  EMAIL_DOMAIN: z.string().optional(),
  FRONTEND_URL: z.string().url().default('http://localhost:3000'),
  ADMIN_EMAILS: z.string().optional(),
  NEXT_PUBLIC_API_URL: z.string().optional(),
  NEXT_PUBLIC_SITE_URL: z.string().optional(),
  NEXT_PUBLIC_SEED_ADMIN_EMAIL: z.string().optional(),
  NEXT_PUBLIC_STRIPE_PK: z.string().optional(),
  NEXT_PUBLIC_FIREBASE_API_KEY: z.string().optional(),
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: z.string().optional(),
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: z.string().optional(),
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: z.string().optional(),
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: z.string().optional(),
  NEXT_PUBLIC_FIREBASE_APP_ID: z.string().optional(),
});

function validateEnv() {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    console.error('Invalid environment variables:', parsed.error.flatten().fieldErrors);
    // In development, warn but don't crash
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
    // Return defaults for development
    return {
      NODE_ENV: 'development' as const,
      PORT: 5000,
      MONGODB_URI: 'mongodb://localhost:27017',
      MONGODB_DB_NAME: 'EasyFundDB',
      ACCESS_TOKEN_SECRET: 'dev-access-secret-change-me',
      ACCESS_TOKEN_EXPIRY: '15m',
      REFRESH_TOKEN_SECRET: 'dev-refresh-secret-change-me',
      REFRESH_TOKEN_EXPIRY: '7d',
      STRIPE_SECRET_KEY: 'sk_test_placeholder',
      STRIPE_WEBHOOK_SECRET: 'whsec_placeholder',
      FRONTEND_URL: 'http://localhost:3000',
    };
  }

  return parsed.data;
}

export const env = validateEnv();
