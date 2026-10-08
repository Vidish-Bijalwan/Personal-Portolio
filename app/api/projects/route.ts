export const dynamic = 'force-dynamic';

import { NextResponse, type NextRequest } from 'next/server';
import { db } from '@/lib/db/client';
import { requireSession } from '@/lib/auth';
import {
  createProject,
  isValidBrief,
  isValidName,
  listProjects,
  PROJECT_NAME_MAX,
  type CreativeBrief,
} from '@/lib/muse/projects';

/**
 * GET /api/projects
 * Auth required. Lists the signed-in user's projects (newest first).
 * Returns { projects: ProjectSummary[] } (contract §2) — summaries omit
 * the brief; fetch GET /api/projects/[id] for the full brief.
 */
export async function GET() {
  const { user, response: authResponse } = await requireSession();
  if (!user) return authResponse;

  const projects = await listProjects(db, user.id);
  return NextResponse.json({ projects });
}

/**
 * POST /api/projects
 * Body: { name: string, brief: CreativeBrief, primaryRef?: string, referenceIds?: string[] }
 * Auth required. Returns 201 { project: Project } (contract §2).
 */
export async function POST(req: NextRequest) {
  const { user, response: authResponse } = await requireSession();
  if (!user) return authResponse;

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== 'object') {
    return NextResponse.json(
      { code: 'INVALID_REQUEST', error: 'Request body must be JSON' },
      { status: 400 }
    );
  }

  if (!isValidName(body.name)) {
    return NextResponse.json(
      {
        code: 'INVALID_NAME',
        error: `name must be a non-empty string (max ${PROJECT_NAME_MAX} characters)`,
      },
      { status: 400 }
    );
  }
  if (!isValidBrief(body.brief)) {
    return NextResponse.json(
      { code: 'INVALID_BRIEF', error: 'brief is not a valid CreativeBrief' },
      { status: 400 }
    );
  }

  let primaryAsset: unknown;
  if (body.primaryRef !== undefined && body.primaryRef !== null) {
    if (typeof body.primaryRef !== 'string' || !body.primaryRef.trim()) {
      return NextResponse.json(
        { code: 'INVALID_PRIMARY_REF', error: 'primaryRef must be a non-empty string' },
        { status: 400 }
      );
    }
    primaryAsset = { refId: body.primaryRef.trim() };
  }

  let referenceIds: string[] | undefined;
  if (body.referenceIds !== undefined && body.referenceIds !== null) {
    if (
      !Array.isArray(body.referenceIds) ||
      body.referenceIds.some((r: unknown) => typeof r !== 'string')
    ) {
      return NextResponse.json(
        { code: 'INVALID_REFERENCE_IDS', error: 'referenceIds must be an array of strings' },
        { status: 400 }
      );
    }
    referenceIds = body.referenceIds;
  }

  const project = await createProject(db, user.id, {
    name: body.name,
    brief: body.brief as CreativeBrief,
    primaryAsset,
    referenceIds,
  });
  return NextResponse.json({ project }, { status: 201 });
}
