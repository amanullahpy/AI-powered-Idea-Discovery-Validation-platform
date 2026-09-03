import { Suspense } from 'react';
import { z } from 'zod';
import { Login } from './Login';
import { getCachedLoggedInSupabaseUser } from '@/rsc-data/supabase';
import { redirect } from 'next/navigation';
import { connection } from 'next/server';

const SearchParamsSchema = z.object({
  next: z.string().optional(),
});

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

async function LoginWrapper(props: {
  searchParams: SearchParams;
}) {
  await connection();
  const searchParams = await props.searchParams;
  const { next } = SearchParamsSchema.parse(searchParams);

  // If user is already authenticated, redirect them to their destination or dashboard
  const user = await getCachedLoggedInSupabaseUser();
  if (user) {
    redirect(next || '/dashboard');
  }

  return <Login next={next} />;
}

export default async function LoginPage(props: {
  searchParams: SearchParams;
}) {
  return (
    <Suspense>
      <LoginWrapper searchParams={props.searchParams} />
    </Suspense>
  );
}
