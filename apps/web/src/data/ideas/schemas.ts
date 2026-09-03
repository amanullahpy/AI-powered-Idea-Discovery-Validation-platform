import { z } from 'zod';

export const ideaDifficultySchema = z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'HARD']);
export const ideaVisibilitySchema = z.enum(['PRIVATE', 'PUBLIC', 'UNLISTED']);
export const ideaStatusSchema = z.enum(['DRAFT', 'SAVED', 'VALIDATING', 'BUILDING', 'LAUNCHED', 'ARCHIVED']);

export const createIdeaSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(120),
  shortDescription: z.string().min(10, 'Short description must be at least 10 characters').max(300),
  description: z.string().max(3000).optional().nullable(),
  problem: z.string().max(2000).optional().nullable(),
  solution: z.string().max(2000).optional().nullable(),
  targetAudience: z.string().max(1000).optional().nullable(),
  monetization: z.string().max(1000).optional().nullable(),
  categoryId: z.string().uuid().optional().nullable(),
  difficulty: ideaDifficultySchema.default('INTERMEDIATE'),
  estimatedCost: z.string().max(100).optional().nullable(),
  estimatedTime: z.string().max(100).optional().nullable(),
  mvpFeatures: z.array(z.string()).default([]),
  visibility: ideaVisibilitySchema.default('PRIVATE'),
  status: ideaStatusSchema.default('SAVED'),
  aiGenerated: z.boolean().default(false),
  aiModel: z.string().optional().nullable(),
  aiGenerationId: z.string().uuid().optional().nullable(),
});

export const updateIdeaSchema = createIdeaSchema.partial().extend({
  id: z.string().uuid(),
});

export const updateIdeaVisibilitySchema = z.object({
  id: z.string().uuid(),
  visibility: ideaVisibilitySchema,
});

export const updateIdeaStatusSchema = z.object({
  id: z.string().uuid(),
  status: ideaStatusSchema,
});

export const toggleSaveIdeaSchema = z.object({
  ideaId: z.string().uuid(),
  notes: z.string().max(500).optional(),
});

export const deleteIdeaSchema = z.object({
  id: z.string().uuid(),
  softDelete: z.boolean().default(true),
});
