'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { IdeaCard, type IdeaItem } from '@/components/ideas/idea-card';
import {
  ArrowRight,
  Bookmark,
  Compass,
  Hammer,
  Lightbulb,
  Rocket,
  Search,
  ShieldCheck,
  Sliders,
  Sparkles,
  Target,
  TrendingUp,
  Zap,
} from 'lucide-react';

interface ScoredIdea extends IdeaItem {
  matchScore: number;
  matchReasons: string[];
}

interface DashboardViewProps {
  userName: string;
  onboardingCompleted: boolean;
  userStats: {
    totalIdeas: number;
    savedIdeas: number;
    buildingIdeas: number;
    aiIdeas: number;
  };
  scoredIdeas: ScoredIdea[];
  savedIdeaIds: string[];
}

const POPULAR_PROMPTS = [
  'B2B SaaS tool I can build in 2 weeks',
  'AI workflow tool for students',
  'Low-risk side hustle under $100',
  'Micro developer tool for Next.js',
];

export function DashboardView({
  userName,
  onboardingCompleted,
  userStats,
  scoredIdeas,
  savedIdeaIds,
}: DashboardViewProps) {
  const router = useRouter();
  const [promptInput, setPromptInput] = useState('');

  function handlePromptSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!promptInput.trim()) {
      router.push('/ai');
      return;
    }
    router.push(`/ai?prompt=${encodeURIComponent(promptInput.trim())}`);
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Onboarding Reminder Banner (if not yet completed) */}
      {!onboardingCompleted && (
        <Card className="border-primary/30 bg-primary/5 shadow-none">
          <CardContent className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge variant="default" className="text-xs">Setup</Badge>
                <span className="font-semibold text-sm">Personalize Your Idea Engine</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Complete our 2-minute questionnaire to unlock personalized match scores and curated ideas tailored to your budget & skills.
              </p>
            </div>
            <Button size="sm" asChild className="shrink-0 font-semibold text-xs">
              <Link href="/onboarding">
                Personalize Now
                <ArrowRight className="size-3.5 ml-1.5" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Hero Header & AI Prompt Launcher */}
      <div className="rounded-2xl border bg-gradient-to-br from-card via-card to-primary/5 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="max-w-2xl space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider">
            <Sparkles className="size-4" />
            AI Venture Co-pilot
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            What would you like to build{userName ? `, ${userName}` : ''}?
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Describe a market, problem, or project idea. Our AI will analyze customer friction, monetization, and generate an actionable blueprint.
          </p>
        </div>

        {/* Search / AI Launch Form */}
        <form onSubmit={handlePromptSubmit} className="flex flex-col sm:flex-row gap-2 max-w-2xl">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              value={promptInput}
              onChange={(e) => setPromptInput(e.target.value)}
              placeholder="Tell me what you're looking for (e.g. 'SaaS tool for freelance designers')..."
              className="pl-10 h-11 text-sm bg-background"
            />
          </div>
          <Button type="submit" className="h-11 px-6 font-semibold gap-2 shrink-0 w-full sm:w-auto">
            <Sparkles className="size-4" />
            Launch AI Chat
          </Button>
        </form>

        {/* Quick Suggestion Chips */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
          <span className="text-muted-foreground text-[11px] font-medium mr-1">Quick Ideas:</span>
          {POPULAR_PROMPTS.map((prompt, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => router.push(`/ai?prompt=${encodeURIComponent(prompt)}`)}
              className="px-2.5 py-1 rounded-full border bg-background hover:bg-accent text-muted-foreground hover:text-foreground transition-colors text-xs"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Quick Metrics Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">My Ideas</span>
            <Lightbulb className="size-4 text-primary" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold">{userStats.totalIdeas}</div>
            <p className="text-[11px] text-muted-foreground mt-0.5">Created or generated</p>
          </div>
        </Card>

        <Card className="p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Saved Bookmarks</span>
            <Bookmark className="size-4 text-amber-500" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold">{userStats.savedIdeas}</div>
            <p className="text-[11px] text-muted-foreground mt-0.5">Bookmarked for later</p>
          </div>
        </Card>

        <Card className="p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">In Building</span>
            <Hammer className="size-4 text-emerald-500" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold">{userStats.buildingIdeas}</div>
            <p className="text-[11px] text-muted-foreground mt-0.5">Active projects</p>
          </div>
        </Card>

        <Card className="p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">AI Syntheses</span>
            <Zap className="size-4 text-purple-500" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold">{userStats.aiIdeas}</div>
            <p className="text-[11px] text-muted-foreground mt-0.5">Assisted blueprints</p>
          </div>
        </Card>
      </div>

      {/* Venture Acceleration Suite */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          href="/trends"
          className="p-4 rounded-xl border bg-card hover:bg-muted/40 hover:border-primary/40 transition-all space-y-2 group shadow-2xs"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="size-4 text-emerald-500" />
              <span className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">
                Market Trends Radar
              </span>
            </div>
            <ArrowRight className="size-3.5 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
          </div>
          <p className="text-xs text-muted-foreground">
            Explore fast-growing niches (+240% YoY) and find unsolved customer friction.
          </p>
        </Link>

        <Link
          href="/validation"
          className="p-4 rounded-xl border bg-card hover:bg-muted/40 hover:border-primary/40 transition-all space-y-2 group shadow-2xs"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="size-4 text-blue-500" />
              <span className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">
                Validation Experiments
              </span>
            </div>
            <ArrowRight className="size-3.5 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
          </div>
          <p className="text-xs text-muted-foreground">
            Log customer discovery calls, run smoke tests, and measure real willingness-to-pay.
          </p>
        </Link>

        <Link
          href="/competitors"
          className="p-4 rounded-xl border bg-card hover:bg-muted/40 hover:border-primary/40 transition-all space-y-2 group shadow-2xs"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="size-4 text-amber-500" />
              <span className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">
                Competitor Moats
              </span>
            </div>
            <ArrowRight className="size-3.5 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
          </div>
          <p className="text-xs text-muted-foreground">
            Deconstruct incumbent weaknesses, pricing gaps, and build your asymmetric moat.
          </p>
        </Link>
      </div>

      {/* "Ideas Picked For You" Section */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
              <Sparkles className="size-5 text-primary" />
              Ideas Picked For You
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Ranked and scored based on your skills, experience, budget, and time availability.
            </p>
          </div>
          <Button variant="ghost" size="sm" asChild className="text-xs font-medium">
            <Link href="/discover">
              View All
              <ArrowRight className="size-3.5 ml-1" />
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {scoredIdeas.slice(0, 6).map((idea) => (
            <IdeaCard
              key={idea.id}
              idea={idea}
              matchScore={idea.matchScore}
              matchReasons={idea.matchReasons}
              isSavedInitial={savedIdeaIds.includes(idea.id)}
            />
          ))}
        </div>
      </div>

      {/* Quick Launchpad Navigation */}
      <div className="rounded-xl border p-6 bg-muted/20 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <h3 className="font-semibold text-sm">Want to refine your recommendation criteria?</h3>
          <p className="text-xs text-muted-foreground">
            Update your interested categories, skills, or available hours to surface different opportunities.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2">
          <Button variant="outline" size="sm" asChild className="text-xs">
            <Link href="/settings">
              <Sliders className="size-3.5 mr-1.5" />
              Tune Preferences
            </Link>
          </Button>
          <Button size="sm" asChild className="text-xs font-semibold">
            <Link href="/discover">
              <Compass className="size-3.5 mr-1.5" />
              Browse Directory
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
