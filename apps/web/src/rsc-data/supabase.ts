import { createSupabaseClient } from '@/supabase-clients/server';
import { cache } from 'react';

// Verified user call with Supabase Auth server
export const getCachedLoggedInVerifiedSupabaseUser = cache(async () => {
  try {
    const supabase = await createSupabaseClient();
    const { data, error } = await supabase.auth.getUser();
    if (error || !data?.user) {
      return { user: null };
    }
    return data;
  } catch {
    return { user: null };
  }
});

// Authenticated Supabase User object
export const getCachedLoggedInSupabaseUser = cache(async () => {
  try {
    const supabase = await createSupabaseClient();
    const { data, error } = await supabase.auth.getUser();
    if (error || !data?.user) {
      return null;
    }
    return data.user;
  } catch {
    return null;
  }
});

// Decoded JWT Claims
export const getCachedLoggedInUserClaims = cache(async () => {
  try {
    const supabase = await createSupabaseClient();
    const { data, error } = await supabase.auth.getClaims();
    if (error || !data?.claims) {
      return null;
    }
    return data.claims;
  } catch {
    return null;
  }
});

// Boolean check for verified authentication (contacts auth server or verified session)
export const getCachedIsUserLoggedIn = cache(async () => {
  const user = await getCachedLoggedInSupabaseUser();
  return !!user?.id;
});

// Verified User ID getter (guaranteed valid active user session)
export const getCachedLoggedInUserId = cache(async () => {
  const user = await getCachedLoggedInSupabaseUser();
  return user?.id || null;
});
