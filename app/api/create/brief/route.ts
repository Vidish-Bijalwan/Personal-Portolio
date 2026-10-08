export const dynamic = 'force-dynamic';

import { NextResponse, type NextRequest } from 'next/server';
import { compileBrief } from '@/lib/muse/intent-compiler';
import type { AssetMeta, RefMeta } from '@/lib/muse/brief';

/**
 * POST /api/create/brief
 * Body: { instruction: string; primary: AssetMeta | null; references: RefMeta[] }
 * Returns: { brief: CreativeBrief } — 400 on invalid input with { error }.
 * Deterministic, rule-based. No LLM, no network calls.
 */

function isAssetMeta(v: unknown): v is AssetMeta {
  if (typeof v !== 'object' || v === null) return false;
  const o = v as Record<string, unknown>;
  return (
    (o.kind === 'image' || o.kind === 'video') &&
    typeof o.name === 'string' &&
    typeof o.mime === 'string' &&
    typeof o.width === 'number' &&
    typeof o.height === 'number' &&
    typeof o.sizeBytes === 'number'
  );
}

function isRefMeta(v: unknown): v is RefMeta {
  if (!isAssetMeta(v)) return false;
  const o = v as unknown as Record<string, unknown>;
  return (
    typeof o.id === 'string' &&
    typeof o.role === 'string' &&
    typeof o.roleConfidence === 'number' &&
    typeof o.roleUserOverride === 'boolean'
  );
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);

  if (typeof body !== 'object' || body === null) {
    return NextResponse.json({ error: 'Request body must be a JSON object' }, { status: 400 });
  }

  const instruction = (body as Record<string, unknown>).instruction;
  const primaryRaw = (body as Record<string, unknown>).primary;
  const referencesRaw = (body as Record<string, unknown>).references;

  if (typeof instruction !== 'string' || instruction.trim().length === 0) {
    return NextResponse.json(
      { error: 'instruction is required and must be a non-empty string' },
      { status: 400 }
    );
  }

  if (primaryRaw !== null && primaryRaw !== undefined && !isAssetMeta(primaryRaw)) {
    return NextResponse.json(
      { error: 'primary must be null or a valid AssetMeta object' },
      { status: 400 }
    );
  }

  let references: RefMeta[] = [];
  if (referencesRaw !== undefined) {
    if (!Array.isArray(referencesRaw) || !referencesRaw.every(isRefMeta)) {
      return NextResponse.json(
        { error: 'references must be an array of valid RefMeta objects' },
        { status: 400 }
      );
    }
    references = referencesRaw;
  }

  const brief = compileBrief({
    instruction: instruction.trim(),
    primary: (primaryRaw as AssetMeta | null) ?? null,
    references,
  });
  return NextResponse.json({ brief });
}
