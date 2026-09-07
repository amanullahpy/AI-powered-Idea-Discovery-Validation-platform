'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  ChevronDown,
  Clock,
  Coins,
  DollarSign,
  ExternalLink,
  Globe,
  Layers,
  Lightbulb,
  LockKeyhole,
  Rocket,
  Share2,
  Sparkles,
  Target,
  Users,
} from 'lucide-react';
import { updateIdeaVisibilityAction, updateIdeaStatusAction, validateIdeaAction } from '@/data/ideas/actions';
import { IdeaExporter } from '@/components/ideas/idea-exporter';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';

interface IdeaCockpitProps {
  idea: any;
}

export function IdeaCockpit({ idea }: IdeaCockpitProps) {
  const [visibility, setVisibility] = useState(idea.visibility);
  const [status, setStatus] = useState(idea.status);
  const [validationReport, setValidationReport] = useState<any>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [completedMilestones, setCompletedMilestones] = useState<Record<number, boolean>>({});
  const [isPending, startTransition] = useTransition();

  const mvpFeatures: string[] = Array.isArray(idea.mvp_features) ? idea.mvp_features : [];

  function handleRunValidation() {
    setIsValidating(true);
    startTransition(async () => {
      try {
        const res = await validateIdeaAction({ ideaId: idea.id });
        if (res.data) {
          setValidationReport(res.data);
          toast.success('AI Validation Feasibility Report generated!');
        }
      } catch (err: any) {
        toast.error(err.message || 'Failed to run validation');
      } finally {
        setIsValidating(false);
      }
    });
  }

  function handleVisibilityChange(newVis: 'PRIVATE' | 'PUBLIC' | 'UNLISTED') {
    startTransition(async () => {
      try {
        await updateIdeaVisibilityAction({ id: idea.id, visibility: newVis });
        setVisibility(newVis);
        toast.success(`Idea visibility set to ${newVis.toLowerCase()}`);
      } catch (err: any) {
        toast.error(err.message || 'Failed to update visibility');
      }
    });
  }

  function handleStatusChange(newStatus: 'DRAFT' | 'SAVED' | 'VALIDATING' | 'BUILDING' | 'LAUNCHED' | 'ARCHIVED') {
    startTransition(async () => {
      try {
        await updateIdeaStatusAction({ id: idea.id, status: newStatus });
        setStatus(newStatus);
        toast.success(`Lifecycle status updated to ${newStatus.toLowerCase()}`);
      } catch (err: any) {
        toast.error(err.message || 'Failed to update status');
      }
    });
  }

  function handleShare() {
    const url = `${window.location.origin}/ideas/public/${idea.slug}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      toast.success('Public link copied to clipboard!');
    }
  }

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Back button & Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <Button variant="ghost" size="sm" asChild className="-ml-2 text-muted-foreground hover:text-foreground">
          <Link href="/ideas">
            <ArrowLeft className="size-4 mr-1.5" />
            Back to My Ideas
          </Link>
        </Button>

        <div className="flex items-center gap-2">
          {/* Visibility Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" disabled={isPending} className="text-xs h-8">
                {visibility === 'PUBLIC' && <Globe className="size-3.5 mr-1.5 text-emerald-500" />}
                {visibility === 'PRIVATE' && <LockKeyhole className="size-3.5 mr-1.5 text-muted-foreground" />}
                {visibility}
                <ChevronDown className="size-3 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleVisibilityChange('PRIVATE')}>
                <LockKeyhole className="size-3.5 mr-2" />
                Private (Only you)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleVisibilityChange('PUBLIC')}>
                <Globe className="size-3.5 mr-2 text-emerald-500" />
                Public (Discoverable by everyone)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleVisibilityChange('UNLISTED')}>
                <ExternalLink className="size-3.5 mr-2 text-blue-500" />
                Unlisted (Link access only)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Status Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" disabled={isPending} className="text-xs h-8">
                Status: {status}
                <ChevronDown className="size-3 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {['DRAFT', 'SAVED', 'VALIDATING', 'BUILDING', 'LAUNCHED', 'ARCHIVED'].map((s) => (
                <DropdownMenuItem key={s} onClick={() => handleStatusChange(s as any)}>
                  {s}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Idea Exporter */}
          <IdeaExporter idea={idea} className="h-8 text-xs font-semibold" />

          {(visibility === 'PUBLIC' || visibility === 'UNLISTED') && (
            <Button size="sm" variant="default" onClick={handleShare} className="h-8 text-xs font-semibold">
              <Share2 className="size-3.5 mr-1.5" />
              Share Link
            </Button>
          )}
        </div>
      </div>

      {/* Idea Header Title & Badges */}
      <div className="space-y-2 border-b pb-6">
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
              AI Generated
            </Badge>
          )}
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
          {idea.title}
        </h1>
        <p className="text-base text-muted-foreground max-w-3xl leading-relaxed">
          {idea.short_description}
        </p>
      </div>

      {/* Key Metrics Quick Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-4 flex flex-col justify-between">
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Coins className="size-3.5" />
            Estimated Cost
          </span>
          <span className="text-sm font-bold mt-1">{idea.estimated_cost || 'N/A'}</span>
        </Card>
        <Card className="p-4 flex flex-col justify-between">
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Clock className="size-3.5" />
            Time to Build
          </span>
          <span className="text-sm font-bold mt-1">{idea.estimated_time || 'N/A'}</span>
        </Card>
        <Card className="p-4 flex flex-col justify-between">
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Rocket className="size-3.5" />
            Difficulty
          </span>
          <span className="text-sm font-bold mt-1">{idea.difficulty}</span>
        </Card>
        <Card className="p-4 flex flex-col justify-between">
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Calendar className="size-3.5" />
            Created
          </span>
          <span className="text-sm font-bold mt-1">
            {new Date(idea.created_at).toLocaleDateString()}
          </span>
        </Card>
      </div>

      {/* Cockpit Tabs */}
      <Tabs defaultValue="blueprint" className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="blueprint" className="text-xs">
            Blueprint & MVP
          </TabsTrigger>
          <TabsTrigger value="monetization" className="text-xs">
            Audience & Revenue
          </TabsTrigger>
          <TabsTrigger value="validation" className="text-xs">
            Validation & Roadmap
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Blueprint */}
        <TabsContent value="blueprint" className="space-y-4 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Target className="size-4 text-rose-500" />
                  The Problem
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground leading-relaxed">
                {idea.problem || 'No specific problem description documented yet.'}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Lightbulb className="size-4 text-amber-500" />
                  The Proposed Solution
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground leading-relaxed">
                {idea.solution || 'No specific solution documented yet.'}
              </CardContent>
            </Card>
          </div>

          {/* MVP Features */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Layers className="size-4 text-primary" />
                Minimum Viable Product (MVP) Scope
              </CardTitle>
              <CardDescription className="text-xs">
                Key capabilities required to launch and validate this opportunity.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {mvpFeatures.length === 0 ? (
                <p className="text-sm text-muted-foreground">No MVP features defined yet.</p>
              ) : (
                <div className="space-y-2">
                  {mvpFeatures.map((feat, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-sm p-2 rounded-lg bg-muted/40">
                      <CheckCircle2 className="size-4 text-emerald-500 mt-0.5 shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Monetization & Audience */}
        <TabsContent value="monetization" className="space-y-4 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Users className="size-4 text-blue-500" />
                  Target Customer & Audience
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground leading-relaxed">
                {idea.target_audience || 'No target audience profile specified.'}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <DollarSign className="size-4 text-emerald-500" />
                  Monetization & Pricing Strategy
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground leading-relaxed">
                {idea.monetization || 'No monetization model specified.'}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab 3: Validation & Roadmap */}
        <TabsContent value="validation" className="space-y-4 mt-6">
          <Card>
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  <Sparkles className="size-4 text-primary" />
                  AI Feasibility & Validation Report
                </CardTitle>
                <CardDescription className="text-xs">
                  Automated market friction, risk analysis, and 30-day execution roadmap.
                </CardDescription>
              </div>
              <Button
                size="sm"
                onClick={handleRunValidation}
                disabled={isValidating}
                className="text-xs font-semibold"
              >
                <Sparkles className="size-3.5 mr-1.5" />
                {isValidating ? 'Analyzing...' : 'Run Feasibility Audit'}
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {validationReport ? (
                <div className="space-y-4 pt-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3.5 rounded-lg border bg-card space-y-1">
                      <span className="text-xs font-bold text-foreground">Problem Urgency & Willingness to Pay</span>
                      <p className="text-xs text-muted-foreground">{validationReport.problemStrength}</p>
                    </div>
                    <div className="p-3.5 rounded-lg border bg-card space-y-1">
                      <span className="text-xs font-bold text-foreground">Competitive Landscape</span>
                      <p className="text-xs text-muted-foreground">{validationReport.competitionRisk}</p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-lg border bg-rose-500/5 border-rose-500/20 space-y-1">
                    <span className="text-xs font-bold text-rose-600 dark:text-rose-400">Primary Execution Risk</span>
                    <p className="text-xs text-muted-foreground">{validationReport.keyRiskFactor}</p>
                  </div>

                  <div className="space-y-2">
                    <span className="text-xs font-bold text-foreground">Recommended Next Steps:</span>
                    <div className="space-y-1">
                      {validationReport.recommendedNextSteps?.map((step: string, i: number) => (
                        <div key={i} className="text-xs text-muted-foreground p-2 rounded bg-muted/40">
                          {step}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-foreground">30-Day Launch Roadmap</span>
                      <span className="text-xs font-medium text-muted-foreground">
                        {Object.values(completedMilestones).filter(Boolean).length} of {validationReport.thirtyDayRoadmap?.length || 0} completed
                      </span>
                    </div>
                    {validationReport.thirtyDayRoadmap?.length > 0 && (
                      <Progress
                        value={Math.round(
                          (Object.values(completedMilestones).filter(Boolean).length /
                            validationReport.thirtyDayRoadmap.length) *
                            100
                        )}
                        className="h-2"
                      />
                    )}
                    <div className="space-y-2 pt-1">
                      {validationReport.thirtyDayRoadmap?.map((week: string, i: number) => {
                        const isDone = !!completedMilestones[i];
                        return (
                          <div
                            key={i}
                            onClick={() =>
                              setCompletedMilestones((prev) => ({
                                ...prev,
                                [i]: !prev[i],
                              }))
                            }
                            className={`flex items-start gap-2.5 text-xs p-3 rounded-lg border cursor-pointer transition-all ${
                              isDone
                                ? 'bg-emerald-500/5 border-emerald-500/30 text-foreground'
                                : 'bg-card hover:bg-accent/40 text-muted-foreground border-border'
                            }`}
                          >
                            <div className="mt-0.5 shrink-0">
                              <CheckCircle2
                                className={`size-4 transition-colors ${
                                  isDone ? 'text-emerald-500 fill-emerald-500/20' : 'text-muted-foreground/40'
                                }`}
                              />
                            </div>
                            <span className={isDone ? 'line-through text-muted-foreground' : 'text-foreground'}>
                              {week}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="p-3.5 rounded-lg border bg-muted/30 space-y-1">
                    <h4 className="font-semibold text-xs uppercase tracking-wider text-foreground">
                      1. Customer Problem Discovery
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      Interview 5-10 people in your target audience. Confirm whether this problem causes measurable friction or loss of money.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-lg border bg-muted/30 space-y-1">
                    <h4 className="font-semibold text-xs uppercase tracking-wider text-foreground">
                      2. Smoke Test / Pre-Launch Page
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      Build a high-converting waitlist page describing the core value proposition. Measure email signup conversion.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-lg border bg-muted/30 space-y-1">
                    <h4 className="font-semibold text-xs uppercase tracking-wider text-foreground">
                      3. Paid Commitment / LOI
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      Ask target users to pre-order or sign a non-binding Letter of Intent before building custom infrastructure.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
