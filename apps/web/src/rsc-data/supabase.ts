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

// Boolean check for authentication (safe - never throws)
export const getCachedIsUserLoggedIn = cache(async () => {
  const claims = await getCachedLoggedInUserClaims();
  if (claims?.sub) return true;
  const user = await getCachedLoggedInSupabaseUser();
  return !!user?.id;
});

// User ID getter (safe - returns string or null)
export const getCachedLoggedInUserId = cache(async () => {
  const claims = await getCachedLoggedInUserClaims();
  if (claims?.sub) return claims.sub;
  const user = await getCachedLoggedInSupabaseUser();
  return user?.id || null;
});
