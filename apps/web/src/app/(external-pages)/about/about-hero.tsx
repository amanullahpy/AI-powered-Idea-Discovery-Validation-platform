import { ArrowRight, Compass, Sparkles } from 'lucide-react';
import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { siteConfig } from '@/config/site';

export function AboutHero() {
  return (
    <section className="mx-auto max-w-3xl py-10 text-center sm:py-16">
      <Badge variant="secondary" className="gap-1.5 rounded-full px-3 py-1">
        <Sparkles className="size-3.5 text-primary" aria-hidden="true" />
        About {siteConfig.name}
      </Badge>
      <h1 className="mt-6 text-balance text-4xl font-semibold tracking-tight sm:text-6xl">
        Built to help founders build things people actually want
      </h1>
      <p className="mx-auto mt-5 max-w-2xl text-pretty text-lg leading-8 text-muted-foreground">
        {siteConfig.name} brings together personalized opportunity matching,
        conversational AI idea generation, and structured market validation to turn
        curiosity into high-conviction startups and side hustles.
      </p>
      <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        <Button size="lg" asChild>
          <Link href="/discover">
            <Compass className="size-4 mr-1.5" aria-hidden="true" />
            Discover Ideas
          </Link>
        </Button>
        <Button size="lg" variant="outline" asChild>
          <Link href="/ai">
            <Sparkles className="size-4 mr-1.5 text-primary" />
            Try AI Co-pilot
          </Link>
        </Button>
      </div>
    </section>
  );
}
