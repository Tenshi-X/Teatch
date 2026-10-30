import { createHash, timingSafeEqual } from 'node:crypto';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(request: Request) {
  const secret = process.env.TEATCH_MAINTENANCE_SECRET;
  const token = request.headers.get('authorization') || '';
  const digest = (s: string) => createHash('sha256').update(s).digest();
  if (!secret || !timingSafeEqual(digest(token), digest(`Bearer ${secret}`)))
    return Response.json(
      { error: 'Unauthorized' },
      { status: 401, headers: { 'Cache-Control': 'no-store' } }
    );
  const { data, error } = await createAdminClient().rpc('maintain_runtime', {});
  if (error)
    return Response.json({ error: 'Maintenance failed' }, { status: 503 });
  return Response.json(
    { result: data },
    { headers: { 'Cache-Control': 'no-store' } }
  );
}
