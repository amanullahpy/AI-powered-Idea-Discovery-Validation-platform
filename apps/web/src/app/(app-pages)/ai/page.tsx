import { getCachedLoggedInUserId } from '@/rsc-data/supabase';
import { AIChat } from './ai-chat';
import { redirect } from 'next/navigation';

export const metadata = {
  title: 'AI Idea Co-pilot — Idea Discovery Platform',
  description: 'Brainstorm, generate, and refine high-conviction ideas with your interactive AI venture co-pilot.',
};

export default async function AIPage() {
  const userId = await getCachedLoggedInUserId();
  if (!userId) {
    redirect('/login');
  }

  return (
    <div className="space-y-4 p-4 sm:p-6 md:p-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">AI Idea Co-pilot</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Explore new startup, SaaS, app, and side hustle concepts with conversational AI tailored to your skills.
        </p>
      </div>

      <AIChat />
    </div>
  );
}
