'use server';

import { authActionClient } from '@/lib/safe-action';
import { createSupabaseClient } from '@/supabase-clients/server';
import { checkRateLimit } from '@/lib/ai/rate-limiter';
import {
  generateChatResponse,
  structuredIdeaSchema,
  type UserPersonalizationContext,
} from '@/lib/ai/provider';
import { getUserOnboardingData } from '@/data/user/onboarding';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const sendMessageSchema = z.object({
  conversationId: z.string().uuid().optional(),
  message: z.string().min(1, 'Message cannot be empty').max(2000),
  history: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant', 'system']),
        content: z.string(),
      })
    )
    .default([]),
  provider: z.enum(['groq', 'openrouter', 'gemini', 'auto', 'local']).optional(),
  modelId: z.string().optional(),
  customApiKey: z.string().max(256).optional(),
  personaArchetype: z.enum(['bootstrapper', 'student', 'side_hustle', 'scaler']).optional(),
});

export const sendMessageAndGenerateAction = authActionClient
  .schema(sendMessageSchema)
  .action(async ({ parsedInput, ctx }) => {
    const supabase = await createSupabaseClient();
    const userId = ctx.userId;

    // 1. Rate Limit check
    const rateLimit = checkRateLimit(userId, { maxRequests: 30, windowMs: 60 * 1000 });
    if (!rateLimit.allowed) {
      throw new Error(`Rate limit exceeded. Please wait ${rateLimit.retryAfterSec || 30} seconds.`);
    }

    // 2. Fetch User Personalization Context & Taxonomy Names
    const userData = await getUserOnboardingData(userId);

    // Retrieve readable names for skills, categories, goals, markets
    const [skillsRes, catsRes, goalsRes, marketsRes] = await Promise.all([
      userData.selectedSkillIds.length > 0
        ? supabase.from('skills').select('name').in('id', userData.selectedSkillIds)
        : Promise.resolve({ data: [] }),
      userData.selectedCategoryIds.length > 0
        ? supabase.from('categories').select('name').in('id', userData.selectedCategoryIds)
        : Promise.resolve({ data: [] }),
      userData.selectedGoalIds.length > 0
        ? supabase.from('goals').select('title').in('id', userData.selectedGoalIds)
        : Promise.resolve({ data: [] }),
      userData.selectedMarketIds.length > 0
        ? supabase.from('markets').select('name').in('id', userData.selectedMarketIds)
        : Promise.resolve({ data: [] }),
    ]);

    const userContext: UserPersonalizationContext = {
      experienceLevel: userData.preferences?.experience_level,
      budgetBracket: userData.preferences?.budget_bracket,
      availableTime: userData.preferences?.available_time,
      targetMarket: userData.preferences?.target_audience_focus || undefined,
      skills: (skillsRes.data || []).map((s: any) => s.name),
      interests: (catsRes.data || []).map((c: any) => c.name),
      goals: (goalsRes.data || []).map((g: any) => g.title),
      markets: (marketsRes.data || []).map((m: any) => m.name),
      personaArchetype: parsedInput.personaArchetype || 'bootstrapper',
    };

    // 3. Ensure Conversation exists
    let conversationId = parsedInput.conversationId;
    let conversationTitle: string | undefined;
    if (!conversationId) {
      conversationTitle = parsedInput.message.slice(0, 50);
      const { data: conv, error: convErr } = await supabase
        .from('ai_conversations')
        .insert({
          user_id: userId,
          title: conversationTitle,
          context_type: 'GENERATION',
        })
        .select('id, title')
        .single();

      if (convErr) throw new Error(convErr.message);
      conversationId = conv.id;
      conversationTitle = conv.title;
    } else {
      await supabase
        .from('ai_conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', conversationId);
    }

    // 4. Save User message to DB
    await supabase.from('ai_messages').insert({
      conversation_id: conversationId,
      role: 'user',
      content: parsedInput.message,
    });

    // 5. Generate AI Chat & Structured Idea with selected provider/model
    const messages = [...parsedInput.history, { role: 'user' as const, content: parsedInput.message }];
    const result = await generateChatResponse(messages, userContext, {
      provider: parsedInput.provider,
      modelId: parsedInput.modelId,
      customApiKey: parsedInput.customApiKey,
    });

    // 6. Save Assistant message to DB with telemetry
    await supabase.from('ai_messages').insert({
      conversation_id: conversationId,
      role: 'assistant',
      content: result.reply,
      input_tokens: result.inputTokens,
      output_tokens: result.outputTokens,
      latency_ms: result.latencyMs,
      metadata: {
        model: result.model,
        provider: result.provider,
        ...(result.suggestedIdea ? { suggestedIdea: result.suggestedIdea } : {}),
      } as any,
    });

    // 7. If structured idea generated, log to idea_generations
    if (result.suggestedIdea) {
      await supabase.from('idea_generations').insert({
        conversation_id: conversationId,
        user_id: userId,
        model: result.model,
        provider: result.provider,
        structured_output: result.suggestedIdea as any,
        input_tokens: result.inputTokens,
        output_tokens: result.outputTokens,
        latency_ms: result.latencyMs,
      });
    }

    return {
      conversationId,
      conversationTitle,
      reply: result.reply,
      suggestedIdea: result.suggestedIdea,
      model: result.model,
      provider: result.provider,
      latencyMs: result.latencyMs,
      inputTokens: result.inputTokens,
      outputTokens: result.outputTokens,
    };
  });

