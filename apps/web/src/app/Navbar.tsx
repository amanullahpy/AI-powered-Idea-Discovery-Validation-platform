'use client';

import { useState, useEffect } from 'react';
import { Github, Menu, LayoutDashboard } from 'lucide-react';
import Link from 'next/link';

import { Brand } from '@/components/brand';
import { Button } from '@/components/ui/button';
import { ModeToggle } from '@/components/ui/mode-toggle';
import { createClient } from '@/supabase-clients/client';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { siteConfig } from '@/config/site';

export default function Navbar() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    try {
      const supabase = createClient();
      supabase.auth.getUser().then(({ data }) => {
        setUser(data?.user || null);
      });

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user || null);
      });

      return () => {
        subscription.unsubscribe();
      };
    } catch {
      // Offline / uninitialized
    }
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/90 backdrop-blur-lg supports-[backdrop-filter]:bg-background/75">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" aria-label={`${siteConfig.name} home`} className="shrink-0">
          <Brand />
        </Link>

        <NavigationMenu className="hidden md:flex">
          <NavigationMenuList>
            {siteConfig.navigation.map((item) => (
              <NavigationMenuItem key={item.href}>
                <NavigationMenuLink asChild>
                  <Link
                    href={item.href}
                    className={cn(
                      navigationMenuTriggerStyle(),
                      'bg-transparent text-muted-foreground'
                    )}
                  >
                    {item.label}
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>

        <div className="ml-auto flex items-center gap-1.5">
          <Button variant="ghost" size="sm" asChild className="hidden lg:flex">
            <Link
              href={siteConfig.links.github}
              target="_blank"
              rel="noreferrer"
            >
              <Github aria-hidden="true" />
              GitHub
            </Link>
          </Button>
          <ModeToggle />

          {user ? (
            <Button asChild size="sm" className="hidden sm:flex font-semibold">
              <Link href="/dashboard">
                <LayoutDashboard className="size-3.5 mr-1.5" />
                Go to Dashboard
              </Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm" className="hidden sm:flex">
                <Link href="/login">Sign in</Link>
              </Button>
              <Button asChild size="sm" className="hidden sm:flex">
                <Link href="/sign-up">Get started</Link>
              </Button>
            </>
          )}

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu aria-hidden="true" />
                <span className="sr-only">Open navigation</span>
              </Button>
            </SheetTrigger>
            <SheetContent className="flex w-[min(22rem,85vw)] flex-col">
              <SheetHeader className="text-left">
                <SheetTitle>
                  <Brand />
                </SheetTitle>
                <SheetDescription>
                  {siteConfig.tagline}
                </SheetDescription>
              </SheetHeader>
              <nav className="mt-6 grid gap-1">
                {siteConfig.navigation.map((item) => (
                  <SheetClose asChild key={item.href}>
                    <Button variant="ghost" asChild className="justify-start">
                      <Link href={item.href}>{item.label}</Link>
                    </Button>
                  </SheetClose>
                ))}
              </nav>
              <div className="mt-auto grid gap-2 pt-8">
                {user ? (
                  <SheetClose asChild>
                    <Button asChild className="font-semibold">
                      <Link href="/dashboard">
                        <LayoutDashboard className="size-3.5 mr-1.5" />
                        Go to Dashboard
                      </Link>
                    </Button>
                  </SheetClose>
                ) : (
                  <>
                    <SheetClose asChild>
                      <Button variant="outline" asChild>
                        <Link href="/login">Sign in</Link>
                      </Button>
                    </SheetClose>
                    <SheetClose asChild>
                      <Button asChild>
                        <Link href="/sign-up">Get started</Link>
                      </Button>
                    </SheetClose>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
