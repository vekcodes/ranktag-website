/**
 * Public env, accessed in browser-safe code only.
 * Keep server-only secrets out of this file.
 */
export const env = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000',
  appName: process.env.NEXT_PUBLIC_APP_NAME ?? 'SEO Suite',
  appEnv: process.env.NEXT_PUBLIC_APP_ENV ?? 'development',
  sentryDsn: process.env.NEXT_PUBLIC_SENTRY_DSN ?? '',
} as const;

export type Env = typeof env;