export const saveAIGeneratedIdeaAction = authActionClient
  .schema(
    z.object({
      idea: structuredIdeaSchema,
      conversationId: z.string().uuid().optional(),
    })
  )
  .action(async ({ parsedInput, ctx }) => {
    const supabase = await createSupabaseClient();
    const userId = ctx.userId;
    const { idea, conversationId } = parsedInput;

    const rateLimit = checkRateLimit(`rate_limit:save_ai_idea:${userId}`, {
      maxRequests: 20,
      windowMs: 60 * 1000,
    });
    if (!rateLimit.allowed) {
      throw new Error(`Rate limit exceeded for saving AI ideas. Please wait ${rateLimit.retryAfterSec || 30}s.`);
    }

    // Find category ID matching categorySlug if exists
    let categoryId: string | null = null;
    if (idea.categorySlug) {
      const { data: cat } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', idea.categorySlug)
        .maybeSingle();
      if (cat) categoryId = cat.id;
    }

    const slug = `${idea.title.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-')}-${Math.random().toString(36).substring(2, 7)}`;

    const { data: newIdea, error } = await supabase
      .from('ideas')
      .insert({
        owner_id: userId,
        title: idea.title,
        slug,
        short_description: idea.shortDescription,
        problem: idea.problem,
        solution: idea.solution,
        target_audience: idea.targetAudience,
        monetization: idea.monetization,
        category_id: categoryId,
        difficulty: idea.difficulty,
        estimated_cost: idea.estimatedCost,
        estimated_time: idea.estimatedTime,
        mvp_features: idea.mvpFeatures as any,
        visibility: 'PRIVATE',
        status: 'SAVED',
        ai_generated: true,
      })
      .select('id, slug')
      .single();

    if (error) {
      throw new Error(error.message);
    }

    // Link idea_generations record to this idea if conversationId provided
    if (conversationId) {
      await supabase
        .from('idea_generations')
        .update({ idea_id: newIdea.id })
        .eq('conversation_id', conversationId);
    }

    // Auto-save to bookmarks as well
    await supabase.from('saved_ideas').insert({
      user_id: userId,
      idea_id: newIdea.id,
      notes: 'Generated with AI Co-pilot',
    });

    await supabase.from('audit_events').insert({
      user_id: userId,
      event_type: 'AI_IDEA_SAVED',
      entity_type: 'idea',
      entity_id: newIdea.id,
      metadata: { title: idea.title },
    });

    revalidatePath('/ideas');
    revalidatePath('/saved');
    revalidatePath('/dashboard');

    return newIdea;
  });

// -----------------------------------------------------------------------------
// Conversation History Management
// -----------------------------------------------------------------------------

export async function getUserConversations(userId: string) {
  const supabase = await createSupabaseClient();
  const { data, error } = await supabase
    .from('ai_conversations')
    .select('id, title, context_type, created_at, updated_at')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('Error fetching user conversations:', error);
    return [];
  }
  return data || [];
}

export const getConversationMessagesAction = authActionClient
  .schema(z.object({ conversationId: z.string().uuid() }))
  .action(async ({ parsedInput, ctx }) => {
    const supabase = await createSupabaseClient();
    const userId = ctx.userId;

    const { data: conv, error: convErr } = await supabase
      .from('ai_conversations')
      .select('id, title')
      .eq('id', parsedInput.conversationId)
      .eq('user_id', userId)
      .maybeSingle();

    if (convErr || !conv) {
      throw new Error('Conversation not found or access denied.');
    }

    const { data: messages, error: msgErr } = await supabase
      .from('ai_messages')
      .select('id, role, content, metadata, created_at')
      .eq('conversation_id', parsedInput.conversationId)
      .order('created_at', { ascending: true });

    if (msgErr) {
      throw new Error(msgErr.message);
    }

    return {
      conversation: conv,
      messages: (messages || []).map((m) => ({
        id: m.id,
        role: m.role as 'user' | 'assistant',
        content: m.content,
        suggestedIdea: (m.metadata as any)?.suggestedIdea || null,
      })),
    };
  });

export const deleteConversationAction = authActionClient
  .schema(z.object({ conversationId: z.string().uuid() }))
  .action(async ({ parsedInput, ctx }) => {
    const supabase = await createSupabaseClient();
    const userId = ctx.userId;

    await supabase
      .from('ai_messages')
      .delete()
      .eq('conversation_id', parsedInput.conversationId);

    const { error } = await supabase
      .from('ai_conversations')
      .delete()
      .eq('id', parsedInput.conversationId)
      .eq('user_id', userId);

    if (error) {
      throw new Error(error.message);
    }

    revalidatePath('/ai');
    return { success: true };
  });

export const renameConversationAction = authActionClient
  .schema(
    z.object({
      conversationId: z.string().uuid(),
      title: z.string().min(1).max(100),
    })
  )
  .action(async ({ parsedInput, ctx }) => {
    const supabase = await createSupabaseClient();
    const userId = ctx.userId;

    const { error } = await supabase
      .from('ai_conversations')
      .update({
        title: parsedInput.title,
        updated_at: new Date().toISOString(),
      })
      .eq('id', parsedInput.conversationId)
      .eq('user_id', userId);

    if (error) {
      throw new Error(error.message);
    }

    revalidatePath('/ai');
    return { success: true };
  });
