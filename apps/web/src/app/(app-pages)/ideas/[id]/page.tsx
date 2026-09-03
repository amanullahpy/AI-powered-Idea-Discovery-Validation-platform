import { getCachedLoggedInUserId } from '@/rsc-data/supabase';
import { getIdeaById } from '@/data/ideas/actions';
import { IdeaCockpit } from './idea-cockpit';
import { notFound, redirect } from 'next/navigation';

interface IdeaDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: IdeaDetailPageProps) {
  const { id } = await params;
  const idea = await getIdeaById(id);
  if (!idea) {
    return { title: 'Idea Not Found' };
  }
  return {
    title: `${idea.title} — Idea Cockpit`,
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
    <div className="p-6 md:p-8">
      <IdeaCockpit idea={idea} />
    </div>
  );
}
