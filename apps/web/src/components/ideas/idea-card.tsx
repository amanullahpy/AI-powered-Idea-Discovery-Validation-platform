'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Bookmark,
  Clock,
  Coins,
  ExternalLink,
  Eye,
  Globe,
  LockKeyhole,
  MoreVertical,
  Share2,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { toggleSaveIdeaAction, updateIdeaVisibilityAction, deleteIdeaAction } from '@/data/ideas/actions';
import { toast } from 'sonner';

export interface IdeaItem {
  id: string;
  title: string;
  slug: string;
  short_description: string;
  description?: string | null;
  problem?: string | null;
  solution?: string | null;
  target_audience?: string | null;
  monetization?: string | null;
  category_id?: string | null;
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'HARD';
  estimated_cost?: string | null;
  estimated_time?: string | null;
  visibility: 'PRIVATE' | 'PUBLIC' | 'UNLISTED';
  status: 'DRAFT' | 'SAVED' | 'VALIDATING' | 'BUILDING' | 'LAUNCHED' | 'ARCHIVED';
  ai_generated?: boolean;
  categories?: {
    name: string;
    slug: string;
    icon?: string | null;
  } | null;
  owner_id?: string | null;
}

interface IdeaCardProps {
  idea: IdeaItem;
  isOwner?: boolean;
  isSavedInitial?: boolean;
  matchScore?: number;
  matchReasons?: string[];
  showSaveButton?: boolean;
}

