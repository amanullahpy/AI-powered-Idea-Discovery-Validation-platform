'use client';

import { useState, useTransition, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  ArrowLeft,
  Bookmark,
  CheckCircle2,
  Clock,
  Coins,
  DollarSign,
  Globe,
  Layers,
  Lightbulb,
  Rocket,
  Share2,
  Sparkles,
  Target,
  Users,
} from 'lucide-react';
import { toggleSaveIdeaAction } from '@/data/ideas/actions';
import { createClient } from '@/supabase-clients/client';
import { toast } from 'sonner';

interface PublicIdeaViewProps {
  idea: any;
  isAuthenticated?: boolean;
  isSavedInitial?: boolean;
}

export function PublicIdeaView({
  idea,
  isAuthenticated = false,
  isSavedInitial = false,
}: PublicIdeaViewProps) {
  const [isSaved, setIsSaved] = useState(isSavedInitial);
  const [isAuth, setIsAuth] = useState(isAuthenticated);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    try {
      const supabase = createClient();
      supabase.auth.getUser().then(({ data }) => {
        if (data?.user) {
          setIsAuth(true);
        }
      });
    } catch {
      // offline / uninitialized
    }
  }, []);

  const mvpFeatures: string[] = Array.isArray(idea.mvp_features) ? idea.mvp_features : [];

  function handleSave() {
    if (!isAuth) {
      toast.info('Please sign in or create an account to save ideas to your workspace.');
      return;
    }

    startTransition(async () => {
      try {
        const res = await toggleSaveIdeaAction({ ideaId: idea.id });
        setIsSaved(res.data?.saved ?? !isSaved);
        toast.success(res.data?.saved ? 'Idea saved to your bookmarks!' : 'Idea removed from saved.');
      } catch (err: any) {
        toast.error(err.message || 'Failed to update saved status');
      }
    });
  }

  function handleShare() {
    if (typeof window !== 'undefined') {
      const url = window.location.href;
      if (navigator.share) {
        navigator.share({ title: idea.title, text: idea.short_description, url }).catch(() => {});
      } else if (navigator.clipboard) {
        navigator.clipboard.writeText(url);
        toast.success('Public link copied to clipboard!');
      }
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-8 px-4 sm:px-6">
      {/* Top Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button variant="ghost" size="sm" asChild className="-ml-2 text-muted-foreground hover:text-foreground">
          <Link href="/discover">
            <ArrowLeft className="size-4 mr-1.5" />
            Back to Discovery
          </Link>
        </Button>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSave}
            disabled={isPending}
            className={`text-xs h-9 ${isSaved ? 'text-primary border-primary/40' : ''}`}
          >
            <Bookmark className={`size-3.5 mr-1.5 ${isSaved ? 'fill-primary' : ''}`} />
            {isSaved ? 'Saved to Bookmarks' : 'Bookmark Idea'}
          </Button>

          <Button size="sm" onClick={handleShare} className="text-xs h-9 font-semibold">
            <Share2 className="size-3.5 mr-1.5" />
            Share Opportunity
          </Button>
        </div>
      </div>

      {/* Header Info */}
      <div className="space-y-3 border-b pb-6">
        <div className="flex flex-wrap items-center gap-2">
          {idea.categories && (
            <Badge variant="secondary" className="font-semibold text-xs">
              {idea.categories.name}
            </Badge>
          )}
          <Badge variant="outline" className="text-xs">
            {idea.difficulty}
          </Badge>
          {idea.ai_generated && (
            <Badge variant="outline" className="text-xs border-purple-500/20 bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center gap-1">
              <Sparkles className="size-3" />
              AI Synthesized
            </Badge>
          )}
          <Badge variant="outline" className="text-xs text-emerald-600 border-emerald-500/30 flex items-center gap-1">
            <Globe className="size-3" />
            Public Opportunity
          </Badge>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
          {idea.title}
        </h1>
        <p className="text-base sm:text-lg text-muted-foreground max-w-3xl leading-relaxed">
          {idea.short_description}
        </p>
      </div>

      {/* Key Quick Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <Card className="p-4">
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Coins className="size-3.5" />
            Estimated Capital
          </span>
          <span className="text-sm font-bold mt-1">{idea.estimated_cost || 'Lean bootstrap'}</span>
        </Card>
        <Card className="p-4">
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Clock className="size-3.5" />
            Timeline to MVP
          </span>
          <span className="text-sm font-bold mt-1">{idea.estimated_time || '2 - 4 weeks'}</span>
        </Card>
        <Card className="p-4 col-span-2 sm:col-span-1">
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Rocket className="size-3.5" />
            Execution Difficulty
          </span>
          <span className="text-sm font-bold mt-1">{idea.difficulty}</span>
        </Card>
      </div>

      {/* Problem & Solution Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Card className="border-rose-500/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Target className="size-4 text-rose-500" />
              The Customer Problem
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground leading-relaxed">
            {idea.problem}
          </CardContent>
        </Card>

        <Card className="border-emerald-500/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Lightbulb className="size-4 text-emerald-500" />
              The Proposed Solution
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground leading-relaxed">
            {idea.solution}
          </CardContent>
        </Card>
      </div>

      {/* Target Audience & Monetization */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="size-4 text-blue-500" />
              Target Audience & Ideal Customer
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground leading-relaxed">
            {idea.target_audience || 'General early adopters and niche operators.'}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <DollarSign className="size-4 text-emerald-500" />
              Monetization Model
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground leading-relaxed">
            {idea.monetization || 'Subscription / Transactional'}
          </CardContent>
        </Card>
      </div>

      {/* MVP Scope Checklist */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Layers className="size-4 text-primary" />
            Recommended Minimum Viable Product (MVP) Features
          </CardTitle>
          <CardDescription className="text-xs">
            Start small. These core capabilities validate demand before heavy development.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {mvpFeatures.length === 0 ? (
            <p className="text-sm text-muted-foreground">Standard lightweight web prototype.</p>
          ) : (
            <div className="space-y-2">
              {mvpFeatures.map((feat, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-sm p-2.5 rounded-lg bg-muted/40">
                  <CheckCircle2 className="size-4 text-emerald-500 mt-0.5 shrink-0" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Footer CTA */}
      <div className="rounded-xl border bg-primary/5 p-6 text-center space-y-3">
        <h3 className="font-bold text-lg">Inspired to build or tailor your own ideas?</h3>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          Sign up to save ideas, generate tailored concepts using AI, and run automated validation tests.
        </p>
        <div className="pt-2 flex justify-center gap-3">
          <Button asChild size="sm" className="font-semibold">
            <Link href="/sign-up">Create Free Account</Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href="/discover">Explore More Ideas</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
