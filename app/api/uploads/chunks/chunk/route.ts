export const dynamic = 'force-dynamic';

import { NextResponse, type NextRequest } from 'next/server';
import { requireSession } from '@/lib/auth';
import { writeUploadChunk } from '@/lib/muse/chunked-uploads';
import { MAX_CHUNK_BYTES, mb } from '@/lib/muse/chunk-plan';

/**
 * POST /api/uploads/chunks/chunk
 * multipart/form-data: sessionId, index (0-based), chunk=<bytes>
 * Auth required. A single chunk is capped at 2 MB (413 otherwise) so no
 * request can hit the serverless body limit. Re-sending an index is
 * idempotent (resume-safe).
 */
export async function POST(req: NextRequest) {
  const { user, response: authResponse } = await requireSession();
  if (!user) return authResponse;

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json(
      { code: 'INVALID_FORM', error: 'Expected multipart form-data' },
      { status: 400 }
    );
  }

  const sessionId =
    typeof form.get('sessionId') === 'string'
      ? (form.get('sessionId') as string)
      : '';
  const index = Number(form.get('index'));
  const chunk = form.get('chunk');

  if (!sessionId || !Number.isInteger(index) || index < 0) {
    return NextResponse.json(
      { code: 'INVALID_CHUNK', error: "'sessionId' and a non-negative integer 'index' are required" },
      { status: 400 }
    );
  }
  if (!(chunk instanceof File) || chunk.size === 0) {
    return NextResponse.json(
      { code: 'CHUNK_REQUIRED', error: "'chunk' file part is required" },
      { status: 400 }
    );
  }
  if (chunk.size > MAX_CHUNK_BYTES) {
    return NextResponse.json(
      {
        code: 'CHUNK_TOO_LARGE',
        error: `Chunk is ${mb(chunk.size)} — keep each chunk under ${mb(MAX_CHUNK_BYTES)}.`,
      },
      { status: 413 }
    );
  }

  const result = await writeUploadChunk(
    user.id,
    sessionId,
    index,
    Buffer.from(await chunk.arrayBuffer())
  );
  if (!result.ok) {
    const code =
      result.status === 410
        ? 'SESSION_EXPIRED'
        : result.status === 403
          ? 'FORBIDDEN'
          : 'CHUNK_REJECTED';
    return NextResponse.json(
      { code, error: result.error },
      { status: result.status ?? 400 }
    );
  }
  return NextResponse.json({ index, receivedCount: result.receivedCount });
}
