import { ArrowRight, Compass, Sparkles } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { siteConfig } from '@/config/site';

export function HomeCTA() {
  return (
    <section className="px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
      <Card className="mx-auto max-w-5xl overflow-hidden border-border/70 bg-muted/30 shadow-none">
        <CardContent className="flex flex-col items-start gap-8 p-8 sm:p-12 md:flex-row md:items-center md:justify-between">
          <div className="flex max-w-2xl gap-4">
            <div className="hidden size-11 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground sm:flex">
              <Sparkles className="size-5" aria-hidden="true" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                Ready to find your next breakthrough idea?
              </h2>
              <p className="leading-7 text-muted-foreground">
                Join founders, creators, and builders uncovering validated SaaS, AI tool, and side hustle concepts customized to their exact background on {siteConfig.name}.
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
            <Button asChild size="lg">
              <Link href="/discover">
                <Compass className="size-4 mr-1.5" aria-hidden="true" />
                Discover Ideas
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/sign-up">
                Get Started Free
                <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
