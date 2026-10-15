/**
 * Centralized Site & Brand Configuration
 * 
 * Edit this file to update the platform brand name, tagline, descriptions,
 * navigation, and social links across the entire application.
 */

import { clientEnv } from './env';
import { DEFAULT_SITE_URL, PRODUCT_NAME } from '@/constants';

export const siteConfig = {
  // Brand Identity
  name: PRODUCT_NAME,
  shortName: PRODUCT_NAME,
  tagline: 'AI-Powered Idea Discovery & Validation',
  description:
    'Discover high-conviction startup, SaaS, AI agent, and side hustle concepts tailored to your skills, budget, and timeline. Validate market demand, audit competitors, and build your MVP faster.',

  // Domain & URLs
  url: (() => {
    const configured =
      clientEnv.NEXT_PUBLIC_SITE_URL ||
      (clientEnv.NEXT_PUBLIC_VERCEL_URL
        ? 'https://' + clientEnv.NEXT_PUBLIC_VERCEL_URL
        : DEFAULT_SITE_URL);
    return configured.startsWith('http://') || configured.startsWith('https://')
      ? configured
      : 'https://' + configured;
  })(),
  ogImage: '/logos/ideaforge-logo.svg',

  // Author & Contact
  author: 'IdeaForge Team',
  creator: 'IdeaForge',
  supportEmail: 'support@ideaforge.ai',

  // Social & Community Links
  links: {
    github: 'https://github.com/amanullahpy/AI-powered-Idea-Discovery-Validation-platform',
    twitter: 'https://twitter.com',
    discord: 'https://discord.gg',
  },

  // Main Public Navigation Menu
  navigation: [
    { href: '/', label: 'Home' },
    { href: '/discover', label: 'Discover Ideas' },
    { href: '/ai', label: 'AI Co-pilot' },
    { href: '/about', label: 'About' },
  ],

  // Footer Configuration
  footer: {
    tagline: 'Discover, validate, and launch your next high-conviction idea.',
    copyright: `© ${new Date().getFullYear()} IdeaForge. All rights reserved.`,
    badge: 'Powered by Next.js 16 · Supabase · AI Co-pilot',
  },

  // Feature Flags
  features: {
    enableAIGeneration: true,
    enablePublicDiscovery: true,
    enablePersonalization: true,
    enableValidationAudit: true,
  },
} as const;

export type SiteConfig = typeof siteConfig;
