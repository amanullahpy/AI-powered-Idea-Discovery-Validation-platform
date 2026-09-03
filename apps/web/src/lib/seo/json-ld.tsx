import { siteConfig } from '@/config/site';

/**
 * Helper to render JSON-LD script tags safely
 */
export function JsonLd({ data }: { data: Record<string, any> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

/**
 * Generate Organization & WebSite structured data
 */
export function getWebsiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${siteConfig.url}/#organization`,
        name: siteConfig.name,
        url: siteConfig.url,
        logo: {
          '@type': 'ImageObject',
          url: `${siteConfig.url}/logos/ideaforge-logo.svg`,
        },
        sameAs: [siteConfig.links.github, siteConfig.links.twitter],
      },
      {
        '@type': 'WebSite',
        '@id': `${siteConfig.url}/#website`,
        url: siteConfig.url,
        name: siteConfig.name,
        description: siteConfig.description,
        publisher: {
          '@id': `${siteConfig.url}/#organization`,
        },
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: `${siteConfig.url}/discover?q={search_term_string}`,
          },
          'query-input': 'required name=search_term_string',
        },
      },
      {
        '@type': 'SoftwareApplication',
        name: siteConfig.name,
        operatingSystem: 'Any (Web)',
        applicationCategory: 'BusinessApplication',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
        },
        description: siteConfig.description,
      },
    ],
  };
}

/**
 * Generate BreadcrumbList structured data
 */
export function getBreadcrumbJsonLd(
  items: { name: string; url: string }[]
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `${siteConfig.url}${item.url}`,
    })),
  };
}

/**
 * Generate Structured Data for a Public Idea Blueprint
 */
export function getIdeaJsonLd(idea: any) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: idea.title,
    headline: idea.title,
    description: idea.short_description,
    abstract: idea.problem,
    genre: idea.categories?.name || 'Technology / Startup',
    keywords: [
      idea.categories?.name,
      idea.difficulty,
      'startup idea',
      'mvp blueprint',
      'business opportunity',
    ].filter(Boolean).join(', '),
    publisher: {
      '@type': 'Organization',
      name: siteConfig.name,
      url: siteConfig.url,
    },
    offers: idea.monetization
      ? {
          '@type': 'Offer',
          priceDescription: idea.monetization,
        }
      : undefined,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${siteConfig.url}/ideas/public/${idea.slug}`,
    },
  };
}
