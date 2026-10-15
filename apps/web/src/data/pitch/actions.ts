'use server';

import { authActionClient } from '@/lib/safe-action';
import { createSupabaseClient } from '@/supabase-clients/server';
import { checkRateLimit } from '@/lib/ai/rate-limiter';
import { getIdeaById } from '@/data/ideas/actions';
import {
  synthesizePitchPackage,
  calculateUnitEconomics,
  type UnitEconomicsModel,
  type GeneratedPitchPackage,
  type ComputedUnitEconomics,
} from '@/lib/pitch/generator';
import { z } from 'zod';

const synthesizePitchSchema = z.object({
  ideaId: z.string().optional(),
  customTitle: z.string().max(200).optional(),
  customProblem: z.string().max(2000).optional(),
  customSolution: z.string().max(2000).optional(),
  customAudience: z.string().max(1000).optional(),
  customMonetization: z.string().max(1000).optional(),
});

export const synthesizePitchDeckAction = authActionClient
  .schema(synthesizePitchSchema)
  .action(async ({ parsedInput, ctx }): Promise<GeneratedPitchPackage> => {
    const rateLimit = checkRateLimit(`rate_limit:pitch_gen:${ctx.userId}`, {
      maxRequests: 25,
      windowMs: 60 * 1000,
    });

    if (!rateLimit.allowed) {
      throw new Error(`Rate limit exceeded for pitch deck synthesis. Please wait ${rateLimit.retryAfterSec}s.`);
    }

    const supabase = await createSupabaseClient();

    let ideaInput = {
      id: parsedInput.ideaId,
      title: parsedInput.customTitle || 'Venture Opportunity',
      problem: parsedInput.customProblem || null,
      solution: parsedInput.customSolution || null,
      target_audience: parsedInput.customAudience || null,
      monetization: parsedInput.customMonetization || null,
      mvp_features: null as string[] | null,
      estimated_cost: null as string | null,
      estimated_time: null as string | null,
      difficulty: null as string | null,
      categories: null as { name: string } | null,
    };

    if (parsedInput.ideaId) {
      const fetchedIdea = await getIdeaById(parsedInput.ideaId, ctx.userId);
      if (fetchedIdea) {
        ideaInput = {
          id: fetchedIdea.id,
          title: parsedInput.customTitle || fetchedIdea.title,
          problem: parsedInput.customProblem || fetchedIdea.problem,
          solution: parsedInput.customSolution || fetchedIdea.solution,
          target_audience: parsedInput.customAudience || fetchedIdea.target_audience,
          monetization: parsedInput.customMonetization || fetchedIdea.monetization,
          mvp_features: Array.isArray(fetchedIdea.mvp_features) ? fetchedIdea.mvp_features : null,
          estimated_cost: fetchedIdea.estimated_cost,
          estimated_time: fetchedIdea.estimated_time,
          difficulty: fetchedIdea.difficulty,
          categories: fetchedIdea.categories,
        };
      }
    }

    const pitchPackage = synthesizePitchPackage(ideaInput);

    // Record audit event
    await supabase.from('audit_events').insert({
      user_id: ctx.userId,
      event_type: 'PITCH_DECK_GENERATED',
      entity_type: 'idea',
      entity_id: ideaInput.id || null,
      metadata: {
        title: pitchPackage.ideaTitle,
        slideCount: pitchPackage.slides.length,
      },
    });

    return pitchPackage;
  });

const computeEconomicsSchema = z.object({
  monthlyPrice: z.number().min(0).max(100000),
  newCustomersPerMonth: z.number().min(0).max(1000000),
  cac: z.number().min(0).max(1000000),
  monthlyChurnPercent: z.number().min(0).max(100),
  monthlyFixedCosts: z.number().min(0).max(100000000),
});

export const computeUnitEconomicsAction = authActionClient
  .schema(computeEconomicsSchema)
  .action(async ({ parsedInput }): Promise<ComputedUnitEconomics> => {
    return calculateUnitEconomics(parsedInput as UnitEconomicsModel);
  });
