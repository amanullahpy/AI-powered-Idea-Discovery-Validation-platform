export type ExperienceLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
export type AvailableTime = 'LESS_THAN_1_HR' | '1_TO_2_HRS' | '2_TO_4_HRS' | '4_TO_8_HRS' | 'FULL_TIME';
export type BudgetBracket = 'ZERO' | '1_TO_50' | '50_TO_250' | '250_TO_1000' | '1000_PLUS' | 'NOT_SURE';

export interface SaveOnboardingInput {
  categoryIds?: string[];
  skillIds?: string[];
  goalIds?: string[];
  marketIds?: string[];
  experienceLevel?: ExperienceLevel | null;
  availableTime?: AvailableTime | null;
  budgetBracket?: BudgetBracket | null;
  targetAudienceFocus?: string | null;
  markCompleted?: boolean;
}

export interface UpdateProfileInput {
  displayName: string;
  username?: string | null;
  bio?: string | null;
  avatarUrl?: string | null;
}
