import { getCachedLoggedInUserId } from '@/rsc-data/supabase';
import { getSavedIdeas } from '@/data/ideas/actions';
import { IdeaCard } from '@/components/ideas/idea-card';
import { Button } from '@/components/ui/button';
import { Bookmark, Compass } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { siteConfig } from '@/config/site';

export const instant = false;

export const metadata = {
  title: `Saved Ideas — ${siteConfig.name}`,
  description: `Your bookmarked ideas and inspirations on ${siteConfig.name}.`,
};

export default async function SavedIdeasPage() {
  const userId = await getCachedLoggedInUserId();
  if (!userId) {
    redirect('/login');
  }

  const savedRecords = await getSavedIdeas(userId);

  return (
    <div className="space-y-6 p-6 md:p-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Saved Ideas</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Curated opportunities and bookmarks you want to revisit or build.
        </p>
      </div>

      {savedRecords.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed p-12 text-center">
          <div className="rounded-full bg-primary/10 p-3 mb-3 text-primary">
            <Bookmark className="size-6" />
          </div>
          <h3 className="font-semibold text-lg">No saved ideas yet</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm">
            Browse public opportunities or use the AI co-pilot to discover ideas to save.
          </p>
          <div className="mt-5 flex gap-2">
            <Button asChild size="sm">
              <Link href="/discover">
                <Compass className="size-3.5 mr-1.5" />
                Discover Public Ideas
              </Link>
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {savedRecords.map((rec: any) => {
            const idea = rec.ideas;
            if (!idea) return null;
            return (
              <IdeaCard
                key={rec.id}
                idea={idea}
                isOwner={idea.owner_id === userId}
                isSavedInitial={true}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
