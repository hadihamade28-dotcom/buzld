import { supabase } from './supabase';

const signedCache = new Map<string, { url: string; expires: number }>();

function requireClient() {
  if (!supabase) throw new Error('Supabase is not configured');
  return supabase;
}

/** Returns true if value is a storage path (not a full URL). */
export function isStoragePath(value: string) {
  return !value.startsWith('http://') && !value.startsWith('https://') && !value.startsWith('file://');
}

/** Upload a local image URI to the private photos bucket. Returns the storage path. */
export async function uploadProfilePhoto(
  userId: string,
  localUri: string,
  slot = 0,
): Promise<string> {
  const client = requireClient();
  const response = await fetch(localUri);
  const blob = await response.blob();
  const ext = localUri.split('.').pop()?.split('?')[0]?.toLowerCase() || 'jpg';
  const contentType =
    ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg';
  const path = `${userId}/photo-${slot}-${Date.now()}.${ext}`;

  const { error } = await client.storage.from('photos').upload(path, blob, {
    contentType,
    upsert: false,
  });
  if (error) throw error;
  return path;
}

/** Resolve a storage path or passthrough URL to a displayable URI. */
export async function resolvePhotoUrl(pathOrUrl: string | null | undefined): Promise<string | null> {
  if (!pathOrUrl) return null;
  if (!isStoragePath(pathOrUrl)) return pathOrUrl;

  const cached = signedCache.get(pathOrUrl);
  if (cached && cached.expires > Date.now()) return cached.url;

  const client = requireClient();
  const { data, error } = await client.storage.from('photos').createSignedUrl(pathOrUrl, 3600);
  if (error || !data?.signedUrl) return null;

  signedCache.set(pathOrUrl, { url: data.signedUrl, expires: Date.now() + 3_500_000 });
  return data.signedUrl;
}

export async function resolvePhotoUrls(paths: string[]): Promise<string[]> {
  const resolved = await Promise.all(paths.map((p) => resolvePhotoUrl(p)));
  return resolved.filter(Boolean) as string[];
}
