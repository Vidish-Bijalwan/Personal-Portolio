/**
 * Vidish Phase 2 — route contract tests (contract §5 + §8).
 *
 * - Admin authz: every new /api/admin/fulfillment/* route 401s without
 *   x-admin-token (same fail-closed pattern as existing admin routes).
 * - Customer respond route: unauthenticated → 401/403.
 * - Boot with NO FAL_KEY (§8): fal reports READY_FOR_CREDENTIAL (disabled,
 *   not connected), the registry still resolves, and quote works.
 *
 * Each route is checked for existence first and skipped gracefully until the
 * API agent lands it.
 */
import { describe, it, expect, beforeAll, beforeEach, vi } from 'vitest';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { NextRequest } from 'next/server';

// The real @/lib/auth boots next-auth, which cannot resolve next/server
// under vitest. Customer routes only need getSessionUser; unauthenticated
// here so the respond route's auth rejection is exercised.
vi.mock('@/lib/auth', () => ({
  getSessionUser: () => Promise.resolve(null),
}));

delete process.env.DATABASE_URL;

const ADMIN_TOKEN = 'test-admin-token-routes';

let migrated = false;
/** runMigrations is not idempotent — call once per test file. */
async function ensureMigratedAndSeeded() {
  const client = await import('@/lib/db/client');
  if (!migrated) {
    await client.runMigrations();
    migrated = true;
  }
  const seed = await import('@/lib/db/seed');
  await seed.seed();
}

beforeEach(() => {
  process.env.ADMIN_TOKEN = ADMIN_TOKEN;
  delete process.env.FAL_KEY;
});

interface RouteSpec {
  file: string;
  method: 'GET' | 'POST' | 'PUT';
  path: string;
  params?: Record<string, string>;
  exists?: boolean;
}

const ADMIN_ROUTES: RouteSpec[] = [
  { file: 'app/api/admin/fulfillment/queue/route.ts', method: 'GET', path: '/api/admin/fulfillment/queue' },
  { file: 'app/api/admin/fulfillment/[id]/route.ts', method: 'GET', path: '/api/admin/fulfillment/x1', params: { id: 'x1' } },
  { file: 'app/api/admin/fulfillment/[id]/approve/route.ts', method: 'POST', path: '/api/admin/fulfillment/x1/approve', params: { id: 'x1' } },
  { file: 'app/api/admin/fulfillment/[id]/start/route.ts', method: 'POST', path: '/api/admin/fulfillment/x1/start', params: { id: 'x1' } },
  { file: 'app/api/admin/fulfillment/[id]/clarify/route.ts', method: 'POST', path: '/api/admin/fulfillment/x1/clarify', params: { id: 'x1' } },
  { file: 'app/api/admin/fulfillment/[id]/upload/route.ts', method: 'POST', path: '/api/admin/fulfillment/x1/upload', params: { id: 'x1' } },
  { file: 'app/api/admin/fulfillment/[id]/to-qc/route.ts', method: 'POST', path: '/api/admin/fulfillment/x1/to-qc', params: { id: 'x1' } },
  { file: 'app/api/admin/fulfillment/[id]/rework/route.ts', method: 'POST', path: '/api/admin/fulfillment/x1/rework', params: { id: 'x1' } },
  { file: 'app/api/admin/fulfillment/[id]/deliver/route.ts', method: 'POST', path: '/api/admin/fulfillment/x1/deliver', params: { id: 'x1' } },
  { file: 'app/api/admin/fulfillment/[id]/reject/route.ts', method: 'POST', path: '/api/admin/fulfillment/x1/reject', params: { id: 'x1' } },
  { file: 'app/api/admin/fulfillment/[id]/notes/route.ts', method: 'POST', path: '/api/admin/fulfillment/x1/notes', params: { id: 'x1' } },
  { file: 'app/api/admin/fulfillment/[id]/package/route.ts', method: 'GET', path: '/api/admin/fulfillment/x1/package', params: { id: 'x1' } },
  { file: 'app/api/admin/fulfillment/[id]/bundle/route.ts', method: 'GET', path: '/api/admin/fulfillment/x1/bundle', params: { id: 'x1' } },
  { file: 'app/api/admin/config/route.ts', method: 'GET', path: '/api/admin/config' },
  { file: 'app/api/admin/config/route.ts', method: 'PUT', path: '/api/admin/config' },
];

for (const spec of ADMIN_ROUTES) {
  spec.exists = existsSync(resolve(process.cwd(), spec.file));
}

type Handler = (
  req: NextRequest,
  ctx: { params: Promise<Record<string, string>> }
) => Promise<Response>;

const handlers = new Map<string, Handler>();

