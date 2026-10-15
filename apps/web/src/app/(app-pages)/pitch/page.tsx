import { Suspense } from 'react';
import { getCachedLoggedInUserId } from '@/rsc-data/supabase';
import { getUserIdeas, getSavedIdeas } from '@/data/ideas/actions';
import { redirect } from 'next/navigation';
import { siteConfig } from '@/config/site';
import { PitchStudioView } from './pitch-studio-view';

export const instant = false;

export const metadata = {
  title: `Pitch Deck & Investment Memo Studio — ${siteConfig.name}`,
  description: `Synthesize 10-slide VC pitch decks, calculate unit economics, and export 1-page investment memos on ${siteConfig.name}.`,
};

export default async function PitchPage({
  searchParams,
}: {
  searchParams: Promise<{ ideaId?: string }>;
}) {
  const userId = await getCachedLoggedInUserId();
  if (!userId) {
    redirect('/login');
  }

  const { ideaId } = await searchParams;

  const [userIdeas, savedIdeas] = await Promise.all([
    getUserIdeas(userId),
    getSavedIdeas(userId),
  ]);

  const combinedIdeas = [
    ...userIdeas,
    ...savedIdeas.map((s: any) => s.ideas).filter(Boolean),
  ];

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
      <Suspense fallback={null}>
        <PitchStudioView
          ideas={combinedIdeas}
          initialIdeaId={ideaId}
        />
      </Suspense>
    </div>
  );
}
