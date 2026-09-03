import { Github } from 'lucide-react';
import Link from 'next/link';

import { Brand } from '@/components/brand';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { siteConfig } from '@/config/site';

const footerLinks = [
  { href: '/discover', label: 'Discover' },
  { href: '/ai', label: 'AI Co-pilot' },
  { href: '/about', label: 'About' },
  { href: '/login', label: 'Sign in' },
  { href: '/sign-up', label: 'Create account' },
];

export default function Footer() {
  return (
    <footer className="border-t bg-muted/20">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-[1fr_auto] md:items-start">
          <div className="max-w-md space-y-3">
            <Link href="/" aria-label={`${siteConfig.name} home`} className="inline-flex">
              <Brand showTagline />
            </Link>
            <p className="text-sm leading-6 text-muted-foreground">
              {siteConfig.description}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-1 md:justify-end">
            {footerLinks.map((item) => (
              <Button key={item.href} variant="ghost" size="sm" asChild>
                <Link href={item.href}>{item.label}</Link>
              </Button>
            ))}
            <Button variant="ghost" size="icon-sm" asChild>
              <Link
                href={siteConfig.links.github}
                target="_blank"
                rel="noreferrer"
                aria-label={`${siteConfig.name} on GitHub`}
              >
                <Github aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </div>
        <Separator className="my-8" />
        <div className="flex flex-col gap-2 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>{siteConfig.footer.copyright}</p>
          <p>{siteConfig.footer.badge}</p>
        </div>
      </div>
    </footer>
  );
}
