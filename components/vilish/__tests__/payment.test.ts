/**
 * W1-BUGFIX: startManualPayment maps an edge 413 (oversized request body)
 * to a dedicated 'too_large' error kind instead of the misleading generic
 * "Could not create the payment order" failure.
 */
import { describe, it, expect, vi, afterEach } from 'vitest';
import {
  startManualPayment,
  UPLOAD_EDGE_LIMIT_BYTES,
} from '../payment';

afterEach(() => {
  vi.unstubAllGlobals();
});

function mockFetch(status: number, body: unknown, contentType = 'application/json') {
  const text = typeof body === 'string' ? body : JSON.stringify(body);
  vi.stubGlobal(
    'fetch',
    vi.fn(async () =>
      new Response(text, {
        status,
        headers: { 'content-type': contentType },
      })
    )
  );
}

describe('startManualPayment error mapping', () => {
  it('maps HTTP 413 to too_large', async () => {
    // Edge rejection pages are HTML, not JSON — like the real Vercel 413.
    mockFetch(413, '<html>413</html>', 'text/html');
    const res = await startManualPayment('quote-1', 'IN', {});
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.error.kind).toBe('too_large');
  });

  it('maps HTTP 401 to unauthorized', async () => {
    mockFetch(401, { code: 'LOGIN_REQUIRED' });
    const res = await startManualPayment('quote-1', 'IN', {});
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.error.kind).toBe('unauthorized');
  });

  it('returns the server message on other failures', async () => {
    mockFetch(400, { code: 'INVALID_ATTACHMENTS', error: 'Bad file.' });
    const res = await startManualPayment('quote-1', 'IN', {});
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error.kind).toBe('failed');
      if (res.error.kind === 'failed') expect(res.error.message).toBe('Bad file.');
    }
  });

  it('exposes a conservative edge body-size ceiling', () => {
    // Must stay comfortably under Vercel's ~4.5MB serverless body limit.
    expect(UPLOAD_EDGE_LIMIT_BYTES).toBeLessThanOrEqual(4.5 * 1024 * 1024);
    expect(UPLOAD_EDGE_LIMIT_BYTES).toBeGreaterThan(0);
  });
});
