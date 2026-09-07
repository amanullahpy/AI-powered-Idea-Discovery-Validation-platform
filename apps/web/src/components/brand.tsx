import { siteConfig } from '@/config/site';
import { cn } from '@/lib/utils';

export function IdeaForgeLogo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('size-8 shrink-0', className)}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="brandBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0f172a" />
          <stop offset="100%" stopColor="#1e1b4b" />
        </linearGradient>
        <linearGradient id="brandRing" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="50%" stopColor="#a855f7" />
          <stop offset="100%" stopColor="#ec4899" />
        </linearGradient>
        <linearGradient id="brandFlame" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#f97316" />
          <stop offset="50%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#ffffff" />
        </linearGradient>
        <linearGradient id="brandSpark" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#818cf8" />
        </linearGradient>
      </defs>
      {/* Outer Hexagon / Squircle Container */}
      <rect
        x="1.5"
        y="1.5"
        width="37"
        height="37"
        rx="9"
        fill="url(#brandBg)"
        stroke="url(#brandRing)"
        strokeWidth="1.5"
      />
      {/* Crucible Anvil Base */}
      <path
        d="M11 28C11 27 12 26 13.5 26H26.5C28 26 29 27 29 28C29 29 28 30 26 30H14C12 30 11 29 11 28Z"
        fill="url(#brandRing)"
      />
      {/* Forge Facets */}
      <path
        d="M13 24L17.5 17C18 16.2 19 16.8 18.8 17.7L18 24H13Z"
        fill="url(#brandSpark)"
        fillOpacity="0.8"
      />
      <path
        d="M27 24L22.5 17C22 16.2 21 16.8 21.2 17.7L22 24H27Z"
        fill="url(#brandRing)"
        fillOpacity="0.8"
      />
      {/* Rising Core Flame */}
      <path
        d="M20 9C20.5 12 22.5 13.5 22.5 16C22.5 18.5 20.8 21 20 22.5C19.2 21 17.5 18.5 17.5 16C17.5 13.5 19.5 12 20 9Z"
        fill="url(#brandFlame)"
      />
      {/* Diamond Spark / AI Core */}
      <path
        d="M20 8L20.8 11.2L24 12L20.8 12.8L20 16L19.2 12.8L16 12L19.2 11.2Z"
        fill="#ffffff"
      />
    </svg>
  );
}

interface BrandProps {
  className?: string;
  showTagline?: boolean;
}

export function Brand({ className, showTagline = false }: BrandProps) {
  return (
    <span className={cn('flex min-w-0 items-center gap-2.5', className)}>
      <IdeaForgeLogo />
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
