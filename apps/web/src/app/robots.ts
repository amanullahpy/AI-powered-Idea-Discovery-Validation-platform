import type { MetadataRoute } from 'next';
import { siteConfig } from '@/config/site';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/discover', '/ideas/public/', '/about'],
        disallow: [
          '/dashboard/',
          '/onboarding/',
          '/settings/',
          '/ai/',
          '/ideas/',
          '/saved/',
          '/auth/',
          '/private-item/',
          '/private-items/',
          '/api/',
        ],
      },
    ],
    sitemap: `${siteConfig.url}/sitemap.xml`,
    host: siteConfig.url,
  };
}
