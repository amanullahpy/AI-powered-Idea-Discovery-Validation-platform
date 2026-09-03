import type { MetadataRoute } from 'next';
import { siteConfig } from '@/config/site';
import { getPublicIdeas } from '@/data/ideas/actions';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = siteConfig.url;

  // Base marketing and public pages
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/discover`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/sign-up`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];

  // Dynamic public idea pages
  try {
    const publicIdeas = await getPublicIdeas();
    const ideaRoutes: MetadataRoute.Sitemap = (publicIdeas || []).map((idea: any) => ({
      url: `${baseUrl}/ideas/public/${idea.slug}`,
      lastModified: new Date(idea.updated_at || idea.created_at || Date.now()),
      changeFrequency: 'weekly',
      priority: 0.8,
    }));

    return [...staticRoutes, ...ideaRoutes];
  } catch (err) {
    console.error('Error generating sitemap dynamic routes:', err);
    return staticRoutes;
  }
}
