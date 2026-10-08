/**
 * Scratch verification for the modified POST /api/create/brief route:
 * style-memory is consulted best-effort for signed-in users; the route
 * stays public and never breaks when memory is unavailable.
 *
 * Mocks @/lib/auth + @/lib/db/client because this sandbox's vendored
 * next package is missing its `exports` map (pre-existing environment
 * artifact — next-auth's ESM import of 'next/server' can't resolve here).
 */
import { describe, expect, it, vi, beforeEach } from 'vitest';

const RETRO_FP = {
  visualFamily: 'retro collage',
  palette: ['#f4ead8'],
  texture: 'grainy paper',
  typography: 'hand-drawn retro display headline',
  source: 'manual',
};

const mockGetSessionUser = vi.fn();
const mockListStyleMemory = vi.fn();

vi.mock('@/lib/auth', () => ({
  getSessionUser: () => mockGetSessionUser(),
}));
vi.mock('@/lib/db/client', () => ({ db: {} }));
vi.mock('@/lib/muse/style-memory', async (importOriginal) => {
  const orig = (await importOriginal()) as Record<string, unknown>;
  return {
    ...orig,
    listStyleMemory: (...args: unknown[]) => mockListStyleMemory(...args),
  };
});

async function postBrief(body: unknown) {
  const { POST } = await import('../../../../app/api/create/brief/route');
  const req = new Request('http://localhost/api/create/brief', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
  return POST(req as never);
}

beforeEach(() => {
  vi.resetModules();
  mockGetSessionUser.mockReset();
  mockListStyleMemory.mockReset();
});

describe('POST /api/create/brief with style memory', () => {
  it('applies the memory family default for signed-in users', async () => {
    mockGetSessionUser.mockResolvedValue({ id: 'u1' });
    mockListStyleMemory.mockResolvedValue([
      { id: 's1', fingerprint: RETRO_FP, createdAt: new Date().toISOString() },
    ]);
    const res = await postBrief({
      instruction: 'a birthday card for my sister',
      primary: null,
      references: [],
    });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.brief.visualFamily).toBe('retro collage');
    expect(mockListStyleMemory).toHaveBeenCalled();
  });

  it('stays public and un-biased for anonymous users', async () => {
    mockGetSessionUser.mockResolvedValue(null);
    const res = await postBrief({
      instruction: 'a birthday card for my sister',
      primary: null,
      references: [],
    });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.brief.visualFamily).toBe('cinematic moody');
    expect(mockListStyleMemory).not.toHaveBeenCalled();
  });

  it('still compiles when the memory lookup throws', async () => {
    mockGetSessionUser.mockResolvedValue({ id: 'u1' });
    mockListStyleMemory.mockRejectedValue(new Error('db down'));
    const res = await postBrief({
      instruction: 'a birthday card for my sister',
      primary: null,
      references: [],
    });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.brief.visualFamily).toBe('cinematic moody');
  });

  it('explicit instruction still beats memory', async () => {
    mockGetSessionUser.mockResolvedValue({ id: 'u1' });
    mockListStyleMemory.mockResolvedValue([
      { id: 's1', fingerprint: RETRO_FP, createdAt: new Date().toISOString() },
    ]);
    const res = await postBrief({
      instruction: 'make it cinematic and moody',
      primary: null,
      references: [],
    });
    const data = await res.json();
    expect(data.brief.visualFamily).toBe('cinematic moody');
  });
});
