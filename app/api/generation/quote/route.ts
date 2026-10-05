export const dynamic = 'force-dynamic';

import { NextResponse, type NextRequest } from 'next/server';
import { db } from '@/lib/db/client';
import * as schema from '@/lib/db/schema';
import { quotePrice, ladderPrice } from '@/lib/pricing/engine';
import { getGenerationService } from '@/lib/providers/registry';
import { PROMPT_MAX_LENGTH } from '@/lib/vilish/prompt-limits';
import type { CreativeSpec } from '@/lib/vilish/types';

const TASKS = ['text_to_image', 'image_to_image'];
const ASPECTS = ['1:1', '4:5', '9:16', '16:9'];
const QUALITIES = ['quick', 'studio', 'cinema'];

function validateSpec(body: any): { spec?: CreativeSpec; error?: string } {
  const spec = body?.spec;
  if (!spec || typeof spec !== 'object') return { error: 'Missing spec' };
  if (typeof spec.prompt !== 'string' || !spec.prompt.trim())
    return { error: 'spec.prompt must be a non-empty string' };
  if (spec.prompt.trim().length > PROMPT_MAX_LENGTH)
    return {
      error: `spec.prompt must be at most ${PROMPT_MAX_LENGTH} characters`,
    };
  if (!TASKS.includes(spec.task)) return { error: 'spec.task is invalid' };
  if (!ASPECTS.includes(spec.aspectRatio))
    return { error: 'spec.aspectRatio is invalid' };
  if (!QUALITIES.includes(spec.quality))
    return { error: 'spec.quality is invalid' };
  return { spec: spec as CreativeSpec };
}

/**
 * POST /api/generation/quote
 * Body: { spec: CreativeSpec }
 * Plans via the provider registry, prices via the pricing engine,
 * persists a QUOTED job + 15-minute quote. Provider errors -> 502.
 */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const { spec, error } = validateSpec(body);
  if (!spec) {
    return NextResponse.json(
      { code: 'INVALID_SPEC', error: error ?? 'Invalid spec' },
      { status: 400 }
    );
  }

  let plan: {
    providerId: string;
    model: string;
    estimatedCostPaise: number;
  };
  try {
    const service = getGenerationService();
    plan = await service.plan(spec);
  } catch {
    return NextResponse.json(
      { code: 'PROVIDER_UNAVAILABLE', error: 'Generation provider unavailable' },
      { status: 502 }
    );
  }

  const breakdown = quotePrice({ providerCostPaise: plan.estimatedCostPaise });
  // Slice retail: the single-image ladder price (value-based, floor-protected).
  // The cost breakdown is tracked for margins; the customer always sees
  // the exact retail price before paying.
  const retailPaise = ladderPrice('singleImage', plan.estimatedCostPaise);
  const priceShown = { ...breakdown, retailPaise };
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

  try {
    const [job] = await db
      .insert(schema.generationJobs)
      .values({
        state: 'QUOTED',
        task: spec.task,
        prompt: spec.prompt,
        enhancedPrompt: spec.enhancedPrompt ?? null,
        negativePrompt: spec.negativePrompt ?? null,
        aspectRatio: spec.aspectRatio,
        quality: spec.quality,
        providerId: plan.providerId,
        model: plan.model,
        estimatedCost: plan.estimatedCostPaise,
        customerPrice: retailPaise,
        idempotencyKey: crypto.randomUUID(),
      })
      .returning();

    const [quote] = await db
      .insert(schema.quotes)
      .values({
        jobId: job.id,
        breakdown: priceShown,
        totalPaise: retailPaise,
        expiresAt,
      })
      .returning();

    return NextResponse.json({
      quoteId: quote.id,
      jobId: job.id,
      breakdown: priceShown,
      totalPaise: retailPaise,
      expiresAt: expiresAt.toISOString(),
    });
  } catch (err) {
    return NextResponse.json(
      { code: 'QUOTE_FAILED', error: 'Failed to create quote' },
      { status: 500 }
    );
  }
}
