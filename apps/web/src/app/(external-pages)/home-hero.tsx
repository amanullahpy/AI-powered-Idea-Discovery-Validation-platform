import {
  ArrowRight,
  Check,
  Github,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export function HomeHero() {
  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,var(--color-muted),transparent_45%)]" />
      <div className="mx-auto grid max-w-7xl items-center gap-14 px-4 py-20 sm:px-6 sm:py-28 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-32">
        <div className="max-w-2xl space-y-7">
          <Badge variant="secondary" className="gap-1.5 rounded-full px-3 py-1">
            <Sparkles className="size-3.5 text-primary" aria-hidden="true" />
            AI-Powered Idea Discovery & Validation
          </Badge>
          <div className="space-y-5">
            <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-6xl lg:text-7xl">
              Discover, Validate & Launch Your Next Big Idea.
            </h1>
            <p className="max-w-xl text-pretty text-lg leading-8 text-muted-foreground">
              Discover opportunities tailored to your skills, budget, and schedule.
              Brainstorm with conversational AI co-pilots, validate market friction,
              and build your MVP faster.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/discover">
                Discover Ideas
                <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/ai">
                <Sparkles className="size-4 mr-1.5 text-primary" />
                Launch AI Co-pilot
              </Link>
            </Button>
          </div>
          <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
            {['15+ Categories', 'Personalized Match Engine', 'MVP Blueprints', 'Private by Default'].map((item) => (
              <span key={item} className="flex items-center gap-1.5">
                <Check className="size-3.5 text-foreground" aria-hidden="true" />
                {item}
              </span>
            ))}
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-xl">
          <div className="absolute -inset-8 -z-10 rounded-full bg-muted/70 blur-3xl" />
          <Card className="overflow-hidden border-border/70 shadow-xl shadow-foreground/5">
            <CardHeader className="border-b bg-muted/30 pb-3">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <Badge variant="secondary" className="text-xs font-semibold">AI Products</Badge>
                    <Badge variant="outline" className="text-xs border-emerald-500/30 text-emerald-600 dark:text-emerald-400">Beginner</Badge>
                  </div>
                  <CardTitle className="text-base sm:text-lg font-bold">ContractLens: AI Agreement Scanner</CardTitle>
                </div>
                <Badge variant="default" className="gap-1 bg-primary text-xs shrink-0">
                  <Sparkles className="size-3" />
                  94% Match
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-5 space-y-3 text-xs">
              <p className="text-muted-foreground text-xs leading-relaxed">
                Automated clause-by-clause risk auditing and hidden fee detector for SMB vendor contracts with pre-built red-lining.
              </p>
              <div className="grid grid-cols-2 gap-2 text-muted-foreground p-2 rounded-lg bg-muted/40">
                <div><strong>Est. Capital:</strong> $50 - $250</div>
                <div><strong>Timeline:</strong> 2 - 3 weeks</div>
              </div>
              <div className="space-y-1.5 pt-1">
                <span className="font-semibold text-foreground">MVP Launch Features:</span>
                <div className="space-y-1 text-muted-foreground">
                  <div className="flex items-center gap-1.5">✓ PDF contract drag-and-drop parser</div>
                  <div className="flex items-center gap-1.5">✓ Risk scoring engine with auto-renewal alerts</div>
                  <div className="flex items-center gap-1.5">✓ Exportable negotiation counter-proposals</div>
                </div>
              </div>
              <div className="pt-2 flex items-center justify-between border-t border-border/50">
                <span className="text-[11px] text-muted-foreground">Monetization: $29/scan or $79/mo</span>
                <Button size="sm" asChild className="h-7 text-xs font-semibold">
                  <Link href="/discover">View Blueprint</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
