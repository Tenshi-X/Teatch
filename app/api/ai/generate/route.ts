import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateWorksheet } from '@/services/ai/gemini';
import type { AIGenerateParams } from '@/types';

export async function POST(request: Request) {
  try {
    // Auth check
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = (await request.json()) as AIGenerateParams;

    // Validate required fields
    if (!body.subject || !body.questionType || !body.level) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Fetch user profile to check quota
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, worksheet_quota')
      .eq('auth_user_id', user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    if (profile.worksheet_quota !== undefined && profile.worksheet_quota <= 0) {
      return NextResponse.json({ error: 'Kuota worksheet Anda telah habis. Silakan upgrade paket berlangganan.' }, { status: 403 });
    }

    // Generate worksheet using Gemini
    const worksheet = await generateWorksheet(body);

    // Decrement quota on success
    if (profile.worksheet_quota !== undefined && profile.worksheet_quota > 0) {
      await supabase
        .from('profiles')
        .update({ worksheet_quota: profile.worksheet_quota - 1 })
        .eq('id', profile.id);
    }

    return NextResponse.json(worksheet);
  } catch (error) {
    console.error('AI generate error:', error);
    const message =
      error instanceof Error ? error.message : 'Gagal menggenerate soal';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
