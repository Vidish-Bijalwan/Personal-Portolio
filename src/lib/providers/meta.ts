// Status: AWAITING_PROVIDER_ACCESS — no verified image/video endpoint.
//
// 'server-only' semantics: stub only, never called. Every method throws.
// Server-side only by convention.

import type {
  GenerationRequest,
  MediaProvider,
  ProviderQuote,
  ProviderStatus,
} from '../vilish/types';

type StatusResult = Awaited<ReturnType<MediaProvider['statusOf']>>;

const STUB_ERROR =
  'meta provider: AWAITING_PROVIDER_ACCESS — no verified image/video endpoint';

export class MetaProvider implements MediaProvider {
  readonly id = 'meta';
  readonly displayName = 'Meta';
  readonly status: ProviderStatus = 'AWAITING_PROVIDER_ACCESS';

  async quote(_req: GenerationRequest): Promise<ProviderQuote> {
    throw new Error(STUB_ERROR);
  }

  async generate(_req: GenerationRequest): Promise<{ providerJobId: string }> {
    throw new Error(STUB_ERROR);
  }

  async statusOf(_providerJobId: string): Promise<StatusResult> {
    throw new Error(STUB_ERROR);
  }
}
