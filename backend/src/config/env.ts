import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

function required(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 5000),

  db: {
    host: process.env.DB_HOST ?? '127.0.0.1',
    port: Number(process.env.DB_PORT ?? 3307),
    user: process.env.DB_USER ?? 'root',
    password: process.env.DB_PASSWORD ?? '',
    database: process.env.DB_NAME ?? 'crunchx',
  },

  jwt: {
    secret: process.env.JWT_SECRET || 'crunchx-secret-key-production-change-in-env',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'crunchx-refresh-secret-key-production',
    expiresIn: process.env.JWT_EXPIRES_IN ?? '30m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '7d',
  },

  appUrl: process.env.APP_URL ?? 'http://localhost:5173',
  apiUrl: process.env.API_URL ?? 'http://localhost:5000/api/v1',
  corsOrigins: (process.env.CORS_ORIGIN ?? 'http://localhost:5173').split(',').map((s) => s.trim()),

  paymentProvider: process.env.PAYMENT_PROVIDER ?? 'mock',
  shippingProvider: process.env.SHIPPING_PROVIDER ?? 'mock',
} as const;