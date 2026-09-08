'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  saveOnboardingAction,
  skipOnboardingAction,
  type ExperienceLevel,
  type AvailableTime,
  type BudgetBracket,
} from '@/data/user/onboarding';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Clock,
  Coins,
  Globe,
  GraduationCap,
  Layers,
  Rocket,
  Sparkles,
  Target,
  Wrench,
} from 'lucide-react';

interface TaxonomyCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
}

interface TaxonomySkill {
  id: string;
  category: string;
  name: string;
  slug: string;
}

interface TaxonomyGoal {
  id: string;
  title: string;
  description: string | null;
  slug: string;
}

interface TaxonomyMarket {
  id: string;
  name: string;
  code: string;
  region: string | null;
}

interface OnboardingWizardProps {
  categories: TaxonomyCategory[];
  skills: TaxonomySkill[];
  goals: TaxonomyGoal[];
  markets: TaxonomyMarket[];
  initialCategoryIds?: string[];
  initialSkillIds?: string[];
  initialGoalIds?: string[];
  initialMarketIds?: string[];
  initialExperienceLevel?: ExperienceLevel | null;
  initialAvailableTime?: AvailableTime | null;
  initialBudgetBracket?: BudgetBracket | null;
}

const STEPS = [
  { id: 1, title: 'Interests', subtitle: 'What spaces and product types excite you most?' },
  { id: 2, title: 'Skills & Strengths', subtitle: 'What skills do you bring to your projects?' },
  { id: 3, title: 'Your Primary Goal', subtitle: 'What are you aiming to achieve right now?' },
  { id: 4, title: 'Experience Level', subtitle: 'How would you describe your building background?' },
  { id: 5, title: 'Time Commitment', subtitle: 'How much time can you realistically invest?' },
  { id: 6, title: 'Starting Budget', subtitle: 'What upfront capital are you comfortable investing?' },
  { id: 7, title: 'Target Market', subtitle: 'Where are your ideal customers located?' },
];

