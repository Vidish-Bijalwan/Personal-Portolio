/**
 * Madam Muse — projects persistence service (backend workstream).
 *
 * TYPE NOTE: the CreativeBrief family below is a verbatim copy of the
 * contract shapes (CONTRACTS.md §1). The compiler workstream owns the
 * canonical file `src/lib/muse/brief.ts`, which is not in this branch's
 * snapshot yet. At integration (branch etch-madam-muse), re-point the
 * imports here to that file and delete the copies below — field names are
 * identical to the contract, so the swap is mechanical.
 */
import { and, desc, eq } from 'drizzle-orm';
import type { VilishDb } from '@/lib/db/client';
import { projects } from '@/lib/db/schema';

/* ---------------- contract §1 shapes (canonical: ./brief.ts) ---------------- */
import type { AssetMeta, CreativeBrief, RefMeta, RefRole, TaskType } from './brief';
export type { AssetMeta, CreativeBrief, RefMeta, RefRole, TaskType };

/* ---------------- contract §2 Project shapes ---------------- */

export interface LastResult {
  imageUrl?: string;
  videoUrl?: string;
  promptUsed: string;
}

export interface Project {
  id: string;
  name: string;
  brief: CreativeBrief;
  createdAt: string;
  updatedAt: string;
  revisions: number;
  lastResult?: LastResult;
}

/** Summary for GET /api/projects — omits the (potentially large) brief. */
export interface ProjectSummary {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  revisions: number;
}

/* ---------------- validation ---------------- */

const TASK_TYPES: TaskType[] = [
  'image-generate',
  'image-edit',
  'video-edit',
  'video-generate',
];

export const PROJECT_NAME_MAX = 200;

export function isValidBrief(v: unknown): v is CreativeBrief {
  if (!v || typeof v !== 'object') return false;
  const b = v as Record<string, unknown>;
  if (b.version !== 1) return false;
  if (typeof b.taskType !== 'string' || !TASK_TYPES.includes(b.taskType as TaskType))
    return false;
  if (typeof b.instruction !== 'string' || !b.instruction.trim()) return false;
  if (!b.outputSpec || typeof b.outputSpec !== 'object') return false;
  return true;
}

export function isValidName(v: unknown): v is string {
  return (
    typeof v === 'string' &&
    v.trim().length > 0 &&
    v.trim().length <= PROJECT_NAME_MAX
  );
}

export function isValidLastResult(v: unknown): v is LastResult {
  if (!v || typeof v !== 'object') return false;
  const r = v as Record<string, unknown>;
  if (typeof r.promptUsed !== 'string' || !r.promptUsed.trim()) return false;
  if (r.imageUrl !== undefined && typeof r.imageUrl !== 'string') return false;
  if (r.videoUrl !== undefined && typeof r.videoUrl !== 'string') return false;
  return true;
}

export const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isValidUuid(v: unknown): v is string {
  return typeof v === 'string' && UUID_RE.test(v);
}

/* ---------------- serialization ---------------- */

function iso(d: Date | null | undefined): string {
  return d ? d.toISOString() : new Date(0).toISOString();
}

export function serializeProject(
  row: typeof projects.$inferSelect
): Project {
  const project: Project = {
    id: row.id,
    name: row.name,
    brief: (row.brief ?? {}) as CreativeBrief,
    createdAt: iso(row.createdAt),
    updatedAt: iso(row.updatedAt),
    revisions: row.revisions ?? 0,
  };
  if (row.lastResult) project.lastResult = row.lastResult as LastResult;
  return project;
}

function serializeSummary(row: typeof projects.$inferSelect): ProjectSummary {
  return {
    id: row.id,
    name: row.name,
    createdAt: iso(row.createdAt),
    updatedAt: iso(row.updatedAt),
    revisions: row.revisions ?? 0,
  };
}

/* ---------------- CRUD (all user-scoped) ---------------- */

export interface CreateProjectInput {
  name: string;
  brief: CreativeBrief;
  /** ref id string from POST body `primaryRef` */
  primaryAsset?: unknown;
  referenceIds?: string[];
}

export async function createProject(
  database: VilishDb,
  userId: string,
  input: CreateProjectInput
): Promise<Project> {
  const [row] = await database
    .insert(projects)
    .values({
      userId,
      name: input.name.trim(),
      brief: input.brief as unknown as Record<string, unknown>,
      primaryAsset:
        input.primaryAsset === undefined
          ? null
          : (input.primaryAsset as Record<string, unknown>),
      referenceIds: input.referenceIds ?? [],
      revisions: 0,
      lastResult: null,
      updatedAt: new Date(),
    })
    .returning();
  return serializeProject(row);
}

export async function listProjects(
  database: VilishDb,
  userId: string
): Promise<ProjectSummary[]> {
  const rows = await database
    .select()
    .from(projects)
    .where(eq(projects.userId, userId))
    .orderBy(desc(projects.updatedAt));
  return rows.map(serializeSummary);
}

export async function getProject(
  database: VilishDb,
  userId: string,
  id: string
): Promise<Project | null> {
  const rows = await database
    .select()
    .from(projects)
    .where(and(eq(projects.id, id), eq(projects.userId, userId)))
    .limit(1);
  return rows[0] ? serializeProject(rows[0]) : null;
}

export interface UpdateProjectInput {
  name?: string;
  brief?: CreativeBrief;
  lastResult?: LastResult;
}

/**
 * Applies a PATCH. When `lastResult` is included (a result was delivered),
 * `revisions` increments by 1 — the conversational-revision counter.
 */
export async function updateProject(
  database: VilishDb,
  userId: string,
  id: string,
  input: UpdateProjectInput
): Promise<Project | null> {
  const existing = await database
    .select()
    .from(projects)
    .where(and(eq(projects.id, id), eq(projects.userId, userId)))
    .limit(1);
  const row = existing[0];
  if (!row) return null;

  const set: Partial<typeof projects.$inferInsert> = {
    updatedAt: new Date(),
  };
  if (input.name !== undefined) set.name = input.name.trim();
  if (input.brief !== undefined)
    set.brief = input.brief as unknown as Record<string, unknown>;
  if (input.lastResult !== undefined) {
    set.lastResult = input.lastResult as unknown as Record<string, unknown>;
    set.revisions = (row.revisions ?? 0) + 1;
  }
  const [updated] = await database
    .update(projects)
    .set(set)
    .where(eq(projects.id, id))
    .returning();
  return serializeProject(updated);
}
