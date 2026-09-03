import { describe, it, expect } from 'vitest';
import { calculateIdeaMatchScore } from './matcher';

describe('calculateIdeaMatchScore', () => {
  it('should return baseline score of 75 when no user profile is provided', () => {
    const result = calculateIdeaMatchScore({
      category_id: 'cat-1',
      difficulty: 'BEGINNER',
    });

    expect(result.score).toBe(75);
    expect(result.reasons).toHaveLength(1);
  });

  it('should award extra points when idea category matches user interests', () => {
    const withoutMatch = calculateIdeaMatchScore(
      { category_id: 'cat-other', difficulty: 'INTERMEDIATE' },
      { selectedCategoryIds: ['cat-1'] }
    );

    const withMatch = calculateIdeaMatchScore(
      { category_id: 'cat-1', difficulty: 'INTERMEDIATE' },
      { selectedCategoryIds: ['cat-1'] }
    );

    expect(withMatch.score).toBeGreaterThan(withoutMatch.score);
    expect(withMatch.reasons).toContain('Directly matches one of your core selected interests.');
  });

  it('should reward beginner-friendly difficulty for beginners', () => {
    const result = calculateIdeaMatchScore(
      { difficulty: 'BEGINNER' },
      { experienceLevel: 'BEGINNER' }
    );

    expect(result.reasons).toContain('Beginner-friendly execution curve.');
  });

  it('should match zero-cost ideas with zero-budget users', () => {
    const result = calculateIdeaMatchScore(
      { estimated_cost: '$0 - $50 (Free tier)' },
      { budgetBracket: 'ZERO' }
    );

    expect(result.reasons).toContain('Zero-capital bootstrapper friendly.');
  });

  it('should cap score within reasonable bounds', () => {
    const highMatch = calculateIdeaMatchScore(
      {
        category_id: 'cat-1',
        difficulty: 'BEGINNER',
        estimated_cost: '$0',
        estimated_time: '1 week',
      },
      {
        selectedCategoryIds: ['cat-1'],
        experienceLevel: 'BEGINNER',
        budgetBracket: 'ZERO',
        availableTime: 'LESS_THAN_1_HR',
      }
    );

    expect(highMatch.score).toBeLessThanOrEqual(98);
    expect(highMatch.score).toBeGreaterThanOrEqual(80);
  });
});
