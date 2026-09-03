import { getCachedLoggedInUserId } from '@/rsc-data/supabase';
import { getUserIdeas, getSavedIdeas } from '@/data/ideas/actions';
import { IdeasWorkspace } from './ideas-workspace';
import { redirect } from 'next/navigation';

export const metadata = {
  title: 'My Ideas — Idea Discovery Platform',
  description: 'Manage, organize, and develop your saved and generated ideas.',
};

export default async function IdeasPage() {
  const userId = await getCachedLoggedInUserId();
  if (!userId) {
    redirect('/login');
  }

  const [ideas, savedIdeas] = await Promise.all([
    getUserIdeas(userId),
    getSavedIdeas(userId),
  ]);

  const savedIdeaIds = savedIdeas.map((s) => s.idea_id);

  return (
    <div className="space-y-6 p-6 md:p-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">My Ideas</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Review your private idea concepts, public listings, and projects in validation or development.
        </p>
      </div>

      <IdeasWorkspace
        initialIdeas={ideas as any[]}
        savedIdeaIds={savedIdeaIds}
      />
    </div>
  );
}
