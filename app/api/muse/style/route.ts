export const dynamic = 'force-dynamic';

import { NextResponse, type NextRequest } from 'next/server';
import { db } from '@/lib/db/client';
import { requireSession } from '@/lib/auth';
import {
  clearStyleMemory,
  deriveFingerprintFromProject,
  listStyleMemory,
  recordStyleApproval,
  removeStyleMemory,
  STYLE_MEMORY_CAP,
  type StoredStyle,
} from '@/lib/muse/style-memory';
import { getProject, isValidUuid } from '@/lib/muse/projects';

/**
 * Madam Muse approved-style memory (Phase 2). Auth required on all verbs.
 *
 * GET  /api/muse/style
 *   → { styles: [{ id, fingerprint, createdAt }] } newest first (≤20).
 *
 * POST /api/muse/style
 *   Body: { fingerprint: StyleFingerprint }
 *     — or { projectId: "<uuid>" } to derive the fingerprint from a
 *       project's brief (the "approve this result's style" path).
 *   → 201 { style }. 400 on invalid fingerprint / unknown project.
 *
 * DELETE /api/muse/style
 *   Body: {} → clears the whole memory; { id: "<uuid>" } → removes one.
 *   → { ok: true, removed: <count> }.
 */
export async function GET() {
  const { user, response: authResponse } = await requireSession();
  if (!user) return authResponse;

  const styles = await listStyleMemory(db, user.id);
  return NextResponse.json({ styles: styles.map(publicStyle) });
}

export async function POST(req: NextRequest) {
  const { user, response: authResponse } = await requireSession();
  if (!user) return authResponse;

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== 'object') {
    return NextResponse.json(
      { code: 'INVALID_REQUEST', error: 'Request body must be a JSON object' },
      { status: 400 }
    );
  }
  const b = body as Record<string, unknown>;

  let fingerprint: unknown;
  if (typeof b.projectId === 'string') {
    if (!isValidUuid(b.projectId)) {
      return NextResponse.json(
        { code: 'INVALID_PROJECT_ID', error: 'projectId must be a valid UUID' },
        { status: 400 }
      );
    }
    const project = await getProject(db, user.id, b.projectId);
    if (!project) {
      return NextResponse.json(
        { code: 'PROJECT_NOT_FOUND', error: 'No such project for this user' },
        { status: 404 }
      );
    }
    fingerprint = deriveFingerprintFromProject(project);
    if (!fingerprint) {
      return NextResponse.json(
        {
          code: 'NO_STYLE_TO_LEARN',
          error:
            'That project has no visual-family to learn from yet — compile a brief with a visual style first.',
        },
        { status: 400 }
      );
    }
  } else {
    fingerprint = b.fingerprint;
  }

  const stored = await recordStyleApproval(db, user.id, fingerprint);
  if (!stored) {
    return NextResponse.json(
      {
        code: 'INVALID_FINGERPRINT',
        error:
          'fingerprint must have a valid playbook visualFamily, 1–5 palette entries, and non-empty texture/typography hints.',
      },
      { status: 400 }
    );
  }
  return NextResponse.json(
    { style: publicStyle(stored), cap: STYLE_MEMORY_CAP },
    { status: 201 }
  );
}

export async function DELETE(req: NextRequest) {
  const { user, response: authResponse } = await requireSession();
  if (!user) return authResponse;

  const body = await req.json().catch(() => null);
  const b = body && typeof body === 'object' ? (body as Record<string, unknown>) : {};

  if (typeof b.id === 'string') {
    if (!isValidUuid(b.id)) {
      return NextResponse.json(
        { code: 'INVALID_ID', error: 'id must be a valid UUID' },
        { status: 400 }
      );
    }
    const removed = await removeStyleMemory(db, user.id, b.id);
    return NextResponse.json({ ok: true, removed: removed ? 1 : 0 });
  }

  const removed = await clearStyleMemory(db, user.id);
  return NextResponse.json({ ok: true, removed });
}

function publicStyle(s: StoredStyle) {
  return { id: s.id, fingerprint: s.fingerprint, createdAt: s.createdAt };
}
