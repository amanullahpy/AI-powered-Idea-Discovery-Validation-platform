'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import {
  Bookmark,
  Compass,
  Laptop,
  LayoutDashboard,
  Lightbulb,
  Moon,
  Settings,
  Sliders,
  Sparkles,
  Sun,
} from 'lucide-react';

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { setTheme } = useTheme();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) || e.key === '/') {
        // Only trigger if not already typing in an input or textarea
        if (
          (e.target instanceof HTMLElement && e.target.isContentEditable) ||
          e.target instanceof HTMLInputElement ||
          e.target instanceof HTMLTextAreaElement ||
          e.target instanceof HTMLSelectElement
        ) {
          return;
        }
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const runCommand = React.useCallback((command: () => unknown) => {
    setOpen(false);
    command();
  }, []);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="hidden md:flex items-center gap-2 rounded-lg border bg-muted/30 hover:bg-accent px-2.5 py-1 text-xs text-muted-foreground transition-colors"
        aria-label="Search and command shortcut"
      >
        <span className="text-[11px]">Quick search...</span>
        <kbd className="pointer-events-none inline-flex h-4.5 select-none items-center gap-0.5 rounded border bg-background px-1.5 font-mono text-[10px] font-medium text-muted-foreground shadow-2xs">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a command or search sections..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>

          <CommandGroup heading="Navigation">
            <CommandItem
              onSelect={() => runCommand(() => router.push('/dashboard'))}
              className="cursor-pointer gap-2"
            >
              <LayoutDashboard className="size-4" />
              <span>Dashboard</span>
            </CommandItem>
            <CommandItem
              onSelect={() => runCommand(() => router.push('/ai'))}
              className="cursor-pointer gap-2"
            >
              <Sparkles className="size-4 text-primary" />
              <span>AI Idea Co-pilot</span>
            </CommandItem>
            <CommandItem
              onSelect={() => runCommand(() => router.push('/trends'))}
              className="cursor-pointer gap-2"
            >
              <Compass className="size-4 text-blue-500" />
              <span>Market Trends & Radar</span>
            </CommandItem>
            <CommandItem
              onSelect={() => runCommand(() => router.push('/ideas'))}
              className="cursor-pointer gap-2"
            >
              <Lightbulb className="size-4" />
              <span>My Ideas Workspace</span>
            </CommandItem>
            <CommandItem
              onSelect={() => runCommand(() => router.push('/validation'))}
              className="cursor-pointer gap-2"
            >
              <Sparkles className="size-4 text-emerald-500" />
              <span>Validation Matrix & Experiments</span>
            </CommandItem>
            <CommandItem
              onSelect={() => runCommand(() => router.push('/competitors'))}
              className="cursor-pointer gap-2"
            >
              <Lightbulb className="size-4 text-amber-500" />
              <span>Competitor Moat Studio</span>
            </CommandItem>
            <CommandItem
              onSelect={() => runCommand(() => router.push('/saved'))}
              className="cursor-pointer gap-2"
            >
              <Bookmark className="size-4 text-amber-500" />
              <span>Saved Bookmarks</span>
            </CommandItem>
            <CommandItem
              onSelect={() => runCommand(() => router.push('/discover'))}
              className="cursor-pointer gap-2"
            >
              <Compass className="size-4" />
              <span>Discover Public Ideas</span>
            </CommandItem>
            <CommandItem
              onSelect={() => runCommand(() => router.push('/activity'))}
              className="cursor-pointer gap-2"
            >
              <Laptop className="size-4 text-purple-500" />
              <span>Activity & Audit Trail</span>
            </CommandItem>
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Settings & Personalization">
            <CommandItem
              onSelect={() => runCommand(() => router.push('/onboarding'))}
              className="cursor-pointer gap-2"
            >
              <Sliders className="size-4" />
              <span>Retune Skills & Preferences</span>
            </CommandItem>
            <CommandItem
              onSelect={() => runCommand(() => router.push('/settings'))}
              className="cursor-pointer gap-2"
            >
              <Settings className="size-4" />
              <span>Account Settings</span>
            </CommandItem>
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Theme">
            <CommandItem
              onSelect={() => runCommand(() => setTheme('light'))}
              className="cursor-pointer gap-2"
            >
              <Sun className="size-4" />
              <span>Light Theme</span>
            </CommandItem>
            <CommandItem
              onSelect={() => runCommand(() => setTheme('dark'))}
              className="cursor-pointer gap-2"
            >
              <Moon className="size-4" />
              <span>Dark Theme</span>
            </CommandItem>
            <CommandItem
              onSelect={() => runCommand(() => setTheme('system'))}
              className="cursor-pointer gap-2"
            >
              <Laptop className="size-4" />
              <span>System Theme</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
