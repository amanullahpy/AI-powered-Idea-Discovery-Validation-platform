'use client';

import React, { useState, useEffect, useTransition, useCallback } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Presentation,
  Play,
  Maximize2,
  Minimize2,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Download,
  Copy,
  Printer,
  FileText,
  Calculator,
  RotateCcw,
  Check,
  Edit3,
  Lightbulb,
  DollarSign,
  TrendingUp,
  Target,
  ShieldCheck,
  Users,
  Layers,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  calculateUnitEconomics,
  synthesizePitchPackage,
  exportDeckToMarkdown,
  type GeneratedPitchPackage,
  type PitchSlide,
  type UnitEconomicsModel,
  type ComputedUnitEconomics,
} from '@/lib/pitch/generator';
import { synthesizePitchDeckAction } from '@/data/pitch/actions';

interface PitchStudioViewProps {
  ideas: any[];
  initialIdeaId?: string;
}

export function PitchStudioView({ ideas, initialIdeaId }: PitchStudioViewProps) {
  const [selectedIdeaId, setSelectedIdeaId] = useState<string>(
    initialIdeaId || (ideas.length > 0 ? ideas[0].id : '')
  );

  const selectedIdea = ideas.find((i) => i.id === selectedIdeaId) || ideas[0] || null;

  // Active package state
  const [pitchPackage, setPitchPackage] = useState<GeneratedPitchPackage>(() => {
    return synthesizePitchPackage(
      selectedIdea || {
        title: 'Modern AI Productivity Workspace',
        problem: 'Teams lose 20+ hours weekly switching between disconnected tools.',
        solution: 'An all-in-one unified workspace with continuous AI synthesis.',
        target_audience: 'Fast-moving engineering and product teams',
        monetization: 'Tiered subscription at $49/mo per seat',
      }
    );
  });

  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isPresenting, setIsPresenting] = useState(false);
  const [showSpeakerNotes, setShowSpeakerNotes] = useState(true);
  const [isEditingSlide, setIsEditingSlide] = useState(false);
  const [isSynthesizing, startSynthesisTransition] = useTransition();

  // Unit Economics state
  const [economics, setEconomics] = useState<UnitEconomicsModel>(pitchPackage.unitEconomics);
  const [computedEco, setComputedEco] = useState<ComputedUnitEconomics>(() =>
    calculateUnitEconomics(pitchPackage.unitEconomics)
  );

  // Local storage persistence key
  const storageKey = `ideaforge_pitch_${selectedIdeaId || 'custom'}`;

  // Load from local storage or initialize on idea change
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const cached = localStorage.getItem(storageKey);
      if (cached) {
        const parsed = JSON.parse(cached) as GeneratedPitchPackage;
        setPitchPackage(parsed);
        setEconomics(parsed.unitEconomics);
        setComputedEco(calculateUnitEconomics(parsed.unitEconomics));
        setCurrentSlideIndex(0);
        return;
      }
    } catch {
      // Ignore parse failure
    }

    if (selectedIdea) {
      const generated = synthesizePitchPackage(selectedIdea);
      setPitchPackage(generated);
      setEconomics(generated.unitEconomics);
      setComputedEco(calculateUnitEconomics(generated.unitEconomics));
      setCurrentSlideIndex(0);
    }
  }, [selectedIdeaId, selectedIdea, storageKey]);

  // Recalculate computed economics whenever inputs change
  const handleEconomicsChange = useCallback((patch: Partial<UnitEconomicsModel>) => {
    setEconomics((prev) => {
      const updated = { ...prev, ...patch };
      const calculated = calculateUnitEconomics(updated);
      setComputedEco(calculated);

      // Also update the unit economics slide (Slide 9)
      setPitchPackage((pkg) => {
        const nextSlides = [...pkg.slides];
        const slideIndex = nextSlides.findIndex((s) => s.slug === 'unit-economics');
        if (slideIndex !== -1) {
          nextSlides[slideIndex] = {
            ...nextSlides[slideIndex],
            subtitle: `Demonstrating disciplined capital efficiency and a sustainable ${calculated.healthRating} LTV:CAC profile.`,
            bullets: [
              `Customer Lifetime Value (LTV): $${calculated.ltv} based on $${calculated.arpu}/mo ARPU and ${updated.monthlyChurnPercent}% churn.`,
              `Estimated Customer Acquisition Cost (CAC): $${updated.cac} with a ${calculated.paybackMonths}-month payback.`,
              `12-Month Run-Rate: Projected ${calculated.projectedMonth12Arr.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })} ARR at month 12.`,
            ],
            metrics: [
              { label: 'LTV : CAC', value: `${calculated.ltvCacRatio}x (${calculated.healthRating})` },
              { label: 'CAC Payback', value: `${calculated.paybackMonths} Months` },
              {
                label: '12-Mo ARR Projection',
                value: calculated.projectedMonth12Arr.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }),
              },
            ],
          };
        }
        const newPkg = { ...pkg, slides: nextSlides, unitEconomics: updated };
        try {
          localStorage.setItem(storageKey, JSON.stringify(newPkg));
        } catch {}
        return newPkg;
      });

      return updated;
    });
  }, [storageKey]);

  // Keyboard navigation for presentation mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.target instanceof HTMLElement && e.target.isContentEditable) ||
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      if (e.key === 'ArrowRight' || e.key === 'PageDown' || (isPresenting && e.key === ' ')) {
        e.preventDefault();
        setCurrentSlideIndex((prev) => Math.min(pitchPackage.slides.length - 1, prev + 1));
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        setCurrentSlideIndex((prev) => Math.max(0, prev - 1));
      } else if (e.key === 'Escape' && isPresenting) {
        setIsPresenting(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPresenting, pitchPackage.slides.length]);

  // Synthesize from AI Server Action
  const handleRegeneratePitch = () => {
    startSynthesisTransition(async () => {
      try {
        const res = await synthesizePitchDeckAction({
          ideaId: selectedIdea?.id,
          customTitle: selectedIdea?.title,
          customProblem: selectedIdea?.problem,
          customSolution: selectedIdea?.solution,
          customAudience: selectedIdea?.target_audience,
          customMonetization: selectedIdea?.monetization,
        });

        if (res.data) {
          setPitchPackage(res.data);
          setEconomics(res.data.unitEconomics);
          setComputedEco(calculateUnitEconomics(res.data.unitEconomics));
          setCurrentSlideIndex(0);
          try {
            localStorage.setItem(storageKey, JSON.stringify(res.data));
          } catch {}
          toast.success('Generated high-conviction 10-slide deck & investor memo!');
        }
      } catch (err: any) {
        toast.error(err.message || 'Failed to synthesize pitch');
      }
    });
  };

  const handleUpdateCurrentSlide = (field: 'title' | 'subtitle' | 'speakerNotes', val: string) => {
    setPitchPackage((prev) => {
      const nextSlides = [...prev.slides];
      nextSlides[currentSlideIndex] = {
        ...nextSlides[currentSlideIndex],
        [field]: val,
      };
      const updated = { ...prev, slides: nextSlides };
      try {
        localStorage.setItem(storageKey, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const handleUpdateBullet = (bulletIndex: number, text: string) => {
    setPitchPackage((prev) => {
      const nextSlides = [...prev.slides];
      const curBullets = [...nextSlides[currentSlideIndex].bullets];
      curBullets[bulletIndex] = text;
      nextSlides[currentSlideIndex] = {
        ...nextSlides[currentSlideIndex],
        bullets: curBullets,
      };
      const updated = { ...prev, slides: nextSlides };
      try {
        localStorage.setItem(storageKey, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  // Export handlers
  const handleCopyMemo = () => {
    const memoText = [
      `# ${pitchPackage.ideaTitle} — Executive Investment Memo`,
      `\n## Executive Summary\n${pitchPackage.memo.executiveSummary}`,
      `\n## Problem Statement\n${pitchPackage.memo.problemStatement}`,
      `\n## Solution & Value Proposition\n${pitchPackage.memo.solutionAndValueProp}`,
      `\n## Market Opportunity\n${pitchPackage.memo.marketSizingTAM}`,
      `\n## Business Model & Economics\n${pitchPackage.memo.businessModelAndPricing}`,
      `\n## Competitive Defensibility\n${pitchPackage.memo.competitiveMoat}`,
      `\n## 12-Month Target Milestones:\n${pitchPackage.memo.targetMilestones.map((m) => `- ${m}`).join('\n')}`,
      `\n## Key Risks & Mitigations:\n${pitchPackage.memo.keyRisksAndMitigations.map((r) => `- ${r}`).join('\n')}`,
    ].join('\n');

    navigator.clipboard.writeText(memoText);
    toast.success('1-Page Investment Memo copied to clipboard!');
  };

  const handleDownloadMarkdown = () => {
    const md = exportDeckToMarkdown(pitchPackage);
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${pitchPackage.ideaTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-pitch-deck.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('Pitch deck downloaded as Markdown (.md)!');
  };

  const handlePrint = () => {
    window.print();
  };

  const currentSlide = pitchPackage.slides[currentSlideIndex] || pitchPackage.slides[0];

  return (
    <div className="space-y-6 max-w-7xl pb-16 print:p-0">
      {/* Top Header Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b pb-5 print:hidden">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <Presentation className="size-5" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Pitch Deck & Investment Memo Studio
            </h1>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Build investor-grade 10-slide pitch decks, calculate unit economics, and export 1-page institutional memos.
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRegeneratePitch}
            disabled={isSynthesizing}
            className="text-xs h-9 gap-1.5 font-semibold"
          >
            <Sparkles className="size-3.5 text-primary" />
            {isSynthesizing ? 'Synthesizing…' : 'Regenerate with AI'}
          </Button>

          <Button
            variant="default"
            size="sm"
            onClick={() => setIsPresenting(true)}
            className="text-xs h-9 gap-1.5 font-semibold bg-primary text-primary-foreground hover:bg-primary/90 shadow-2xs"
          >
            <Play className="size-3.5 fill-current" />
            Present Deck
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadMarkdown}
            className="text-xs h-9 gap-1.5"
            title="Download formatted Markdown"
          >
            <Download className="size-3.5" />
            Export .MD
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
            className="text-xs h-9 gap-1.5"
            title="Print or Save to PDF"
          >
            <Printer className="size-3.5" />
            Print / PDF
          </Button>
        </div>
      </div>

      {/* Idea Selection Selector Strip */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 rounded-xl border bg-card/60 backdrop-blur-xs print:hidden">
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-muted-foreground whitespace-nowrap">
            Selected Venture:
          </span>
          <select
            value={selectedIdeaId}
            onChange={(e) => setSelectedIdeaId(e.target.value)}
            className="text-xs font-semibold bg-background border rounded-lg px-2.5 py-1.5 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 cursor-pointer"
          >
            {ideas.map((item) => (
              <option key={item.id} value={item.id}>
                {item.title} {item.categories?.name ? `(${item.categories.name})` : ''}
              </option>
            ))}
            {ideas.length === 0 && (
              <option value="">Sample AI Productivity Concept</option>
            )}
          </select>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {selectedIdea && (
            <Badge variant="secondary" className="text-[11px] font-semibold">
              {selectedIdea.difficulty || 'Intermediate'}
            </Badge>
          )}
          <span>
            Slide <strong className="text-foreground">{currentSlideIndex + 1}</strong> of{' '}
            <strong className="text-foreground">{pitchPackage.slides.length}</strong>
          </span>
        </div>
      </div>

      {/* Main Tabs: Pitch Deck, Unit Economics Simulator, 1-Page Investment Memo */}
      <Tabs defaultValue="deck" className="w-full print:hidden">
        <TabsList className="grid grid-cols-3 max-w-md h-10 p-1">
          <TabsTrigger value="deck" className="text-xs gap-1.5 font-semibold">
            <Presentation className="size-3.5" />
            10-Slide Deck
          </TabsTrigger>
          <TabsTrigger value="economics" className="text-xs gap-1.5 font-semibold">
            <Calculator className="size-3.5" />
            Unit Economics
          </TabsTrigger>
          <TabsTrigger value="memo" className="text-xs gap-1.5 font-semibold">
            <FileText className="size-3.5" />
            Investor Memo
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: 10-SLIDE PITCH DECK */}
        <TabsContent value="deck" className="mt-4 space-y-4">
          {/* Deck Workspace: Left Navigation Thumbnails + Center Slide Canvas */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* Left Slide Thumbnail Strip */}
            <div className="lg:col-span-3 space-y-2 max-h-[620px] overflow-y-auto pr-1">
              {pitchPackage.slides.map((slide, idx) => {
                const isActive = idx === currentSlideIndex;
                return (
                  <button
                    key={slide.id}
                    type="button"
                    onClick={() => {
                      setCurrentSlideIndex(idx);
                      setIsEditingSlide(false);
                    }}
                    className={`w-full text-left p-3 rounded-xl border transition-all text-xs flex flex-col gap-1 ${
                      isActive
                        ? 'border-primary bg-primary/5 ring-1 ring-primary/30 shadow-xs'
                        : 'border-border/70 bg-card hover:bg-muted/40 hover:border-primary/30 text-muted-foreground'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="font-bold text-[10px] uppercase tracking-wider text-muted-foreground">
                        Slide {slide.id} • {slide.category}
                      </span>
                      {isActive && <div className="size-2 rounded-full bg-primary" />}
                    </div>
                    <span className="font-semibold text-foreground line-clamp-1">
                      {slide.title}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Center Slide Stage Preview */}
            <div className="lg:col-span-9 space-y-4">
              {/* Slide Screen Frame */}
              <Card className="border shadow-md overflow-hidden bg-gradient-to-b from-card to-card/90">
                {/* Stage Header Controls */}
                <div className="px-5 py-3 border-b flex items-center justify-between bg-muted/20">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs uppercase font-mono">
                      {currentSlide.category}
                    </Badge>
                    <span className="text-xs font-semibold text-muted-foreground">
                      Slide {currentSlide.id} of {pitchPackage.slides.length}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsEditingSlide(!isEditingSlide)}
                      className="text-xs h-8 gap-1.5"
                    >
                      <Edit3 className="size-3.5" />
                      {isEditingSlide ? 'Exit Edit' : 'Edit Slide'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsPresenting(true)}
                      className="text-xs h-8 gap-1.5"
                    >
                      <Maximize2 className="size-3.5" />
                      Fullscreen
                    </Button>
                  </div>
                </div>

                {/* Slide Canvas Body */}
                <CardContent className="p-6 sm:p-10 min-h-[380px] flex flex-col justify-between space-y-6">
                  {isEditingSlide ? (
                    // Edit Mode
                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-bold">Slide Title</Label>
                        <Input
                          value={currentSlide.title}
                          onChange={(e) => handleUpdateCurrentSlide('title', e.target.value)}
                          className="font-bold text-base"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-bold">Subtitle / Hook</Label>
                        <Input
                          value={currentSlide.subtitle}
                          onChange={(e) => handleUpdateCurrentSlide('subtitle', e.target.value)}
                          className="text-xs"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-bold">Key Talking Points (Bullets)</Label>
                        {currentSlide.bullets.map((bullet, bIdx) => (
                          <Input
                            key={bIdx}
                            value={bullet}
                            onChange={(e) => handleUpdateBullet(bIdx, e.target.value)}
                            className="text-xs"
                          />
                        ))}
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-bold">Speaker Notes</Label>
                        <Textarea
                          value={currentSlide.speakerNotes}
                          onChange={(e) => handleUpdateCurrentSlide('speakerNotes', e.target.value)}
                          rows={3}
                          className="text-xs"
                        />
                      </div>
                    </div>
                  ) : (
                    // Visual Preview Mode
                    <>
                      <div className="space-y-2">
                        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                          {currentSlide.title}
                        </h2>
                        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-2xl">
                          {currentSlide.subtitle}
                        </p>
                      </div>

                      {/* Bullet Highlights */}
                      <div className="space-y-3 my-2">
                        {currentSlide.bullets.map((bullet, idx) => (
                          <div
                            key={idx}
                            className="flex items-start gap-3 p-3 rounded-xl bg-muted/30 border border-border/50 text-xs sm:text-sm"
                          >
                            <div className="size-2 rounded-full bg-primary mt-2 shrink-0" />
                            <span className="text-foreground leading-relaxed font-medium">
                              {bullet}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Bottom Key Metrics (if applicable) */}
                      {currentSlide.metrics && currentSlide.metrics.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                          {currentSlide.metrics.map((m, mIdx) => (
                            <div
                              key={mIdx}
                              className="p-3 rounded-lg border bg-card/60 flex flex-col justify-between"
                            >
                              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                                {m.label}
                              </span>
                              <span className="text-base sm:text-lg font-extrabold text-foreground mt-1">
                                {m.value}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </CardContent>

                {/* Slide Canvas Footer: Slide Stepper Controls */}
                <div className="px-6 py-3.5 border-t bg-muted/20 flex items-center justify-between">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentSlideIndex === 0}
                    onClick={() => setCurrentSlideIndex((prev) => Math.max(0, prev - 1))}
                    className="text-xs h-8 gap-1"
                  >
                    <ChevronLeft className="size-4" />
                    Previous
                  </Button>

                  <div className="flex items-center gap-1.5">
                    {pitchPackage.slides.map((_, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setCurrentSlideIndex(i)}
                        className={`size-2.5 rounded-full transition-all ${
                          i === currentSlideIndex
                            ? 'bg-primary w-6'
                            : 'bg-muted-foreground/30 hover:bg-muted-foreground/60'
                        }`}
                        aria-label={`Jump to slide ${i + 1}`}
                      />
                    ))}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentSlideIndex === pitchPackage.slides.length - 1}
                    onClick={() =>
                      setCurrentSlideIndex((prev) =>
                        Math.min(pitchPackage.slides.length - 1, prev + 1)
                      )
                    }
                    className="text-xs h-8 gap-1"
                  >
                    Next
                    <ChevronRight className="size-4" />
                  </Button>
                </div>
              </Card>

              {/* Speaker Notes Drawer (Beneath Slide Canvas) */}
              <Card className="border bg-muted/30">
                <CardHeader className="py-3 px-5 flex flex-row items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Lightbulb className="size-4 text-amber-500" />
                    <CardTitle className="text-xs font-bold uppercase tracking-wider">
                      Presenter Talking Notes
                    </CardTitle>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowSpeakerNotes(!showSpeakerNotes)}
                    className="text-[11px] h-7 px-2 text-muted-foreground"
                  >
                    {showSpeakerNotes ? 'Hide Notes' : 'Show Notes'}
                  </Button>
                </CardHeader>
                {showSpeakerNotes && (
                  <CardContent className="px-5 pb-4 pt-0 text-xs text-muted-foreground leading-relaxed">
                    <p className="italic bg-card/60 p-3 rounded-lg border border-border/50">
                      &ldquo;{currentSlide.speakerNotes}&rdquo;
                    </p>
                  </CardContent>
                )}
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* TAB 2: INTERACTIVE UNIT ECONOMICS SIMULATOR */}
        <TabsContent value="economics" className="mt-4 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Input Controls Card */}
            <Card className="lg:col-span-5 border shadow-2xs">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calculator className="size-5 text-emerald-500" />
                    <CardTitle className="text-base font-bold">Model Assumptions</CardTitle>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const defaults: UnitEconomicsModel = {
                        monthlyPrice: 49,
                        newCustomersPerMonth: 20,
                        cac: 95,
                        monthlyChurnPercent: 3.2,
                        monthlyFixedCosts: 1800,
                      };
                      setEconomics(defaults);
                      setComputedEco(calculateUnitEconomics(defaults));
                    }}
                    className="text-xs h-7 gap-1 text-muted-foreground"
                  >
                    <RotateCcw className="size-3" />
                    Reset
                  </Button>
                </div>
                <CardDescription className="text-xs">
                  Tune price, acquisition costs, and customer churn to simulate runway and LTV:CAC health.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-5">
                {/* Monthly Subscription Price */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <Label className="font-semibold">Target Price / ARPU</Label>
                    <span className="font-mono font-bold text-foreground">${economics.monthlyPrice}/mo</span>
                  </div>
                  <Slider
                    value={[economics.monthlyPrice]}
                    min={9}
                    max={299}
                    step={5}
                    onValueChange={([val]) => handleEconomicsChange({ monthlyPrice: val })}
                  />
                </div>

                {/* New Monthly Paying Customers */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <Label className="font-semibold">New Paying Accounts / mo</Label>
                    <span className="font-mono font-bold text-foreground">+{economics.newCustomersPerMonth} /mo</span>
                  </div>
                  <Slider
                    value={[economics.newCustomersPerMonth]}
                    min={1}
                    max={100}
                    step={1}
                    onValueChange={([val]) => handleEconomicsChange({ newCustomersPerMonth: val })}
                  />
                </div>

                {/* Customer Acquisition Cost (CAC) */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <Label className="font-semibold">Estimated CAC ($)</Label>
                    <span className="font-mono font-bold text-foreground">${economics.cac}</span>
                  </div>
                  <Slider
                    value={[economics.cac]}
                    min={0}
                    max={500}
                    step={5}
                    onValueChange={([val]) => handleEconomicsChange({ cac: val })}
                  />
                </div>

                {/* Monthly Churn Rate */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <Label className="font-semibold">Monthly Churn (%)</Label>
                    <span className="font-mono font-bold text-foreground">{economics.monthlyChurnPercent}%</span>
                  </div>
                  <Slider
                    value={[economics.monthlyChurnPercent]}
                    min={0.5}
                    max={15}
                    step={0.1}
                    onValueChange={([val]) => handleEconomicsChange({ monthlyChurnPercent: val })}
                  />
                </div>

                {/* Fixed Monthly Overhead */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <Label className="font-semibold">Fixed Monthly Overhead</Label>
                    <span className="font-mono font-bold text-foreground">${economics.monthlyFixedCosts}/mo</span>
                  </div>
                  <Slider
                    value={[economics.monthlyFixedCosts]}
                    min={200}
                    max={10000}
                    step={100}
                    onValueChange={([val]) => handleEconomicsChange({ monthlyFixedCosts: val })}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Computed Output Cards */}
            <div className="lg:col-span-7 space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <Card className="p-4 flex flex-col justify-between">
                  <span className="text-xs text-muted-foreground">Customer LTV</span>
                  <div className="mt-2">
                    <span className="text-2xl font-black text-foreground">
                      ${computedEco.ltv.toLocaleString()}
                    </span>
                    <p className="text-[11px] text-muted-foreground mt-0.5">Lifetime gross value</p>
                  </div>
                </Card>

                <Card className="p-4 flex flex-col justify-between">
                  <span className="text-xs text-muted-foreground">LTV : CAC Ratio</span>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-2xl font-black text-foreground">
                      {computedEco.ltvCacRatio}x
                    </span>
                    <Badge
                      variant="outline"
                      className={`text-[10px] font-bold ${
                        computedEco.healthRating === 'Exceptional'
                          ? 'border-emerald-500/30 text-emerald-600 bg-emerald-500/10'
                          : computedEco.healthRating === 'Healthy'
                          ? 'border-blue-500/30 text-blue-600 bg-blue-500/10'
                          : computedEco.healthRating === 'Cautious'
                          ? 'border-amber-500/30 text-amber-600 bg-amber-500/10'
                          : 'border-rose-500/30 text-rose-600 bg-rose-500/10'
                      }`}
                    >
                      {computedEco.healthRating}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Standard is 3x+</p>
                </Card>

                <Card className="p-4 flex flex-col justify-between">
                  <span className="text-xs text-muted-foreground">CAC Payback</span>
                  <div className="mt-2">
                    <span className="text-2xl font-black text-foreground">
                      {computedEco.paybackMonths} mo
                    </span>
                    <p className="text-[11px] text-muted-foreground mt-0.5">Months to recover CAC</p>
                  </div>
                </Card>

                <Card className="p-4 flex flex-col justify-between">
                  <span className="text-xs text-muted-foreground">Break-Even Users</span>
                  <div className="mt-2">
                    <span className="text-2xl font-black text-foreground">
                      {computedEco.breakEvenCustomers}
                    </span>
                    <p className="text-[11px] text-muted-foreground mt-0.5">To cover fixed overhead</p>
                  </div>
                </Card>

                <Card className="p-4 flex flex-col justify-between">
                  <span className="text-xs text-muted-foreground">Month 6 MRR</span>
                  <div className="mt-2">
                    <span className="text-2xl font-black text-foreground">
                      ${computedEco.projectedMonth6Mrr.toLocaleString()}
                    </span>
                    <p className="text-[11px] text-muted-foreground mt-0.5">Projected run-rate</p>
                  </div>
                </Card>

                <Card className="p-4 flex flex-col justify-between">
                  <span className="text-xs text-muted-foreground">Year 1 ARR</span>
                  <div className="mt-2">
                    <span className="text-2xl font-black text-primary">
                      ${computedEco.projectedMonth12Arr.toLocaleString()}
                    </span>
                    <p className="text-[11px] text-muted-foreground mt-0.5">Annualized run-rate</p>
                  </div>
                </Card>
              </div>

              {/* Financial Health Assessment */}
              <Card className="p-5 border bg-muted/20 space-y-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="size-4 text-primary" />
                  <h3 className="font-bold text-sm">Investor Feasibility Assessment</h3>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {computedEco.ltvCacRatio >= 3.0 ? (
                    <>
                      This business demonstrates strong unit scalability. With an LTV:CAC ratio of{' '}
                      <strong className="text-foreground">{computedEco.ltvCacRatio}x</strong> and a{' '}
                      <strong className="text-foreground">{computedEco.paybackMonths}-month</strong> payback period, customer acquisition can be safely scaled without premature cash-drain.
                    </>
                  ) : (
                    <>
                      Caution is warranted on acquisition efficiency. The current LTV:CAC ratio is{' '}
                      <strong className="text-foreground">{computedEco.ltvCacRatio}x</strong>. Consider lowering CAC through product-led distribution or boosting subscription ARPU with annual pre-payments.
                    </>
                  )}
                </p>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* TAB 3: 1-PAGE EXECUTIVE INVESTMENT MEMO */}
        <TabsContent value="memo" className="mt-4 space-y-4">
          <Card className="border shadow-md">
            <CardHeader className="border-b pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <CardTitle className="text-lg font-bold">1-Page Investment Memo</CardTitle>
                <CardDescription className="text-xs">
                  Institutional memo format for angel syndicates, accelerators (YC), and asynchronous investor reviews.
                </CardDescription>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={handleCopyMemo}
                className="text-xs h-8 gap-1.5 font-semibold shrink-0"
              >
                <Copy className="size-3.5" />
                Copy Memo Text
              </Button>
            </CardHeader>

            <CardContent className="p-6 sm:p-8 space-y-6">
              {/* Executive Summary */}
              <div className="space-y-1.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-primary">
                  1. Executive Summary
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  {pitchPackage.memo.executiveSummary}
                </p>
              </div>

              {/* Problem & Solution Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border bg-muted/30 space-y-1.5">
                  <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <Target className="size-3.5 text-rose-500" />
                    Problem & Market Pain
                  </h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {pitchPackage.memo.problemStatement}
                  </p>
                </div>

                <div className="p-4 rounded-xl border bg-muted/30 space-y-1.5">
                  <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <Lightbulb className="size-3.5 text-amber-500" />
                    Solution & Value Proposition
                  </h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {pitchPackage.memo.solutionAndValueProp}
                  </p>
                </div>
              </div>

              {/* Market Opportunity & Business Model */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border bg-muted/30 space-y-1.5">
                  <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <TrendingUp className="size-3.5 text-blue-500" />
                    Market Sizing (TAM / SAM / SOM)
                  </h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {pitchPackage.memo.marketSizingTAM}
                  </p>
                </div>

                <div className="p-4 rounded-xl border bg-muted/30 space-y-1.5">
                  <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <DollarSign className="size-3.5 text-emerald-500" />
                    Business Model & Economics
                  </h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {pitchPackage.memo.businessModelAndPricing}
                  </p>
                </div>
              </div>

              {/* Competitive Moat */}
              <div className="space-y-1.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-primary">
                  2. Competitive Defensibility & Asymmetric Moat
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  {pitchPackage.memo.competitiveMoat}
                </p>
              </div>

              {/* 12-Month Target Milestones */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-primary">
                  3. Key Execution Milestones (Next 12 Months)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {pitchPackage.memo.targetMilestones.map((m, i) => (
                    <div key={i} className="flex items-start gap-2 p-2.5 rounded-lg border bg-card text-xs">
                      <div className="size-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                      <span className="text-muted-foreground">{m}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Key Risks & Mitigations */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-primary">
                  4. Risk Factors & Defenses
                </h3>
                <div className="space-y-1.5">
                  {pitchPackage.memo.keyRisksAndMitigations.map((risk, i) => (
                    <div key={i} className="p-2.5 rounded-lg border bg-rose-500/5 border-rose-500/20 text-xs text-muted-foreground">
                      {risk}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* FULLSCREEN PRESENTATION MODE OVERLAY */}
      {isPresenting && (
        <div className="fixed inset-0 z-50 bg-background text-foreground flex flex-col justify-between p-6 sm:p-12 overflow-hidden animate-in fade-in-50 duration-200">
          {/* Top Bar in Presentation */}
          <div className="flex items-center justify-between border-b pb-4">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm sm:text-base tracking-tight">
                {pitchPackage.ideaTitle}
              </span>
              <span className="text-muted-foreground text-xs">•</span>
              <Badge variant="outline" className="text-xs uppercase font-mono">
                {currentSlide.category}
              </Badge>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-xs text-muted-foreground font-mono">
                Slide {currentSlideIndex + 1} of {pitchPackage.slides.length}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsPresenting(false)}
                className="text-xs h-8 gap-1"
              >
                <Minimize2 className="size-3.5" />
                Exit (Esc)
              </Button>
            </div>
          </div>

          {/* Presentation Slide Content Area */}
          <div className="max-w-4xl mx-auto w-full my-auto space-y-8 text-center sm:text-left">
            <div className="space-y-3">
              <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-foreground">
                {currentSlide.title}
              </h1>
              <p className="text-base sm:text-xl text-muted-foreground leading-relaxed max-w-3xl">
                {currentSlide.subtitle}
              </p>
            </div>

            {/* Bullets */}
            <div className="space-y-4 pt-2">
              {currentSlide.bullets.map((b, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-4 p-4 rounded-2xl bg-muted/40 border border-border/60 text-base sm:text-lg text-left"
                >
                  <div className="size-3 rounded-full bg-primary mt-2 shrink-0" />
                  <span className="font-medium text-foreground">{b}</span>
                </div>
              ))}
            </div>

            {/* Metrics */}
            {currentSlide.metrics && currentSlide.metrics.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
                {currentSlide.metrics.map((m, mIdx) => (
                  <div
                    key={mIdx}
                    className="p-4 rounded-xl border bg-card flex flex-col justify-between text-left"
                  >
                    <span className="text-xs uppercase font-semibold text-muted-foreground tracking-wider">
                      {m.label}
                    </span>
                    <span className="text-xl sm:text-2xl font-black text-foreground mt-1">
                      {m.value}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Presentation Footer Bar */}
          <div className="flex items-center justify-between border-t pt-4">
            <Button
              variant="outline"
              size="sm"
              disabled={currentSlideIndex === 0}
              onClick={() => setCurrentSlideIndex((prev) => Math.max(0, prev - 1))}
              className="text-xs h-9 gap-1 px-4"
            >
              <ChevronLeft className="size-4" />
              Previous
            </Button>

            <div className="text-xs text-muted-foreground hidden sm:block">
              Use <kbd className="px-1.5 py-0.5 rounded border bg-muted text-[11px]">←</kbd> and{' '}
              <kbd className="px-1.5 py-0.5 rounded border bg-muted text-[11px]">→</kbd> or{' '}
              <kbd className="px-1.5 py-0.5 rounded border bg-muted text-[11px]">Space</kbd> to advance
            </div>

            <Button
              variant="default"
              size="sm"
              disabled={currentSlideIndex === pitchPackage.slides.length - 1}
              onClick={() =>
                setCurrentSlideIndex((prev) =>
                  Math.min(pitchPackage.slides.length - 1, prev + 1)
                )
              }
              className="text-xs h-9 gap-1 px-4"
            >
              Next
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      )}

      {/* PRINT-ONLY VIEW (Paginated Slides For PDF / Printouts) */}
      <div className="hidden print:block space-y-12">
        <div className="text-center pb-6 border-b">
          <h1 className="text-3xl font-extrabold">{pitchPackage.ideaTitle}</h1>
          <p className="text-sm text-gray-500 mt-1">Pitch Deck & Investment Blueprint — IdeaForge</p>
        </div>

        {pitchPackage.slides.map((slide) => (
          <div
            key={slide.id}
            className="p-8 border rounded-lg space-y-6 page-break-after-always"
            style={{ pageBreakAfter: 'always' }}
          >
            <div className="flex justify-between items-center text-xs text-gray-400 uppercase">
              <span>{slide.category}</span>
              <span>Slide {slide.id} of {pitchPackage.slides.length}</span>
            </div>
            <h2 className="text-2xl font-bold">{slide.title}</h2>
            <p className="text-sm text-gray-600 italic">{slide.subtitle}</p>
            <div className="space-y-3 pt-2">
              {slide.bullets.map((b, i) => (
                <div key={i} className="flex gap-2 text-sm">
                  <span>•</span>
                  <span>{b}</span>
                </div>
              ))}
            </div>
            {slide.metrics && (
              <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                {slide.metrics.map((m, i) => (
                  <div key={i}>
                    <div className="text-xs text-gray-400 uppercase">{m.label}</div>
                    <div className="text-base font-bold">{m.value}</div>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-4 pt-3 border-t text-xs text-gray-500">
              <strong>Speaker Notes:</strong> {slide.speakerNotes}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
