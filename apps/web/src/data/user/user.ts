
'use server'

import { createSupabaseClient } from "@/supabase-clients/server";

export async function getLoggedInUserId(): Promise<string> {
  const supabase = await createSupabaseClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user?.id) {
    throw new Error('User not authenticated or session expired');
  }
  return data.user.id;
}
