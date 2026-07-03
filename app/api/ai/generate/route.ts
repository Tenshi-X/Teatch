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

    // Generate worksheet using Gemini
    const worksheet = await generateWorksheet(body);

    return NextResponse.json(worksheet);
  } catch (error) {
    console.error('AI generate error:', error);
    const message =
      error instanceof Error ? error.message : 'Gagal menggenerate soal';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
