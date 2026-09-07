import { Suspense } from 'react';
import { getCachedLoggedInUserId } from '@/rsc-data/supabase';
import { getUserIdeas, getSavedIdeas } from '@/data/ideas/actions';
import { getIdeaInterviews, getIdeaExperiments } from '@/data/validation/actions';
import { ValidationMatrixView } from './validation-matrix-view';
import { redirect } from 'next/navigation';
import { siteConfig } from '@/config/site';

export const instant = false;

export const metadata = {
  title: `Validation Matrix & Experiments — ${siteConfig.name}`,
  description: `Systematic customer discovery, interview evidence logging, and smoke-test experiment tracking on ${siteConfig.name}.`,
};

export default async function ValidationPage() {
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
  const [initialInterviews, initialExperiments] = await Promise.all([
    firstIdeaId ? getIdeaInterviews(firstIdeaId) : Promise.resolve([]),
    firstIdeaId ? getIdeaExperiments(firstIdeaId) : Promise.resolve([]),
  ]);

  return (
    <div className="flex-1 overflow-y-auto">
      <Suspense fallback={null}>
        <ValidationMatrixView
          ideas={combinedIdeas}
          initialInterviews={initialInterviews}
          initialExperiments={initialExperiments}
        />
      </Suspense>
    </div>
  );
}
