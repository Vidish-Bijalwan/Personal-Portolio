export const dynamic = 'force-dynamic';

import { NextResponse, type NextRequest } from 'next/server';
import { db } from '@/lib/db/client';
import * as schema from '@/lib/db/schema';
import { getSessionUser } from '@/lib/auth';
import { getStorage } from '@/lib/storage';

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB

const EXT_BY_MIME: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/svg+xml': 'svg',
  'image/avif': 'avif',
  'image/heic': 'heic',
};

function extFromMime(mime: string): string {
  const known = EXT_BY_MIME[mime.toLowerCase()];
  if (known) return known;
  const suffix = mime.split('/')[1]?.split('+')[0]?.replace(/[^a-z0-9]/gi, '');
  return suffix || 'bin';
}

/**
 * POST /api/assets/upload
 * multipart/form-data: file=<image>, kind?=<string>
 * Auth required. Accepts image/* up to 5 MB (413 otherwise). Stores under
 * proofs/<uuid>.<ext>, records an assets row, returns { assetId, url }.
 */
export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json(
      { code: 'UNAUTHENTICATED', error: 'Sign in required' },
      { status: 401 }
    );
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json(
      { code: 'INVALID_FORM', error: 'Expected multipart form-data' },
      { status: 400 }
    );
  }

  const file = form.get('file');
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json(
      { code: 'FILE_REQUIRED', error: "'file' is required" },
      { status: 400 }
    );
  }

  const mime = (file.type || '').toLowerCase();
  if (!mime.startsWith('image/')) {
    return NextResponse.json(
      { code: 'INVALID_FILE_TYPE', error: 'Only image/* uploads are allowed' },
      { status: 413 }
    );
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { code: 'FILE_TOO_LARGE', error: 'File must be at most 5 MB' },
      { status: 413 }
    );
  }

  const kindRaw = form.get('kind');
  const kind =
    typeof kindRaw === 'string' && kindRaw.trim()
      ? kindRaw.trim().slice(0, 64)
      : 'payment_proof';

  const key = `proofs/${crypto.randomUUID()}.${extFromMime(mime)}`;
  const buf = Buffer.from(await file.arrayBuffer());

  let url: string;
  try {
    ({ url } = await getStorage().put(key, buf, mime));
  } catch {
    return NextResponse.json(
      { code: 'UPLOAD_FAILED', error: 'Failed to store file' },
      { status: 502 }
    );
  }

  const [asset] = await db
    .insert(schema.assets)
    .values({
      userId: user.id,
      kind,
      url,
      mimeType: mime,
      sizeBytes: file.size,
    })
    .returning();

  return NextResponse.json({ assetId: asset.id, url });
}
