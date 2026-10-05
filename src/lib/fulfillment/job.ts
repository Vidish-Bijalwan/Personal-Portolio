/**
 * VILISH Studio — fulfillment job row helpers (Phase 2 contract §4/§5).
 *
 * The new `generation_jobs` columns (fulfillmentMode, jobKind, operatorNotes,
 * …) and the `fulfillment_results` table are created by the parallel schema
 * agent. This module codes against the CONTRACT names via a camelCase →
 * snake_case map and raw parameterized SQL, so it works with the migration
 * applied and degrades gracefully (defaults) when a row predates the columns.
 */
import { eq, sql, type SQL } from 'drizzle-orm';
import { db } from '@/lib/db/client';
import { generationJobs } from '@/lib/db/schema';

export type JobRow = typeof generationJobs.$inferSelect;

export type FulfillmentMode = 'operator' | 'provider';
export type JobKind = 'generation' | 'remake' | 'edit';

export interface FulfillmentJob extends JobRow {
  fulfillmentMode: FulfillmentMode;
  fulfillmentSource: string | null;
  jobKind: JobKind;
  operatorNotes: string | null;
  clarificationRequest: string | null;
  clarificationResponse: string | null;
  qcNotes: string | null;
  deliveredAt: Date | null;
}

/** Wrap a base row with contract defaults for the Phase-2 columns. */
export function asFulfillmentJob(row: JobRow): FulfillmentJob {
  const r = row as unknown as Partial<FulfillmentJob>;
  return {
    ...row,
    fulfillmentMode: r.fulfillmentMode ?? 'operator',
    fulfillmentSource: r.fulfillmentSource ?? null,
    jobKind: r.jobKind ?? 'generation',
    operatorNotes: r.operatorNotes ?? null,
    clarificationRequest: r.clarificationRequest ?? null,
    clarificationResponse: r.clarificationResponse ?? null,
    qcNotes: r.qcNotes ?? null,
    deliveredAt: r.deliveredAt ?? null,
  };
}

export async function getFulfillmentJob(
  id: string
): Promise<FulfillmentJob | null> {
  const [row] = await db
    .select()
    .from(generationJobs)
    .where(eq(generationJobs.id, id))
    .limit(1);
  return row ? asFulfillmentJob(row) : null;
}

/* ---------------- field patching ----------------
 * camelCase job field -> snake_case column. Column names are whitelisted
 * here; values are always parameterized. updated_at is bumped on every patch.
 */
const COLUMN: Record<string, string> = {
  state: 'state',
  fulfillmentMode: 'fulfillment_mode',
  fulfillmentSource: 'fulfillment_source',
  jobKind: 'job_kind',
  operatorNotes: 'operator_notes',
  clarificationRequest: 'clarification_request',
  clarificationResponse: 'clarification_response',
  qcNotes: 'qc_notes',
  deliveredAt: 'delivered_at',
  outputAssetId: 'output_asset_id',
  errorMessage: 'error_message',
};

export type JobPatch = Partial<
  Record<keyof typeof COLUMN, string | Date | null>
>;

export async function patchJob(
  jobId: string,
  fields: JobPatch
): Promise<void> {
  const sets: SQL[] = [];
  for (const [k, v] of Object.entries(fields)) {
    const col = COLUMN[k];
    if (!col) continue;
    sets.push(sql`${sql.raw(col)} = ${v}`);
  }
  sets.push(sql`updated_at = now()`);
  await db.execute(
    sql`update generation_jobs set ${sql.join(sets, sql`, `)} where id = ${jobId}`
  );
}

/* ---------------- fulfillment_results (contract §4) ---------------- */

export interface FulfillmentTake {
  id: string;
  jobId: string;
  takeLabel: string;
  assetId: string | null;
  resultType: string;
  notes: string | null;
  toolUsed: string | null;
  durationSeconds: number | null;
  width: number | null;
  height: number | null;
  estCostPaise: number | null;
  generationTimeSeconds: number | null;
  uploadedBy: string | null;
  createdAt: Date | null;
  assetUrl: string | null;
}

function rowsOf(res: unknown): Record<string, unknown>[] {
  if (Array.isArray(res)) return res as Record<string, unknown>[];
  const r = res as { rows?: unknown };
  if (Array.isArray(r?.rows)) return r.rows as Record<string, unknown>[];
  return [];
}

export async function getTakes(jobId: string): Promise<FulfillmentTake[]> {
  const res = await db.execute(sql`
    select fr.id, fr.job_id, fr.take_label, fr.asset_id, fr.result_type,
           fr.notes, fr.tool_used, fr.duration_seconds, fr.width, fr.height,
           fr.est_cost_paise, fr.generation_time_seconds, fr.uploaded_by,
           fr.created_at, a.url as asset_url
    from fulfillment_results fr
    left join assets a on a.id = fr.asset_id
    where fr.job_id = ${jobId}
    order by fr.created_at asc
  `);
  return rowsOf(res).map((r) => ({
    id: String(r.id),
    jobId: String(r.job_id),
    takeLabel: String(r.take_label),
    assetId: r.asset_id === null ? null : String(r.asset_id),
    resultType: String(r.result_type),
    notes: (r.notes as string | null) ?? null,
    toolUsed: (r.tool_used as string | null) ?? null,
    durationSeconds:
      r.duration_seconds === null ? null : Number(r.duration_seconds),
    width: r.width === null ? null : Number(r.width),
    height: r.height === null ? null : Number(r.height),
    estCostPaise:
      r.est_cost_paise === null ? null : Number(r.est_cost_paise),
    generationTimeSeconds:
      r.generation_time_seconds === null
        ? null
        : Number(r.generation_time_seconds),
    uploadedBy: (r.uploaded_by as string | null) ?? null,
    createdAt: r.created_at ? new Date(r.created_at as string) : null,
    assetUrl: (r.asset_url as string | null) ?? null,
  }));
}

export interface NewTake {
  jobId: string;
  takeLabel: string;
  assetId: string | null;
  resultType: 'video' | 'image';
  notes?: string | null;
  toolUsed?: string | null;
  durationSeconds?: number | null;
  width?: number | null;
  height?: number | null;
  estCostPaise?: number | null;
  generationTimeSeconds?: number | null;
  uploadedBy?: string | null;
}

export async function insertTake(t: NewTake): Promise<string> {
  const id = crypto.randomUUID();
  const res = await db.execute(sql`
    insert into fulfillment_results
      (id, job_id, take_label, asset_id, result_type, notes, tool_used,
       duration_seconds, width, height, est_cost_paise,
       generation_time_seconds, uploaded_by, created_at)
    values (${id}, ${t.jobId}, ${t.takeLabel}, ${t.assetId},
            ${t.resultType}, ${t.notes ?? null}, ${t.toolUsed ?? null},
            ${t.durationSeconds ?? null}, ${t.width ?? null},
            ${t.height ?? null}, ${t.estCostPaise ?? null},
            ${t.generationTimeSeconds ?? null}, ${t.uploadedBy ?? null},
            now())
    returning id
  `);
  const rows = rowsOf(res);
  return rows.length > 0 ? String(rows[0].id) : id;
}
