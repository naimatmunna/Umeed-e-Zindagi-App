import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const boolStr = z.enum(['true', 'false']).transform((v) => v === 'true');

/**
 * Single source of truth for environment configuration.
 * Validated once at boot so the process fails fast on misconfiguration
 * instead of deep inside a request handler.
 */
const schema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().positive().default(5000),
  API_PREFIX: z.string().default('/api'),

  MONGO_URI: z.string().min(1, 'MONGO_URI is required'),
  /** Optional standard mongodb:// URI — bypasses SRV DNS (use if querySrv ECONNREFUSED on Windows). */
  MONGO_URI_DIRECT: z.string().optional(),

  JWT_ACCESS_SECRET: z.string().min(32, 'JWT_ACCESS_SECRET must be >= 32 chars'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET must be >= 32 chars'),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),

  /** Optional — refresh cookies are unsigned JWTs in httpOnly cookies. */
  COOKIE_SECRET: z.string().min(16).optional(),
  COOKIE_SECURE: boolStr.optional(),
  COOKIE_SAME_SITE: z.enum(['strict', 'lax', 'none']).optional(),

  CORS_ORIGINS: z.string().default('http://localhost:5173'),

  MAIL_HOST: z.string().optional(),
  MAIL_PORT: z.coerce.number().optional(),
  MAIL_USER: z.string().optional(),
  MAIL_PASS: z.string().optional(),
  MAIL_FROM: z.string().default('No Reply <noreply@example.com>'),

  REDIS_URL: z.string().optional(),
  CLOUDINARY_URL: z.string().optional(),
  ENABLE_SOCKET: boolStr.default('false'),
  ENABLE_QUEUE: boolStr.default('false'),

  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'http', 'debug']).default('info'),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(15 * 60 * 1000),
  RATE_LIMIT_MAX: z.coerce.number().default(100),
  CLIENT_URL: z.string().default('http://localhost:5173'),
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  // eslint-disable-next-line no-console
  console.error('❌ Invalid environment configuration:');
  // eslint-disable-next-line no-console
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

const onHttps =
  parsed.data.NODE_ENV === 'production' || Boolean(process.env.VERCEL);

const env = Object.freeze({
  ...parsed.data,
  COOKIE_SECURE: parsed.data.COOKIE_SECURE ?? onHttps,
  COOKIE_SAME_SITE: parsed.data.COOKIE_SAME_SITE ?? (onHttps ? 'lax' : 'strict'),
  isProd: parsed.data.NODE_ENV === 'production',
  isDev: parsed.data.NODE_ENV === 'development',
  isTest: parsed.data.NODE_ENV === 'test',
  corsOrigins: parsed.data.CORS_ORIGINS.split(',').map((s) => s.trim()),
});

export default env;
