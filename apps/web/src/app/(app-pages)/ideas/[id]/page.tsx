import { getCachedLoggedInUserId, getCachedLoggedInSupabaseUser } from '@/rsc-data/supabase';
import { getIdeaById } from '@/data/ideas/actions';
import { IdeaCockpit } from './idea-cockpit';
import { notFound, redirect } from 'next/navigation';
import { siteConfig } from '@/config/site';

export const instant = false;

interface IdeaDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: IdeaDetailPageProps) {
  const { id } = await params;
  let userId: string | undefined;
  try {
    const user = await getCachedLoggedInSupabaseUser();
    userId = user?.id;
  } catch {
    // Unauthenticated
  }
  const idea = await getIdeaById(id, userId);
  if (!idea) {
    return { title: `Idea Not Found — ${siteConfig.name}` };
  }
  return {
    title: `${idea.title} — ${siteConfig.name}`,
    description: idea.short_description,
  };
}

export default async function IdeaDetailPage({ params }: IdeaDetailPageProps) {
  const { id } = await params;
  const userId = await getCachedLoggedInUserId();
  if (!userId) {
    redirect('/login');
  }

  const idea = await getIdeaById(id, userId);
  if (!idea) {
    notFound();
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <IdeaCockpit idea={idea} />
    </div>
  );
}
