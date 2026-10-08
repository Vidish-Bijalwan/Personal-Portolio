/**
 * Madam Muse — pipeline wiring helpers (backend workstream).
 *
 * Threads `brief` + `compiledPrompt` + `projectId` from the unified
 * composer through the EXISTING order-creation APIs into the generations
 * queue, WITHOUT touching the worker/fulfillment path: the only thing
 * about the worker's input that changes is that the prompt text it reads
 * off the generations row is the smarter compiled prompt.
 *
 * Shared by:
 *   POST /api/generation/quote  (paid image: spec → generation_jobs row)
 *   POST /api/generation/start  (paid image: job → generations queue row)
 *   POST /api/free/generate     (free image: direct → generations queue row)
 *   POST /api/video/order       (paid video clip: direct → generations row)
 *
 * TYPE NOTE: CreativeBrief shape lives in `./projects` (contract §1 local
 * copy) — reconcile with `src/lib/muse/brief.ts` at integration.
 */
import { eq } from 'drizzle-orm';
import type { VilishDb } from '@/lib/db/client';
import { projects } from '@/lib/db/schema';
import { PROMPT_MAX } from '@/lib/free/policy';
import { isValidBrief, isValidUuid, type CreativeBrief } from './projects';

export interface MusePipelineFields {
  /** Validated CreativeBrief, or null when not supplied. */
  brief: CreativeBrief | null;
  /** Validated compiled prompt (1..PROMPT_MAX chars), or null. */
  compiledPrompt: string | null;
  /** Validated project UUID, or null. Ownership is NOT checked here —
   *  routes verify/claim it against the session user. */
  projectId: string | null;
}

export interface MuseFieldParse {
  fields: MusePipelineFields;
  /** Human sentence for a 400 response, when present. */
  error?: string;
}

function parseBrief(v: unknown): {
  brief?: CreativeBrief;
  error?: string;
} {
  if (v === undefined || v === null) return {};
  let parsed: unknown = v;
  if (typeof v === 'string') {
    try {
      parsed = JSON.parse(v);
    } catch {
      return { error: 'brief must be valid JSON' };
    }
  }
  if (!isValidBrief(parsed)) {
    return { error: 'brief is not a valid CreativeBrief' };
  }
  return { brief: parsed };
}

function parseCompiledPrompt(v: unknown): {
  compiledPrompt?: string | null;
  error?: string;
} {
  if (v === undefined || v === null) return { compiledPrompt: null };
  if (typeof v !== 'string' || !v.trim()) {
    return { error: 'compiledPrompt must be a non-empty string' };
  }
  const trimmed = v.trim();
  if (trimmed.length > PROMPT_MAX) {
    return {
      error: `compiledPrompt must be at most ${PROMPT_MAX} characters`,
    };
  }
  return { compiledPrompt: trimmed };
}

function parseProjectId(v: unknown): {
  projectId?: string | null;
  error?: string;
} {
  if (v === undefined || v === null || v === '') return { projectId: null };
  if (!isValidUuid(v)) {
    return { error: 'projectId must be a valid UUID' };
  }
  return { projectId: v as string };
}

/** Extract muse pipeline fields from a parsed JSON body. */
export function parseMuseBody(body: unknown): MuseFieldParse {
  const b = (body ?? {}) as Record<string, unknown>;
  const briefR = parseBrief(b.brief);
  if (briefR.error) return { fields: emptyFields(), error: briefR.error };
  const promptR = parseCompiledPrompt(b.compiledPrompt);
  if (promptR.error) return { fields: emptyFields(), error: promptR.error };
  const projectR = parseProjectId(b.projectId);
  if (projectR.error) return { fields: emptyFields(), error: projectR.error };
  return {
    fields: {
      brief: briefR.brief ?? null,
      compiledPrompt: promptR.compiledPrompt ?? null,
      projectId: projectR.projectId ?? null,
    },
  };
}

/** Extract muse pipeline fields from multipart form data (brief arrives as a JSON string). */
export function parseMuseForm(form: FormData): MuseFieldParse {
  const get = (k: string): unknown => {
    const v = form.get(k);
    return typeof v === 'string' ? v : undefined;
  };
  return parseMuseBody({
    brief: get('brief'),
    compiledPrompt: get('compiledPrompt'),
    projectId: get('projectId'),
  });
}

function emptyFields(): MusePipelineFields {
  return { brief: null, compiledPrompt: null, projectId: null };
}

/**
 * The prompt the generations queue row carries. The compiled prompt
 * (from compilePrompt) wins when present — it IS the smarter prompt the
 * worker receives. `fallback` is the route's existing prompt source
 * (job.enhancedPrompt ?? job.prompt, the raw free prompt, or the
 * bank-enhanced video prompt).
 */
export function effectivePrompt(
  compiledPrompt: string | null | undefined,
  fallback: string
): string {
  const c = (compiledPrompt ?? '').trim();
  return c ? c : fallback;
}

/**
 * Verify a projectId against the session user and claim unowned projects.
 * Returns the projectId to store (null when none was requested).
 *
 * Rules:
 *  - project must exist, else 400 PROJECT_NOT_FOUND
 *  - project.userId null → claimed for this user (first authenticated use)
 *  - project.userId !== user.id → 403 (never leak another user's project)
 */
export async function resolveProjectRef(
  database: VilishDb,
  projectId: string | null,
  userId: string
): Promise<
  | { ok: true; projectId: string | null }
  | { ok: false; status: 400 | 403; code: string; error: string }
> {
  if (!projectId) return { ok: true, projectId: null };
  const rows = await database
    .select({ id: projects.id, userId: projects.userId })
    .from(projects)
    .where(eq(projects.id, projectId))
    .limit(1);
  const project = rows[0];
  if (!project) {
    return {
      ok: false,
      status: 400,
      code: 'PROJECT_NOT_FOUND',
      error: 'projectId does not match any project',
    };
  }
  if (project.userId && project.userId !== userId) {
    return {
      ok: false,
      status: 403,
      code: 'PROJECT_FORBIDDEN',
      error: 'Not your project',
    };
  }
  if (!project.userId) {
    await database
      .update(projects)
      .set({ userId, updatedAt: new Date() })
      .where(eq(projects.id, projectId));
  }
  return { ok: true, projectId };
}
