export const dynamic = 'force-dynamic';

import { NextResponse, type NextRequest } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db/client';
import { freeGenerationAttachments, generations } from '@/lib/db/schema';
import { adminAuthFail } from '@/lib/fulfillment/guards';

/**
 * GET /api/admin/fulfillment/generations/[id]/attachments
 * Admin token auth (x-admin-token header). Returns the customer-uploaded
 * reference files attached to a free-tier generations row, so the
 * generation watcher (which cannot reach Postgres directly from its
 * sandbox) can fetch them over HTTPS.
 *
 * Response 200:
 * {
 *   "generationId": "<uuid>",
 *   "count": 2,
 *   "attachments": [
 *     {
 *       "id": "<uuid>",
 *       "filename": "ref.png",
 *       "mimeType": "image/png",
 *       "byteSize": 12345,
 *       "dataBase64": "<base64-encoded file bytes>",
 *       "createdAt": "2026-10-05T12:00:00.000Z"
 *     }
 *   ]
 * }
 * 401 when the x-admin-token header is missing/invalid.
 * 404 when the generation id does not exist (code GENERATION_NOT_FOUND).
 * Attachments were validated at upload time (8MB/file, 20MB total, 5 max,
 * allowlisted types) — the watcher should still treat bytes as untrusted.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authFail = adminAuthFail(req);
  if (authFail) return authFail;

  const { id } = await params;

  const genRows = await db
    .select({ id: generations.id })
    .from(generations)
    .where(eq(generations.id, id))
    .limit(1);
  if (!genRows[0]) {
    return NextResponse.json(
      { code: 'GENERATION_NOT_FOUND', error: 'Generation not found' },
      { status: 404 }
    );
  }

  const rows = await db
    .select({
      id: freeGenerationAttachments.id,
      filename: freeGenerationAttachments.filename,
      mimeType: freeGenerationAttachments.mimeType,
      byteSize: freeGenerationAttachments.byteSize,
      data: freeGenerationAttachments.data,
      createdAt: freeGenerationAttachments.createdAt,
    })
    .from(freeGenerationAttachments)
    .where(eq(freeGenerationAttachments.generationId, id))
    .orderBy(freeGenerationAttachments.createdAt);

  const attachments = rows.map((a) => {
    const bytes = Buffer.isBuffer(a.data)
      ? a.data
      : Buffer.from(a.data as unknown as Uint8Array);
    return {
      id: a.id,
      filename: a.filename,
      mimeType: a.mimeType,
      byteSize: a.byteSize,
      dataBase64: bytes.toString('base64'),
      createdAt: a.createdAt ? new Date(a.createdAt).toISOString() : null,
    };
  });

  return NextResponse.json(
    { generationId: id, count: attachments.length, attachments },
    { status: 200 }
  );
}