export function OnboardingWizard({
  categories,
  skills,
  goals,
  markets,
  initialCategoryIds = [],
  initialSkillIds = [],
  initialGoalIds = [],
  initialMarketIds = [],
  initialExperienceLevel = null,
  initialAvailableTime = null,
  initialBudgetBracket = null,
}: OnboardingWizardProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isPending, startTransition] = useTransition();

  // Selections
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>(initialCategoryIds);
  const [selectedSkillIds, setSelectedSkillIds] = useState<string[]>(initialSkillIds);
  const [selectedGoalIds, setSelectedGoalIds] = useState<string[]>(initialGoalIds);
  const [selectedMarketIds, setSelectedMarketIds] = useState<string[]>(initialMarketIds);
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel | null>(initialExperienceLevel);
  const [availableTime, setAvailableTime] = useState<AvailableTime | null>(initialAvailableTime);
  const [budgetBracket, setBudgetBracket] = useState<BudgetBracket | null>(initialBudgetBracket);

  const progressPercentage = Math.round((currentStep / STEPS.length) * 100);

  function toggleItem(list: string[], setList: (val: string[]) => void, id: string) {
    if (list.includes(id)) {
      setList(list.filter((x) => x !== id));
    } else {
      setList([...list, id]);
    }
  }

  async function handleNext(skipCurrent = false) {
    startTransition(async () => {
      const isLastStep = currentStep === STEPS.length;

      // Persist state to DB
      await saveOnboardingAction({
        categoryIds: selectedCategoryIds,
        skillIds: selectedSkillIds,
        goalIds: selectedGoalIds,
        marketIds: selectedMarketIds,
        experienceLevel,
        availableTime,
        budgetBracket,
        markCompleted: isLastStep,
      });

      if (isLastStep) {
        toast.success('Onboarding complete! Your personalized ideas are ready.');
        router.push('/dashboard');
        router.refresh();
      } else {
        setCurrentStep((prev) => prev + 1);
      }
    });
  }

  function handleBack() {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  }

  function handleSkipAll() {
    startTransition(async () => {
      await skipOnboardingAction();
      toast.info('You can customize your preferences anytime in Settings.');
      router.push('/dashboard');
      router.refresh();
    });
  }

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 py-6 px-4">
      {/* Header bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="px-2.5 py-1 text-xs font-semibold">
            Step {currentStep} of {STEPS.length}
          </Badge>
          <span className="text-sm text-muted-foreground">{STEPS[currentStep - 1].title}</span>
        </div>
        <Button variant="ghost" size="sm" onClick={handleSkipAll} disabled={isPending} className="text-xs text-muted-foreground hover:text-foreground">
          Skip All & Go to Dashboard
        </Button>
      </div>

      <Progress value={progressPercentage} className="h-1.5" />

      <Card className="border shadow-sm">
        <CardHeader className="space-y-1.5 pb-4">
          <CardTitle className="text-xl font-bold tracking-tight">
            {STEPS[currentStep - 1].title}
          </CardTitle>
          <CardDescription className="text-sm">
            {STEPS[currentStep - 1].subtitle}
          </CardDescription>
        </CardHeader>

        <CardContent className="min-h-[300px] pt-2">
          {/* STEP 1: Categories / Interests */}
          {currentStep === 1 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {categories.map((cat) => {
                const isSelected = selectedCategoryIds.includes(cat.id);
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => toggleItem(selectedCategoryIds, setSelectedCategoryIds, cat.id)}
                    className={`flex flex-col items-start p-3 rounded-lg border text-left transition-all ${
                      isSelected
                        ? 'border-primary bg-primary/5 ring-1 ring-primary'
                        : 'border-border hover:border-muted-foreground/30 hover:bg-accent/50'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <span className="font-semibold text-sm">{cat.name}</span>
                      {isSelected && <Check className="size-4 text-primary shrink-0" />}
                    </div>
                    {cat.description && (
                      <span className="text-xs text-muted-foreground line-clamp-2">
                        {cat.description}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* STEP 2: Skills */}
          {currentStep === 2 && (
            <div className="space-y-4">
              {['Tech', 'Business', 'Design', 'Marketing'].map((group) => {
                const groupSkills = skills.filter((s) => s.category.toLowerCase() === group.toLowerCase());
                if (groupSkills.length === 0) return null;
                return (
                  <div key={group} className="space-y-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {group}
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {groupSkills.map((skill) => {
                        const isSelected = selectedSkillIds.includes(skill.id);
                        return (
                          <button
                            key={skill.id}
                            type="button"
                            onClick={() => toggleItem(selectedSkillIds, setSelectedSkillIds, skill.id)}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all flex items-center gap-1.5 ${
                              isSelected
                                ? 'bg-primary text-primary-foreground border-primary'
                                : 'bg-background hover:bg-accent text-foreground border-border'
                            }`}
                          >
                            {isSelected && <Check className="size-3" />}
                            {skill.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* STEP 3: Goals */}
          {currentStep === 3 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {goals.map((goal) => {
                const isSelected = selectedGoalIds.includes(goal.id);
                return (
                  <button
                    key={goal.id}
                    type="button"
                    onClick={() => toggleItem(selectedGoalIds, setSelectedGoalIds, goal.id)}
                    className={`flex flex-col p-3.5 rounded-lg border text-left transition-all ${
                      isSelected
                        ? 'border-primary bg-primary/5 ring-1 ring-primary'
                        : 'border-border hover:border-muted-foreground/30 hover:bg-accent/50'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <span className="font-semibold text-sm">{goal.title}</span>
                      {isSelected && <Check className="size-4 text-primary" />}
                    </div>
                    {goal.description && (
                      <span className="text-xs text-muted-foreground">{goal.description}</span>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* STEP 4: Experience Level */}
          {currentStep === 4 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { value: 'BEGINNER', title: 'Beginner', desc: 'Starting out or building my first serious project.' },
                { value: 'INTERMEDIATE', title: 'Intermediate', desc: 'Built a few apps or launched prototypes previously.' },
                { value: 'ADVANCED', title: 'Advanced', desc: 'Shipped production apps or operated businesses.' },
                { value: 'EXPERT', title: 'Expert / Serial Builder', desc: 'Deep domain expertise, multiple launches or exits.' },
              ].map((lvl) => {
                const isSelected = experienceLevel === lvl.value;
                return (
                  <button
                    key={lvl.value}
                    type="button"
                    onClick={() => setExperienceLevel(lvl.value as ExperienceLevel)}
                    className={`flex flex-col p-4 rounded-lg border text-left transition-all ${
                      isSelected
                        ? 'border-primary bg-primary/5 ring-1 ring-primary'
                        : 'border-border hover:border-muted-foreground/30 hover:bg-accent/50'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <span className="font-semibold text-sm">{lvl.title}</span>
                      {isSelected && <Check className="size-4 text-primary" />}
                    </div>
                    <span className="text-xs text-muted-foreground">{lvl.desc}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* STEP 5: Available Time */}
          {currentStep === 5 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { value: 'LESS_THAN_1_HR', title: '< 1 hour / day', desc: 'Micro-experiments or weekend tinkering.' },
                { value: '1_TO_2_HRS', title: '1 – 2 hours / day', desc: 'Consistent side hustle momentum.' },
                { value: '2_TO_4_HRS', title: '2 – 4 hours / day', desc: 'Aggressive part-time builder focus.' },
                { value: '4_TO_8_HRS', title: '4 – 8 hours / day', desc: 'Substantial daily development dedication.' },
                { value: 'FULL_TIME', title: 'Full-time Founder', desc: '100% focused on shipping this business.' },
              ].map((time) => {
                const isSelected = availableTime === time.value;
                return (
                  <button
                    key={time.value}
                    type="button"
                    onClick={() => setAvailableTime(time.value as AvailableTime)}
                    className={`flex flex-col p-4 rounded-lg border text-left transition-all ${
                      isSelected
                        ? 'border-primary bg-primary/5 ring-1 ring-primary'
                        : 'border-border hover:border-muted-foreground/30 hover:bg-accent/50'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <span className="font-semibold text-sm">{time.title}</span>
                      {isSelected && <Check className="size-4 text-primary" />}
                    </div>
                    <span className="text-xs text-muted-foreground">{time.desc}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* STEP 6: Budget */}
          {currentStep === 6 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { value: 'ZERO', title: '$0 (Bootstrap / Free Tier)', desc: 'Zero upfront spend, strictly free software.' },
                { value: '1_TO_50', title: '$1 – $50', desc: 'Domain name, minimal API credits, basic hosting.' },
                { value: '50_TO_250', title: '$50 – $250', desc: 'Paid tools, templates, micro-ad tests.' },
                { value: '250_TO_1000', title: '$250 – $1,000', desc: 'Small validation marketing budget.' },
                { value: '1000_PLUS', title: '$1,000+', desc: 'Dedicated capital for hiring, ads, or hardware.' },
                { value: 'NOT_SURE', title: 'Not Sure Yet', desc: 'Flexible depending on the opportunity scope.' },
              ].map((b) => {
                const isSelected = budgetBracket === b.value;
                return (
                  <button
                    key={b.value}
                    type="button"
                    onClick={() => setBudgetBracket(b.value as BudgetBracket)}
                    className={`flex flex-col p-4 rounded-lg border text-left transition-all ${
                      isSelected
                        ? 'border-primary bg-primary/5 ring-1 ring-primary'
                        : 'border-border hover:border-muted-foreground/30 hover:bg-accent/50'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <span className="font-semibold text-sm">{b.title}</span>
                      {isSelected && <Check className="size-4 text-primary" />}
                    </div>
                    <span className="text-xs text-muted-foreground">{b.desc}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* STEP 7: Target Markets */}
          {currentStep === 7 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {markets.map((market) => {
                const isSelected = selectedMarketIds.includes(market.id);
                return (
                  <button
                    key={market.id}
                    type="button"
                    onClick={() => toggleItem(selectedMarketIds, setSelectedMarketIds, market.id)}
                    className={`flex flex-col p-3.5 rounded-lg border text-left transition-all ${
                      isSelected
                        ? 'border-primary bg-primary/5 ring-1 ring-primary'
                        : 'border-border hover:border-muted-foreground/30 hover:bg-accent/50'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <span className="font-semibold text-sm">{market.name}</span>
                      {isSelected && <Check className="size-4 text-primary" />}
                    </div>
                    {market.region && (
                      <span className="text-xs text-muted-foreground">{market.region}</span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </CardContent>

        <CardFooter className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 border-t pt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handleBack}
            disabled={currentStep === 1 || isPending}
            className="w-full sm:w-auto"
          >
            <ArrowLeft className="size-4 mr-1.5" />
            Back
          </Button>

          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleNext(true)}
              disabled={isPending}
              className="text-muted-foreground w-full sm:w-auto text-xs"
            >
              Skip this question
            </Button>
            <Button size="sm" onClick={() => handleNext(false)} disabled={isPending} className="w-full sm:w-auto">
              {currentStep === STEPS.length ? (
                <>
                  <CheckCircle2 className="size-4 mr-1.5" />
                  {isPending ? 'Finalizing...' : 'Complete Onboarding'}
                </>
              ) : (
                <>
                  Continue
                  <ArrowRight className="size-4 ml-1.5" />
                </>
              )}
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
