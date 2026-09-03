import type { LucideIcon } from 'lucide-react';
import {
  BookmarkCheck,
  BrainCircuit,
  Compass,
  Layers,
  ShieldCheck,
  Zap,
} from 'lucide-react';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { siteConfig } from '@/config/site';

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
}

const features: Feature[] = [
  {
    icon: Compass,
    title: 'Extensible Idea Taxonomy',
    description:
      'Database-driven categories spanning Micro-SaaS, AI agents, dev tools, e-commerce, and mobile apps with hierarchical tag filters.',
  },
  {
    icon: BrainCircuit,
    title: 'AI Ideation Co-pilot',
    description:
      'Gemini-powered brainstorming that responds to constraints, narrows down technical scope, and generates actionable MVP specs.',
  },
  {
    icon: ShieldCheck,
    title: 'Validation & Moat Audits',
    description:
      'Step-by-step checklist auditing market demand, competition risks, distribution channels, and defensible moats.',
  },
  {
    icon: Layers,
    title: 'Personalized Scoring',
    description:
      'Weighted recommendation engine aligning concepts with your specific programming skills, available hours, and budget.',
  },
  {
    icon: BookmarkCheck,
    title: 'Private Idea Cockpit',
    description:
      'Save, organize, track validation stages, and compare opportunities side-by-side backed by Supabase Row-Level Security.',
  },
  {
    icon: Zap,
    title: 'Modern Architecture',
    description:
      'Built on Next.js 16 App Router, Supabase Postgres, Tailwind CSS 4, and shadcn/ui for speed, security, and developer joy.',
  },
];

export function AboutFeaturesGrid() {
  return (
    <section className="space-y-10">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-sm font-semibold text-primary">Core Pillars</p>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
          Engineered for builders, indie hackers, and founders
        </h2>
        <p className="mt-4 leading-7 text-muted-foreground">
          Every tool inside {siteConfig.name} is designed to minimize risk and shorten the time from initial curiosity to shipping code.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {features.map((feature) => (
          <Card key={feature.title} className="border-border/70 shadow-none">
            <CardHeader className="space-y-4">
              <div className="flex size-10 items-center justify-center rounded-lg border bg-muted/50">
                <feature.icon className="size-5" aria-hidden="true" />
              </div>
              <CardTitle className="text-base">{feature.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="leading-6">
                {feature.description}
              </CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
