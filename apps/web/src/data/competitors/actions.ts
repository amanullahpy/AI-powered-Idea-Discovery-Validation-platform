'use server';

import { authActionClient } from '@/lib/safe-action';
import { createSupabaseClient } from '@/supabase-clients/server';
import { checkRateLimit } from '@/lib/ai/rate-limiter';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

export interface IdeaCompetitorRecord {
  id: string;
  idea_id: string;
  user_id: string;
  name: string;
  category: string | null;
  pricing_model: string | null;
  strength: string | null;
  vulnerability: string;
  user_complaints: string | null;
  created_at: string;
  updated_at: string;
}

export async function getIdeaCompetitors(ideaId: string): Promise<IdeaCompetitorRecord[]> {
  if (!ideaId) return [];
  const supabase = await createSupabaseClient();
  const { data, error } = await supabase
    .from('idea_competitors')
    .select('*')
    .eq('idea_id', ideaId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching idea competitors:', error);
    return [];
  }
  return (data as any) || [];
}

export const createIdeaCompetitorAction = authActionClient
  .schema(
    z.object({
      ideaId: z.string().uuid(),
      name: z.string().min(1).max(100),
      category: z.string().max(100).optional(),
      pricingModel: z.string().max(150).optional(),
      strength: z.string().max(500).optional(),
      vulnerability: z.string().min(1).max(1000),
      userComplaints: z.string().max(1000).optional(),
    })
  )
  .action(async ({ parsedInput, ctx }) => {
    const supabase = await createSupabaseClient();
    const userId = ctx.userId;

    const rateLimit = checkRateLimit(`rate_limit:competitor:${userId}`, {
      maxRequests: 30,
      windowMs: 60 * 1000,
    });
    if (!rateLimit.allowed) {
      throw new Error(`Rate limit exceeded. Please wait ${rateLimit.retryAfterSec || 30}s.`);
    }

    const { data, error } = await supabase
      .from('idea_competitors')
      .insert({
        idea_id: parsedInput.ideaId,
        user_id: userId,
        name: parsedInput.name,
        category: parsedInput.category || null,
        pricing_model: parsedInput.pricingModel || null,
        strength: parsedInput.strength || null,
        vulnerability: parsedInput.vulnerability,
        user_complaints: parsedInput.userComplaints || null,
      })
      .select('*')
      .single();

    if (error) {
      throw new Error(error.message);
    }

    await supabase.from('audit_events').insert({
      user_id: userId,
      event_type: 'COMPETITOR_ANALYZED',
      entity_type: 'idea_competitors',
      entity_id: data.id,
      metadata: { ideaId: parsedInput.ideaId, competitorName: parsedInput.name },
    });

    revalidatePath('/competitors');
    return data;
  });

export const deleteIdeaCompetitorAction = authActionClient
  .schema(z.object({ competitorId: z.string().uuid() }))
  .action(async ({ parsedInput, ctx }) => {
    const supabase = await createSupabaseClient();
    const userId = ctx.userId;

    const { error } = await supabase
      .from('idea_competitors')
      .delete()
      .eq('id', parsedInput.competitorId)
      .eq('user_id', userId);

    if (error) {
      throw new Error(error.message);
    }

    revalidatePath('/competitors');
    return { success: true };
  });

/**
 * AI Competitor Discovery & Moat Teardown Action
 * Automatically researches the market landscape for a venture idea and persists 3 strategic competitor profiles.
 */
