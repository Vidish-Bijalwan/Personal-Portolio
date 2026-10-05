// 'server-only' semantics: provider selection must only run server-side.
// Priority list comes from GENERATION_PROVIDER_PRIORITY (default 'fal,meta,mock').
// - Providers with status 'AWAITING_PROVIDER_ACCESS' are always skipped.
// - 'mock' is skipped unless ALLOW_MOCK_PROVIDER === 'true'.

import type {
  GenerationRequest,
  MediaProvider,
  ProviderQuote,
} from '../vilish/types';
import { FalProvider } from './fal';
import { MetaProvider } from './meta';
import { MockProvider } from './mock';

const FACTORIES: Record<string, () => MediaProvider> = {
  fal: () => new FalProvider(),
  meta: () => new MetaProvider(),
  mock: () => new MockProvider(),
};

function isUsable(provider: MediaProvider): boolean {
  if (provider.status === 'AWAITING_PROVIDER_ACCESS') {
    return false;
  }
  if (provider.id === 'mock' && process.env.ALLOW_MOCK_PROVIDER !== 'true') {
    return false;
  }
  return true;
}

export class GenerationService {
  constructor(private provider: MediaProvider) {}

  async plan(req: GenerationRequest): Promise<{
    providerId: string;
    model: string;
    estimatedCostPaise: number;
  }> {
    const q: ProviderQuote = await this.provider.quote(req);
    return {
      providerId: q.providerId,
      model: q.model,
      estimatedCostPaise: q.estimatedCostINR,
    };
  }

  async start(req: GenerationRequest): Promise<{ providerJobId: string }> {
    const { providerJobId } = await this.provider.generate(req);
    return { providerJobId };
  }

  async poll(providerJobId: string) {
    return this.provider.statusOf(providerJobId);
  }

  get providerId(): string {
    return this.provider.id;
  }
}

export function getGenerationService(): GenerationService {
  const priority = (process.env.GENERATION_PROVIDER_PRIORITY ?? 'fal,meta,mock')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  for (const id of priority) {
    const factory = FACTORIES[id];
    if (!factory) {
      continue;
    }
    const provider = factory();
    if (isUsable(provider)) {
      return new GenerationService(provider);
    }
  }
  throw new Error(
    'no usable generation provider (check GENERATION_PROVIDER_PRIORITY, provider credentials, or ALLOW_MOCK_PROVIDER)'
  );
}
