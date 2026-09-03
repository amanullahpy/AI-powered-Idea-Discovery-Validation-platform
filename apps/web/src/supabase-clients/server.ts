import { Database } from '@/lib/database.types';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export const createSupabaseClient = async () => {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Ignored from Server Components
          }
        },
      },
    }
  );
};

/**
 * Static client without cookies for build-time operations and static generation
 */
export const createStaticSupabaseClient = () => {
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321',
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 'dummy-key',
    {
      cookies: {
        getAll() {
          return [];
        },
        setAll() {},
      },
    }
  );
};
