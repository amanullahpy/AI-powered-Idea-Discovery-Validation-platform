'use server';

import { createSupabaseClient } from '@/supabase-clients/server';
import { getLoggedInUserId } from '@/data/user/user';
import { revalidatePath } from 'next/cache';
import type {
  ExperienceLevel,
  AvailableTime,
  BudgetBracket,
  SaveOnboardingInput,
} from './types';

export type { ExperienceLevel, AvailableTime, BudgetBracket, SaveOnboardingInput };

// 1. Fetch Taxonomy Options
export async function getTaxonomyOptions() {
  const supabase = await createSupabaseClient();

  const [categoriesRes, skillsRes, goalsRes, marketsRes] = await Promise.all([
    supabase.from('categories').select('*').eq('is_active', true).order('sort_order', { ascending: true }),
    supabase.from('skills').select('*').order('name', { ascending: true }),
    supabase.from('goals').select('*').order('created_at', { ascending: true }),
    supabase.from('markets').select('*').order('name', { ascending: true }),
  ]);

  return {
    categories: categoriesRes.data || [],
    skills: skillsRes.data || [],
    goals: goalsRes.data || [],
    markets: marketsRes.data || [],
  };
}

// 2. Fetch User Onboarding Profile & Preferences
export async function getUserOnboardingData(userId: string) {
  const supabase = await createSupabaseClient();

  const [profileRes, prefsRes, skillsRes, interestsRes, goalsRes, marketsRes] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', userId).maybeSingle(),
    supabase.from('user_preferences').select('*').eq('user_id', userId).maybeSingle(),
    supabase.from('user_skills').select('skill_id').eq('user_id', userId),
    supabase.from('user_interests').select('category_id').eq('user_id', userId),
    supabase.from('user_goals').select('goal_id').eq('user_id', userId),
    supabase.from('user_markets').select('market_id').eq('user_id', userId),
  ]);

  return {
    profile: profileRes.data,
    preferences: prefsRes.data,
    selectedSkillIds: (skillsRes.data || []).map((s) => s.skill_id),
    selectedCategoryIds: (interestsRes.data || []).map((i) => i.category_id),
    selectedGoalIds: (goalsRes.data || []).map((g) => g.goal_id),
    selectedMarketIds: (marketsRes.data || []).map((m) => m.market_id),
  };
}

// 3. Save Onboarding / Preferences Action
export async function saveOnboardingAction(input: SaveOnboardingInput) {
  const supabase = await createSupabaseClient();
  const userId = await getLoggedInUserId();

  // Ensure profile exists
  await supabase.from('profiles').upsert(
    {
      id: userId,
      onboarding_completed: input.markCompleted ? true : undefined,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'id' }
  );

  // Update or insert preferences
  const hasPrefs =
    input.experienceLevel !== undefined ||
    input.availableTime !== undefined ||
    input.budgetBracket !== undefined ||
    input.targetAudienceFocus !== undefined;

  if (hasPrefs) {
    await supabase.from('user_preferences').upsert(
      {
        user_id: userId,
        experience_level: input.experienceLevel ?? null,
        available_time: input.availableTime ?? null,
        budget_bracket: input.budgetBracket ?? null,
        target_audience_focus: input.targetAudienceFocus ?? null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' }
    );
  }

  // Sync interests (categories) if provided
  if (input.categoryIds !== undefined) {
    await supabase.from('user_interests').delete().eq('user_id', userId);
    if (input.categoryIds.length > 0) {
      const rows = input.categoryIds.map((catId) => ({
        user_id: userId,
        category_id: catId,
      }));
      await supabase.from('user_interests').insert(rows);
    }
  }

  // Sync skills if provided
  if (input.skillIds !== undefined) {
    await supabase.from('user_skills').delete().eq('user_id', userId);
    if (input.skillIds.length > 0) {
      const rows = input.skillIds.map((sId) => ({
        user_id: userId,
        skill_id: sId,
      }));
      await supabase.from('user_skills').insert(rows);
    }
  }

  // Sync goals if provided
  if (input.goalIds !== undefined) {
    await supabase.from('user_goals').delete().eq('user_id', userId);
    if (input.goalIds.length > 0) {
      const rows = input.goalIds.map((gId) => ({
        user_id: userId,
        goal_id: gId,
      }));
      await supabase.from('user_goals').insert(rows);
    }
  }

  // Sync markets if provided
  if (input.marketIds !== undefined) {
    await supabase.from('user_markets').delete().eq('user_id', userId);
    if (input.marketIds.length > 0) {
      const rows = input.marketIds.map((mId) => ({
        user_id: userId,
        market_id: mId,
      }));
      await supabase.from('user_markets').insert(rows);
    }
  }

  // Audit event
  if (input.markCompleted) {
    await supabase.from('audit_events').insert({
      user_id: userId,
      event_type: 'ONBOARDING_COMPLETED',
      entity_type: 'profile',
      entity_id: userId,
      metadata: {
        categoriesCount: input.categoryIds?.length ?? 0,
        skillsCount: input.skillIds?.length ?? 0,
      },
    });
  }

  revalidatePath('/dashboard');
  revalidatePath('/onboarding');
  revalidatePath('/settings');

  return { success: true };
}

// 4. Skip Onboarding Action
export async function skipOnboardingAction() {
  const supabase = await createSupabaseClient();
  const userId = await getLoggedInUserId();

  await supabase.from('profiles').upsert(
    {
      id: userId,
      onboarding_completed: true,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'id' }
  );

  await supabase.from('audit_events').insert({
    user_id: userId,
    event_type: 'ONBOARDING_SKIPPED',
    entity_type: 'profile',
    entity_id: userId,
    metadata: {},
  });

  revalidatePath('/dashboard');
  revalidatePath('/onboarding');
  return { success: true };
}
