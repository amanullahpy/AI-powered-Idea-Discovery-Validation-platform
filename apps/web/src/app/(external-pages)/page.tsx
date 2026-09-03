import { Separator } from '@/components/ui/separator';
import {
  BookmarkCheck,
  CheckCircle2,
  Code2,
  Compass,
  Sliders,
  Sparkles,
} from 'lucide-react';
import { HomeCTA } from './home-cta';
import { HomeFeatures, type HomeFeature } from './home-features';
import { HomeHero } from './home-hero';

const features: HomeFeature[] = [
  {
    icon: Compass,
    title: '15+ Idea Categories',
    description:
      'Explore database-backed opportunities spanning Micro-SaaS, AI Agents, Developer Tools, Mobile Apps, FYPs, and Side Hustles.',
  },
  {
    icon: Sliders,
    title: 'Personalized Match Engine',
    description:
      'Match scores dynamically rank concepts according to your programming skills, available hours, capital budget, and timeline.',
  },
  {
    icon: Sparkles,
    title: 'AI Idea Co-pilot',
    description:
      'Brainstorm in real-time with an AI co-pilot. Refine monetization models, pivot angles, and reduce scope down to rapid MVPs.',
  },
  {
    icon: CheckCircle2,
    title: 'Validation & Moat Audits',
    description:
      'Audit market demand, pinpoint competitor weaknesses, check unit economics, and test hypotheses before building.',
  },
  {
    icon: Code2,
    title: 'Actionable MVP Blueprints',
    description:
      'Detailed launch specifications with proposed tech stacks, core features, ideal customer profiles, and pricing tiers.',
  },
  {
    icon: BookmarkCheck,
    title: 'Private Idea Cockpit',
    description:
      'Organize your favorites, track validation progress, take notes, and compare concepts side-by-side with full RLS privacy.',
  },
];

export default function HomePage() {
  return (
    <div>
      <HomeHero />
      <Separator />
      <HomeFeatures features={features} />
      <div className="border-t bg-muted/10">
        <HomeCTA />
      </div>
    </div>
  );
}
