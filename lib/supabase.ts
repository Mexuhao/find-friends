import type { SupabaseClient } from '@supabase/supabase-js';
import { getServerEnv } from './env';
import type { Database } from './types';

let client: SupabaseClient<Database> | null = null;
let createClientPromise: Promise<typeof import('@supabase/supabase-js').createClient> | null = null;

async function getCreateClient() {
  if (!createClientPromise) {
    createClientPromise = import('@supabase/supabase-js').then((mod) => mod.createClient);
  }
  return createClientPromise;
}

export async function getServiceSupabase(): Promise<SupabaseClient<Database>> {
  if (client) return client;
  const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = getServerEnv();
  const createClient = await getCreateClient();

  client = createClient<Database>(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    },
    global: {
      headers: {
        'x-client-info': 'find-friends-service'
      }
    }
  }) as SupabaseClient<Database>;

  return client;
}

