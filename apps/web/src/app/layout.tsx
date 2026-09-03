import '@/styles/globals.css';
import localFont from 'next/font/local';
import type { Metadata } from 'next';
import { DynamicLayoutProviders } from './DynamicLayoutProviders';
import { ClientLayout } from './ClientLayout';
import { siteConfig } from '@/config/site';
import { JsonLd, getWebsiteJsonLd } from '@/lib/seo/json-ld';

const inter = localFont({
  src: [
    { path: '../../node_modules/@fontsource/inter/files/inter-latin-400-normal.woff2', weight: '400', style: 'normal' },
    { path: '../../node_modules/@fontsource/inter/files/inter-latin-500-normal.woff2', weight: '500', style: 'normal' },
    { path: '../../node_modules/@fontsource/inter/files/inter-latin-600-normal.woff2', weight: '600', style: 'normal' },
    { path: '../../node_modules/@fontsource/inter/files/inter-latin-700-normal.woff2', weight: '700', style: 'normal' },
  ],
  variable: '--font-inter',
  display: 'swap',
});

const robotoMono = localFont({
  src: [
    { path: '../../node_modules/@fontsource/roboto-mono/files/roboto-mono-latin-400-normal.woff2', weight: '400', style: 'normal' },
    { path: '../../node_modules/@fontsource/roboto-mono/files/roboto-mono-latin-700-normal.woff2', weight: '700', style: 'normal' },
  ],
  variable: '--font-roboto-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} — ${siteConfig.tagline}`,
    template: `%s · ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  authors: [{ name: siteConfig.author, url: siteConfig.url }],
  creator: siteConfig.creator,
  publisher: siteConfig.name,
  category: 'business & technology',
  keywords: [
    'AI startup ideas',
    'idea validation',
    'SaaS opportunities',
    'micro-saas',
    'AI agents',
    'business idea discovery',
    'indie hackers',
    'startup MVP blueprints',
    'founder validation checklists',
    'market research co-pilot',
  ],
  alternates: {
    canonical: siteConfig.url,
  },
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: '32x32' },
    ],
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: `${siteConfig.name} — ${siteConfig.tagline}`,
    description: siteConfig.description,
    url: siteConfig.url,
    siteName: siteConfig.name,
    locale: 'en_US',
    images: [
      {
        url: `${siteConfig.url}${siteConfig.ogImage}`,
        width: 1200,
        height: 630,
        alt: `${siteConfig.name} Logo & Platform Preview`,
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: `${siteConfig.name} — ${siteConfig.tagline}`,
    description: siteConfig.description,
    images: [`${siteConfig.url}${siteConfig.ogImage}`],
    creator: '@ideaforge',
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      className={`${inter.variable} ${robotoMono.variable}`}
    >
      <head>
        <JsonLd data={getWebsiteJsonLd()} />
      </head>
      <body>
        <DynamicLayoutProviders>
          <ClientLayout>
            {children}
          </ClientLayout>
        </DynamicLayoutProviders>
      </body>
    </html>
  );
}
