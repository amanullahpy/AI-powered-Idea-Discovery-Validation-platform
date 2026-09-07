import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-pathname', request.nextUrl.pathname);

  let supabaseResponse = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANT: Avoid adding logic between createServerClient and
  // supabase.auth.getUser(). Extra work here can make session refresh bugs hard
  // to diagnose.

  const protectedPrefixes = [
    '/dashboard',
    '/onboarding',
    '/ai',
    '/ideas',
    '/saved',
    '/validation',
    '/trends',
    '/competitors',
    '/activity',
    '/settings',
    '/profile',
    '/private-item',
    '/private-items',
  ];

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const isPublicIdea = pathname.startsWith('/ideas/public/') || pathname.startsWith('/public/ideas/');

  const isProtected =
    !isPublicIdea &&
    protectedPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));

  // 1. If unauthenticated user tries to access private protected route:
  if (!user && isProtected) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    const returnUrl = pathname + (request.nextUrl.search || '');
    url.searchParams.set('next', encodeURIComponent(returnUrl));
    return NextResponse.redirect(url);
  }

  // 2. If authenticated user tries to access auth pages (login, signup, forgot-password):
  const authRoutes = ['/login', '/sign-up', '/forgot-password'];
  const isAuthRoute = authRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`));
  if (user && isAuthRoute) {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    url.search = '';
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
