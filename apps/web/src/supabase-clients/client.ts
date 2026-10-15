'use client';

import { createBrowserClient } from '@supabase/ssr';
import { clientEnv } from '@/config/env';

export function createClient(): ReturnType<typeof createBrowserClient> {
  return createBrowserClient(
    clientEnv.NEXT_PUBLIC_SUPABASE_URL,
    clientEnv.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  );
}
