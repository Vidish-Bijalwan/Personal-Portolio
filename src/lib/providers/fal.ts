// Status: READY_FOR_CREDENTIAL (needs FAL_KEY env, server-side only)
//
// 'server-only' semantics: NEVER import this module from client-side code.
// It reads a secret credential and must only execute in server contexts
// (API routes, server actions). No keys are ever logged.

import { fal } from '@fal-ai/client';
import type {
  AspectRatio,
  GenerationRequest,
  MediaProvider,
  ProviderQuote,
  ProviderStatus,
} from '../vilish/types';

type StatusResult = Awaited<ReturnType<MediaProvider['statusOf']>>;

const MODEL = 'fal-ai/flux/schnell';

/** fal.ai pricing for the slice: $0.003 per megapixel. */
const USD_PER_MEGAPIXEL = 0.003;

const ASPECT_TO_SIZE: Record<
  AspectRatio,
  'square_hd' | 'portrait_4_3' | 'portrait_16_9' | 'landscape_16_9'
> = {
  '1:1': 'square_hd',
  '4:5': 'portrait_4_3',
  '9:16': 'portrait_16_9',
  '16:9': 'landscape_16_9',
};

/** Approximate megapixels per fal-ai/flux/schnell image_size enum. */
const MP_ESTIMATE: Record<string, number> = {
  square_hd: 1.0,
  portrait_4_3: 1.0,
  portrait_16_9: 1.03,
  landscape_16_9: 1.0,
};

interface SchnellOutput {
  images?: Array<{ url?: string; has_nsfw_concepts?: boolean[] }>;
  has_nsfw_concepts?: boolean[];
}

function assertSupportedTask(req: GenerationRequest): void {
  if (req.task !== 'text_to_image') {
    throw new Error('task not supported in this slice');
  }
}

function requireKey(): string {
  const key = process.env.FAL_KEY;
  if (!key) {
    throw new Error('FAL_KEY not configured');
  }
  return key;
}

export class FalProvider implements MediaProvider {
  readonly id = 'fal';
  readonly displayName = 'fal.ai';
  readonly status: ProviderStatus = 'READY_FOR_CREDENTIAL';

  async quote(req: GenerationRequest): Promise<ProviderQuote> {
    assertSupportedTask(req);
    const size = ASPECT_TO_SIZE[req.aspectRatio];
    const usdInr = Number(process.env.FAL_USD_INR ?? 88);
    const costPaise = Math.ceil(USD_PER_MEGAPIXEL * MP_ESTIMATE[size] * usdInr * 100);
    return {
      providerId: this.id,
      model: MODEL,
      estimatedCostINR: costPaise,
      etaSeconds: 30,
    };
  }

  async generate(req: GenerationRequest): Promise<{ providerJobId: string }> {
    assertSupportedTask(req);
    const key = requireKey();
    fal.config({ credentials: key });
    const r = await fal.queue.submit(MODEL, {
      input: {
        prompt: req.prompt,
        image_size: ASPECT_TO_SIZE[req.aspectRatio],
        num_images: 1,
        seed: req.seed,
        output_format: 'png',
        enable_safety_checker: true,
      },
    });
    return { providerJobId: r.request_id };
  }

  async statusOf(providerJobId: string): Promise<StatusResult> {
    const key = requireKey();
    fal.config({ credentials: key });
    const s = await fal.queue.status(MODEL, { requestId: providerJobId });
    switch (s.status) {
      case 'IN_QUEUE':
        return { state: 'queued' };
      case 'IN_PROGRESS':
        return { state: 'generating' };
      case 'COMPLETED': {
        // fal.queue.result resolves to Result<T> = { data, requestId } —
        // the payload lives under `.data`.
        let data: SchnellOutput;
        try {
          const result = await fal.queue.result(MODEL, {
            requestId: providerJobId,
          });
          data = result.data as unknown as SchnellOutput;
        } catch (err) {
          return {
            state: 'failed',
            error: err instanceof Error ? err.message : 'fal result fetch failed',
          };
        }
        const url = data?.images?.[0]?.url;
        if (url) {
          return { state: 'ready', outputUrl: url };
        }
        const nsfw =
          data?.has_nsfw_concepts ?? data?.images?.[0]?.has_nsfw_concepts ?? [];
        if (nsfw.length > 0) {
          return { state: 'failed', error: 'moderation: nsfw flagged' };
        }
        return { state: 'failed', error: 'no output' };
      }
    }
    // Unreachable per the SDK's QueueStatus union, kept as a runtime guard.
    const unreachable: never = s;
    const unexpected = (unreachable as { status?: unknown }).status ?? 'unknown';
    return { state: 'failed', error: `unexpected fal status: ${unexpected}` };
  }
}
