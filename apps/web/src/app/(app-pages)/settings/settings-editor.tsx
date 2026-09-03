'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { updateProfileAction } from '@/data/user/profile';
import {
  saveOnboardingAction,
  type ExperienceLevel,
  type AvailableTime,
  type BudgetBracket,
} from '@/data/user/onboarding';
import { toast } from 'sonner';
import { Check, CheckCircle2, User, Sliders, Shield } from 'lucide-react';

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

  return (
    <div className="w-full max-w-4xl space-y-6">
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="profile" className="flex items-center gap-1.5 text-xs">
            <User className="size-3.5" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="preferences" className="flex items-center gap-1.5 text-xs">
            <Sliders className="size-3.5" />
            Personalization
          </TabsTrigger>
          <TabsTrigger value="account" className="flex items-center gap-1.5 text-xs">
            <Shield className="size-3.5" />
            Account
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Profile Settings */}
        <TabsContent value="profile" className="mt-4">
          <Card>
            <form onSubmit={handleSaveProfile}>
              <CardHeader>
                <CardTitle className="text-lg">Public Profile</CardTitle>
                <CardDescription>
                  This information will be displayed on ideas you publish publicly.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="displayName">Display Name</Label>
                  <Input
                    id="displayName"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Jane Doe"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="janedoe"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Indie hacker building SaaS & AI tools..."
                    rows={3}
                  />
                </div>
              </CardContent>
              <CardFooter className="border-t pt-4">
                <Button type="submit" size="sm" disabled={isPending}>
                  {isPending ? 'Saving...' : 'Save Profile Changes'}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>

        {/* Tab 2: Personalization Settings */}
        <TabsContent value="preferences" className="mt-4 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Idea Preferences & Filters</CardTitle>
              <CardDescription>
                Tune the criteria our recommendation engine uses to calculate idea match scores.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Categories */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Interested Categories</Label>
                <div className="flex flex-wrap gap-2 pt-1">
                  {taxonomy.categories.map((cat) => {
                    const isSelected = selectedCategoryIds.includes(cat.id);
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => toggleItem(selectedCategoryIds, setSelectedCategoryIds, cat.id)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'bg-background hover:bg-accent text-foreground border-border'
                        }`}
                      >
                        {isSelected && <Check className="size-3" />}
                        {cat.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Skills */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Skills & Strengths</Label>
                <div className="flex flex-wrap gap-2 pt-1">
                  {taxonomy.skills.map((skill) => {
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

              {/* Experience Level */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Experience Level</Label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                  {(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'] as ExperienceLevel[]).map((lvl) => {
                    const isSelected = experienceLevel === lvl;
                    return (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => setExperienceLevel(lvl)}
                        className={`p-2.5 rounded-lg border text-center text-xs font-medium transition-all ${
                          isSelected
                            ? 'border-primary bg-primary/5 text-primary font-bold'
                            : 'border-border hover:bg-accent'
                        }`}
                      >
                        {lvl}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Available Time */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Available Time Commitment</Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
                  {[
                    { value: 'LESS_THAN_1_HR', label: '< 1 hr / day' },
                    { value: '1_TO_2_HRS', label: '1 - 2 hrs / day' },
                    { value: '2_TO_4_HRS', label: '2 - 4 hrs / day' },
                    { value: '4_TO_8_HRS', label: '4 - 8 hrs / day' },
                    { value: 'FULL_TIME', label: 'Full Time' },
                  ].map((t) => {
                    const isSelected = availableTime === t.value;
                    return (
                      <button
                        key={t.value}
                        type="button"
                        onClick={() => setAvailableTime(t.value as AvailableTime)}
                        className={`p-2.5 rounded-lg border text-center text-xs font-medium transition-all ${
                          isSelected
                            ? 'border-primary bg-primary/5 text-primary font-bold'
                            : 'border-border hover:bg-accent'
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
              <Button size="sm" onClick={handleSavePreferences} disabled={isPending}>
                {isPending ? 'Updating...' : 'Save Personalization Preferences'}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Tab 3: Account Info */}
        <TabsContent value="account" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Account Security</CardTitle>
              <CardDescription>
                Manage your credentials and authentication details.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Email Address</Label>
                <div className="font-medium text-sm">{userEmail}</div>
              </div>
              <div className="pt-2">
                <Button variant="outline" size="sm" asChild>
                  <a href="/update-password">Update Password</a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
