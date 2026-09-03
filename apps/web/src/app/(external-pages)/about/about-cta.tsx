import { ArrowRight, Compass } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';

export function AboutCTA() {
  return (
    <Empty className="border bg-muted/20 py-12">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Compass aria-hidden="true" />
        </EmptyMedia>
        <EmptyTitle>Ready to validate your next project?</EmptyTitle>
        <EmptyDescription>
          Explore hundreds of curated concepts or generate a tailored idea with your AI co-pilot today.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button size="lg" asChild>
          <Link href="/sign-up">
            Create Free Account
            <ArrowRight aria-hidden="true" />
          </Link>
        </Button>
      </EmptyContent>
    </Empty>
  );
}
