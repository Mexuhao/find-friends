import { z } from 'zod';

const envSchema = z.object({
  SUPABASE_URL: z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1)
});

let cachedEnv: z.infer<typeof envSchema> | null = null;

export function getServerEnv() {
  if (cachedEnv) return cachedEnv;
  const parsed = envSchema.safeParse({
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY
  });

  if (!parsed.success) {
    console.error('Env validation failed', parsed.error.flatten().fieldErrors);
    throw new Error('Server environment variables are misconfigured');
  }

  cachedEnv = parsed.data;
  return cachedEnv;
}

