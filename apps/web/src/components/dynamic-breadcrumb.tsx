'use client';

import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Home } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const routeLabels: Record<string, string> = {
    dashboard: 'Dashboard',
    ai: 'AI Co-pilot',
    discover: 'Discover Ideas',
    ideas: 'My Ideas',
    saved: 'Saved Ideas',
    settings: 'Settings',
    onboarding: 'Onboarding',
    'private-items': 'Private Items',
    'private-item': 'Private Item',
    item: 'Item',
    new: 'New',
};

export function DynamicBreadcrumb() {
    const pathname = usePathname();
    const segments = pathname.split('/').filter(Boolean);

    if (segments.length === 0) {
        return (
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbPage>Home</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>
        );
    }

    return (
        <Breadcrumb className="min-w-0">
            <BreadcrumbList className="flex-nowrap overflow-hidden">
                <BreadcrumbItem className="shrink-0">
                    <BreadcrumbLink asChild>
                        <Link href="/dashboard" className="flex items-center gap-1">
                            <Home className="h-3.5 w-3.5 shrink-0" />
                            <span className="hidden sm:inline">Home</span>
                        </Link>
                    </BreadcrumbLink>
                </BreadcrumbItem>
                {segments.map((segment, index) => {
                    const isLast = index === segments.length - 1;
                    const href = '/' + segments.slice(0, index + 1).join('/');
                    const label = routeLabels[segment] || segment;

                    // Skip UUID segments in breadcrumb display
                    const isUUID =
                        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
                            segment
                        );
                    if (isUUID && !isLast) return null;

                    return (
                        <div key={segment + index} className="flex items-center gap-1 min-w-0">
                            <BreadcrumbSeparator className="shrink-0" />
                            <BreadcrumbItem className="min-w-0">
                                {isLast ? (
                                    <BreadcrumbPage className="truncate max-w-[110px] sm:max-w-[200px] md:max-w-none font-medium">
                                        {isUUID ? 'Details' : label}
                                    </BreadcrumbPage>
                                ) : (
                                    <BreadcrumbLink asChild className="truncate max-w-[80px] sm:max-w-none">
                                        <Link href={href}>{label}</Link>
                                    </BreadcrumbLink>
                                )}
                            </BreadcrumbItem>
                        </div>
                    );
                })}
            </BreadcrumbList>
        </Breadcrumb>
    );
}
