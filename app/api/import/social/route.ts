export const dynamic = 'force-dynamic';

import { NextResponse, type NextRequest } from 'next/server';
import { fetchImportMedia, validateImportUrl } from '@/lib/muse/social-import';
import { validateMuseUploads } from '@/lib/muse/uploads';

/**
 * POST /api/import/social
 * Body: { url: string }
 *
 * Downloads media from a public link SERVER-SIDE and returns the verified
 * bytes so the intake client can attach them through the normal file path
 * (same client-side validation, same brief flow as a manual upload).
 *
 * The route runs the existing muse upload policy
 * (validateMuseUploads: image/video allowlist + 8MB/file + magic-byte
 * sniff) on the downloaded bytes before returning them.
 *
 * Success: 200, body = the raw file bytes, with
 *   Content-Type: the verified media MIME
 *   Content-Disposition: attachment; filename="<name>"
 *   X-Muse-Import-Name / X-Muse-Import-Mime: for the client's File()
 *
 * Failures are HONEST JSON: { error: <code>, message: <plain sentence> }.
 * When a site blocks the server download (login walls, 403/429, bot
 * blocks) the message says so and tells the user to upload the file
 * directly. We never fake success and never hotlink.
 *
 * Public like /api/create/brief (the intake is pre-auth). SSRF-guarded:
 * http(s) only, no private/loopback hosts, every redirect hop re-checked.
 */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const rawUrl =
    body && typeof body === 'object'
      ? (body as Record<string, unknown>).url
      : undefined;

  const validated = validateImportUrl(rawUrl);
  if (!validated.ok) {
    return NextResponse.json(
      { error: validated.code, message: validated.message },
      { status: validated.status }
    );
  }

  const downloaded = await fetchImportMedia(validated.url);
  if (!downloaded.ok) {
    return NextResponse.json(
      { error: downloaded.code, message: downloaded.message },
      { status: downloaded.status }
    );
  }

  // Existing upload policy on the real bytes: MIME/size/signature.
  const check = validateMuseUploads([
    {
      name: downloaded.filename,
      type: downloaded.mime,
      size: downloaded.bytes.length,
      data: downloaded.bytes,
    },
  ]);
  if (!check.ok) {
    return NextResponse.json(
      { error: check.error, message: check.message },
      { status: 400 }
    );
  }

  const safeName = downloaded.filename.replace(/["\r\n]/g, '');
  // Copy into a fresh ArrayBuffer: NextResponse's BodyInit typing here
  // doesn't accept a bare Uint8Array view.
  const bodyBuf = downloaded.bytes.buffer.slice(
    downloaded.bytes.byteOffset,
    downloaded.bytes.byteOffset + downloaded.bytes.byteLength
  ) as ArrayBuffer;
  return new NextResponse(bodyBuf, {
    status: 200,
    headers: {
      'content-type': downloaded.mime,
      'content-disposition': `attachment; filename="${safeName}"`,
      'x-muse-import-name': encodeURIComponent(downloaded.filename),
      'x-muse-import-mime': downloaded.mime,
      'cache-control': 'no-store',
    },
  });
}
