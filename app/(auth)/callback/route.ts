import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { safeRedirectPath } from '@/lib/auth-redirect';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = safeRedirectPath(searchParams.get('next'));

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role, is_onboarded')
          .eq('auth_user_id', user.id)
          .single();

        if (profile) {
          if (!profile.is_onboarded) {
            return NextResponse.redirect(`${origin}/onboarding`);
          }
          if (profile.role === 'admin') {
            return NextResponse.redirect(`${origin}/admin`);
          }
        }
      }
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Return to login on error
  return NextResponse.redirect(`${origin}/login`);
}
