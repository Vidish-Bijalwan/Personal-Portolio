export const dynamic = 'force-dynamic';

import { NextResponse, type NextRequest } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db/client';
import { generationAttachments } from '@/lib/db/schema';
import { adminAuthFail } from '@/lib/fulfillment/guards';

const INLINE_MIMES = new Set([
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/gif',
]);

function safeFilename(name: string): string {
  return name.replace(/[^\w.\- ]+/g, '_').slice(0, 120) || 'attachment';
}

/**
 * GET /api/admin/fulfillment/attachments/[id]
 * Admin token auth. Streams one customer-uploaded reference file.
 * Images are served inline for quick viewing; everything else downloads.
 * X-Content-Type-Options: nosniff guards against MIME-sniffing of
 * disguised payloads (the extension gate is the trust boundary).
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authFail = adminAuthFail(req);
  if (authFail) return authFail;

  const { id } = await params;
  const rows = await db
    .select()
    .from(generationAttachments)
    .where(eq(generationAttachments.id, id))
    .limit(1);
  const att = rows[0];
  if (!att) {
    return NextResponse.json({ error: 'ATTACHMENT_NOT_FOUND' }, { status: 404 });
  }

  const bytes = Buffer.isBuffer(att.data)
    ? att.data
    : Buffer.from(att.data as unknown as Uint8Array);
  const disposition = INLINE_MIMES.has(att.mimeType)
    ? 'inline'
    : 'attachment';

  return new NextResponse(new Uint8Array(bytes), {
    status: 200,
    headers: {
      'content-type': att.mimeType,
      'content-length': String(bytes.byteLength),
      'content-disposition': `${disposition}; filename="${safeFilename(att.filename)}"`,
      'x-content-type-options': 'nosniff',
      'cache-control': 'private, max-age=3600',
    },
  });
}
