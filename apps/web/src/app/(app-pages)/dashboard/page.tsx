import { getCachedLoggedInSupabaseUser } from '@/rsc-data/supabase';
import { getUserProfile } from '@/data/user/profile';
import { getUserOnboardingData } from '@/data/user/onboarding';
import { getUserIdeas, getSavedIdeas, getPublicIdeas } from '@/data/ideas/actions';
import { calculateIdeaMatchScore } from '@/lib/recommendations/matcher';
import { DashboardView } from './dashboard-view';
import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Dashboard — Idea Platform',
  description: 'Your personalized ideas, AI tools, and project opportunities.',
};

export default async function DashboardPage() {
  const user = await getCachedLoggedInSupabaseUser();
  if (!user) {
    redirect('/login');
  }

  const [profile, onboardingData, userIdeas, savedIdeas, publicIdeas] = await Promise.all([
    getUserProfile(user.id),
    getUserOnboardingData(user.id),
    getUserIdeas(user.id),
    getSavedIdeas(user.id),
    getPublicIdeas(),
  ]);

  const userProfileMatcher = {
    selectedCategoryIds: onboardingData.selectedCategoryIds,
    selectedSkillIds: onboardingData.selectedSkillIds,
    experienceLevel: onboardingData.preferences?.experience_level || null,
    availableTime: onboardingData.preferences?.available_time || null,
    budgetBracket: onboardingData.preferences?.budget_bracket || null,
  };

  // Score each public idea against user profile
  const scoredIdeas = publicIdeas.map((idea) => {
    const match = calculateIdeaMatchScore(idea, userProfileMatcher);
    return {
      ...idea,
      matchScore: match.score,
      matchReasons: match.reasons,
    };
  });

  // Sort by highest match score first
  scoredIdeas.sort((a, b) => b.matchScore - a.matchScore);

  const savedIdeaIds = savedIdeas.map((s) => s.idea_id);

  const userStats = {
    totalIdeas: userIdeas.length,
    savedIdeas: savedIdeas.length,
    buildingIdeas: userIdeas.filter((i) => i.status === 'BUILDING').length,
    aiIdeas: userIdeas.filter((i) => i.ai_generated).length,
  };

  const displayName =
    profile?.display_name ||
    user.user_metadata?.full_name ||
    user.email?.split('@')[0] ||
    'Builder';

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <DashboardView
        userName={displayName}
        onboardingCompleted={profile?.onboarding_completed ?? false}
        userStats={userStats}
        scoredIdeas={scoredIdeas}
        savedIdeaIds={savedIdeaIds}
      />
    </div>
  );
}
