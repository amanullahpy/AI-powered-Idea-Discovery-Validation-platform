'use server';

import { createSupabaseClient } from '@/supabase-clients/server';
import { getLoggedInUserId } from '@/data/user/user';
import { revalidatePath } from 'next/cache';
import type { UpdateProfileInput } from './types';

export type { UpdateProfileInput };

export async function getUserProfile(userId: string) {
  const supabase = await createSupabaseClient();
  const { data } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
  return data;
}

export async function updateProfileAction(input: UpdateProfileInput) {
  const supabase = await createSupabaseClient();
  const userId = await getLoggedInUserId();

  const updates: Record<string, any> = {
    display_name: input.displayName,
    updated_at: new Date().toISOString(),
  };

  if (input.username !== undefined) updates.username = input.username;
  if (input.bio !== undefined) updates.bio = input.bio;
  if (input.avatarUrl !== undefined) updates.avatar_url = input.avatarUrl;

  const { data, error } = await supabase
    .from('profiles')
    .update(updates as any)
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/settings');
  revalidatePath('/profile');
  return data;
}
