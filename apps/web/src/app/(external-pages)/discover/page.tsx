import { getCachedLoggedInSupabaseUser } from '@/rsc-data/supabase';
import { getTaxonomyOptions, getUserOnboardingData } from '@/data/user/onboarding';
import { getPublicIdeas, getSavedIdeas } from '@/data/ideas/actions';
import { calculateIdeaMatchScore } from '@/lib/recommendations/matcher';
import { DiscoverView } from './discover-view';

export const metadata = {
  title: 'Discover Ideas — Idea Platform',
  description: 'Explore curated, public startup, SaaS, mobile, and side hustle concepts.',
};

export default async function DiscoverPage() {
  let currentUserId: string | null = null;
  let userProfileMatcher: any = null;
  let savedIdeaIds: string[] = [];

  try {
    const user = await getCachedLoggedInSupabaseUser();
    if (user) {
      currentUserId = user.id;
      const [userData, userSaved] = await Promise.all([
        getUserOnboardingData(user.id),
        getSavedIdeas(user.id),
      ]);
      savedIdeaIds = userSaved.map((s) => s.idea_id);
      userProfileMatcher = {
        selectedCategoryIds: userData.selectedCategoryIds,
        selectedSkillIds: userData.selectedSkillIds,
        experienceLevel: userData.preferences?.experience_level || null,
        availableTime: userData.preferences?.available_time || null,
        budgetBracket: userData.preferences?.budget_bracket || null,
      };
    }
  } catch {
    // Visitor is unauthenticated
  }

  const [taxonomy, publicIdeas] = await Promise.all([
    getTaxonomyOptions(),
    getPublicIdeas(),
  ]);

  const scoredIdeas = publicIdeas.map((idea) => {
    const match = calculateIdeaMatchScore(idea, userProfileMatcher);
    return {
      ...idea,
      matchScore: match.score,
      matchReasons: match.reasons,
    };
  });

  return (
    <DiscoverView
      categories={taxonomy.categories}
      initialIdeas={scoredIdeas}
      savedIdeaIds={savedIdeaIds}
      currentUserId={currentUserId}
    />
  );
}
