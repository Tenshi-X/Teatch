import 'server-only';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

export function avatarPath(
  value: string | null,
  userId: string
): string | null {
  if (!value) return null;
  let path = value;
  if (/^https?:/.test(value)) {
    try {
      const url = new URL(value),
        origin = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL || '').origin;
      if (url.origin !== origin) return null;
      path = decodeURIComponent(url.pathname.split('/avatars/')[1] || '');
    } catch {
      return null;
    }
  }
  return (path.startsWith(`${userId}/`) || path.startsWith(`${userId}-`)) &&
    !path.includes('..')
    ? path
    : null;
}
export async function signedAvatar(
  db: SupabaseClient<Database>,
  value: string | null,
  userId: string
): Promise<string | undefined> {
  const path = avatarPath(value, userId);
  if (!path) return undefined;
  const { data } = await db.storage.from('avatars').createSignedUrl(path, 3600);
  return data?.signedUrl;
}
export async function uploadAvatar(
  db: SupabaseClient<Database>,
  entry: FormDataEntryValue | null,
  userId: string
): Promise<string | undefined> {
  if (!(entry instanceof File) || entry.size === 0) return undefined;
  if (entry.size > 2097152) throw new Error('Foto maksimal 2 MB.');
  const bytes = new Uint8Array(await entry.arrayBuffer());
  const png = bytes.slice(0, 8).join(',') === '137,80,78,71,13,10,26,10';
  const jpeg = bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255;
  const webp =
    new TextDecoder().decode(bytes.slice(0, 4)) === 'RIFF' &&
    new TextDecoder().decode(bytes.slice(8, 12)) === 'WEBP';
  const type = png
    ? 'image/png'
    : jpeg
      ? 'image/jpeg'
      : webp
        ? 'image/webp'
        : '';
  if (!type || entry.type !== type)
    throw new Error('Gunakan foto PNG, JPG, atau WebP yang valid.');
  const path = `${userId}/${crypto.randomUUID()}.${png ? 'png' : jpeg ? 'jpg' : 'webp'}`;
  const { error } = await db.storage
    .from('avatars')
    .upload(path, bytes, { contentType: type, upsert: false });
  if (error) throw new Error('Foto belum dapat diunggah.');
  return path;
}
