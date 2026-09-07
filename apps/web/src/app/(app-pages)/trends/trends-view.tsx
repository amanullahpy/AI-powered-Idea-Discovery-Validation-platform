'use client';

import React, { useState, useMemo, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  TrendingUp,
  Search,
  Sparkles,
  ArrowUpRight,
  ShieldAlert,
  Target,
  Bookmark,
  RefreshCw,
  Radio,
} from 'lucide-react';
import {
  type MarketTrendRecord,
  toggleBookmarkTrendAction,
  refreshMarketTrendsAction,
} from '@/data/trends/actions';
import { toast } from 'sonner';

const CATEGORIES = [
  'All Trends',
  'AI & Agents',
  'B2B SaaS',
  'Fintech',
  'Dev Tools',
  'Local Commerce',
  'Climate Tech',
] as const;

interface TrendsViewProps {
  initialTrends: MarketTrendRecord[];
  initialBookmarkedIds: string[];
}

export function TrendsView({ initialTrends, initialBookmarkedIds }: TrendsViewProps) {
  const router = useRouter();
  const [trends, setTrends] = useState<MarketTrendRecord[]>(initialTrends);
  const [selectedCategory, setSelectedCategory] = useState<string>('All Trends');
  const [searchQuery, setSearchQuery] = useState('');
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>(initialBookmarkedIds);
  const [isScanning, startScanTransition] = useTransition();

  const filteredTrends = useMemo(() => {
    return trends.filter((trend) => {
      const matchesCategory =
        selectedCategory === 'All Trends' || trend.category === selectedCategory;
      const matchesSearch =
        !searchQuery.trim() ||
        trend.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        trend.overview.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (trend.target_audience && trend.target_audience.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [trends, selectedCategory, searchQuery]);

  function handleToggleBookmark(trendId: string) {
    const isCurrentlyBookmarked = bookmarkedIds.includes(trendId);
    setBookmarkedIds((prev) =>
      isCurrentlyBookmarked ? prev.filter((id) => id !== trendId) : [...prev, trendId]
    );

    startScanTransition(async () => {
      try {
        const res = await toggleBookmarkTrendAction({ trendId });
        if (res.data?.bookmarked) {
          toast.success('Trend pinned to your watch-list');
        } else {
          toast.info('Trend removed from watch-list');
        }
      } catch (err: any) {
        toast.error(err.message || 'Failed to update bookmark');
      }
    });
  }

  function handleLiveScan() {
    startScanTransition(async () => {
      try {
        toast.loading('Scanning market signals and web feeds...', { id: 'scan-toast' });
        const res = await refreshMarketTrendsAction({
          focusCategory: selectedCategory === 'All Trends' ? undefined : selectedCategory,
        });

        if (res.data?.trend) {
          const newTrend: MarketTrendRecord = {
            id: `temp_${Date.now()}`,
            title: res.data.trend.title,
            slug: res.data.trend.title.toLowerCase().replace(/[^a-z0-9]/g, '-'),
            category: res.data.trend.category,
            growth_rate: res.data.trend.growth_rate,
            signal_strength: res.data.trend.signal_strength,
            opportunity_score: res.data.trend.opportunity_score,
            competition_density: res.data.trend.competition_density,
            target_audience: res.data.trend.target_audience,
            overview: res.data.trend.overview,
            unsolved_pains: res.data.trend.unsolved_pains || [],
            whitespace_moat: res.data.trend.whitespace_moat,
            starter_prompt: res.data.trend.starter_prompt,
            source: 'live_ai_web_scraper',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };

          setTrends((prev) => [newTrend, ...prev]);
          toast.success(`Discovered new opportunity: "${res.data.trend.title}"!`, { id: 'scan-toast' });
        }
      } catch (err: any) {
        toast.error(err.message || 'Market radar scan failed. Try again in a moment.', { id: 'scan-toast' });
      }
    });
  }

  function launchInAi(starterPrompt: string | null, title: string) {
    const promptToUse = starterPrompt || `Brainstorm a high-conviction startup MVP in the niche: "${title}"`;
    router.push(`/ai?prompt=${encodeURIComponent(promptToUse)}`);
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      {/* Hero Header */}
      <div className="rounded-2xl border bg-gradient-to-br from-card via-card to-primary/5 p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider">
            <Radio className="size-4 text-emerald-500 animate-pulse" />
            <span>Live Market Intelligence Radar</span>
          </div>

          <Button
            size="sm"
            onClick={handleLiveScan}
            disabled={isScanning}
            className="h-8 text-xs font-semibold gap-1.5 shadow-2xs"
          >
            <RefreshCw className={`size-3.5 ${isScanning ? 'animate-spin' : ''}`} />
            <span>{isScanning ? 'Scanning Feeds...' : 'Live Scan & Scrape Signals'}</span>
          </Button>
        </div>

        <div className="max-w-2xl space-y-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Market Trends & Opportunity Radar
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Continuously scraped intelligence identifying emerging founder wedges, regulatory shifts, and high-growth micro-niches. 
            Directly synced with live Supabase database.
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="pt-2 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Filter by keyword, pain point..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 text-xs h-9 bg-background/80"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 scrollbar-none">
            {CATEGORIES.map((cat) => (
              <Button
                key={cat}
                variant={selectedCategory === cat ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(cat)}
                className="h-8 text-xs shrink-0 rounded-full"
              >
                {cat}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Trends Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredTrends.map((trend) => {
          const isBookmarked = bookmarkedIds.includes(trend.id);

          return (
            <Card
              key={trend.id}
              className="flex flex-col border shadow-2xs hover:shadow-md hover:border-primary/40 transition-all bg-card overflow-hidden group"
            >
              <CardHeader className="p-5 pb-3 space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <Badge variant="secondary" className="text-[10px] font-semibold">
                    {trend.category}
                  </Badge>
                  <div className="flex items-center gap-1.5">
                    <Badge
                      variant="outline"
                      className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 border-emerald-500/30 bg-emerald-500/5"
                    >
                      {trend.growth_rate}
                    </Badge>
                    <button
                      type="button"
                      onClick={() => handleToggleBookmark(trend.id)}
                      className={`p-1 rounded hover:bg-muted transition-colors ${
                        isBookmarked ? 'text-amber-500 fill-amber-500' : 'text-muted-foreground hover:text-foreground'
                      }`}
                      title={isBookmarked ? 'Remove from watch-list' : 'Save to watch-list'}
                    >
                      <Bookmark className="size-3.5" />
                    </button>
                  </div>
                </div>

                <CardTitle className="text-base font-bold leading-snug group-hover:text-primary transition-colors">
                  {trend.title}
                </CardTitle>
                <CardDescription className="text-xs line-clamp-3 leading-relaxed">
                  {trend.overview}
                </CardDescription>
              </CardHeader>

              <CardContent className="p-5 pt-0 space-y-3.5 flex-1 text-xs">
                {/* Metrics Badges */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div className="p-2 rounded-lg bg-muted/40 border space-y-0.5">
                    <span className="text-[10px] text-muted-foreground block">OPPORTUNITY</span>
                    <span className="font-bold text-foreground text-sm">
                      {trend.opportunity_score} / 100
                    </span>
                  </div>
                  <div className="p-2 rounded-lg bg-muted/40 border space-y-0.5">
                    <span className="text-[10px] text-muted-foreground block">COMPETITION</span>
                    <span className="font-bold text-foreground text-sm">
                      {trend.competition_density}
                    </span>
                  </div>
                </div>

                {/* Target Audience */}
                {trend.target_audience && (
                  <div className="space-y-1">
                    <span className="text-[11px] font-semibold text-foreground flex items-center gap-1">
                      <Target className="size-3 text-primary" />
                      Ideal Customer:
                    </span>
                    <p className="text-muted-foreground text-[11px] leading-tight">
                      {trend.target_audience}
                    </p>
                  </div>
                )}

                {/* Unsolved Pain Points */}
                {trend.unsolved_pains && Array.isArray(trend.unsolved_pains) && trend.unsolved_pains.length > 0 && (
                  <div className="space-y-1.5 p-2.5 rounded-lg bg-muted/20 border">
                    <span className="text-[11px] font-semibold text-foreground flex items-center gap-1">
                      <ShieldAlert className="size-3 text-amber-500" />
                      Core Unsolved Friction:
                    </span>
                    <ul className="space-y-1 text-[11px] text-muted-foreground">
                      {trend.unsolved_pains.map((pain, pIdx) => (
                        <li key={pIdx} className="flex items-start gap-1.5">
                          <span className="text-primary mt-0.5">•</span>
                          <span>{pain}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Whitespace Moat */}
                {trend.whitespace_moat && (
                  <div className="p-2.5 rounded-lg bg-primary/5 border border-primary/10 text-[11px] text-primary/90 space-y-0.5">
                    <span className="font-semibold">Founder Whitespace:</span>
                    <p>{trend.whitespace_moat}</p>
                  </div>
                )}
              </CardContent>

              <CardFooter className="p-4 pt-2 border-t bg-muted/10">
                <Button
                  size="sm"
                  onClick={() => launchInAi(trend.starter_prompt, trend.title)}
                  className="w-full text-xs font-semibold gap-1.5 shadow-2xs"
                >
                  <Sparkles className="size-3.5" />
                  <span>Build Idea in this Niche</span>
                  <ArrowUpRight className="size-3.5" />
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
