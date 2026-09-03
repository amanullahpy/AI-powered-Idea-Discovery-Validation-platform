import { Suspense } from 'react';
import { z } from 'zod';
import { SignUp } from './Signup';
import { getCachedLoggedInSupabaseUser } from '@/rsc-data/supabase';
import { redirect } from 'next/navigation';
import { connection } from 'next/server';

const SearchParamsSchema = z.object({
  next: z.string().optional(),
});

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

async function SignUpWrapper(props: {
  searchParams: SearchParams;
}) {
  await connection();
  const searchParams = await props.searchParams;
  const { next } = SearchParamsSchema.parse(searchParams);

  // If already authenticated, redirect to destination or dashboard
  const user = await getCachedLoggedInSupabaseUser();
  if (user) {
    redirect(next || '/dashboard');
  }

  return <SignUp next={next} />;
}

export default async function SignUpPage(props: {
  searchParams: SearchParams;
}) {
  return (
    <Suspense>
      <SignUpWrapper searchParams={props.searchParams} />
    </Suspense>
  );
}
