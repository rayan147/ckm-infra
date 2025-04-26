import { z } from 'zod';

export const envSchema = z.object({
  // AWS Configuration
  AWS_ACCOUNT: z.string().regex(/^\d{12}$/, 'AWS account must be a 12-digit number'),
  AWS_REGION: z.string().min(1, 'AWS region is required'),

  // Project Configuration
  PROJECT_NAME: z.string().min(1, 'Project name is required'),

  // Email Configuration
  FROM_EMAIL_ADDRESS: z.string().email('Invalid from email address'),
  REPLY_TO_EMAIL_ADDRESS: z.string().email('Invalid reply-to email address'),

  // Monitoring Configuration
  BOUNCE_RATE_THRESHOLD: z.coerce.number().min(0).max(100).default(5),
  COMPLAINT_RATE_THRESHOLD: z.coerce.number().min(0).max(100).default(0.1),
  ALERT_EMAIL_ADDRESSES: z.string()
    .transform(s => s.split(','))
    .pipe(z.array(z.string().email()).min(1)),
  ENVIRONMENT: z.string().default('dev'),
  DATABASE_URL: z.string(),
  ENCRYPTION_PASSWORD: z.string(),
  PORT: z.coerce.number(),
  JWT_SECRET_KEY: z.string(),
  PINPOINT_FROM_EMAIL: z.string().email(),
  CORS_ORIGIN: z.string()

});

export type EnvConfig = z.infer<typeof envSchema>;

