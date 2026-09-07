'use client';

import React, { useState, useEffect, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  ShieldCheck,
  Swords,
  Sparkles,
  AlertTriangle,
  Plus,
  Trash2,
  TrendingDown,
  Loader2,
  Layers,
} from 'lucide-react';
import {
  type IdeaCompetitorRecord,
  getIdeaCompetitors,
  createIdeaCompetitorAction,
  deleteIdeaCompetitorAction,
  generateAICompetitorsAction,
} from '@/data/competitors/actions';
import { toast } from 'sonner';

export interface CompetitorEntry {
  id: string;
  name: string;
  category: string;
  pricingModel: string;
  strength: string;
  vulnerability: string;
  userComplaints: string;
}

interface CompetitorsViewProps {
  ideas: any[];
  initialCompetitors?: IdeaCompetitorRecord[];
}

function mapRecordToEntry(r: IdeaCompetitorRecord): CompetitorEntry {
  return {
    id: r.id,
    name: r.name,
    category: r.category || 'Competitor',
    pricingModel: r.pricing_model || 'Undisclosed',
    strength: r.strength || 'Established presence',
    vulnerability: r.vulnerability,
    userComplaints: r.user_complaints || 'Missing streamlined automation',
  };
}

const DEFAULT_SAMPLE_COMPETITORS: CompetitorEntry[] = [
  {
    id: 'comp-sample-1',
    name: 'Legacy Enterprise Incumbent',
    category: 'Enterprise Suite',
    pricingModel: '$12,000/yr annual contract + setup fees',
    strength: 'Deep corporate integrations, high brand awareness among Fortune 500 CIOs.',
    vulnerability: 'Clunky 2012 UI, 6-week onboarding cycle, mandates sales call demos.',
    userComplaints: 'Overwhelming feature bloat, difficult configuration, no self-serve onboarding.',
  },
  {
    id: 'comp-sample-2',
    name: 'Generic Point Tool',
    category: 'Horizontal SaaS',
    pricingModel: '$29/mo seat-based tiering',
    strength: 'Clean modern interface, easy self-serve sign up.',
    vulnerability: 'Horizontal solution that lacks specialized vertical workflows and domain terminology.',
    userComplaints: 'Too generic; requires hours of manual customization to fit specific niche industry rules.',
  },
  {
    id: 'comp-sample-3',
    name: 'Manual Spreadsheets & Agencies',
    category: 'Status Quo',
    pricingModel: 'Internal labor cost ($50/hr internal employee time)',
    strength: '100% custom, zero upfront software approval required.',
    vulnerability: 'Error-prone, completely non-scalable, breaks when employees leave.',
    userComplaints: 'Endless copy-pasting between tabs, broken formulas, and zero automated notifications.',
  },
];

