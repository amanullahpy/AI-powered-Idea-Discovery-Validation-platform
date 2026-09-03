'use server';

import { authActionClient } from '@/lib/safe-action';
import { createSupabaseClient } from '@/supabase-clients/server';
import { checkRateLimit } from '@/lib/ai/rate-limiter';
import { generateChatResponse, structuredIdeaSchema, type StructuredIdeaOutput } from '@/lib/ai/provider';
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
});

export const sendMessageAndGenerateAction = authActionClient
  .schema(sendMessageSchema)
  .action(async ({ parsedInput, ctx }) => {
    const supabase = await createSupabaseClient();
    const userId = ctx.userId;

    // 1. Rate Limit check
    const rateLimit = checkRateLimit(userId, { maxRequests: 20, windowMs: 60 * 1000 });
    if (!rateLimit.allowed) {
      throw new Error(`Rate limit exceeded. Please wait ${rateLimit.retryAfterSec || 30} seconds.`);
    }

    // 2. Fetch User Personalization Context
    const userData = await getUserOnboardingData(userId);
    const userContext = {
      experienceLevel: userData.preferences?.experience_level,
      budgetBracket: userData.preferences?.budget_bracket,
      availableTime: userData.preferences?.available_time,
    };

    // 3. Ensure Conversation exists
    let conversationId = parsedInput.conversationId;
    if (!conversationId) {
      const { data: conv, error: convErr } = await supabase
        .from('ai_conversations')
        .insert({
          user_id: userId,
          title: parsedInput.message.slice(0, 50),
          context_type: 'GENERATION',
        })
        .select('id')
        .single();

      if (convErr) throw new Error(convErr.message);
      conversationId = conv.id;
    }

    // 4. Save User message to DB
    await supabase.from('ai_messages').insert({
      conversation_id: conversationId,
      role: 'user',
      content: parsedInput.message,
    });

    // 5. Generate AI Chat & Structured Idea
    const messages = [...parsedInput.history, { role: 'user' as const, content: parsedInput.message }];
    const result = await generateChatResponse(messages, userContext);

    // 6. Save Assistant message to DB
    await supabase.from('ai_messages').insert({
      conversation_id: conversationId,
      role: 'assistant',
      content: result.reply,
      input_tokens: result.inputTokens,
      output_tokens: result.outputTokens,
      latency_ms: result.latencyMs,
      metadata: (result.suggestedIdea ? { suggestedIdea: result.suggestedIdea } : {}) as any,
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
      reply: result.reply,
      suggestedIdea: result.suggestedIdea,
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
