import { describe, it, expect } from 'vitest';
import { structuredIdeaSchema } from './provider';
import { checkRateLimit } from './rate-limiter';

describe('structuredIdeaSchema', () => {
  it('should validate a complete, well-formed structured idea', () => {
    const validIdea = {
      title: 'Valid Startup Idea',
      shortDescription: 'A very detailed short description for this validated test concept.',
      categorySlug: 'saas',
      problem: 'This is an extensive problem description that explains why customers struggle with this issue every day.',
      solution: 'This is an extensive solution description explaining the exact proposed software workflow.',
      targetAudience: 'Early-stage bootstrapped founders and indie hackers.',
      monetization: '$29/month subscription tier with a 14-day free trial.',
      difficulty: 'INTERMEDIATE' as const,
      estimatedCost: '$50 - $100',
      estimatedTime: '2 - 3 weeks',
      mvpFeatures: ['Feature 1', 'Feature 2', 'Feature 3'],
      whyItFits: 'Fits your schedule and software skills perfectly.',
    };

    const parsed = structuredIdeaSchema.safeParse(validIdea);
    expect(parsed.success).toBe(true);
  });

  it('should reject idea with too short problem or title', () => {
    const invalidIdea = {
      title: 'A', // Too short
      shortDescription: 'Short',
      categorySlug: 'saas',
      problem: 'Short',
      solution: 'Short',
      targetAudience: 'All',
      monetization: '$1',
      difficulty: 'INTERMEDIATE',
      estimatedCost: '$0',
      estimatedTime: '1 day',
      mvpFeatures: ['Just one'],
      whyItFits: 'Good',
    };

    const parsed = structuredIdeaSchema.safeParse(invalidIdea);
    expect(parsed.success).toBe(false);
  });
});

describe('checkRateLimit', () => {
  it('should allow requests within limit and reject when exceeded', () => {
    const key = `test-user-${Date.now()}`;
    const config = { maxRequests: 3, windowMs: 10000 };

    expect(checkRateLimit(key, config).allowed).toBe(true);
    expect(checkRateLimit(key, config).allowed).toBe(true);
    expect(checkRateLimit(key, config).allowed).toBe(true);

    // 4th request exceeds maxRequests of 3
    const fourth = checkRateLimit(key, config);
    expect(fourth.allowed).toBe(false);
    expect(fourth.remaining).toBe(0);
    expect(fourth.retryAfterSec).toBeGreaterThan(0);
  });
});
