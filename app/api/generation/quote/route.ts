export const dynamic = 'force-dynamic';

import { NextResponse, type NextRequest } from 'next/server';
import { db } from '@/lib/db/client';
import * as schema from '@/lib/db/schema';
import { quotePrice, ladderPrice, PRICE_LADDER } from '@/lib/pricing/engine';
import {
  COMPOSER_SERVICES,
  type ComposerServiceId,
} from '@/lib/pricing/catalog';
import { getGenerationService } from '@/lib/providers/registry';
import { PROMPT_MAX_LENGTH } from '@/lib/vilish/prompt-limits';
import type { CreativeSpec } from '@/lib/vilish/types';

const TASKS = ['text_to_image', 'image_to_image'];
const ASPECTS = ['1:1', '4:5', '9:16', '16:9'];
const QUALITIES = ['quick', 'studio', 'cinema'];
/** Catalog products the image composer can quote. Anything else -> 400. */
const QUOTABLE_PRODUCTS: ComposerServiceId[] = COMPOSER_SERVICES.map((s) => s.id);

function validateProduct(body: any): ComposerServiceId {
  const p = body?.product;
  if (p === undefined || p === null) return 'single-image';
  if (typeof p === 'string' && (QUOTABLE_PRODUCTS as string[]).includes(p)) {
    return p as ComposerServiceId;
  }
  throw new Error('INVALID_PRODUCT');
}

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
 * Body: { spec: CreativeSpec, product?: 'single-image' | 'pack-4' | 'product-photo' }
 * Plans via the provider registry, prices via the pricing engine,
 * persists a QUOTED job + 15-minute quote. Provider errors -> 502.
 * The product selects the retail ladder (default 'single-image') and is
 * stamped on the job so the operator knows what was sold.
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
  let product: ComposerServiceId;
  try {
    product = validateProduct(body);
  } catch {
    return NextResponse.json(
      {
        code: 'INVALID_PRODUCT',
        error: `product must be one of: ${QUOTABLE_PRODUCTS.join(', ')}`,
      },
      { status: 400 }
    );
  }
  const ladderKey =
    COMPOSER_SERVICES.find((s) => s.id === product)!.ladderKey;
  if (!(ladderKey in PRICE_LADDER)) {
    return NextResponse.json(
      { code: 'INVALID_PRODUCT', error: 'Unknown product ladder' },
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
  // Slice retail: the product's ladder price (value-based, floor-protected).
  // The cost breakdown is tracked for margins; the customer always sees
  // the exact retail price before paying.
  const retailPaise = ladderPrice(ladderKey, plan.estimatedCostPaise);
  const priceShown = { ...breakdown, retailPaise, product };
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
        product,
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
      product,
      expiresAt: expiresAt.toISOString(),
    });
  } catch (err) {
    return NextResponse.json(
      { code: 'QUOTE_FAILED', error: 'Failed to create quote' },
      { status: 500 }
    );
  }
}
