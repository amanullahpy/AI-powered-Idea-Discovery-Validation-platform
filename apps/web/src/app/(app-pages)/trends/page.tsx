import { Suspense } from 'react';
import { getCachedLoggedInUserId } from '@/rsc-data/supabase';
import { getMarketTrends, getUserBookmarkedTrendIds } from '@/data/trends/actions';
import { TrendsView } from './trends-view';
import { redirect } from 'next/navigation';
import { siteConfig } from '@/config/site';

export const instant = false;

export const metadata = {
  title: `Market Trends & Opportunity Radar — ${siteConfig.name}`,
  description: `Live founder intelligence, emerging micro-niches, structural regulatory tailwinds, and opportunity radars on ${siteConfig.name}.`,
};

export default async function TrendsPage() {
  const userId = await getCachedLoggedInUserId();
  if (!userId) {
    redirect('/login');
  }

  const [trends, bookmarkedIds] = await Promise.all([
    getMarketTrends(),
    getUserBookmarkedTrendIds(userId),
  ]);

  return (
    <div className="flex-1 overflow-y-auto">
      <Suspense fallback={null}>
        <TrendsView initialTrends={trends} initialBookmarkedIds={bookmarkedIds} />
      </Suspense>
    </div>
  );
}
