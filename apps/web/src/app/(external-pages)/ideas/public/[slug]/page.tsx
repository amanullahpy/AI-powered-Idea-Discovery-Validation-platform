import { getIdeaBySlug, getSavedIdeas } from '@/data/ideas/actions';
import { getCachedLoggedInSupabaseUser } from '@/rsc-data/supabase';
import { PublicIdeaView } from './public-idea-view';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

interface PublicIdeaPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PublicIdeaPageProps): Promise<Metadata> {
  const { slug } = await params;
  const idea = await getIdeaBySlug(slug);

  if (!idea) {
    return { title: 'Idea Not Found — Idea Platform' };
  }

  return {
    title: `${idea.title} — Idea Blueprint`,
    description: idea.short_description,
    openGraph: {
      title: `${idea.title} — Startup & Project Opportunity`,
      description: idea.short_description,
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: idea.title,
      description: idea.short_description,
    },
  };
}

export default async function PublicIdeaPage({ params }: PublicIdeaPageProps) {
  const { slug } = await params;
  const idea = await getIdeaBySlug(slug);

  if (!idea || (idea.visibility === 'PRIVATE')) {
    notFound();
  }

  let isAuthenticated = false;
  let isSaved = false;

  try {
    const user = await getCachedLoggedInSupabaseUser();
    if (user) {
      isAuthenticated = true;
      const userSaved = await getSavedIdeas(user.id);
      isSaved = userSaved.some((s) => s.idea_id === idea.id);
    }
  } catch {
    // Visitor is unauthenticated
  }

  return (
    <PublicIdeaView
      idea={idea}
      isAuthenticated={isAuthenticated}
      isSavedInitial={isSaved}
    />
  );
}
