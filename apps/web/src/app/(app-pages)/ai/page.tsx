import { Suspense } from 'react';
import { getCachedLoggedInUserId } from '@/rsc-data/supabase';
import { getUserConversations } from '@/data/ai/actions';
import { getSavedIdeas } from '@/data/ideas/actions';
import { getUserOnboardingData } from '@/data/user/onboarding';
import { AIChat } from './ai-chat';
import { redirect } from 'next/navigation';
import { siteConfig } from '@/config/site';

export const instant = false;

export const metadata = {
  title: `AI Idea Co-pilot — ${siteConfig.name}`,
  description: `Brainstorm, generate, and refine high-conviction ideas with your interactive ${siteConfig.name} AI co-pilot.`,
};

export default async function AIPage() {
  const userId = await getCachedLoggedInUserId();
  if (!userId) {
    redirect('/login');
  }

  const [conversations, savedIdeas, onboardingData] = await Promise.all([
    getUserConversations(userId),
    getSavedIdeas(userId),
    getUserOnboardingData(userId),
  ]);

  return (
    <div className="flex-1 flex flex-col h-full max-h-full overflow-hidden">
      <Suspense fallback={null}>
        <AIChat
          initialConversations={conversations}
          savedIdeas={savedIdeas.map((s: any) => s.ideas).filter(Boolean)}
          userProfile={onboardingData}
        />
      </Suspense>
    </div>
  );
}
