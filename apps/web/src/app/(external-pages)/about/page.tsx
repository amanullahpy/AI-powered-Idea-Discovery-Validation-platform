import { AboutCTA } from './about-cta';
import { AboutFeaturesGrid } from './about-features-grid';
import { AboutHero } from './about-hero';
import { AboutTechStack } from './about-tech-stack';
import { siteConfig } from '@/config/site';
import { JsonLd, getBreadcrumbJsonLd } from '@/lib/seo/json-ld';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: `About ${siteConfig.name} — Mission & Technology Architecture`,
  description: `Learn how ${siteConfig.name} empowers entrepreneurs, indie builders, and students with AI-powered idea discovery, personalized matchmaking, and structured market validation.`,
  alternates: {
    canonical: `${siteConfig.url}/about`,
  },
  openGraph: {
    title: `About ${siteConfig.name} — Empowering High-Conviction Builders`,
    description: `Learn how ${siteConfig.name} combines AI ideation, database-backed taxonomy, and validation audits.`,
    url: `${siteConfig.url}/about`,
    siteName: siteConfig.name,
    type: 'website',
  },
};

const technologies = [
  'Next.js 16',
  'TypeScript',
  'Supabase',
  'Tailwind CSS 4',
  'shadcn/ui',
  'React Hook Form',
  'Zod',
  'Turborepo',
];

const breadcrumbs = [
  { name: 'Home', url: '/' },
  { name: 'About', url: '/about' },
];

export default function About() {
  return (
    <div className="mx-auto max-w-7xl space-y-20 px-4 py-10 sm:px-6 sm:py-16 lg:px-8">
      <JsonLd data={getBreadcrumbJsonLd(breadcrumbs)} />
      <AboutHero />
      <AboutFeaturesGrid />
      <AboutTechStack technologies={technologies} />
      <AboutCTA />
    </div>
  );
}
