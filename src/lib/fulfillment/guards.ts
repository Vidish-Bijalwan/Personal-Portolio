/**
 * Etch — fulfillment route guards (Phase 2 contract §5).
 *
 * - Every /api/admin/* route: fail-closed x-admin-token check.
 * - Every state-changing admin action: audit log (audit_logs table).
 * - Every job state change: assertTransition (throws TransitionError → 409).
 *
 * States are handled as plain strings so this module compiles against both
 * the current JobState union and the Phase-2 extended union (owned by the
 * types agent per contract §1/§2). Transition legality is always checked
 * against canTransition from the shared contract.
 */
import { NextResponse, type NextRequest } from 'next/server';
import { db } from '@/lib/db/client';
import { auditLogs } from '@/lib/db/schema';
import { canTransition, type JobState } from '@/lib/vilish/types';

/* ---------------- admin auth (fail-closed) ---------------- */

export function adminAuthFail(req: NextRequest): NextResponse | null {
  const token = process.env.ADMIN_TOKEN;
  if (!token || req.headers.get('x-admin-token') !== token) {
    return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
  }
  return null;
}

/** True only when a valid admin token is present (fail-closed). */
export function isAdminOverride(req: NextRequest): boolean {
  const token = process.env.ADMIN_TOKEN;
  return !!token && req.headers.get('x-admin-token') === token;
}

/* ---------------- audit ---------------- */

export async function auditAdmin(
  action: string,
  target: unknown,
  actorUserId = 'admin'
): Promise<void> {
  await db.insert(auditLogs).values({
    actorUserId,
    action,
    target: target as Record<string, unknown>,
  });
}

/* ---------------- transitions ---------------- */

export class TransitionError extends Error {
  readonly from: string;
  readonly to: string;
  constructor(from: string, to: string) {
    super(`Illegal transition ${from} -> ${to}`);
    this.name = 'TransitionError';
    this.from = from;
    this.to = to;
  }
}

/** Throw TransitionError unless the edge is legal in JOB_TRANSITIONS. */
export function assertTransition(from: string, to: string): void {
  if (!canTransition(from as JobState, to as JobState)) {
    throw new TransitionError(from, to);
  }
}

export function canTransitionState(from: string, to: string): boolean {
  return canTransition(from as JobState, to as JobState);
}

/** Map a caught error to a 409 for TransitionError; null otherwise. */
export function transitionErrorResponse(e: unknown): NextResponse | null {
  if (e instanceof TransitionError) {
    return NextResponse.json(
      {
        error: 'ILLEGAL_TRANSITION',
        message: `Illegal transition ${e.from} -> ${e.to}`,
      },
      { status: 409 }
    );
  }
  return null;
}

/** Wrap a state-changing admin handler: auth + TransitionError mapping. */
export async function withAdminTransition(
  req: NextRequest,
  handler: () => Promise<NextResponse>
): Promise<NextResponse> {
  const authFail = adminAuthFail(req);
  if (authFail) return authFail;
  try {
    return await handler();
  } catch (e) {
    const t = transitionErrorResponse(e);
    if (t) return t;
    throw e;
  }
}
