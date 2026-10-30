import { z } from 'zod';
import { getParent } from '@/lib/server/ownership';
import { createAdminClient } from '@/lib/supabase/admin';
import { readGenerationStatus } from '@/lib/learning/generation-status';

export async function GET(request: Request) {
  const headers = { 'Cache-Control': 'private, no-store' };
  try {
    const { profile } = await getParent();
    const key = z
      .uuid()
      .safeParse(new URL(request.url).searchParams.get('requestKey'));
    if (!key.success)
      return Response.json(
        { error: 'Kunci permintaan tidak valid.' },
        { status: 400, headers }
      );
    const result = await readGenerationStatus(
      profile.id,
      key.data,
      async (parentId, requestKey) => {
        const { data, error } = await createAdminClient()
          .from('generation_requests')
          .select('status,worksheet_id')
          .eq('parent_id', parentId)
          .eq('request_key', requestKey)
          .maybeSingle();
        if (error) throw new Error('STATUS_UNAVAILABLE');
        return data;
      }
    );
    return Response.json(result, { headers });
  } catch (e) {
    return Response.json(
      {
        error:
          'Status belum dapat diperiksa. Permintaan tersimpan; coba kembali nanti.',
      },
      {
        status: e instanceof Error && e.message === 'UNAUTHORIZED' ? 401 : 503,
        headers,
      }
    );
  }
}
