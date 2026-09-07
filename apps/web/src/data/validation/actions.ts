'use server';

import { authActionClient } from '@/lib/safe-action';
import { createSupabaseClient } from '@/supabase-clients/server';
import { checkRateLimit } from '@/lib/ai/rate-limiter';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

export interface IdeaInterviewRecord {
  id: string;
  idea_id: string;
  user_id: string;
  name: string;
  role: string | null;
  company_or_channel: string | null;
  pain_score: number;
  willingness_to_pay: string | null;
  key_quote: string;
  verdict: 'Validated' | 'Neutral' | 'Invalidated';
  created_at: string;
  updated_at: string;
}

export interface IdeaExperimentRecord {
  id: string;
  idea_id: string;
  user_id: string;
  title: string;
  experiment_type: string;
  target_metric: string;
  current_result: string | null;
  status: 'Pending' | 'In Progress' | 'Completed' | 'Cancelled';
  created_at: string;
  updated_at: string;
}

export async function getIdeaInterviews(ideaId: string): Promise<IdeaInterviewRecord[]> {
  if (!ideaId) return [];
  const supabase = await createSupabaseClient();
  const { data, error } = await supabase
    .from('idea_interviews')
    .select('*')
    .eq('idea_id', ideaId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching idea interviews:', error);
    return [];
  }
  return (data as any) || [];
}

export async function getIdeaExperiments(ideaId: string): Promise<IdeaExperimentRecord[]> {
  if (!ideaId) return [];
  const supabase = await createSupabaseClient();
  const { data, error } = await supabase
    .from('idea_experiments')
    .select('*')
    .eq('idea_id', ideaId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching idea experiments:', error);
    return [];
  }
  return (data as any) || [];
}

export const createIdeaInterviewAction = authActionClient
  .schema(
    z.object({
      ideaId: z.string().uuid(),
      name: z.string().min(1).max(100),
      role: z.string().max(100).optional(),
      companyOrChannel: z.string().max(100).optional(),
      painScore: z.number().int().min(1).max(10),
      willingnessToPay: z.string().max(100).optional(),
      keyQuote: z.string().min(1).max(2000),
      verdict: z.enum(['Validated', 'Neutral', 'Invalidated']),
    })
  )
  .action(async ({ parsedInput, ctx }) => {
    const supabase = await createSupabaseClient();
    const userId = ctx.userId;

    const rateLimit = checkRateLimit(`rate_limit:interview:${userId}`, {
      maxRequests: 30,
      windowMs: 60 * 1000,
    });
    if (!rateLimit.allowed) {
      throw new Error(`Rate limit exceeded. Please wait ${rateLimit.retryAfterSec || 30}s.`);
    }

    const { data, error } = await supabase
      .from('idea_interviews')
      .insert({
        idea_id: parsedInput.ideaId,
        user_id: userId,
        name: parsedInput.name,
        role: parsedInput.role || null,
        company_or_channel: parsedInput.companyOrChannel || null,
        pain_score: parsedInput.painScore,
        willingness_to_pay: parsedInput.willingnessToPay || null,
        key_quote: parsedInput.keyQuote,
        verdict: parsedInput.verdict,
      })
      .select('*')
      .single();

    if (error) {
      throw new Error(error.message);
    }

    await supabase.from('audit_events').insert({
      user_id: userId,
      event_type: 'CUSTOMER_INTERVIEW_LOGGED',
      entity_type: 'idea_interviews',
      entity_id: data.id,
      metadata: { ideaId: parsedInput.ideaId, verdict: parsedInput.verdict, name: parsedInput.name },
    });

    revalidatePath('/validation');
    return data;
  });

export const deleteIdeaInterviewAction = authActionClient
  .schema(z.object({ interviewId: z.string().uuid() }))
  .action(async ({ parsedInput, ctx }) => {
    const supabase = await createSupabaseClient();
    const userId = ctx.userId;

    const { error } = await supabase
      .from('idea_interviews')
      .delete()
      .eq('id', parsedInput.interviewId)
      .eq('user_id', userId);

    if (error) {
      throw new Error(error.message);
    }

    revalidatePath('/validation');
    return { success: true };
  });

export const createIdeaExperimentAction = authActionClient
  .schema(
    z.object({
      ideaId: z.string().uuid(),
      title: z.string().min(1).max(200),
      experimentType: z.string().min(1).max(100),
      targetMetric: z.string().min(1).max(250),
      currentResult: z.string().max(250).optional(),
      status: z.enum(['Pending', 'In Progress', 'Completed', 'Cancelled']),
    })
  )
  .action(async ({ parsedInput, ctx }) => {
    const supabase = await createSupabaseClient();
    const userId = ctx.userId;

    const { data, error } = await supabase
      .from('idea_experiments')
      .insert({
        idea_id: parsedInput.ideaId,
        user_id: userId,
        title: parsedInput.title,
        experiment_type: parsedInput.experimentType,
        target_metric: parsedInput.targetMetric,
        current_result: parsedInput.currentResult || null,
        status: parsedInput.status,
      })
      .select('*')
      .single();

    if (error) {
      throw new Error(error.message);
    }

    revalidatePath('/validation');
    return data;
  });

export const updateIdeaExperimentStatusAction = authActionClient
  .schema(
    z.object({
      experimentId: z.string().uuid(),
      status: z.enum(['Pending', 'In Progress', 'Completed', 'Cancelled']),
      currentResult: z.string().max(250).optional(),
    })
  )
  .action(async ({ parsedInput, ctx }) => {
    const supabase = await createSupabaseClient();
    const userId = ctx.userId;

    const { error } = await supabase
      .from('idea_experiments')
      .update({
        status: parsedInput.status,
        ...(parsedInput.currentResult !== undefined ? { current_result: parsedInput.currentResult } : {}),
        updated_at: new Date().toISOString(),
      })
      .eq('id', parsedInput.experimentId)
      .eq('user_id', userId);

    if (error) {
      throw new Error(error.message);
    }

    revalidatePath('/validation');
    return { success: true };
  });
