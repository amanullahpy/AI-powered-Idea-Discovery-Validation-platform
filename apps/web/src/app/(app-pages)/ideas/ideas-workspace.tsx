'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { IdeaCard, type IdeaItem } from '@/components/ideas/idea-card';
import { Lightbulb, Plus, Search, Sparkles } from 'lucide-react';

interface IdeasWorkspaceProps {
  initialIdeas: IdeaItem[];
  savedIdeaIds: string[];
}

export function IdeasWorkspace({ initialIdeas, savedIdeaIds }: IdeasWorkspaceProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  const filteredIdeas = useMemo(() => {
    return initialIdeas.filter((idea) => {
      // Tab filter
      if (activeTab === 'private' && idea.visibility !== 'PRIVATE') return false;
      if (activeTab === 'public' && idea.visibility !== 'PUBLIC') return false;
      if (activeTab === 'unlisted' && idea.visibility !== 'UNLISTED') return false;
      if (activeTab === 'saved' && !savedIdeaIds.includes(idea.id)) return false;
      if (activeTab === 'building' && idea.status !== 'BUILDING') return false;
      if (activeTab === 'archived' && idea.status !== 'ARCHIVED') return false;

      // Text search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = idea.title.toLowerCase().includes(q);
        const matchDesc = idea.short_description.toLowerCase().includes(q);
        const matchCategory = idea.categories?.name.toLowerCase().includes(q);
        if (!matchTitle && !matchDesc && !matchCategory) return false;
      }

      return true;
    });
  }, [initialIdeas, activeTab, searchQuery, savedIdeaIds]);

  const counts = useMemo(() => {
    return {
      all: initialIdeas.length,
      private: initialIdeas.filter((i) => i.visibility === 'PRIVATE').length,
      public: initialIdeas.filter((i) => i.visibility === 'PUBLIC').length,
      unlisted: initialIdeas.filter((i) => i.visibility === 'UNLISTED').length,
      saved: initialIdeas.filter((i) => savedIdeaIds.includes(i.id)).length,
      building: initialIdeas.filter((i) => i.status === 'BUILDING').length,
      archived: initialIdeas.filter((i) => i.status === 'ARCHIVED').length,
    };
  }, [initialIdeas, savedIdeaIds]);

  return (
    <div className="space-y-6">
      {/* Search and Quick Actions Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search your ideas by title, keyword, category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 text-sm"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button asChild size="sm" className="gap-1.5 font-semibold w-full sm:w-auto">
            <Link href="/ai">
              <Sparkles className="size-3.5" />
              Generate with AI
            </Link>
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="flex flex-wrap h-auto p-1 max-w-full justify-start gap-1">
          <TabsTrigger value="all" className="text-xs">
            All ({counts.all})
          </TabsTrigger>
          <TabsTrigger value="private" className="text-xs">
            Private ({counts.private})
          </TabsTrigger>
          <TabsTrigger value="public" className="text-xs">
            Public ({counts.public})
          </TabsTrigger>
          <TabsTrigger value="unlisted" className="text-xs">
            Unlisted ({counts.unlisted})
          </TabsTrigger>
          <TabsTrigger value="building" className="text-xs">
            Building ({counts.building})
          </TabsTrigger>
          <TabsTrigger value="archived" className="text-xs">
            Archived ({counts.archived})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {filteredIdeas.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed p-12 text-center">
              <div className="rounded-full bg-primary/10 p-3 mb-3 text-primary">
                <Lightbulb className="size-6" />
              </div>
              <h3 className="font-semibold text-lg">No ideas found</h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                {searchQuery
                  ? 'No ideas match your search criteria. Try a different search.'
                  : `You don't have any ideas in this category yet.`}
              </p>
              <div className="mt-5 flex gap-2">
                <Button asChild size="sm" variant="default">
                  <Link href="/ai">
                    <Sparkles className="size-3.5 mr-1.5" />
                    Discover / Generate New Idea
                  </Link>
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredIdeas.map((idea) => (
                <IdeaCard
                  key={idea.id}
                  idea={idea}
                  isOwner={true}
                  isSavedInitial={savedIdeaIds.includes(idea.id)}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
