import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { isPublicPath, copySessionResponse } from '@/lib/auth-session';

export async function updateSession(request: NextRequest) {
  if (isPublicPath(request.nextUrl.pathname)) return NextResponse.next();
  let response = NextResponse.next({ request });
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll(cookies, headers) {
          cookies.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          const next = NextResponse.next({ request });
          copySessionResponse(response, next);
          response = next;
          cookies.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
          Object.entries(headers || {}).forEach(([name, value]) =>
            response.headers.set(name, value)
          );
        },
      },
    }
  );
  // Keep the fresh server check, including session revocation.
  const {
    data: { user },
  } = await supabase.auth.getUser();
  response.headers.set('Cache-Control', 'private, no-store');
  const pathname = request.nextUrl.pathname;
  let destination: string | undefined;
  if (
    !user &&
    pathname !== '/login' &&
    pathname !== '/callback' &&
    !pathname.startsWith('/api/')
  )
    destination = '/login';
  if (user && pathname === '/login') destination = '/dashboard';
  if (!destination) return response;
  const url = request.nextUrl.clone();
  url.pathname = destination;
  const redirect = NextResponse.redirect(url);
  copySessionResponse(response, redirect);
  return redirect;
}
