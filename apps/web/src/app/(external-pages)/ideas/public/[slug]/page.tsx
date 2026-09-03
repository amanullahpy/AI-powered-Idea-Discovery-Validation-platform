import { getIdeaBySlug, getPublicIdeas } from '@/data/ideas/actions';
import { PublicIdeaView } from './public-idea-view';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { siteConfig } from '@/config/site';
import { JsonLd, getIdeaJsonLd, getBreadcrumbJsonLd } from '@/lib/seo/json-ld';

export const instant = false;

interface PublicIdeaPageProps {
  params: Promise<{ slug: string }>;
}

/**
 * Pre-render public ideas at build time for sub-100ms TTFB and search engine crawling
 */
export async function generateStaticParams() {
  try {
    const ideas = await getPublicIdeas();
    return (ideas || []).map((idea: any) => ({
      slug: idea.slug,
    }));
  } catch (err) {
    console.error('generateStaticParams error:', err);
    return [];
  }
}

export async function generateMetadata({ params }: PublicIdeaPageProps): Promise<Metadata> {
  const { slug } = await params;
  const idea = await getIdeaBySlug(slug);

  if (!idea) {
    return { title: `Idea Not Found — ${siteConfig.name}` };
  }

  const pageUrl = `${siteConfig.url}/ideas/public/${idea.slug}`;
  const categoryName = idea.categories?.name || 'Startup Concept';

  return {
    title: `${idea.title} — ${siteConfig.name}`,
    description: idea.short_description,
    keywords: [
      idea.title,
      categoryName,
      idea.difficulty,
      'startup idea',
      'mvp blueprint',
      'market validation',
      'saas opportunity',
    ].filter(Boolean),
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
      title: `${idea.title} | ${categoryName} on ${siteConfig.name}`,
      description: idea.short_description,
      url: pageUrl,
      siteName: siteConfig.name,
      type: 'article',
      publishedTime: idea.created_at,
      modifiedTime: idea.updated_at,
      section: categoryName,
      tags: [categoryName, idea.difficulty, 'Startup Idea', 'MVP'],
      images: [
        {
          url: `${siteConfig.url}${siteConfig.ogImage}`,
          width: 1200,
          height: 630,
          alt: `${idea.title} — Blueprint`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${idea.title} — Blueprint`,
      description: idea.short_description,
      images: [`${siteConfig.url}${siteConfig.ogImage}`],
    },
  };
}

export default async function PublicIdeaPage({ params }: PublicIdeaPageProps) {
  const { slug } = await params;
  const idea = await getIdeaBySlug(slug);

  if (!idea || idea.visibility === 'PRIVATE') {
    notFound();
  }

  const breadcrumbItems = [
    { name: 'Home', url: '/' },
    { name: 'Discover Ideas', url: '/discover' },
    { name: idea.title, url: `/ideas/public/${idea.slug}` },
  ];

  return (
    <>
      <JsonLd data={getIdeaJsonLd(idea)} />
      <JsonLd data={getBreadcrumbJsonLd(breadcrumbItems)} />
      <PublicIdeaView idea={idea} />
    </>
  );
}
