'use client';

import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { IdeaCard, type IdeaItem } from '@/components/ideas/idea-card';
import { Compass, Filter, Search, Sparkles, X } from 'lucide-react';

interface CategoryOption {
  id: string;
  name: string;
  slug: string;
  icon?: string | null;
}

interface ScoredIdea extends IdeaItem {
  matchScore?: number;
  matchReasons?: string[];
}

interface DiscoverViewProps {
  categories: CategoryOption[];
  initialIdeas: ScoredIdea[];
  savedIdeaIds: string[];
  currentUserId?: string | null;
}

export function DiscoverView({
  categories,
  initialIdeas,
  savedIdeaIds,
  currentUserId,
}: DiscoverViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategorySlug, setSelectedCategorySlug] = useState<string | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'recommended' | 'newest'>('recommended');

  const filteredIdeas = useMemo(() => {
    let list = initialIdeas.filter((idea) => {
      // Category filter
      if (selectedCategorySlug && idea.categories?.slug !== selectedCategorySlug) {
        return false;
      }

      // Difficulty filter
      if (selectedDifficulty && idea.difficulty !== selectedDifficulty) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const inTitle = idea.title.toLowerCase().includes(q);
        const inDesc = idea.short_description.toLowerCase().includes(q);
        const inCategory = idea.categories?.name?.toLowerCase().includes(q);
        if (!inTitle && !inDesc && !inCategory) return false;
      }

      return true;
    });

    if (sortBy === 'recommended') {
      list.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
    }

    return list;
  }, [initialIdeas, selectedCategorySlug, selectedDifficulty, searchQuery, sortBy]);

  const hasActiveFilters = selectedCategorySlug !== null || selectedDifficulty !== null || searchQuery.trim() !== '';

  function clearFilters() {
    setSelectedCategorySlug(null);
    setSelectedDifficulty(null);
    setSearchQuery('');
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-2.5">
          <Compass className="size-7 text-primary" />
          Discover Public Opportunities
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground max-w-3xl">
          Explore validated problem spaces, market gaps, and curated project blueprints submitted by the community.
        </p>
      </div>

      {/* Search and Sort controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by keyword, problem, or technology..."
            className="pl-9 text-sm h-10"
          />
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={sortBy === 'recommended' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setSortBy('recommended')}
            className="text-xs h-9"
          >
            <Sparkles className="size-3.5 mr-1 text-primary" />
            Recommended
          </Button>
          <Button
            variant={sortBy === 'newest' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setSortBy('newest')}
            className="text-xs h-9"
          >
            Newest
          </Button>

          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearFilters}
              className="text-xs h-9 text-muted-foreground hover:text-foreground"
            >
              <X className="size-3.5 mr-1" />
              Reset Filters
            </Button>
          )}
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 no-scrollbar">
        <button
          type="button"
          onClick={() => setSelectedCategorySlug(null)}
          className={`px-3.5 py-1.5 rounded-full text-xs font-medium border transition-colors shrink-0 ${
            selectedCategorySlug === null
              ? 'bg-primary text-primary-foreground border-primary'
              : 'bg-background hover:bg-accent text-muted-foreground border-border'
          }`}
        >
          All Categories
        </button>
        {categories.map((cat) => {
          const isSelected = selectedCategorySlug === cat.slug;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategorySlug(isSelected ? null : cat.slug)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium border transition-colors shrink-0 ${
                isSelected
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-background hover:bg-accent text-muted-foreground border-border'
              }`}
            >
              {cat.name}
            </button>
          );
        })}
      </div>

      {/* Difficulty Quick Filters */}
      <div className="flex items-center gap-2 text-xs">
        <span className="text-muted-foreground text-[11px] font-semibold uppercase tracking-wider mr-1">
          Difficulty:
        </span>
        {['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'HARD'].map((diff) => {
          const isSelected = selectedDifficulty === diff;
          return (
            <button
              key={diff}
              type="button"
              onClick={() => setSelectedDifficulty(isSelected ? null : diff)}
              className={`px-2.5 py-1 rounded-md border text-xs transition-colors ${
                isSelected
                  ? 'bg-muted font-bold text-foreground border-foreground/30'
                  : 'text-muted-foreground hover:text-foreground border-border'
              }`}
            >
              {diff.charAt(0) + diff.slice(1).toLowerCase()}
            </button>
          );
        })}
      </div>

      {/* Ideas Grid */}
      {filteredIdeas.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed p-12 text-center">
          <div className="rounded-full bg-primary/10 p-3 mb-3 text-primary">
            <Compass className="size-6" />
          </div>
          <h3 className="font-semibold text-lg">No matching public ideas found</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm">
            Try clearing your filters or generate a custom idea with the AI co-pilot.
          </p>
          <div className="mt-5 flex gap-2">
            <Button size="sm" variant="outline" onClick={clearFilters}>
              Reset Filters
            </Button>
            <Button size="sm" asChild>
              <a href="/ai">
                <Sparkles className="size-3.5 mr-1.5" />
                Generate with AI
              </a>
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredIdeas.map((idea) => (
            <IdeaCard
              key={idea.id}
              idea={idea}
              isOwner={idea.owner_id === currentUserId}
              isSavedInitial={savedIdeaIds.includes(idea.id)}
              matchScore={idea.matchScore}
              matchReasons={idea.matchReasons}
            />
          ))}
        </div>
      )}
    </div>
  );
}
