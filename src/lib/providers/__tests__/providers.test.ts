/**
 * Providers slice tests — image adapters only.
 *
 * The real @fal-ai/client is fully mocked: NO test below may touch the
 * network. Every fal call goes through the vi.mock factory, and tests assert
 * the mock was the thing called.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { GenerationRequest } from '../../vilish/types';

vi.mock('@fal-ai/client', () => ({
  fal: {
    config: vi.fn(),
    queue: {
      submit: vi.fn(),
      status: vi.fn(),
      result: vi.fn(),
    },
  },
}));

// replaced at runtime by the vi.mock factory above
import { fal } from '@fal-ai/client';
import { FalProvider } from '../fal';
import { MetaProvider } from '../meta';
import { MockProvider } from '../mock';
import { GenerationService, getGenerationService } from '../registry';

const submitMock = () =>
  vi.mocked(fal.queue.submit) as unknown as ReturnType<typeof vi.fn>;
const statusMock = () =>
  vi.mocked(fal.queue.status) as unknown as ReturnType<typeof vi.fn>;
const resultMock = () =>
  vi.mocked(fal.queue.result) as unknown as ReturnType<typeof vi.fn>;

function req(overrides: Partial<GenerationRequest> = {}): GenerationRequest {
  return {
    task: 'text_to_image',
    prompt: 'a serene mountain lake at dawn',
    aspectRatio: '1:1',
    quality: 'quick',
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  delete process.env.FAL_KEY;
  delete process.env.FAL_USD_INR;
  delete process.env.GENERATION_PROVIDER_PRIORITY;
  delete process.env.ALLOW_MOCK_PROVIDER;
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('FalProvider', () => {
  it('identity fields are set', () => {
    const p = new FalProvider();
    expect(p.id).toBe('fal');
    expect(p.displayName).toBe('fal.ai');
    expect(p.status).toBe('READY_FOR_CREDENTIAL');
  });

  it('quote math: 1:1 @ ₹88/$, $0.003/MP → 27 paise', async () => {
    // ceil(0.003 * 1.0 * 88 * 100) = ceil(26.4) = 27
    const p = new FalProvider();
    const q = await p.quote(req());
    expect(q.providerId).toBe('fal');
    expect(q.model).toBe('fal-ai/flux/schnell');
    expect(q.estimatedCostINR).toBe(27);
    expect(q.etaSeconds).toBe(30);
  });

  it('quote math: 9:16 has 1.03 MP estimate → 28 paise', async () => {
    // ceil(0.003 * 1.03 * 88 * 100) = ceil(27.192) = 28
    const p = new FalProvider();
    const q = await p.quote(req({ aspectRatio: '9:16' }));
    expect(q.estimatedCostINR).toBe(28);
  });

  it('quote honors FAL_USD_INR override', async () => {
    // ceil(0.003 * 1.0 * 100 * 100) = ceil(30) = 30
    vi.stubEnv('FAL_USD_INR', '100');
    const p = new FalProvider();
    const q = await p.quote(req());
    expect(q.estimatedCostINR).toBe(30);
  });

  it('generate passes correct image_size for 9:16 and returns request_id', async () => {
    vi.stubEnv('FAL_KEY', 'test-key');
    submitMock().mockResolvedValue({ request_id: 'req_123' });
    const p = new FalProvider();
    const out = await p.generate(req({ aspectRatio: '9:16', seed: 42 }));
    expect(out.providerJobId).toBe('req_123');
    expect(submitMock()).toHaveBeenCalledTimes(1);
    const [endpoint, options] = submitMock().mock.calls[0];
    expect(endpoint).toBe('fal-ai/flux/schnell');
    expect(options.input.prompt).toBe('a serene mountain lake at dawn');
    expect(options.input.image_size).toBe('portrait_16_9');
    expect(options.input.num_images).toBe(1);
    expect(options.input.seed).toBe(42);
    expect(options.input.output_format).toBe('png');
    expect(options.input.enable_safety_checker).toBe(true);
  });

  it('generate maps all aspect ratios to fal image_size enums', async () => {
    vi.stubEnv('FAL_KEY', 'test-key');
    submitMock().mockResolvedValue({ request_id: 'req_x' });
    const p = new FalProvider();
    const expected: Record<string, string> = {
      '1:1': 'square_hd',
      '4:5': 'portrait_4_3',
      '9:16': 'portrait_16_9',
      '16:9': 'landscape_16_9',
    };
    for (const [aspect, size] of Object.entries(expected)) {
      submitMock().mockClear();
      await p.generate(req({ aspectRatio: aspect as GenerationRequest['aspectRatio'] }));
      expect(submitMock().mock.calls[0][1].input.image_size).toBe(size);
    }
  });

  it('generate throws without FAL_KEY and never calls the SDK', async () => {
    const p = new FalProvider();
    await expect(p.generate(req())).rejects.toThrow('FAL_KEY not configured');
    expect(submitMock()).not.toHaveBeenCalled();
  });

  it('statusOf maps IN_QUEUE → queued (no result fetch)', async () => {
    vi.stubEnv('FAL_KEY', 'test-key');
    statusMock().mockResolvedValue({ status: 'IN_QUEUE' });
    const p = new FalProvider();
    expect(await p.statusOf('req_1')).toEqual({ state: 'queued' });
    expect(resultMock()).not.toHaveBeenCalled();
  });

  it('statusOf maps IN_PROGRESS → generating (no result fetch)', async () => {
    vi.stubEnv('FAL_KEY', 'test-key');
    statusMock().mockResolvedValue({ status: 'IN_PROGRESS' });
    const p = new FalProvider();
    expect(await p.statusOf('req_1')).toEqual({ state: 'generating' });
    expect(resultMock()).not.toHaveBeenCalled();
  });

  it('statusOf COMPLETED with image → ready with outputUrl', async () => {
    vi.stubEnv('FAL_KEY', 'test-key');
    statusMock().mockResolvedValue({ status: 'COMPLETED' });
    resultMock().mockResolvedValue({
      data: { images: [{ url: 'https://cdn.fal/img.png' }] },
      requestId: 'req_1',
    });
    const p = new FalProvider();
    expect(await p.statusOf('req_1')).toEqual({
      state: 'ready',
      outputUrl: 'https://cdn.fal/img.png',
    });
    expect(resultMock()).toHaveBeenCalledWith('fal-ai/flux/schnell', {
      requestId: 'req_1',
    });
  });

  it('statusOf COMPLETED with nsfw flags → failed moderation', async () => {
    vi.stubEnv('FAL_KEY', 'test-key');
    statusMock().mockResolvedValue({ status: 'COMPLETED' });
    resultMock().mockResolvedValue({
      data: { images: [], has_nsfw_concepts: [true] },
      requestId: 'req_1',
    });
    const p = new FalProvider();
    expect(await p.statusOf('req_1')).toEqual({
      state: 'failed',
      error: 'moderation: nsfw flagged',
    });
  });

  it('statusOf COMPLETED with no output → failed no output', async () => {
    vi.stubEnv('FAL_KEY', 'test-key');
    statusMock().mockResolvedValue({ status: 'COMPLETED' });
    resultMock().mockResolvedValue({ data: { images: [] }, requestId: 'req_1' });
    const p = new FalProvider();
    expect(await p.statusOf('req_1')).toEqual({
      state: 'failed',
      error: 'no output',
    });
  });

  it('image_to_image is rejected in this slice', async () => {
    const p = new FalProvider();
    await expect(p.quote(req({ task: 'image_to_image' }))).rejects.toThrow(
      'task not supported in this slice'
    );
    await expect(p.generate(req({ task: 'image_to_image' }))).rejects.toThrow(
      'task not supported in this slice'
    );
  });
});

describe('MetaProvider', () => {
  it('is an AWAITING_PROVIDER_ACCESS stub', () => {
    const p = new MetaProvider();
    expect(p.id).toBe('meta');
    expect(p.status).toBe('AWAITING_PROVIDER_ACCESS');
  });

  it('throws on every method', async () => {
    const p = new MetaProvider();
    await expect(p.quote(req())).rejects.toThrow(
      'meta provider: AWAITING_PROVIDER_ACCESS'
    );
    await expect(p.generate(req())).rejects.toThrow(
      'meta provider: AWAITING_PROVIDER_ACCESS'
    );
    await expect(p.statusOf('x')).rejects.toThrow(
      'meta provider: AWAITING_PROVIDER_ACCESS'
    );
  });
});

describe('MockProvider', () => {
  it('quote returns fixed mock price', async () => {
    const p = new MockProvider();
    const q = await p.quote(req());
    expect(q).toEqual({
      providerId: 'mock',
      model: 'mock-svg',
      estimatedCostINR: 25,
      etaSeconds: 5,
    });
  });

  it('polls transition queued → generating → ready with watermarked SVG', async () => {
    const p = new MockProvider();
    const longPrompt = 'x'.repeat(200);
    const { providerJobId } = await p.generate(req({ prompt: longPrompt }));
    expect(providerJobId.startsWith('mock_')).toBe(true);

    const first = await p.statusOf(providerJobId);
    expect(first.state).toBe('queued');

    const second = await p.statusOf(providerJobId);
    expect(second.state).toBe('generating');

    const third = await p.statusOf(providerJobId);
    expect(third.state).toBe('ready');
    expect(third.outputUrl).toMatch(/^data:image\/svg\+xml;utf8,/);

    const svg = decodeURIComponent(
      third.outputUrl!.replace('data:image/svg+xml;utf8,', '')
    );
    expect(svg).toContain('DEV MOCK — NOT A REAL GENERATION');
    // prompt truncated: prefix kept, full 200 chars absent
    expect(svg).toContain(longPrompt.slice(0, 57));
    expect(svg).not.toContain(longPrompt);
    expect(svg).toContain('width="800" height="800"');
  });
});

describe('registry', () => {
  it('priority "mock,fal" with ALLOW_MOCK_PROVIDER=true picks mock', () => {
    vi.stubEnv('GENERATION_PROVIDER_PRIORITY', 'mock,fal');
    vi.stubEnv('ALLOW_MOCK_PROVIDER', 'true');
    const svc = getGenerationService();
    expect(svc.providerId).toBe('mock');
  });

  it('priority "meta,mock" without ALLOW_MOCK_PROVIDER throws (meta skipped, mock gated)', () => {
    vi.stubEnv('GENERATION_PROVIDER_PRIORITY', 'meta,mock');
    expect(() => getGenerationService()).toThrow('no usable generation provider');
  });

  it('default priority picks fal (READY_FOR_CREDENTIAL is usable)', () => {
    vi.stubEnv('ALLOW_MOCK_PROVIDER', 'true');
    const svc = getGenerationService();
    expect(svc.providerId).toBe('fal');
  });

  it('GenerationService plan/start/poll delegate to the provider', async () => {
    vi.stubEnv('GENERATION_PROVIDER_PRIORITY', 'mock');
    vi.stubEnv('ALLOW_MOCK_PROVIDER', 'true');
    const svc = new GenerationService(new MockProvider());
    expect(svc.providerId).toBe('mock');

    const plan = await svc.plan(req());
    expect(plan).toEqual({
      providerId: 'mock',
      model: 'mock-svg',
      estimatedCostPaise: 25,
    });

    const { providerJobId } = await svc.start(req());
    expect(providerJobId.startsWith('mock_')).toBe(true);

    expect((await svc.poll(providerJobId)).state).toBe('queued');
    expect((await svc.poll(providerJobId)).state).toBe('generating');
    const ready = await svc.poll(providerJobId);
    expect(ready.state).toBe('ready');
    expect(ready.outputUrl).toMatch(/^data:image\/svg\+xml;utf8,/);
  });

  it('unknown provider ids in priority are skipped', () => {
    vi.stubEnv('GENERATION_PROVIDER_PRIORITY', 'nope,also-nope,mock');
    vi.stubEnv('ALLOW_MOCK_PROVIDER', 'true');
    expect(getGenerationService().providerId).toBe('mock');
  });

  it('empty priority list throws', () => {
    vi.stubEnv('GENERATION_PROVIDER_PRIORITY', '');
    expect(() => getGenerationService()).toThrow('no usable generation provider');
  });
});
