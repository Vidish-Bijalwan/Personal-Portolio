/**
 * GET /api/share-bundle?token=<token>
 *
 * Returns a stored PWA share bundle (written by /share-target) so the
 * /create intake can pre-attach the shared files:
 *
 *   { title, text, url, files: [{ name, mime, size, url }] }
 *
 * file.url points at the file under /storage/... (served statically by
 * Next from the local storage driver's public/storage root).
 *
 * 400 on a malformed token, 404 on unknown token, 410 once the bundle
 * is older than SHARE_BUNDLE_TTL_MS (24h).
 */
import { readFile } from 'node:fs/promises';
import { NextRequest, NextResponse } from 'next/server';
import {
  isPlausibleShareToken,
  isShareBundleExpired,
  shareMetaKey,
  type ShareBundleMeta,
} from '@/lib/pwa/share-target';
import { localStorageKeyPath } from '@/lib/storage';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest): Promise<NextResponse> {
  const token = (req.nextUrl.searchParams.get('token') ?? '').trim();
  if (!isPlausibleShareToken(token)) {
    return NextResponse.json({ error: 'bad_token' }, { status: 400 });
  }
  let meta: ShareBundleMeta;
  try {
    const raw = await readFile(localStorageKeyPath(shareMetaKey(token)), 'utf8');
    meta = JSON.parse(raw) as ShareBundleMeta;
  } catch {
    return NextResponse.json({ error: 'not_found' }, { status: 404 });
  }
  if (!meta || typeof meta.createdAt !== 'number' || isShareBundleExpired(meta.createdAt)) {
    return NextResponse.json({ error: 'expired' }, { status: 410 });
  }
  return NextResponse.json({
    title: meta.title ?? '',
    text: meta.text ?? '',
    url: meta.url ?? '',
    files: (meta.files ?? []).map((f) => ({
      name: f.name,
      mime: f.mime,
      size: f.size,
      url: `/storage/${f.key}`,
    })),
  });
}
