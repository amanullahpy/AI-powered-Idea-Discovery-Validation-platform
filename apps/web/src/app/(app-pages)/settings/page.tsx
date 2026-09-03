import { getCachedLoggedInSupabaseUser } from '@/rsc-data/supabase';
import { getTaxonomyOptions, getUserOnboardingData } from '@/data/user/onboarding';
import { getUserProfile } from '@/data/user/profile';
import { SettingsEditor } from './settings-editor';
import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Settings — Idea Platform',
  description: 'Manage your profile and idea discovery preferences.',
};

export default async function SettingsPage() {
  const user = await getCachedLoggedInSupabaseUser();
  if (!user) {
    redirect('/login');
  }

  const [profile, taxonomy, userData] = await Promise.all([
    getUserProfile(user.id),
    getTaxonomyOptions(),
    getUserOnboardingData(user.id),
  ]);

  return (
    <div className="space-y-6 p-6 md:p-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your personal profile, account security, and tailored idea recommendation criteria.
        </p>
      </div>

      <SettingsEditor
        userEmail={user.email || ''}
        initialProfile={profile}
        taxonomy={taxonomy}
        userPreferences={{
          selectedCategoryIds: userData.selectedCategoryIds,
          selectedSkillIds: userData.selectedSkillIds,
          selectedGoalIds: userData.selectedGoalIds,
          selectedMarketIds: userData.selectedMarketIds,
          experienceLevel: userData.preferences?.experience_level || null,
          availableTime: userData.preferences?.available_time || null,
          budgetBracket: userData.preferences?.budget_bracket || null,
        }}
      />
    </div>
  );
}