// Import every route module ONCE, serially, up front: each module
// instantiates its own PGlite handle at import time, so per-test imports
// compound into multi-second hangs under parallel workers.
beforeAll(async () => {
  for (const spec of ADMIN_ROUTES) {
    if (!spec.exists) continue;
    const key = `${spec.method} ${spec.file}`;
    const mod = (await import(
      pathToFileURL(resolve(process.cwd(), spec.file)).href
    )) as Record<string, unknown>;
    const handler = mod[spec.method] as Handler;
    expect(typeof handler, `${key} handler`).toBe('function');
    handlers.set(key, handler);
  }
  if (existsSync(RESPOND_FILE)) {
    const mod = (await import(pathToFileURL(RESPOND_FILE).href)) as {
      POST: Handler;
    };
    handlers.set('RESPOND', mod.POST as Handler);
  }
}, 180_000);

for (const spec of ADMIN_ROUTES) {
  describe.runIf(spec.exists)(
    `${spec.method} ${spec.file} — admin authz`,
    () => {
      it('401s without x-admin-token', async () => {
        const key = `${spec.method} ${spec.file}`;
        const handler = handlers.get(key);
        expect(handler, `${key} handler`).toBeTypeOf('function');

        const req = new NextRequest(`http://localhost${spec.path}`, {
          method: spec.method,
          headers:
            spec.method === 'GET'
              ? {}
              : { 'content-type': 'application/json' },
          body:
            spec.method === 'GET' ? undefined : JSON.stringify({}),
        });
        const res = spec.params
          ? await handler!(req, { params: Promise.resolve(spec.params) })
          : await handler!(req, { params: Promise.resolve({}) });
        expect(res.status).toBe(401);
      });
    }
  );
}

const RESPOND_FILE = resolve(
  process.cwd(),
  'app/api/fulfillment/[id]/respond/route.ts'
);
describe.runIf(existsSync(RESPOND_FILE))(
  'POST /api/fulfillment/[id]/respond — customer auth',
  () => {
    it('rejects unauthenticated customers', async () => {
      const POST = handlers.get('RESPOND');
      expect(POST, 'respond POST handler').toBeTypeOf('function');
      const req = new NextRequest(
        'http://localhost/api/fulfillment/x1/respond',
        {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ message: 'here is the clarification' }),
        }
      );
      const res = await POST!(req, { params: Promise.resolve({ id: 'x1' }) });
      expect([401, 403]).toContain(res.status);
    });
  }
);

describe('boot with NO FAL_KEY — contract §8', () => {
  it('fal provider reports READY_FOR_CREDENTIAL (disabled, not connected)', async () => {
    const { FalProvider } = await import('@/lib/providers/fal');
    const p = new FalProvider();
    expect(p.id).toBe('fal');
    expect(p.status).toBe('READY_FOR_CREDENTIAL');
    expect(p.status).not.toBe('CONNECTED');
  });

  it('registry resolves and quote works without FAL_KEY (no network)', async () => {
    delete process.env.GENERATION_PROVIDER_PRIORITY;
    delete process.env.ALLOW_MOCK_PROVIDER;
    const { getGenerationService } = await import('@/lib/providers/registry');
    const svc = getGenerationService();
    const plan = await svc.plan({
      task: 'text_to_image',
      prompt: 'boot probe',
      aspectRatio: '1:1',
      quality: 'quick',
    });
    expect(plan.providerId).toBe('fal');
    expect(plan.estimatedCostPaise).toBeGreaterThan(0);
  });

  it('seed marks fal READY_FOR_CREDENTIAL in the provider registry', async () => {
    await ensureMigratedAndSeeded();
    const client = await import('@/lib/db/client');
    const schema = await import('@/lib/db/schema');
    const rows = await client.getDb().select().from(schema.providers);
    const fal = rows.find((r) => r.id === 'fal');
    expect(fal).toBeTruthy();
    expect(fal!.status).toBe('READY_FOR_CREDENTIAL');
  }, 120_000);

  it('POST /api/generation/quote boots and prices with NO FAL_KEY', async () => {
    const quoteFile = resolve(process.cwd(), 'app/api/generation/quote/route.ts');
    if (!existsSync(quoteFile)) return;
    await ensureMigratedAndSeeded();
    const { POST } = (await import(pathToFileURL(quoteFile).href)) as {
      POST: (req: NextRequest) => Promise<Response>;
    };
    const req = new NextRequest('http://localhost/api/generation/quote', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        spec: {
          task: 'text_to_image',
          prompt: 'boot probe',
          aspectRatio: '1:1',
          quality: 'quick',
        },
      }),
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const body = (await res.json()) as { totalPaise?: number };
    expect(body.totalPaise).toBeGreaterThan(0);
  }, 120_000);
});