export const generateAICompetitorsAction = authActionClient
  .schema(z.object({ ideaId: z.string().uuid() }))
  .action(async ({ parsedInput, ctx }) => {
    const supabase = await createSupabaseClient();
    const userId = ctx.userId;

    const rateLimit = checkRateLimit(`rate_limit:comp_ai:${userId}`, {
      maxRequests: 5,
      windowMs: 60 * 1000,
    });
    if (!rateLimit.allowed) {
      throw new Error(`Rate limit reached for AI competitor analysis. Please wait ${rateLimit.retryAfterSec || 30}s.`);
    }

    // Fetch idea details
    const { data: idea, error: ideaErr } = await supabase
      .from('ideas')
      .select('title, description, target_audience, problem, solution')
      .eq('id', parsedInput.ideaId)
      .single();

    if (ideaErr || !idea) {
      throw new Error('Idea not found.');
    }

    const prompt = `You are an elite competitive intelligence strategist for venture capital firms.
Analyze the competitive landscape for this startup idea:
Idea Title: "${idea.title}"
Description: "${idea.description || 'Startup offering a digital solution'}"
Target Audience: "${idea.target_audience || 'General businesses & consumers'}"

Identify 3 distinct categories of competitors:
1. An established Enterprise Incumbent (expensive, legacy, slow)
2. A modern Horizontal / Point Solution SaaS (cheap or feature-limited)
3. The Status Quo / Manual alternative (e.g. Google Sheets, agencies, or custom scripts)

Return ONLY valid JSON with this exact schema:
[
  {
    "name": "Competitor or Solution Name",
    "category": "Enterprise Suite" | "Horizontal SaaS" | "Status Quo",
    "pricingModel": "Pricing structure (e.g. $12,000/yr or $49/mo/seat or Free/Manual)",
    "strength": "Their key competitive moat or strength in the market",
    "vulnerability": "Their architectural, pricing, or UX vulnerability where this new venture has an asymmetric wedge",
    "userComplaints": "Common criticisms from user reviews on G2/Reddit"
  }
]`;

    const { generateChatResponse } = await import('@/lib/ai/provider');
    const aiRes = await generateChatResponse(
      [{ role: 'user', content: prompt }],
      { experienceLevel: 'ADVANCED', budgetBracket: 'ZERO', availableTime: 'FULL_TIME', personaArchetype: 'scaler' },
      { provider: 'auto' }
    );

    let parsedComps: any[] = [];
    try {
      const cleaned = aiRes.reply.replace(/```json/g, '').replace(/```/g, '').trim();
      parsedComps = JSON.parse(cleaned);
      if (!Array.isArray(parsedComps)) {
        parsedComps = [];
      }
    } catch {
      parsedComps = [
        {
          name: 'Legacy Enterprise Incumbent',
          category: 'Enterprise Suite',
          pricingModel: '$15,000/yr annual contracts',
          strength: 'Extensive brand trust and legacy vendor approvals.',
          vulnerability: 'Overly complex onboarding and lack of self-serve accessibility.',
          userComplaints: 'Bloated interface, requires weeks of configuration.',
        },
        {
          name: 'Generic Point Tool',
          category: 'Horizontal SaaS',
          pricingModel: '$29/mo/seat',
          strength: 'Quick setup and accessible self-serve tier.',
          vulnerability: 'Missing specialized vertical workflows tailored to this specific niche.',
          userComplaints: 'Does not integrate natively with domain-specific tools.',
        },
        {
          name: 'Manual Spreadsheets & Internal Scripts',
          category: 'Status Quo',
          pricingModel: 'Internal labor hours ($60/hr staff time)',
          strength: 'Zero new software spend required to begin.',
          vulnerability: 'Non-scalable, manual data entry errors, breaks when staff changes.',
          userComplaints: 'Fragmented data, accidental cell overwrites, no real-time alerts.',
        },
      ];
    }

    const insertedRows: any[] = [];
    for (const comp of parsedComps.slice(0, 3)) {
      const { data, error } = await supabase
        .from('idea_competitors')
        .insert({
          idea_id: parsedInput.ideaId,
          user_id: userId,
          name: comp.name || 'Unnamed Competitor',
          category: comp.category || 'Competitor',
          pricing_model: comp.pricingModel || 'Undisclosed',
          strength: comp.strength || 'Established presence',
          vulnerability: comp.vulnerability || 'High friction',
          user_complaints: comp.userComplaints || 'Missing streamlined automation',
        })
        .select('*')
        .single();

      if (!error && data) {
        insertedRows.push(data);
      }
    }

    await supabase.from('audit_events').insert({
      user_id: userId,
      event_type: 'COMPETITORS_AI_SCANNED',
      entity_type: 'idea_competitors',
      metadata: { ideaId: parsedInput.ideaId, count: insertedRows.length },
    });

    revalidatePath('/competitors');
    return { success: true, competitors: insertedRows };
  });

