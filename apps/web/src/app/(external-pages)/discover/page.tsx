import { getCachedLoggedInSupabaseUser } from '@/rsc-data/supabase';
import { getTaxonomyOptions, getUserOnboardingData } from '@/data/user/onboarding';
import { getPublicIdeas, getSavedIdeas } from '@/data/ideas/actions';
import { calculateIdeaMatchScore } from '@/lib/recommendations/matcher';
import { DiscoverView } from './discover-view';
import { siteConfig } from '@/config/site';
import { JsonLd, getBreadcrumbJsonLd } from '@/lib/seo/json-ld';
import type { Metadata } from 'next';

export const instant = false;

export const metadata: Metadata = {
  title: `Discover Ideas — ${siteConfig.name}`,
  description: `Explore curated, public startup, SaaS, mobile, AI agent, and side hustle concepts on ${siteConfig.name}. Filter by skill level, category, and budget.`,
  keywords: [
    'discover startup ideas',
    'browse SaaS opportunities',
    'AI agent blueprints',
    'profitable side hustles',
    'indie hacker ideas',
    'MVP concepts',
  ],
  alternates: {
    canonical: `${siteConfig.url}/discover`,
  },
  openGraph: {
    title: `Discover High-Conviction Startup & SaaS Ideas — ${siteConfig.name}`,
    description: `Explore curated, public startup, SaaS, mobile, AI agent, and side hustle concepts on ${siteConfig.name}.`,
    url: `${siteConfig.url}/discover`,
    siteName: siteConfig.name,
    type: 'website',
  },
};

export default async function DiscoverPage() {
  let currentUserId: string | null = null;
  let userProfileMatcher: any = null;
  let savedIdeaIds: string[] = [];

  try {
    const user = await getCachedLoggedInSupabaseUser();
    if (user) {
      currentUserId = user.id;
      const [userData, userSaved] = await Promise.all([
        getUserOnboardingData(user.id),
        getSavedIdeas(user.id),
      ]);
      savedIdeaIds = userSaved.map((s) => s.idea_id);
      userProfileMatcher = {
        selectedCategoryIds: userData.selectedCategoryIds,
        selectedSkillIds: userData.selectedSkillIds,
        experienceLevel: userData.preferences?.experience_level || null,
        availableTime: userData.preferences?.available_time || null,
        budgetBracket: userData.preferences?.budget_bracket || null,
      };
    }
  } catch {
    // Visitor is unauthenticated
  }

  const [taxonomy, publicIdeas] = await Promise.all([
    getTaxonomyOptions(),
    getPublicIdeas(),
  ]);

  const scoredIdeas = publicIdeas.map((idea) => {
    const match = calculateIdeaMatchScore(idea, userProfileMatcher);
    return {
      ...idea,
      matchScore: match.score,
      matchReasons: match.reasons,
    };
  });

  const collectionJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `Discover Ideas — ${siteConfig.name}`,
    description: `Explore curated startup and project ideas across ${taxonomy.categories.length}+ categories.`,
    url: `${siteConfig.url}/discover`,
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: scoredIdeas.slice(0, 10).map((idea: any, index: number) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: idea.title,
        url: `${siteConfig.url}/ideas/public/${idea.slug}`,
      })),
    },
  };

  const breadcrumbItems = [
    { name: 'Home', url: '/' },
    { name: 'Discover Ideas', url: '/discover' },
  ];

  return (
    <>
      <JsonLd data={collectionJsonLd} />
      <JsonLd data={getBreadcrumbJsonLd(breadcrumbItems)} />
      <DiscoverView
        categories={taxonomy.categories}
        initialIdeas={scoredIdeas}
        savedIdeaIds={savedIdeaIds}
        currentUserId={currentUserId}
      />
    </>
  );
}
