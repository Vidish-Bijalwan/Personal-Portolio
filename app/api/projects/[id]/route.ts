export const dynamic = 'force-dynamic';

import { NextResponse, type NextRequest } from 'next/server';
import { db } from '@/lib/db/client';
import { requireSession } from '@/lib/auth';
import {
  getProject,
  isValidBrief,
  isValidLastResult,
  isValidName,
  isValidUuid,
  PROJECT_NAME_MAX,
  updateProject,
  type CreativeBrief,
  type LastResult,
} from '@/lib/muse/projects';

function badId() {
  return NextResponse.json(
    { code: 'INVALID_ID', error: 'Project id must be a valid UUID' },
    { status: 400 }
  );
}

/**
 * GET /api/projects/[id]
 * Auth required, owner-scoped. Returns { project: Project } (contract §2);
 * 404 when the project doesn't exist or belongs to someone else.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, response: authResponse } = await requireSession();
  if (!user) return authResponse;

  const { id } = await params;
  if (!isValidUuid(id)) return badId();

  const project = await getProject(db, user.id, id);
  if (!project) {
    return NextResponse.json(
      { code: 'NOT_FOUND', error: 'Project not found' },
      { status: 404 }
    );
  }
  return NextResponse.json({ project });
}

/**
 * PATCH /api/projects/[id]
 * Body: { name?: string, brief?: CreativeBrief, lastResult?: { imageUrl?, videoUrl?, promptUsed } }
 * Auth required, owner-scoped. Returns { project: Project } (contract §2).
 * When `lastResult` is included (a result was delivered), `revisions`
 * increments by 1 — the conversational-revision counter (contract §5).
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, response: authResponse } = await requireSession();
  if (!user) return authResponse;

  const { id } = await params;
  if (!isValidUuid(id)) return badId();

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== 'object') {
    return NextResponse.json(
      { code: 'INVALID_REQUEST', error: 'Request body must be JSON' },
      { status: 400 }
    );
  }

  const input: { name?: string; brief?: CreativeBrief; lastResult?: LastResult } = {};
  let touched = false;

  if (body.name !== undefined) {
    if (!isValidName(body.name)) {
      return NextResponse.json(
        {
          code: 'INVALID_NAME',
          error: `name must be a non-empty string (max ${PROJECT_NAME_MAX} characters)`,
        },
        { status: 400 }
      );
    }
    input.name = body.name;
    touched = true;
  }
  if (body.brief !== undefined) {
    if (!isValidBrief(body.brief)) {
      return NextResponse.json(
        { code: 'INVALID_BRIEF', error: 'brief is not a valid CreativeBrief' },
        { status: 400 }
      );
    }
    input.brief = body.brief;
    touched = true;
  }
  if (body.lastResult !== undefined) {
    if (!isValidLastResult(body.lastResult)) {
      return NextResponse.json(
        {
          code: 'INVALID_LAST_RESULT',
          error: 'lastResult must be { imageUrl?, videoUrl?, promptUsed } with a non-empty promptUsed',
        },
        { status: 400 }
      );
    }
    input.lastResult = body.lastResult;
    touched = true;
  }

  if (!touched) {
    return NextResponse.json(
      { code: 'NOTHING_TO_UPDATE', error: 'Provide at least one of: name, brief, lastResult' },
      { status: 400 }
    );
  }

  const project = await updateProject(db, user.id, id, input);
  if (!project) {
    return NextResponse.json(
      { code: 'NOT_FOUND', error: 'Project not found' },
      { status: 404 }
    );
  }
  return NextResponse.json({ project });
}
