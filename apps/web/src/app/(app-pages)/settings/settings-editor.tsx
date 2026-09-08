'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { updateProfileAction } from '@/data/user/profile';
import {
  saveOnboardingAction,
  type ExperienceLevel,
  type AvailableTime,
  type BudgetBracket,
} from '@/data/user/onboarding';
import { toast } from 'sonner';
import { Check, User, Sliders, Shield, ArrowRight } from 'lucide-react';

interface SettingsEditorProps {
  userEmail: string;
  initialProfile: {
    id: string;
    username: string | null;
    display_name: string | null;
    bio: string | null;
  } | null;
  taxonomy: {
    categories: Array<{ id: string; name: string }>;
    skills: Array<{ id: string; name: string; category: string }>;
    goals: Array<{ id: string; title: string }>;
    markets: Array<{ id: string; name: string }>;
  };
  userPreferences: {
    selectedCategoryIds: string[];
    selectedSkillIds: string[];
    selectedGoalIds: string[];
    selectedMarketIds: string[];
    experienceLevel: ExperienceLevel | null;
    availableTime: AvailableTime | null;
    budgetBracket: BudgetBracket | null;
  };
}

export function SettingsEditor({
  userEmail,
  initialProfile,
  taxonomy,
  userPreferences,
}: SettingsEditorProps) {
  const [isPending, startTransition] = useTransition();

  // Profile Form State
  const [displayName, setDisplayName] = useState(initialProfile?.display_name || '');
  const [username, setUsername] = useState(initialProfile?.username || '');
  const [bio, setBio] = useState(initialProfile?.bio || '');

  // Personalization Form State
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>(userPreferences.selectedCategoryIds);
  const [selectedSkillIds, setSelectedSkillIds] = useState<string[]>(userPreferences.selectedSkillIds);
  const [selectedGoalIds, setSelectedGoalIds] = useState<string[]>(userPreferences.selectedGoalIds);
  const [selectedMarketIds, setSelectedMarketIds] = useState<string[]>(userPreferences.selectedMarketIds);
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel | null>(userPreferences.experienceLevel);
  const [availableTime, setAvailableTime] = useState<AvailableTime | null>(userPreferences.availableTime);
  const [budgetBracket, setBudgetBracket] = useState<BudgetBracket | null>(userPreferences.budgetBracket);

  function toggleItem(list: string[], setList: (val: string[]) => void, id: string) {
    if (list.includes(id)) {
      setList(list.filter((x) => x !== id));
    } else {
      setList([...list, id]);
    }
  }

  function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      try {
        await updateProfileAction({
          displayName,
          username: username || null,
          bio: bio || null,
        });
        toast.success('Profile updated successfully!');
      } catch (err: any) {
        toast.error(err.message || 'Failed to update profile');
      }
    });
  }

  function handleSavePreferences() {
    startTransition(async () => {
      try {
        await saveOnboardingAction({
          categoryIds: selectedCategoryIds,
          skillIds: selectedSkillIds,
          goalIds: selectedGoalIds,
          marketIds: selectedMarketIds,
          experienceLevel,
          availableTime,
          budgetBracket,
        });
        toast.success('Preferences updated! Your recommendation scores will refresh.');
      } catch (err: any) {
        toast.error(err.message || 'Failed to update preferences');
      }
    });
  }

  const userInitials = (displayName || userEmail)
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="w-full max-w-4xl space-y-6">
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-sm">
          <TabsTrigger value="profile" className="flex items-center gap-1.5 text-xs px-1.5 sm:px-3">
            <User className="size-3.5" />
            <span className="truncate">Profile</span>
          </TabsTrigger>
          <TabsTrigger value="preferences" className="flex items-center gap-1.5 text-xs px-1.5 sm:px-3">
            <Sliders className="size-3.5" />
            <span className="truncate">Personalization</span>
          </TabsTrigger>
          <TabsTrigger value="account" className="flex items-center gap-1.5 text-xs px-1.5 sm:px-3">
            <Shield className="size-3.5" />
            <span className="truncate">Account</span>
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Profile Settings */}
        <TabsContent value="profile" className="mt-4">
          <Card className="border shadow-xs rounded-2xl">
            <form onSubmit={handleSaveProfile}>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-bold">Public Profile</CardTitle>
                <CardDescription className="text-xs">
                  This information will be displayed on ideas you publish publicly.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* User Avatar & Summary Card */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-xl bg-muted/40 border">
                  <Avatar className="size-14 border-2 border-primary/20 bg-primary/10">
                    <AvatarFallback className="text-base font-bold bg-primary/10 text-primary">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-1">
                    <h3 className="font-semibold text-sm text-foreground">{displayName || 'Anonymous Builder'}</h3>
                    <p className="text-xs text-muted-foreground">{userEmail}</p>
                    <Badge variant="outline" className="text-[10px] uppercase tracking-wider font-semibold mt-1">
                      Active Account
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="displayName" className="text-xs font-semibold">Display Name</Label>
                    <Input
                      id="displayName"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Jane Doe"
                      required
                      className="text-xs h-9 rounded-xl"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="username" className="text-xs font-semibold">Username</Label>
                    <Input
                      id="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="janedoe"
                      className="text-xs h-9 rounded-xl"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio" className="text-xs font-semibold">Bio & Background</Label>
                  <Textarea
                    id="bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Solo founder building developer tools and AI products..."
                    rows={3}
                    className="text-xs rounded-xl"
                  />
                </div>
              </CardContent>

              <CardFooter className="border-t pt-4">
                <Button type="submit" size="sm" disabled={isPending} className="font-semibold text-xs rounded-xl w-full sm:w-auto">
                  {isPending ? 'Saving...' : 'Save Profile Changes'}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>

        {/* Tab 2: Personalization & Preferences */}
        <TabsContent value="preferences" className="mt-4">
          <Card className="border shadow-xs rounded-2xl">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-bold">Discovery & AI Personalization</CardTitle>
              <CardDescription className="text-xs">
                Customize your background constraints to tune idea recommendation algorithms and AI prompt outputs.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Categories / Interests */}
              <div className="space-y-3">
                <Label className="text-xs font-semibold">Interested Industries & Categories</Label>
                <div className="flex flex-wrap gap-2">
                  {taxonomy.categories.map((cat) => {
                    const isSelected = selectedCategoryIds.includes(cat.id);
                    return (
                      <Badge
                        key={cat.id}
                        variant={isSelected ? 'default' : 'outline'}
                        className="cursor-pointer py-1.5 px-3 text-xs rounded-lg transition-all"
                        onClick={() => toggleItem(selectedCategoryIds, setSelectedCategoryIds, cat.id)}
                      >
                        {isSelected && <Check className="size-3 mr-1" />}
                        {cat.name}
                      </Badge>
                    );
                  })}
                </div>
              </div>

              {/* Skills */}
              <div className="space-y-3">
                <Label className="text-xs font-semibold">Your Skills & Capabilities</Label>
                <div className="flex flex-wrap gap-2">
                  {taxonomy.skills.map((skill) => {
                    const isSelected = selectedSkillIds.includes(skill.id);
                    return (
                      <Badge
                        key={skill.id}
                        variant={isSelected ? 'default' : 'outline'}
                        className="cursor-pointer py-1.5 px-3 text-xs rounded-lg transition-all"
                        onClick={() => toggleItem(selectedSkillIds, setSelectedSkillIds, skill.id)}
                      >
                        {isSelected && <Check className="size-3 mr-1" />}
                        {skill.name}
                      </Badge>
                    );
                  })}
                </div>
              </div>

              {/* Goals */}
              <div className="space-y-3">
                <Label className="text-xs font-semibold">Primary Entrepreneurial Goals</Label>
                <div className="flex flex-wrap gap-2">
                  {taxonomy.goals.map((g) => {
                    const isSelected = selectedGoalIds.includes(g.id);
                    return (
                      <Badge
                        key={g.id}
                        variant={isSelected ? 'default' : 'outline'}
                        className="cursor-pointer py-1.5 px-3 text-xs rounded-lg transition-all"
                        onClick={() => toggleItem(selectedGoalIds, setSelectedGoalIds, g.id)}
                      >
                        {isSelected && <Check className="size-3 mr-1" />}
                        {g.title}
                      </Badge>
                    );
                  })}
                </div>
              </div>

              {/* Target Markets */}
              <div className="space-y-3">
                <Label className="text-xs font-semibold">Target Geographic & Market Regions</Label>
                <div className="flex flex-wrap gap-2">
                  {taxonomy.markets.map((m) => {
                    const isSelected = selectedMarketIds.includes(m.id);
                    return (
                      <Badge
                        key={m.id}
                        variant={isSelected ? 'default' : 'outline'}
                        className="cursor-pointer py-1.5 px-3 text-xs rounded-lg transition-all"
                        onClick={() => toggleItem(selectedMarketIds, setSelectedMarketIds, m.id)}
                      >
                        {isSelected && <Check className="size-3 mr-1" />}
                        {m.name}
                      </Badge>
                    );
                  })}
                </div>
              </div>

              {/* Experience Level */}
              <div className="space-y-3">
                <Label className="text-xs font-semibold">Technical / Product Experience</Label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'] as ExperienceLevel[]).map((level) => {
                    const isSelected = experienceLevel === level;
                    return (
                      <button
                        key={level}
                        type="button"
                        onClick={() => setExperienceLevel(level)}
                        className={`p-2.5 rounded-xl border text-center text-xs font-medium transition-all ${
                          isSelected
                            ? 'border-primary bg-primary/10 text-primary font-bold shadow-2xs'
                            : 'border-border hover:bg-accent text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        {level}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Working Capital Budget */}
              <div className="space-y-3">
                <Label className="text-xs font-semibold">Starting Capital Budget</Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { val: 'ZERO', label: '$0 (Bootstrapped)' },
                    { val: '1_TO_50', label: '$1 - $50' },
                    { val: '50_TO_250', label: '$50 - $250' },
                    { val: '250_TO_1000', label: '$250 - $1,000' },
                    { val: '1000_PLUS', label: '$1,000+' },
                  ].map((b) => {
                    const isSelected = budgetBracket === b.val;
                    return (
                      <button
                        key={b.val}
                        type="button"
                        onClick={() => setBudgetBracket(b.val as BudgetBracket)}
                        className={`p-2.5 rounded-xl border text-center text-xs font-medium transition-all ${
                          isSelected
                            ? 'border-primary bg-primary/10 text-primary font-bold shadow-2xs'
                            : 'border-border hover:bg-accent text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        {b.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Available Time */}
              <div className="space-y-3">
                <Label className="text-xs font-semibold">Available Time Commitment</Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { val: 'LESS_THAN_1_HR', label: '< 1 hour / day' },
                    { val: '1_TO_2_HRS', label: '1 - 2 hours / day' },
                    { val: '2_TO_4_HRS', label: '2 - 4 hours / day' },
                    { val: '4_TO_8_HRS', label: '4 - 8 hours / day' },
                    { val: 'FULL_TIME', label: 'Full-Time (8+ hrs)' },
                  ].map((t) => {
                    const isSelected = availableTime === t.val;
                    return (
                      <button
                        key={t.val}
                        type="button"
                        onClick={() => setAvailableTime(t.val as AvailableTime)}
                        className={`p-2.5 rounded-xl border text-center text-xs font-medium transition-all ${
                          isSelected
                            ? 'border-primary bg-primary/10 text-primary font-bold shadow-2xs'
                            : 'border-border hover:bg-accent text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        {t.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t pt-4">
              <Button size="sm" onClick={handleSavePreferences} disabled={isPending} className="font-semibold text-xs rounded-xl w-full sm:w-auto">
                {isPending ? 'Updating...' : 'Save Personalization Preferences'}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Tab 3: Account Info */}
        <TabsContent value="account" className="mt-4">
          <Card className="border shadow-xs rounded-2xl">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-bold">Account & Security</CardTitle>
              <CardDescription className="text-xs">
                Manage your credentials and security settings.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-xl bg-muted/40 border space-y-1">
                <Label className="text-xs text-muted-foreground">Registered Email Address</Label>
                <div className="font-semibold text-sm text-foreground">{userEmail}</div>
              </div>

              <div className="pt-2">
                <Button variant="outline" size="sm" asChild className="rounded-xl text-xs font-medium">
                  <a href="/update-password">
                    Change Password
                    <ArrowRight className="size-3 ml-1.5" />
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