export function IdeaCard({
  idea,
  isOwner = false,
  isSavedInitial = false,
  matchScore,
  matchReasons,
  showSaveButton = true,
}: IdeaCardProps) {
  const [isSaved, setIsSaved] = useState(isSavedInitial);
  const [visibility, setVisibility] = useState(idea.visibility);
  const [isPending, startTransition] = useTransition();

  function handleToggleSave() {
    startTransition(async () => {
      try {
        const res = await toggleSaveIdeaAction({ ideaId: idea.id });
        setIsSaved(res.data?.saved ?? !isSaved);
        toast.success(res.data?.saved ? 'Idea saved to bookmarks!' : 'Idea removed from saved.');
      } catch (err: any) {
        toast.error(err.message || 'Failed to update saved status');
      }
    });
  }

  function handleVisibilityChange(newVis: 'PRIVATE' | 'PUBLIC' | 'UNLISTED') {
    startTransition(async () => {
      try {
        await updateIdeaVisibilityAction({ id: idea.id, visibility: newVis });
        setVisibility(newVis);
        toast.success(`Idea visibility updated to ${newVis.toLowerCase()}.`);
      } catch (err: any) {
        toast.error(err.message || 'Failed to change visibility');
      }
    });
  }

  function handleDelete() {
    if (!confirm('Are you sure you want to delete this idea?')) return;
    startTransition(async () => {
      try {
        await deleteIdeaAction({ id: idea.id, softDelete: true });
        toast.success('Idea moved to trash.');
      } catch (err: any) {
        toast.error(err.message || 'Failed to delete idea');
      }
    });
  }

  function handleShare() {
    const url = `${window.location.origin}/ideas/public/${idea.slug}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      toast.success('Public link copied to clipboard!');
    } else {
      toast.info(`Public URL: ${url}`);
    }
  }

  const difficultyColors = {
    BEGINNER: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400',
    INTERMEDIATE: 'bg-blue-500/10 text-blue-600 border-blue-500/20 dark:text-blue-400',
    ADVANCED: 'bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400',
    HARD: 'bg-rose-500/10 text-rose-600 border-rose-500/20 dark:text-rose-400',
  };

  return (
    <Card className="flex flex-col justify-between border bg-card text-card-foreground shadow-sm transition-all hover:shadow-md hover:border-border/80">
      <CardHeader className="space-y-2 p-5 pb-3">
        {/* Top Badges & Actions */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5 min-w-0">
            {idea.categories && (
              <Badge variant="secondary" className="text-xs font-semibold">
                {idea.categories.name}
              </Badge>
            )}
            <Badge variant="outline" className={`text-xs border ${difficultyColors[idea.difficulty]}`}>
              {idea.difficulty.charAt(0) + idea.difficulty.slice(1).toLowerCase()}
            </Badge>
            {idea.ai_generated && (
              <Badge variant="outline" className="text-xs border-purple-500/20 bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center gap-1">
                <Sparkles className="size-3" />
                AI
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-1">
            {isOwner && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="size-7">
                    <MoreVertical className="size-4" />
                    <span className="sr-only">Idea Options</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel className="text-xs">Visibility</DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => handleVisibilityChange('PRIVATE')}>
                    <LockKeyhole className="size-3.5 mr-2 text-muted-foreground" />
                    Private {visibility === 'PRIVATE' && '✓'}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleVisibilityChange('PUBLIC')}>
                    <Globe className="size-3.5 mr-2 text-emerald-500" />
                    Public {visibility === 'PUBLIC' && '✓'}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleVisibilityChange('UNLISTED')}>
                    <Eye className="size-3.5 mr-2 text-blue-500" />
                    Unlisted {visibility === 'UNLISTED' && '✓'}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleDelete} className="text-destructive focus:text-destructive">
                    <Trash2 className="size-3.5 mr-2" />
                    Delete Idea
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>

        {/* Title */}
        <Link href={isOwner ? `/ideas/${idea.id}` : `/ideas/public/${idea.slug}`} className="group">
          <h3 className="font-bold text-base md:text-lg leading-snug tracking-tight group-hover:text-primary transition-colors line-clamp-2">
            {idea.title}
          </h3>
        </Link>
      </CardHeader>

      <CardContent className="space-y-3 px-5 py-0 flex-1">
        <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
          {idea.short_description}
        </p>

        {/* Match score bar if available */}
        {typeof matchScore === 'number' && (
          <div className="rounded-md bg-muted/60 p-2.5 space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-foreground flex items-center gap-1">
                <Sparkles className="size-3 text-primary" />
                Match Fit
              </span>
              <span className="font-bold text-primary">{matchScore}%</span>
            </div>
            {matchReasons && matchReasons.length > 0 && (
              <p className="text-[11px] text-muted-foreground line-clamp-1">
                {matchReasons[0]}
              </p>
            )}
          </div>
        )}

        {/* Metadata Badges */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground pt-1">
          {idea.estimated_cost && (
            <div className="flex items-center gap-1">
              <Coins className="size-3 text-muted-foreground" />
              <span>{idea.estimated_cost}</span>
            </div>
          )}
          {idea.estimated_time && (
            <div className="flex items-center gap-1">
              <Clock className="size-3 text-muted-foreground" />
              <span>{idea.estimated_time}</span>
            </div>
          )}
          {isOwner && (
            <div className="flex items-center gap-1 ml-auto">
              {visibility === 'PUBLIC' && <span title="Public"><Globe className="size-3 text-emerald-500" /></span>}
              {visibility === 'PRIVATE' && <span title="Private"><LockKeyhole className="size-3 text-muted-foreground" /></span>}
              {visibility === 'UNLISTED' && <span title="Unlisted"><Eye className="size-3 text-blue-500" /></span>}
              <span className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">
                {visibility}
              </span>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="flex flex-wrap items-center justify-between gap-2 border-t p-4 px-5 mt-4 bg-muted/20">
        <div className="flex flex-wrap items-center gap-1">
          {showSaveButton && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleToggleSave}
              disabled={isPending}
              className={`h-8 px-2.5 text-xs ${isSaved ? 'text-primary' : 'text-muted-foreground'}`}
              title={isSaved ? 'Saved' : 'Save Idea'}
            >
              <Bookmark className={`size-3.5 mr-1.5 ${isSaved ? 'fill-primary' : ''}`} />
              {isSaved ? 'Saved' : 'Save'}
            </Button>
          )}

          {(visibility === 'PUBLIC' || visibility === 'UNLISTED') && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleShare}
              className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground"
              title="Share Public Link"
            >
              <Share2 className="size-3.5" />
            </Button>
          )}
        </div>

        <Button size="sm" variant="default" className="h-8 text-xs font-semibold" asChild>
          <Link href={isOwner ? `/ideas/${idea.id}` : `/ideas/public/${idea.slug}`}>
            {isOwner ? 'View Cockpit' : 'Explore Idea'}
            <ExternalLink className="size-3 ml-1.5" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
