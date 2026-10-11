import { NextResponse } from 'next/server';
import { createHash } from 'node:crypto';
import { z } from 'zod';
import { getParent } from '@/lib/server/ownership';
import { createAdminClient } from '@/lib/supabase/admin';
import { generationInputSchema } from '@/lib/learning/contracts';
import { getObjectives, subjectSegment } from '@/lib/learning/objectives';
import { calculateAge } from '@/lib/utils';
import {
  enabledQuestionTypes,
  generationAvailability,
} from '@/lib/server/features';
import { fulfillGeneration, PipelineError } from '@/services/ai/pipeline';
import { generateWorksheet, GenerationError } from '@/services/ai/gemini';
import type { Json } from '@/types/database';
import { GRADES_BY_LEVEL } from '@/types';

export const maxDuration = 60;
const reservationSchema = z.object({
  id: z.uuid(),
  status: z.enum(['reserved', 'succeeded', 'failed']),
  created: z.boolean(),
  worksheetId: z.string().nullable().optional(),
});
const json = (v: unknown): Json => JSON.parse(JSON.stringify(v)) as Json;
export async function POST(request: Request) {
  let requestId: string | undefined;
  let pipelineHandled = false;
  const fail = (error: string, status: number, retrySameKey = false) =>
    NextResponse.json(
      { error, retrySameKey },
      { status, headers: { 'Cache-Control': 'no-store' } }
    );
  try {
    const { supabase, profile } = await getParent();
    const availability = generationAvailability(profile.id);
    if (!availability.enabled)
      return fail(
        availability.message || 'Pembuatan soal AI belum diaktifkan.',
        503
      );
    const text = await request.text();
    if (text.length > 4000) return fail('Permintaan terlalu panjang.', 400);
    const parsed = generationInputSchema.safeParse(JSON.parse(text));
    if (!parsed.success)
      return fail('Pilihan latihan tidak valid. Jumlah soal harus 1–20.', 400);
    const input = parsed.data;
    if (!enabledQuestionTypes().includes(input.questionType))
      return fail('Tipe soal ini belum tersedia pada tahap uji coba.', 400);
    const { data: child } = await supabase
      .from('children')
      .select('*')
      .eq('id', input.childId)
      .eq('parent_id', profile.id)
      .single();
    if (!child) return fail('Profil anak tidak ditemukan.', 404);
    const age = calculateAge(child.birth_date);
    if (
      !Number.isFinite(age) ||
      age < 1 ||
      age > 25 ||
      (child.grade && !GRADES_BY_LEVEL[child.level].includes(child.grade))
    )
      return fail('Periksa tanggal lahir dan kelas pada profil anak.', 400);
    const { data: subject } = await supabase
      .from('subjects')
      .select('*')
      .eq('id', input.subjectId)
      .eq('level', child.level)
      .single();
    if (!subject) return fail('Pelajaran tidak sesuai jenjang anak.', 400);
    if (
      !subjectSegment(subject.name).allowedQuestionTypes.includes(
        input.questionType
      )
    )
      return fail('Tipe soal tidak sesuai pelajaran.', 400);
    if (input.questionType === 'image_label' && input.questionCount > 3)
      return fail('Label tumbuhan mendukung maksimal 3 soal berbeda.', 400);
    if (input.questionType === 'guess_image' && input.questionCount > 17)
      return fail('Tebak gambar mendukung maksimal 17 soal berbeda.', 400);
    const objective = input.objectiveId
      ? getObjectives(subject.name, child.level, child.grade || '').find(
          (o) => o.id === input.objectiveId
        )
      : undefined;
    if (input.objectiveId && !objective)
      return fail('Tujuan belajar tidak sesuai profil.', 400);
    const params = {
      ...input,
      age,
      level: child.level,
      grade: child.grade || '',
      subject: subject.name,
      objective: objective?.label,
      topic: input.topic || objective?.label,
      interest: child.interests?.[0]?.slice(0, 40),
    };
    const admin = createAdminClient();
    const hash = createHash('sha256')
      .update(JSON.stringify(input))
      .digest('hex');
    const { data, error } = await admin.rpc('reserve_generation', {
      p_parent: profile.id,
      p_key: input.requestKey,
      p_hash: hash,
      p_count: input.questionCount,
    });
    if (error) {
      const code = error.message;
      return fail(
        code.includes('QUOTA_EXHAUSTED')
          ? 'Kuota soal tidak cukup.'
          : code.includes('SUBSCRIPTION_INACTIVE')
            ? 'Masa aktif paket telah berakhir.'
            : code.includes('KEY_CONFLICT')
              ? 'Permintaan berubah. Mulai pembuatan baru.'
              : code.includes('RATE_LIMIT')
                ? 'Batas permintaan tercapai. Coba lagi satu jam kemudian.'
                : 'Pembuatan belum tersedia. Hubungi pengelola.',
        code.includes('KEY_CONFLICT')
          ? 409
          : code.includes('RATE_LIMIT')
            ? 429
            : 403
      );
    }
    const reservation = reservationSchema.parse(data);
    if (!reservation.created) {
      if (reservation.status === 'succeeded' && reservation.worksheetId)
        return NextResponse.json({
          worksheetId: reservation.worksheetId,
          reused: true,
        });
      return fail(
        reservation.status === 'reserved'
          ? 'Permintaan ini masih diproses.'
          : 'Permintaan sebelumnya gagal. Mulai pembuatan baru.',
        409,
        reservation.status === 'reserved'
      );
    }
    requestId = reservation.id;
    pipelineHandled = true;
    const worksheetId = await fulfillGeneration({
      generate: () => generateWorksheet(params),
      save: async ({ worksheet, usage }) => {
        const { data, error } = await admin.rpc('finalize_generation', {
          p_request: reservation.id,
          p_child: child.id,
          p_subject: subject.id,
          p_params: json(params),
          p_result: json(worksheet),
          p_usage: json(usage),
        });
        if (error || !data) throw new Error('SAVE_FAILED');
        return data;
      },
      release: async (code, usage) => {
        const { data, error } = await admin.rpc('fail_generation', {
          p_request: reservation.id,
          p_code: code,
          p_usage: usage ? json(usage) : {},
        });
        if (error) {
          console.error('generation_release_failed', {
            requestId: reservation.id,
            code: error.code,
          });
          throw new Error('RELEASE_FAILED');
        }
        return z
          .object({
            status: z.string(),
            worksheetId: z.string().nullable().optional(),
          })
          .parse(data);
      },
    });
    return NextResponse.json(
      { worksheetId },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (error) {
    if (requestId && !pipelineHandled) {
      const { error: releaseError } = await createAdminClient().rpc(
        'fail_generation',
        {
          p_request: requestId,
          p_code:
            error instanceof GenerationError ? error.code : 'SERVER_ERROR',
          p_usage: error instanceof GenerationError ? json(error.usage) : {},
        }
      );
      if (releaseError) {
        console.error('generation_release_failed', {
          requestId,
          code: releaseError.code,
        });
        return fail(
          'Pembuatan gagal. Reservasi kuota akan dipulihkan pada permintaan berikutnya setelah 15 menit.',
          500
        );
      }
    }
    if (error instanceof Error && error.message === 'UNAUTHORIZED')
      return fail('Silakan masuk terlebih dahulu.', 401);
    if (error instanceof SyntaxError)
      return fail('Permintaan tidak valid.', 400);
    return fail(
      error instanceof PipelineError
        ? error.message
        : 'Pembuatan gagal. Silakan coba lagi.',
      500,
      error instanceof PipelineError ? error.retrySameKey : !!requestId
    );
  }
}
