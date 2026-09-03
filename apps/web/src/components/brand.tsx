import { Sparkles } from 'lucide-react';
import { siteConfig } from '@/config/site';
import { cn } from '@/lib/utils';

interface BrandProps {
  className?: string;
  showTagline?: boolean;
}

export function Brand({ className, showTagline = false }: BrandProps) {
  return (
    <span className={cn('flex min-w-0 items-center gap-2.5', className)}>
      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
        <Sparkles className="size-4 text-primary-foreground" aria-hidden="true" />
      </span>
      <span className="grid min-w-0 text-left leading-tight">
        <span className="truncate text-sm font-bold tracking-tight">
          {siteConfig.name}
        </span>
        {showTagline ? (
          <span className="truncate text-xs text-muted-foreground">
            {siteConfig.tagline}
          </span>
        ) : null}
      </span>
    </span>
  );
}
