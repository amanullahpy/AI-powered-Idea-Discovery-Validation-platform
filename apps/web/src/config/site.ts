/**
 * Centralized Site & Brand Configuration
 * 
 * Edit this file to update the platform brand name, tagline, descriptions,
 * navigation, and social links across the entire application.
 */

export const siteConfig = {
  // Brand Identity
  name: 'IdeaForge',
  shortName: 'IdeaForge',
  tagline: 'AI Idea Discovery & Validation',
  description:
    'An AI-powered discovery and validation platform to explore profitable SaaS, startup, mobile, and side hustle concepts tailored to your skills, budget, and timeline.',

  // Domain & URLs
  url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  ogImage: '/og-image.png',

  // Author & Contact
  author: 'IdeaForge Team',
  creator: 'IdeaForge',
  supportEmail: 'support@ideaforge.ai',

  // Social & Community Links
  links: {
    github: 'https://github.com/imbhargav5/nextbase-nextjs-supabase-starter',
    twitter: 'https://twitter.com',
    discord: 'https://discord.gg',
  },

  // Main Public Navigation Menu
  navigation: [
    { href: '/', label: 'Home' },
    { href: '/discover', label: 'Discover' },
    { href: '/ai', label: 'AI Co-pilot' },
    { href: '/about', label: 'About' },
  ],

  // Footer Configuration
  footer: {
    tagline: 'Discover, validate, and launch your next high-conviction idea.',
    copyright: `© ${new Date().getFullYear()} IdeaForge. All rights reserved.`,
    badge: 'Next.js 16 · Supabase · shadcn/ui',
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
