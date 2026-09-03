import { getCachedLoggedInUserId } from '@/rsc-data/supabase';
import { getTaxonomyOptions, getUserOnboardingData } from '@/data/user/onboarding';
import { OnboardingWizard } from './onboarding-wizard';
import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Personalize Your Idea Discovery — NextBase',
  description: 'Tell us about your interests, skills, and goals to discover tailored startup and project ideas.',
};

export default async function OnboardingPage() {
  const userId = await getCachedLoggedInUserId();
  if (!userId) {
    redirect('/login');
  }

  const [taxonomy, userData] = await Promise.all([
    getTaxonomyOptions(),
    getUserOnboardingData(userId),
  ]);

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-3xl mb-4 text-center">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Tailor Your Idea Engine</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Answer a few quick questions so we can score and surface ideas that match your background.
        </p>
      </div>

      <OnboardingWizard
        categories={taxonomy.categories}
        skills={taxonomy.skills}
        goals={taxonomy.goals}
        markets={taxonomy.markets}
        initialCategoryIds={userData.selectedCategoryIds}
        initialSkillIds={userData.selectedSkillIds}
        initialGoalIds={userData.selectedGoalIds}
        initialMarketIds={userData.selectedMarketIds}
        initialExperienceLevel={userData.preferences?.experience_level}
        initialAvailableTime={userData.preferences?.available_time}
        initialBudgetBracket={userData.preferences?.budget_bracket}
      />
    </div>
  );
}
