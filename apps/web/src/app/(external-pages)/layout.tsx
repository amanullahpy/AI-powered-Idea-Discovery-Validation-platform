import Footer from '@/components/Footer';
import Navbar from '@/app/Navbar';
import { type ReactNode, Suspense } from 'react';
import { headers } from 'next/headers';
import { connection } from 'next/server';
import { getCachedLoggedInSupabaseUser } from '@/rsc-data/supabase';
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { AppSidebar } from '../(app-pages)/app-sidebar';
import { Separator } from '@/components/ui/separator';
import { DynamicBreadcrumb } from '@/components/dynamic-breadcrumb';
import { ModeToggle } from '@/components/ui/mode-toggle';

export const instant = false;

export default async function ExternalLayout({ children }: { children: ReactNode }) {
  await connection();
  const [user, headerList] = await Promise.all([
    getCachedLoggedInSupabaseUser(),
    headers(),
  ]);

  const pathname = headerList.get('x-pathname') || '';
  const isAppWorkspacePage =
    pathname.startsWith('/discover') ||
    pathname.startsWith('/ideas/public') ||
    pathname.startsWith('/public/ideas');

  if (user && isAppWorkspacePage) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="min-w-0 overflow-hidden">
          <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-1.5 sm:gap-2 border-b bg-background/90 px-3 sm:px-4 backdrop-blur-md min-w-0">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-1 sm:mr-2 h-4" />
            <div className="min-w-0 flex-1 overflow-hidden">
              <Suspense fallback={null}>
                <DynamicBreadcrumb />
              </Suspense>
            </div>
            <div className="ml-auto flex items-center gap-1.5 shrink-0">
              <ModeToggle />
            </div>
          </header>
          <div className="flex min-h-[calc(100svh-3.5rem)] flex-1 flex-col bg-muted/15 min-w-0">
            {children}
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
