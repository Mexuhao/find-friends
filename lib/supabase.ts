import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { getServerEnv } from './env';
import { Database } from './types';

let client: SupabaseClient<Database> | null = null;

export function getServiceSupabase() {
  if (client) return client;
  const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = getServerEnv();

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
  });

  return client;
}

