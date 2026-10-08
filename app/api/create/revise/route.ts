export const dynamic = 'force-dynamic';

import { NextResponse, type NextRequest } from 'next/server';
import { reviseBrief } from '@/lib/muse/intent-compiler';
import type { CreativeBrief } from '@/lib/muse/brief';

/**
 * POST /api/create/revise
 * Body: { brief: CreativeBrief; instruction: string }
 * Returns: { brief: CreativeBrief } — targeted patch: changes only the fields
 * the instruction addresses, preserves everything else. 400 on invalid input.
 */

function isCreativeBrief(v: unknown): v is CreativeBrief {
  if (typeof v !== 'object' || v === null) return false;
  const o = v as Record<string, unknown>;
  if (o.version !== 1) return false;
  if (typeof o.taskType !== 'string') return false;
  if (typeof o.instruction !== 'string') return false;
  if (typeof o.outputSpec !== 'object' || o.outputSpec === null) return false;
  if (!Array.isArray(o.references)) return false;
  if (!Array.isArray(o.preserve)) return false;
  if (!Array.isArray(o.modifiers)) return false;
  if (!Array.isArray(o.exclusions)) return false;
  return true;
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);

  if (typeof body !== 'object' || body === null) {
    return NextResponse.json({ error: 'Request body must be a JSON object' }, { status: 400 });
  }

  const { brief, instruction } = body as Record<string, unknown>;

  if (!isCreativeBrief(brief)) {
    return NextResponse.json(
      { error: 'brief is required and must be a valid CreativeBrief (version 1)' },
      { status: 400 }
    );
  }

  if (typeof instruction !== 'string' || instruction.trim().length === 0) {
    return NextResponse.json(
      { error: 'instruction is required and must be a non-empty string' },
      { status: 400 }
    );
  }

  const revised = reviseBrief(brief, instruction.trim());
  return NextResponse.json({ brief: revised });
}
