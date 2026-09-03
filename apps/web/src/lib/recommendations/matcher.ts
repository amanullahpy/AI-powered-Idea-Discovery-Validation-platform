import { type ExperienceLevel, type AvailableTime, type BudgetBracket } from '@/data/user/onboarding';

export interface UserMatchProfile {
  selectedCategoryIds?: string[];
  selectedSkillIds?: string[];
  experienceLevel?: ExperienceLevel | null;
  availableTime?: AvailableTime | null;
  budgetBracket?: BudgetBracket | null;
}

export interface IdeaMatchInput {
  category_id?: string | null;
  difficulty?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'HARD';
  estimated_cost?: string | null;
  estimated_time?: string | null;
}

export interface MatchScoreResult {
  score: number; // 0 - 100
  reasons: string[];
}

export function calculateIdeaMatchScore(
  idea: IdeaMatchInput,
  userProfile?: UserMatchProfile | null
): MatchScoreResult {
  if (!userProfile) {
    return {
      score: 75,
      reasons: ['Popular curated concept with standard validation requirements.'],
    };
  }

  let totalScore = 40; // Base discovery score
  const reasons: string[] = [];

  // 1. Category / Interest Match (Up to +25 points)
  if (idea.category_id && userProfile.selectedCategoryIds?.includes(idea.category_id)) {
    totalScore += 25;
    reasons.push('Directly matches one of your core selected interests.');
  }

  // 2. Experience Level vs Difficulty (Up to +15 points)
  if (idea.difficulty) {
    const exp = userProfile.experienceLevel;
    if (exp === 'BEGINNER' && (idea.difficulty === 'BEGINNER' || idea.difficulty === 'INTERMEDIATE')) {
      totalScore += 15;
      reasons.push('Beginner-friendly execution curve.');
    } else if (exp === 'INTERMEDIATE' && idea.difficulty !== 'HARD') {
      totalScore += 15;
      reasons.push('Great match for your intermediate building experience.');
    } else if ((exp === 'ADVANCED' || exp === 'EXPERT')) {
      totalScore += 15;
      reasons.push('High-leverage concept suited for experienced builders.');
    } else {
      totalScore += 5;
    }
  }

  // 3. Time Availability Match (Up to +10 points)
  if (userProfile.availableTime) {
    const time = userProfile.availableTime;
    const estTime = (idea.estimated_time || '').toLowerCase();

    if (time === 'LESS_THAN_1_HR' && (estTime.includes('1 week') || estTime.includes('2 week'))) {
      totalScore += 10;
      reasons.push('Fast turnaround matches your micro-experiment schedule.');
    } else if (time === 'FULL_TIME' || time === '4_TO_8_HRS') {
      totalScore += 10;
      reasons.push('Scope fits your full dedicated builder availability.');
    } else {
      totalScore += 8;
    }
  }

  // 4. Budget Match (Up to +10 points)
  if (userProfile.budgetBracket) {
    const b = userProfile.budgetBracket;
    const estCost = (idea.estimated_cost || '').toLowerCase();

    if (b === 'ZERO' && (estCost.includes('$0') || estCost.includes('free'))) {
      totalScore += 10;
      reasons.push('Zero-capital bootstrapper friendly.');
    } else if (b === '1_TO_50' || b === '50_TO_250') {
      totalScore += 10;
      reasons.push('Lean budget requirement matches your investment comfort.');
    } else {
      totalScore += 8;
    }
  }

  // Ensure score is capped between 50 and 98 (realistic)
  const finalScore = Math.min(98, Math.max(50, totalScore));

  if (reasons.length === 0) {
    reasons.push('Solid foundational project with verified market demand.');
  }

  return {
    score: finalScore,
    reasons,
  };
}
