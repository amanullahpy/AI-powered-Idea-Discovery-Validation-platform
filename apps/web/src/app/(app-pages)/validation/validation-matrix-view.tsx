'use client';

import React, { useState, useEffect, useTransition } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Target,
  Users,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  Sparkles,
  Coins,
  ExternalLink,
  Zap,
} from 'lucide-react';
import {
  type IdeaInterviewRecord,
  type IdeaExperimentRecord,
  createIdeaInterviewAction,
  deleteIdeaInterviewAction,
  createIdeaExperimentAction,
  updateIdeaExperimentStatusAction,
  getIdeaInterviews,
  getIdeaExperiments,
} from '@/data/validation/actions';
import { toast } from 'sonner';

interface ValidationMatrixViewProps {
  ideas: any[];
  initialInterviews: IdeaInterviewRecord[];
  initialExperiments: IdeaExperimentRecord[];
}

export function ValidationMatrixView({
  ideas,
  initialInterviews,
  initialExperiments,
}: ValidationMatrixViewProps) {
  const [selectedIdeaId, setSelectedIdeaId] = useState<string>(
    ideas.length > 0 ? ideas[0].id : ''
  );

  const selectedIdea = ideas.find((i) => i.id === selectedIdeaId) || ideas[0];
  const [interviews, setInterviews] = useState<IdeaInterviewRecord[]>(initialInterviews);
  const [experiments, setExperiments] = useState<IdeaExperimentRecord[]>(initialExperiments);
  const [isPending, startTransition] = useTransition();

  // Form states for Interview
  const [newInterviewName, setNewInterviewName] = useState('');
  const [newInterviewRole, setNewInterviewRole] = useState('');
  const [newInterviewChannel, setNewInterviewChannel] = useState('LinkedIn DM');
  const [newInterviewPain, setNewInterviewPain] = useState(8);
  const [newInterviewWTP, setNewInterviewWTP] = useState('$29/mo');
  const [newInterviewQuote, setNewInterviewQuote] = useState('');
  const [newInterviewVerdict, setNewInterviewVerdict] = useState<'Validated' | 'Neutral' | 'Invalidated'>('Validated');
  const [showInterviewForm, setShowInterviewForm] = useState(false);

  // Form states for Experiment
  const [showExpForm, setShowExpForm] = useState(false);
  const [newExpTitle, setNewExpTitle] = useState('');
  const [newExpType, setNewExpType] = useState('Smoke Test Landing Page');
  const [newExpMetric, setNewExpMetric] = useState('');

  // When selected idea changes, load interviews & experiments from DB
  useEffect(() => {
    if (!selectedIdeaId) return;
    startTransition(async () => {
      try {
        const [fetchedInterviews, fetchedExperiments] = await Promise.all([
          getIdeaInterviews(selectedIdeaId),
          getIdeaExperiments(selectedIdeaId),
        ]);
        setInterviews(fetchedInterviews);
        setExperiments(fetchedExperiments);
      } catch (e) {
        console.error('Failed to load validation data:', e);
      }
    });
  }, [selectedIdeaId]);

  function handleAddInterview(e: React.FormEvent) {
    e.preventDefault();
    if (!newInterviewName.trim() || !newInterviewQuote.trim()) {
      toast.error('Please enter interviewee name and key quote.');
      return;
    }
    if (!selectedIdea?.id) {
      toast.error('No idea selected');
      return;
    }

    startTransition(async () => {
      try {
        const res = await createIdeaInterviewAction({
          ideaId: selectedIdea.id,
          name: newInterviewName.trim(),
          role: newInterviewRole.trim() || undefined,
          companyOrChannel: newInterviewChannel.trim() || undefined,
          painScore: Number(newInterviewPain),
          willingnessToPay: newInterviewWTP.trim() || undefined,
          keyQuote: newInterviewQuote.trim(),
          verdict: newInterviewVerdict,
        });

        if (res.data) {
          setInterviews((prev) => [res.data as any, ...prev]);
          setNewInterviewName('');
          setNewInterviewRole('');
          setNewInterviewQuote('');
          setShowInterviewForm(false);
          toast.success('Interview logged and synced to database!');
        }
      } catch (err: any) {
        toast.error(err.message || 'Failed to save interview.');
      }
    });
  }

  function handleDeleteInterview(id: string) {
    startTransition(async () => {
      try {
        await deleteIdeaInterviewAction({ interviewId: id });
        setInterviews((prev) => prev.filter((i) => i.id !== id));
        toast.success('Interview removed from database');
      } catch (err: any) {
        toast.error(err.message || 'Failed to delete interview');
      }
    });
  }

  function handleAddExperiment(e: React.FormEvent) {
    e.preventDefault();
    if (!newExpTitle.trim() || !newExpMetric.trim()) {
      toast.error('Please enter experiment title and target metric.');
      return;
    }
    if (!selectedIdea?.id) return;

    startTransition(async () => {
      try {
        const res = await createIdeaExperimentAction({
          ideaId: selectedIdea.id,
          title: newExpTitle.trim(),
          experimentType: newExpType,
          targetMetric: newExpMetric.trim(),
          currentResult: 'Pending execution',
          status: 'In Progress',
        });

        if (res.data) {
          setExperiments((prev) => [res.data as any, ...prev]);
          setNewExpTitle('');
          setNewExpMetric('');
          setShowExpForm(false);
          toast.success('Experiment created and synced to database!');
        }
      } catch (err: any) {
        toast.error(err.message || 'Failed to create experiment.');
      }
    });
  }

  function handleToggleExpStatus(exp: IdeaExperimentRecord) {
    const nextStatus = exp.status === 'Completed' ? 'In Progress' : 'Completed';
    startTransition(async () => {
      try {
        await updateIdeaExperimentStatusAction({
          experimentId: exp.id,
          status: nextStatus,
        });
        setExperiments((prev) =>
          prev.map((e) => (e.id === exp.id ? { ...e, status: nextStatus } : e))
        );
        toast.success(`Experiment marked as ${nextStatus}`);
      } catch (err: any) {
        toast.error(err.message || 'Failed to update experiment');
      }
    });
  }

  // Calculate readiness score
  const validatedCount = interviews.filter((i) => i.verdict === 'Validated').length;
  const interviewScore = Math.min(Math.round((validatedCount / 5) * 50), 50);
  const experimentScore = Math.min(experiments.filter((e) => e.status === 'Completed').length * 25, 50);
  const readinessScore = Math.min(interviewScore + experimentScore, 100);

  return (
    <div className="space-y-8 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="rounded-2xl border bg-gradient-to-br from-card via-card to-primary/5 p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider">
            <Target className="size-4 text-emerald-500" />
            <span>Customer Discovery & Evidence</span>
          </div>

          {/* Idea Selector Dropdown */}
          {ideas.length > 0 && (
            <div className="flex items-center gap-2 max-w-full">
              <span className="text-xs text-muted-foreground hidden sm:inline shrink-0">Active Idea:</span>
              <select
                value={selectedIdeaId}
                onChange={(e) => setSelectedIdeaId(e.target.value)}
                className="bg-background border rounded-lg px-2.5 py-1.5 text-xs text-foreground font-semibold focus:ring-1 focus:ring-primary focus:outline-none max-w-[200px] xs:max-w-[260px] sm:max-w-xs truncate"
              >
                {ideas.map((idea) => (
                  <option key={idea.id} value={idea.id}>
                    {idea.title} ({idea.status || 'DRAFT'})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="max-w-3xl space-y-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Validation Matrix & Experiments Hub
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Never build in the dark. Systematically log customer discovery interviews, run smoke-test experiments, 
            and quantify real willingness to pay before writing production code.
          </p>
        </div>

        {/* Readiness Bar */}
        <div className="pt-2 max-w-xl space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="flex items-center gap-1.5 flex-wrap">
              <span>Overall Validation Readiness</span>
              <Badge
                variant="outline"
                className={`text-[10px] ${
                  readinessScore >= 70
                    ? 'text-emerald-500 border-emerald-500/30 bg-emerald-500/5'
                    : 'text-amber-500 border-amber-500/30 bg-amber-500/5'
                }`}
              >
                {readinessScore >= 70 ? 'High Confidence (Build Ready)' : 'Requires More Evidence'}
              </Badge>
            </span>
            <span className="text-primary font-bold">{readinessScore}%</span>
          </div>
          <Progress value={readinessScore} className="h-2" />
        </div>
      </div>

      {selectedIdea ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT 2 COLS: Interviews & Experiments */}
          <div className="lg:col-span-2 space-y-6 min-w-0">
            <Tabs defaultValue="interviews" className="space-y-4">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <TabsList className="h-9 w-full sm:w-auto p-0.5">
                  <TabsTrigger value="interviews" className="flex-1 sm:flex-initial text-xs gap-1.5 px-2 sm:px-3">
                    <Users className="size-3.5" />
                    <span>Interviews ({interviews.length})</span>
                  </TabsTrigger>
                  <TabsTrigger value="experiments" className="flex-1 sm:flex-initial text-xs gap-1.5 px-2 sm:px-3">
                    <Zap className="size-3.5" />
                    <span>Smoke Tests ({experiments.length})</span>
                  </TabsTrigger>
                </TabsList>

                <div className="flex items-center gap-2 self-stretch sm:self-auto">
                  <Button
                    size="sm"
                    onClick={() => setShowInterviewForm(!showInterviewForm)}
                    className="flex-1 sm:flex-initial h-8 text-xs font-semibold gap-1.5 shadow-2xs"
                  >
                    <Plus className="size-3.5" />
                    <span>Log Interview</span>
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowExpForm(!showExpForm)}
                    className="flex-1 sm:flex-initial h-8 text-xs font-semibold gap-1.5"
                  >
                    <Plus className="size-3.5" />
                    <span>New Test</span>
                  </Button>
                </div>
              </div>

              {/* LOG INTERVIEW FORM */}
              {showInterviewForm && (
                <Card className="border-primary/40 bg-card shadow-sm p-4 sm:p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-foreground">Log Customer Discovery Call</h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowInterviewForm(false)}
                      className="h-6 text-xs text-muted-foreground"
                    >
                      Cancel
                    </Button>
                  </div>

                  <form onSubmit={handleAddInterview} className="space-y-3 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <label className="font-semibold text-foreground">Interviewee Name</label>
                        <Input
                          placeholder="e.g. Alex Rivera"
                          value={newInterviewName}
                          onChange={(e) => setNewInterviewName(e.target.value)}
                          className="h-8 text-xs"
                          required
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="font-semibold text-foreground">Role / Title</label>
                        <Input
                          placeholder="e.g. Agency Owner"
                          value={newInterviewRole}
                          onChange={(e) => setNewInterviewRole(e.target.value)}
                          className="h-8 text-xs"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="font-semibold text-foreground">Channel</label>
                        <Input
                          placeholder="e.g. LinkedIn DM / Reddit"
                          value={newInterviewChannel}
                          onChange={(e) => setNewInterviewChannel(e.target.value)}
                          className="h-8 text-xs"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <label className="font-semibold text-foreground">Pain Severity (1-10)</label>
                        <Input
                          type="number"
                          min={1}
                          max={10}
                          value={newInterviewPain}
                          onChange={(e) => setNewInterviewPain(Number(e.target.value))}
                          className="h-8 text-xs"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="font-semibold text-foreground">Willingness to Pay</label>
                        <Input
                          placeholder="e.g. $49/mo, $200 deposit"
                          value={newInterviewWTP}
                          onChange={(e) => setNewInterviewWTP(e.target.value)}
                          className="h-8 text-xs"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="font-semibold text-foreground">Verdict</label>
                        <select
                          value={newInterviewVerdict}
                          onChange={(e) => setNewInterviewVerdict(e.target.value as any)}
                          className="w-full h-8 bg-background border rounded-md px-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                        >
                          <option value="Validated">Validated Pain</option>
                          <option value="Neutral">Neutral / Lukewarm</option>
                          <option value="Invalidated">Invalidated / No Pain</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="font-semibold text-foreground">Key Unfiltered Quote</label>
                      <textarea
                        rows={2}
                        placeholder="What exact words did they use to describe their biggest frustration?"
                        value={newInterviewQuote}
                        onChange={(e) => setNewInterviewQuote(e.target.value)}
                        className="w-full bg-background border rounded-md p-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                        required
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-1">
                      <Button type="submit" size="sm" disabled={isPending} className="h-8 text-xs font-semibold">
                        {isPending ? 'Saving...' : 'Save Discovery Entry'}
                      </Button>
                    </div>
                  </form>
                </Card>
              )}

              {/* NEW EXPERIMENT FORM */}
              {showExpForm && (
                <Card className="border-primary/40 bg-card shadow-sm p-4 sm:p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-foreground">Launch Smoke-Test Experiment</h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowExpForm(false)}
                      className="h-6 text-xs text-muted-foreground"
                    >
                      Cancel
                    </Button>
                  </div>

                  <form onSubmit={handleAddExperiment} className="space-y-3 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="font-semibold text-foreground">Experiment Title</label>
                        <Input
                          placeholder="e.g. Waitlist Smoke Test Page"
                          value={newExpTitle}
                          onChange={(e) => setNewExpTitle(e.target.value)}
                          className="h-8 text-xs"
                          required
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="font-semibold text-foreground">Experiment Type</label>
                        <select
                          value={newExpType}
                          onChange={(e) => setNewExpType(e.target.value)}
                          className="w-full h-8 bg-background border rounded-md px-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                        >
                          <option value="Smoke Test Landing Page">Smoke Test Landing Page</option>
                          <option value="Cold Outreach">Cold Outreach (LinkedIn/Email)</option>
                          <option value="Concierge MVP">Concierge MVP (Manual service)</option>
                          <option value="Community Post">Community Post (Reddit/Discord)</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="font-semibold text-foreground">Target Success Metric</label>
                      <Input
                        placeholder="e.g. 15% conversion rate on 200 visitors, or 3 deposit pre-orders"
                        value={newExpMetric}
                        onChange={(e) => setNewExpMetric(e.target.value)}
                        className="h-8 text-xs"
                        required
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-1">
                      <Button type="submit" size="sm" disabled={isPending} className="h-8 text-xs font-semibold">
                        {isPending ? 'Saving...' : 'Add Experiment'}
                      </Button>
                    </div>
                  </form>
                </Card>
              )}

              {/* TAB CONTENT: INTERVIEWS */}
              <TabsContent value="interviews" className="space-y-3 m-0">
                {interviews.length === 0 ? (
                  <Card className="p-8 text-center text-xs text-muted-foreground space-y-2 border-dashed">
                    <Users className="size-8 mx-auto opacity-30 stroke-[1.5]" />
                    <p className="font-semibold text-foreground">No customer interviews logged yet for this idea.</p>
                    <p className="max-w-sm mx-auto">
                      Talk to 5 prospective users before writing code to confirm they actively search for a solution.
                    </p>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setShowInterviewForm(true)}
                      className="mt-2 text-xs"
                    >
                      Log your first call
                    </Button>
                  </Card>
                ) : (
                  interviews.map((item) => (
                    <Card key={item.id} className="p-4 border bg-card shadow-2xs space-y-2.5">
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-foreground text-sm">{item.name}</span>
                            {item.role && (
                              <Badge variant="secondary" className="text-[10px]">
                                {item.role}
                              </Badge>
                            )}
                            {item.company_or_channel && (
                              <span className="text-[10px] text-muted-foreground">via {item.company_or_channel}</span>
                            )}
                          </div>
                          <span className="text-[10px] text-muted-foreground">
                            Logged on {new Date(item.created_at).toLocaleDateString()}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className={`text-[10px] ${
                              item.verdict === 'Validated'
                                ? 'text-emerald-500 border-emerald-500/30 bg-emerald-500/5'
                                : item.verdict === 'Neutral'
                                ? 'text-amber-500 border-amber-500/30'
                                : 'text-destructive border-destructive/30'
                            }`}
                          >
                            {item.verdict}
                          </Badge>
                          <button
                            type="button"
                            onClick={() => handleDeleteInterview(item.id)}
                            className="p-1 hover:text-destructive text-muted-foreground rounded transition-colors"
                            title="Delete entry"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        </div>
                      </div>

                      <blockquote className="p-2.5 rounded-lg bg-muted/30 border text-xs text-muted-foreground italic leading-relaxed">
                        "{item.key_quote}"
                      </blockquote>

                      <div className="flex items-center justify-between flex-wrap gap-2 text-[11px] pt-1 border-t text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <AlertCircle className="size-3 text-amber-500 shrink-0" />
                          <span>Pain Severity: <strong className="text-foreground">{item.pain_score} / 10</strong></span>
                        </span>
                        <span className="flex items-center gap-1">
                          <Coins className="size-3 text-emerald-500 shrink-0" />
                          <span>Validated WTP: <strong className="text-foreground">{item.willingness_to_pay || 'Unspecified'}</strong></span>
                        </span>
                      </div>
                    </Card>
                  ))
                )}
              </TabsContent>

              {/* TAB CONTENT: EXPERIMENTS */}
              <TabsContent value="experiments" className="space-y-3 m-0">
                {experiments.length === 0 ? (
                  <Card className="p-8 text-center text-xs text-muted-foreground space-y-2 border-dashed">
                    <Zap className="size-8 mx-auto opacity-30 stroke-[1.5]" />
                    <p className="font-semibold text-foreground">No smoke-test experiments added yet.</p>
                    <p className="max-w-sm mx-auto">
                      Formulate a 72-hour smoke-test to test conversion rates before writing code.
                    </p>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setShowExpForm(true)}
                      className="mt-2 text-xs"
                    >
                      Create First Test
                    </Button>
                  </Card>
                ) : (
                  experiments.map((exp) => (
                    <Card key={exp.id} className="p-4 border bg-card shadow-2xs space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <span className="font-bold text-sm text-foreground">{exp.title}</span>
                          <div className="text-[11px] text-muted-foreground">{exp.experiment_type}</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleToggleExpStatus(exp)}
                          className="cursor-pointer"
                          title="Click to toggle status"
                        >
                          <Badge
                            variant={exp.status === 'Completed' ? 'default' : 'secondary'}
                            className="text-[10px]"
                          >
                            {exp.status}
                          </Badge>
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                        <div className="p-2 rounded-lg bg-muted/30 border space-y-0.5">
                          <span className="text-[10px] text-muted-foreground block">TARGET METRIC</span>
                          <span className="font-medium text-foreground">{exp.target_metric}</span>
                        </div>
                        <div className="p-2 rounded-lg bg-muted/30 border space-y-0.5">
                          <span className="text-[10px] text-muted-foreground block">ACTUAL RESULT</span>
                          <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                            {exp.current_result || 'In progress'}
                          </span>
                        </div>
                      </div>
                    </Card>
                  ))
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* RIGHT COL: Idea Specs & Next Validation Milestone */}
          <div className="space-y-5">
            <Card className="border bg-card p-5 space-y-4">
              <div className="space-y-1">
                <Badge variant="outline" className="text-[10px] uppercase font-bold">
                  {selectedIdea.difficulty || 'Intermediate'}
                </Badge>
                <h3 className="text-base font-bold text-foreground leading-snug">
                  {selectedIdea.title}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {selectedIdea.short_description || selectedIdea.problem}
                </p>
              </div>

              <div className="space-y-2 text-xs border-t pt-3">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Target ICP:</span>
                  <span className="font-semibold text-foreground text-right max-w-[180px] truncate">
                    {selectedIdea.target_audience || 'Early Adopters'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Monetization:</span>
                  <span className="font-semibold text-foreground text-right max-w-[180px] truncate">
                    {selectedIdea.monetization || 'Subscription'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Est. MVP Timeline:</span>
                  <span className="font-semibold text-foreground">
                    {selectedIdea.estimated_time || '2 - 3 weeks'}
                  </span>
                </div>
              </div>

              <div className="pt-2 space-y-2">
                <Button size="sm" variant="outline" asChild className="w-full text-xs font-semibold gap-1.5">
                  <Link href={`/ideas/${selectedIdea.id}`}>
                    <span>Open Idea Cockpit</span>
                    <ExternalLink className="size-3" />
                  </Link>
                </Button>
                <Button size="sm" asChild className="w-full text-xs font-semibold gap-1.5 shadow-2xs">
                  <Link href={`/ai?prompt=${encodeURIComponent(`Help me formulate a step-by-step customer discovery script to validate my idea: "${selectedIdea.title}"`)}`}>
                    <Sparkles className="size-3.5" />
                    <span>Generate Discovery Script</span>
                  </Link>
                </Button>
              </div>
            </Card>

            {/* Validation Playbook Tip */}
            <Card className="p-4 border border-primary/20 bg-primary/5 space-y-2 text-xs">
              <span className="font-semibold text-foreground flex items-center gap-1.5">
                <CheckCircle2 className="size-3.5 text-primary" />
                The 5-Call Rule
              </span>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                If 4 out of 5 prospective users describe the exact same manual bottleneck without leading questions, 
                you have verified strong problem-market resonance.
              </p>
            </Card>
          </div>
        </div>
      ) : (
        <Card className="p-12 text-center text-muted-foreground space-y-3">
          <Target className="size-10 mx-auto opacity-30 stroke-[1.5]" />
          <h3 className="text-base font-bold text-foreground">No Ideas to Validate Yet</h3>
          <p className="text-xs max-w-sm mx-auto">
            Generate your first concept with AI Co-pilot or browse discovered ideas to begin structured validation.
          </p>
          <Button size="sm" asChild className="mt-2 text-xs">
            <Link href="/ai">Launch AI Co-pilot</Link>
          </Button>
        </Card>
      )}
    </div>
  );
}
