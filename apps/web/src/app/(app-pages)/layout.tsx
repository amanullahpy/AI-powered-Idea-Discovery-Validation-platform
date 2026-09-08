import { Suspense, type ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { connection } from 'next/server';

import { DynamicBreadcrumb } from '@/components/dynamic-breadcrumb';
import { CommandPalette } from '@/components/command-palette';
import { ModeToggle } from '@/components/ui/mode-toggle';
import { Separator } from '@/components/ui/separator';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { getCachedIsUserLoggedIn } from '@/rsc-data/supabase';
import { AppSidebar } from './app-sidebar';

export const instant = false;

async function AuthGuard({ children }: { children: ReactNode }) {
  await connection();
  const isLoggedIn = await getCachedIsUserLoggedIn();
  if (!isLoggedIn) redirect('/login');
  return <>{children}</>;
}

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="min-w-0 overflow-hidden flex flex-col h-svh max-h-svh">
        <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-1.5 sm:gap-2 border-b bg-background/90 px-3 sm:px-4 backdrop-blur-md min-w-0">
          <SidebarTrigger className="-ml-1 shrink-0" />
          <Separator orientation="vertical" className="mr-1 sm:mr-2 h-4 shrink-0" />
          <div className="min-w-0 flex-1 overflow-hidden">
            <Suspense fallback={null}>
              <DynamicBreadcrumb />
            </Suspense>
          </div>
          <div className="ml-auto flex items-center gap-1.5 sm:gap-2 shrink-0">
            <CommandPalette />
            <ModeToggle />
          </div>
        </header>
        <div className="flex h-[calc(100svh-3.5rem)] flex-1 flex-col overflow-y-auto bg-muted/15 min-w-0">
          <Suspense fallback={null}>
            <AuthGuard>{children}</AuthGuard>
          </Suspense>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