export function CompetitorsView({ ideas, initialCompetitors = [] }: CompetitorsViewProps) {
  const router = useRouter();
  const [selectedIdeaId, setSelectedIdeaId] = useState<string>(
    ideas.length > 0 ? ideas[0].id : ''
  );

  const selectedIdea = ideas.find((i) => i.id === selectedIdeaId) || ideas[0];
  const [isPending, startTransition] = useTransition();
  const [isAiScanning, setIsAiScanning] = useState(false);

  const [competitors, setCompetitors] = useState<CompetitorEntry[]>(() => {
    if (initialCompetitors && initialCompetitors.length > 0) {
      return initialCompetitors.map(mapRecordToEntry);
    }
    return DEFAULT_SAMPLE_COMPETITORS;
  });

  // Re-fetch competitors when selected idea changes
  useEffect(() => {
    if (!selectedIdeaId) return;
    startTransition(async () => {
      try {
        const records = await getIdeaCompetitors(selectedIdeaId);
        if (records.length > 0) {
          setCompetitors(records.map(mapRecordToEntry));
        } else {
          setCompetitors([]);
        }
      } catch (e) {
        console.error('Failed to load competitors:', e);
      }
    });
  }, [selectedIdeaId]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newCompName, setNewCompName] = useState('');
  const [newCompCategory, setNewCompCategory] = useState('Horizontal SaaS');
  const [newCompPricing, setNewCompPricing] = useState('');
  const [newCompStrength, setNewCompStrength] = useState('');
  const [newCompVuln, setNewCompVuln] = useState('');
  const [newCompComplaints, setNewCompComplaints] = useState('');

  function handleAddCompetitor(e: React.FormEvent) {
    e.preventDefault();
    if (!newCompName.trim() || !newCompVuln.trim()) {
      toast.error('Please enter competitor name and key vulnerability.');
      return;
    }
    if (!selectedIdea?.id) {
      toast.error('Please select an idea first.');
      return;
    }

    startTransition(async () => {
      try {
        const res = await createIdeaCompetitorAction({
          ideaId: selectedIdea.id,
          name: newCompName.trim(),
          category: newCompCategory.trim() || undefined,
          pricingModel: newCompPricing.trim() || undefined,
          strength: newCompStrength.trim() || undefined,
          vulnerability: newCompVuln.trim(),
          userComplaints: newCompComplaints.trim() || undefined,
        });

        if (res?.data) {
          const entry = mapRecordToEntry(res.data as any);
          setCompetitors((prev) => [entry, ...prev]);
          setNewCompName('');
          setNewCompPricing('');
          setNewCompStrength('');
          setNewCompVuln('');
          setNewCompComplaints('');
          setShowAddForm(false);
          toast.success('Competitor profile saved to database!');
        } else if (res?.serverError) {
          toast.error(res.serverError);
        }
      } catch (err: any) {
        toast.error(err?.message || 'Failed to save competitor.');
      }
    });
  }

  function handleDeleteCompetitor(id: string) {
    // If it's a sample card not in DB, remove locally
    if (id.startsWith('comp-sample')) {
      setCompetitors((prev) => prev.filter((c) => c.id !== id));
      toast.success('Competitor removed');
      return;
    }

    startTransition(async () => {
      try {
        const res = await deleteIdeaCompetitorAction({ competitorId: id });
        if (res?.data?.success) {
          setCompetitors((prev) => prev.filter((c) => c.id !== id));
          toast.success('Competitor deleted from database.');
        } else if (res?.serverError) {
          toast.error(res.serverError);
        }
      } catch (err: any) {
        toast.error(err?.message || 'Failed to delete competitor.');
      }
    });
  }

  async function handleAiAutoScan() {
    if (!selectedIdea?.id) {
      toast.error('Please select an idea first.');
      return;
    }

    setIsAiScanning(true);
    toast.loading('Analyzing market incumbents & asymmetric attack vectors...', { id: 'comp-scan' });

    try {
      const res = await generateAICompetitorsAction({ ideaId: selectedIdea.id });
      if (res?.data?.success && res.data.competitors?.length) {
        const newEntries = res.data.competitors.map(mapRecordToEntry);
        setCompetitors((prev) => [
          ...newEntries,
          ...prev.filter((c) => !c.id.startsWith('comp-sample')),
        ]);
        toast.success(`Discovered ${newEntries.length} competitor teardowns!`, { id: 'comp-scan' });
      } else if (res?.serverError) {
        toast.error(res.serverError, { id: 'comp-scan' });
      } else {
        toast.info('Scan complete.', { id: 'comp-scan' });
      }
    } catch (err: any) {
      toast.error(err?.message || 'Failed to scan competitors.', { id: 'comp-scan' });
    } finally {
      setIsAiScanning(false);
    }
  }

  function launchMoatTeardown(compName: string) {
    const prompt = `Perform a deep competitive teardown between my idea "${selectedIdea?.title || 'this venture'}" and the competitor "${compName}". Identify 3 asymmetric advantages where my lean software can outperform them for our ICP.`;
    router.push(`/ai?prompt=${encodeURIComponent(prompt)}`);
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="rounded-2xl border bg-gradient-to-br from-card via-card to-primary/5 p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider">
            <Swords className="size-4 text-amber-500" />
            <span>Competitive Asymmetry & Defensive Moats</span>
          </div>

          {ideas.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground hidden sm:inline">Compare for Idea:</span>
              <select
                value={selectedIdeaId}
                onChange={(e) => setSelectedIdeaId(e.target.value)}
                className="bg-background border rounded-lg px-3 py-1.5 text-xs text-foreground font-semibold focus:ring-1 focus:ring-primary focus:outline-none"
              >
                {ideas.map((idea) => (
                  <option key={idea.id} value={idea.id}>
                    {idea.title}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="max-w-3xl space-y-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Competitor Intelligence & Defensive Moats
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Uncover incumbent vulnerabilities, pricing blindspots, and user pain points. 
            Build an asymmetric competitive wedge that makes your product impossible to ignore.
          </p>
        </div>

        {/* 5 Moat Pillars Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 text-xs">
          <div className="p-2.5 rounded-lg border bg-card/60 space-y-0.5">
            <span className="text-[10px] text-muted-foreground font-medium">SPEED TO VALUE</span>
            <span className="font-bold text-foreground block">3-Minute Setup</span>
          </div>
          <div className="p-2.5 rounded-lg border bg-card/60 space-y-0.5">
            <span className="text-[10px] text-muted-foreground font-medium">PRICING WEDGE</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400 block">Self-Serve / No Sales</span>
          </div>
          <div className="p-2.5 rounded-lg border bg-card/60 space-y-0.5">
            <span className="text-[10px] text-muted-foreground font-medium">NICHE SPECIALIZATION</span>
            <span className="font-bold text-primary block">100% Vertical Fit</span>
          </div>
          <div className="p-2.5 rounded-lg border bg-card/60 space-y-0.5">
            <span className="text-[10px] text-muted-foreground font-medium">DISTRIBUTION MOAT</span>
            <span className="font-bold text-amber-500 block">Organic / Embedded</span>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-base font-bold text-foreground">Competitor Matrix</h2>
          <p className="text-xs text-muted-foreground">
            {competitors.length} key competitor categories identified.
            {isPending && <span className="ml-2 text-primary animate-pulse">(Updating...)</span>}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            disabled={isAiScanning || !selectedIdea?.id}
            onClick={handleAiAutoScan}
            className="h-8 text-xs font-semibold gap-1.5 border-primary/30 hover:border-primary/60 bg-primary/5 hover:bg-primary/10 text-primary shadow-2xs"
          >
            {isAiScanning ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Sparkles className="size-3.5 text-primary" />
            )}
            <span>{isAiScanning ? 'Scanning...' : '⚡ AI Scan Incumbents'}</span>
          </Button>

          <Button
            size="sm"
            onClick={() => setShowAddForm(!showAddForm)}
            className="h-8 text-xs font-semibold gap-1.5 shadow-2xs"
          >
            <Plus className="size-3.5" />
            <span>Add Competitor</span>
          </Button>
        </div>
      </div>

      {/* ADD COMPETITOR FORM */}
      {showAddForm && (
        <Card className="border-primary/40 bg-card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-foreground">Analyze New Competitor</h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAddForm(false)}
              className="h-6 text-xs text-muted-foreground"
            >
              Cancel
            </Button>
          </div>

          <form onSubmit={handleAddCompetitor} className="space-y-3 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="font-semibold text-foreground">Competitor Name</label>
                <Input
                  placeholder="e.g. Acme Software Co"
                  value={newCompName}
                  onChange={(e) => setNewCompName(e.target.value)}
                  className="h-8 text-xs"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-foreground">Category</label>
                <Input
                  placeholder="e.g. Enterprise Legacy / Point Solution"
                  value={newCompCategory}
                  onChange={(e) => setNewCompCategory(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-foreground">Pricing Tier</label>
                <Input
                  placeholder="e.g. $99/mo or Annual Only"
                  value={newCompPricing}
                  onChange={(e) => setNewCompPricing(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-semibold text-foreground">Their Perceived Strength</label>
                <textarea
                  rows={2}
                  placeholder="What makes them difficult to dislodge?"
                  value={newCompStrength}
                  onChange={(e) => setNewCompStrength(e.target.value)}
                  className="w-full bg-background border rounded-md p-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                />
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-foreground">Their Critical Vulnerability</label>
                <textarea
                  rows={2}
                  placeholder="What is their architectural or pricing Achilles heel?"
                  value={newCompVuln}
                  onChange={(e) => setNewCompVuln(e.target.value)}
                  className="w-full bg-background border rounded-md p-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-foreground">Common User Complaints (G2 / Reddit / Twitter)</label>
              <textarea
                rows={2}
                placeholder="What do customers repeatedly criticize about their experience?"
                value={newCompComplaints}
                onChange={(e) => setNewCompComplaints(e.target.value)}
                className="w-full bg-background border rounded-md p-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <Button type="submit" size="sm" className="h-8 text-xs font-semibold">
                Save Competitor Profile
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Competitor Cards Grid */}
      {competitors.length === 0 ? (
        <div className="rounded-xl border border-dashed p-10 text-center space-y-3 bg-muted/10">
          <Layers className="size-10 text-muted-foreground mx-auto opacity-50" />
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-foreground">No Competitors Logged Yet</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              Scan existing enterprise incumbents and status-quo alternatives using AI, or manually log your competitor profiles.
            </p>
          </div>
          <div className="pt-2 flex justify-center gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={isAiScanning || !selectedIdea?.id}
              onClick={handleAiAutoScan}
              className="text-xs font-semibold gap-1.5"
            >
              <Sparkles className="size-3.5 text-primary" />
              <span>⚡ AI Auto-Scan Incumbents</span>
            </Button>
            <Button
              size="sm"
              onClick={() => setShowAddForm(true)}
              className="text-xs font-semibold gap-1.5"
            >
              <Plus className="size-3.5" />
              <span>Add Competitor</span>
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {competitors.map((comp) => (
          <Card
            key={comp.id}
            className="flex flex-col border shadow-2xs hover:shadow-md transition-all bg-card overflow-hidden"
          >
            <CardHeader className="p-5 pb-3 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <Badge variant="secondary" className="text-[10px]">
                  {comp.category}
                </Badge>
                <button
                  type="button"
                  onClick={() => handleDeleteCompetitor(comp.id)}
                  className="p-1 hover:text-destructive text-muted-foreground rounded transition-colors"
                  title="Remove competitor"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>

              <CardTitle className="text-base font-bold text-foreground">
                {comp.name}
              </CardTitle>
              <CardDescription className="text-xs">
                Pricing: {comp.pricingModel}
              </CardDescription>
            </CardHeader>

            <CardContent className="p-5 pt-0 space-y-3 flex-1 text-xs">
              <div className="space-y-1 p-2.5 rounded-lg bg-muted/20 border">
                <span className="font-semibold text-foreground flex items-center gap-1 text-[11px]">
                  <ShieldCheck className="size-3 text-emerald-500" />
                  Their Strength:
                </span>
                <p className="text-muted-foreground text-[11px] leading-relaxed">
                  {comp.strength}
                </p>
              </div>

              <div className="space-y-1 p-2.5 rounded-lg bg-destructive/5 border border-destructive/20 text-destructive-foreground">
                <span className="font-semibold flex items-center gap-1 text-[11px] text-destructive">
                  <AlertTriangle className="size-3 text-destructive" />
                  Your Asymmetric Attack Vector:
                </span>
                <p className="text-muted-foreground text-[11px] leading-relaxed">
                  {comp.vulnerability}
                </p>
              </div>

              <div className="space-y-1 p-2.5 rounded-lg bg-muted/20 border">
                <span className="font-semibold text-foreground flex items-center gap-1 text-[11px]">
                  <TrendingDown className="size-3 text-amber-500" />
                  Common User Complaints:
                </span>
                <p className="text-muted-foreground text-[11px] leading-relaxed">
                  {comp.userComplaints}
                </p>
              </div>
            </CardContent>

            <CardFooter className="p-4 pt-2 border-t bg-muted/10">
              <Button
                size="sm"
                variant="outline"
                onClick={() => launchMoatTeardown(comp.name)}
                className="w-full text-xs font-semibold gap-1.5"
              >
                <Sparkles className="size-3.5 text-primary" />
                <span>AI Teardown & Moat Strategy</span>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
      )}
    </div>
  );
}
