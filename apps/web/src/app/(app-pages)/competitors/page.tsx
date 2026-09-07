import { Suspense } from 'react';
import { getCachedLoggedInUserId } from '@/rsc-data/supabase';
import { getUserIdeas, getSavedIdeas } from '@/data/ideas/actions';
import { CompetitorsView } from './competitors-view';
import { redirect } from 'next/navigation';
import { siteConfig } from '@/config/site';

export const instant = false;

export const metadata = {
  title: `Competitor Moats & Intelligence — ${siteConfig.name}`,
  description: `Deconstruct competitor pricing, uncover incumbent vulnerabilities, and craft an asymmetric defensive moat on ${siteConfig.name}.`,
};

export default async function CompetitorsPage() {
  const userId = await getCachedLoggedInUserId();
  if (!userId) {
    redirect('/login');
  }

  const [userIdeas, savedIdeas] = await Promise.all([
    getUserIdeas(userId),
    getSavedIdeas(userId),
  ]);

  const combinedIdeas = [
    ...userIdeas,
    ...savedIdeas.map((s: any) => s.ideas).filter(Boolean),
  ];

  const firstIdeaId = combinedIdeas[0]?.id;
  const initialCompetitors = firstIdeaId
    ? await (await import('@/data/competitors/actions')).getIdeaCompetitors(firstIdeaId)
    : [];

  return (
    <div className="flex-1 overflow-y-auto">
      <Suspense fallback={null}>
        <CompetitorsView
          ideas={combinedIdeas}
          initialCompetitors={initialCompetitors}
        />
      </Suspense>
    </div>
  );
}
