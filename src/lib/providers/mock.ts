// Status: CONNECTED (dev-only; ALLOW_MOCK_PROVIDER=true required)
//
// 'server-only' semantics: dev-only provider. Returns watermarked SVG data
// URIs instead of real generations. Never touches a network or a vendor.

import { randomUUID } from 'node:crypto';
import type {
  GenerationRequest,
  MediaProvider,
  ProviderQuote,
  ProviderStatus,
} from '../vilish/types';

type StatusResult = Awaited<ReturnType<MediaProvider['statusOf']>>;

const WATERMARK = 'DEV MOCK — NOT A REAL GENERATION';
const PROMPT_PREVIEW_LEN = 57;

function escapeXml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function buildMockSvg(prompt: string): string {
  const truncated =
    prompt.length > PROMPT_PREVIEW_LEN
      ? prompt.slice(0, PROMPT_PREVIEW_LEN) + '...'
      : prompt;
  const esc = escapeXml(truncated);
  return (
    '<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800" viewBox="0 0 800 800">' +
    '<rect width="800" height="800" fill="#1a1a2e"/>' +
    '<rect x="40" y="40" width="720" height="720" fill="none" stroke="#e94560" stroke-width="8"/>' +
    '<g transform="rotate(-30 400 400)">' +
    '<text x="400" y="370" text-anchor="middle" font-family="sans-serif" font-size="58" font-weight="bold" fill="#e94560">' +
    WATERMARK +
    '</text>' +
    '<text x="400" y="450" text-anchor="middle" font-family="sans-serif" font-size="58" font-weight="bold" fill="#e94560">' +
    WATERMARK +
    '</text>' +
    '</g>' +
    '<text x="400" y="740" text-anchor="middle" font-family="sans-serif" font-size="26" fill="#ffffff">' +
    esc +
    '</text>' +
    '</svg>'
  );
}

interface MockJob {
  polls: number;
  prompt: string;
}

export class MockProvider implements MediaProvider {
  readonly id = 'mock';
  readonly displayName = 'Dev mock';
  readonly status: ProviderStatus = 'CONNECTED';

  private jobs = new Map<string, MockJob>();

  async quote(_req: GenerationRequest): Promise<ProviderQuote> {
    return {
      providerId: this.id,
      model: 'mock-svg',
      estimatedCostINR: 25,
      etaSeconds: 5,
    };
  }

  async generate(req: GenerationRequest): Promise<{ providerJobId: string }> {
    const id = `mock_${randomUUID()}`;
    this.jobs.set(id, { polls: 0, prompt: req.prompt });
    return { providerJobId: id };
  }

  async statusOf(providerJobId: string): Promise<StatusResult> {
    const job = this.jobs.get(providerJobId);
    const n = job?.polls ?? 0;
    if (job) {
      job.polls = n + 1;
    }
    if (n === 0) {
      return { state: 'queued' };
    }
    if (n === 1) {
      return { state: 'generating' };
    }
    const prompt = job?.prompt ?? '(no prompt)';
    const outputUrl = `data:image/svg+xml;utf8,${encodeURIComponent(
      buildMockSvg(prompt)
    )}`;
    return { state: 'ready', outputUrl };
  }
}
