/**
 * Madam Muse social-import tests.
 * URL validation + honest fallback behavior with a stubbed fetch/DNS.
 */
import { describe, expect, it } from 'vitest';
import {
  fetchImportMedia,
  isNonPublicIp,
  validateImportUrl,
  type ImportFailure,
} from '../social-import';

const PUBLIC = async () => ['93.184.216.34'];

function pngBytes(n = 64): Uint8Array {
  const b = new Uint8Array(n);
  b[0] = 0x89; b[1] = 0x50; b[2] = 0x4e; b[3] = 0x47; // PNG magic
  return b;
}

function okPng(body?: Uint8Array, headers: Record<string, string> = {}) {
  // Fresh ArrayBuffer: this repo's DOM lib typing doesn't accept Uint8Array
  // as a Response body.
  const bytes = body ?? pngBytes();
  const buf = bytes.buffer.slice(
    bytes.byteOffset,
    bytes.byteOffset + bytes.byteLength
  ) as ArrayBuffer;
  return new Response(buf, {
    status: 200,
    headers: { 'content-type': 'image/png', ...headers },
  });
}

function failureOf(r: { ok: boolean }): ImportFailure {
  if (r.ok) throw new Error('expected failure');
  return r as ImportFailure;
}

describe('validateImportUrl', () => {
  it('accepts a normal https URL', () => {
    const r = validateImportUrl('https://www.instagram.com/p/abc123/');
    expect(r.ok).toBe(true);
  });

  it('rejects empty, garbage, and non-http(s) URLs', () => {
    for (const raw of ['', '   ', 'not a url', 'ftp://x.com/f.png', 'javascript:alert(1)', 'file:///etc/passwd']) {
      const r = validateImportUrl(raw);
      expect(r.ok).toBe(false);
      expect((r as ImportFailure).code).toBe('invalid_url');
    }
  });

  it('rejects localhost and loopback/private literals (SSRF)', () => {
    for (const raw of [
      'http://localhost:3000/x.png',
      'http://127.0.0.1/x.png',
      'http://10.0.0.5/x.png',
      'http://192.168.1.1/x.png',
      'http://169.254.169.254/latest/meta-data',
      'http://[::1]/x.png',
    ]) {
      const r = validateImportUrl(raw);
      expect(r.ok).toBe(false);
      expect((r as ImportFailure).code).toBe('blocked_host');
    }
  });

  it('accepts a public IP literal', () => {
    const r = validateImportUrl('https://93.184.216.34/f.png');
    expect(r.ok).toBe(true);
  });
});

describe('isNonPublicIp', () => {
  it('flags private/loopback/link-local ranges', () => {
    for (const ip of ['127.0.0.1', '10.1.2.3', '172.16.0.1', '172.31.255.255', '192.168.0.1', '169.254.10.20', '0.0.0.0', '224.0.0.1', '::1', 'fe80::1', 'fc00::1', '::ffff:127.0.0.1']) {
      expect(isNonPublicIp(ip)).toBe(true);
    }
  });
  it('allows public addresses', () => {
    for (const ip of ['93.184.216.34', '8.8.8.8', '172.15.9.9', '172.32.0.1', '1.1.1.1']) {
      expect(isNonPublicIp(ip)).toBe(false);
    }
  });
});

describe('fetchImportMedia (stubbed)', () => {
  it('downloads, verifies, and names a PNG', async () => {
    const url = new URL('https://cdn.example.com/photos/sunset.png?x=1');
    const r = await fetchImportMedia(url, {
      fetchFn: (async () => okPng()) as typeof fetch,
      resolveHost: PUBLIC,
    });
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.mime).toBe('image/png');
    expect(r.filename).toBe('sunset.png');
    expect(r.bytes.length).toBe(64);
  });

  it('is honest on 403: login_wall telling the user to upload directly', async () => {
    const url = new URL('https://www.instagram.com/p/abc123/');
    const r = await fetchImportMedia(url, {
      fetchFn: (async () => new Response('denied', { status: 403 })) as typeof fetch,
      resolveHost: PUBLIC,
    });
    const f = failureOf(r);
    expect(f.code).toBe('login_wall');
    expect(f.message).toMatch(/blocks server downloads/i);
    expect(f.message).toMatch(/upload.*directly/i);
    // Never a half-success.
    expect(r.ok).toBe(false);
  });

  it('is honest on 429 and 401 too', async () => {
    for (const status of [401, 429]) {
      const r = await fetchImportMedia(new URL('https://x.example/f.png'), {
        fetchFn: (async () => new Response('no', { status })) as typeof fetch,
        resolveHost: PUBLIC,
      });
      expect(failureOf(r).code).toBe('login_wall');
    }
  });

  it('rejects HTML pages as bad_type with a plain explanation', async () => {
    const r = await fetchImportMedia(new URL('https://www.instagram.com/p/abc123/'), {
      fetchFn: (async () =>
        new Response('<html>post page</html>', {
          status: 200,
          headers: { 'content-type': 'text/html; charset=utf-8' },
        })) as typeof fetch,
      resolveHost: PUBLIC,
    });
    const f = failureOf(r);
    expect(f.code).toBe('bad_type');
    expect(f.message).toMatch(/web page, not an image or video/i);
  });

  it('rejects oversized content-length before reading the body', async () => {
    // body: null — if the implementation touched the body first, the
    // streaming section would bail with 'network_error' instead.
    const fakeRes = {
      status: 200,
      headers: new Headers({
        'content-type': 'image/png',
        'content-length': String(50 * 1024 * 1024),
      }),
      body: null,
    };
    const r = await fetchImportMedia(new URL('https://cdn.example/f.png'), {
      fetchFn: (async () => fakeRes) as unknown as typeof fetch,
      resolveHost: PUBLIC,
    });
    expect(failureOf(r).code).toBe('too_large');
  });

  it('caps a lying stream mid-download', async () => {
    const chunk = pngBytes(1024 * 1024); // 1MB chunks, PNG magic in first
    const stream = new ReadableStream({
      start(c) {
        for (let i = 0; i < 10; i++) c.enqueue(chunk);
        c.close();
      },
    });
    const r = await fetchImportMedia(new URL('https://cdn.example/f.png'), {
      fetchFn: (async () =>
        new Response(stream, { status: 200, headers: { 'content-type': 'image/png' } })) as typeof fetch,
      resolveHost: PUBLIC,
    });
    expect(failureOf(r).code).toBe('too_large');
  });

  it('rejects bytes that fail the magic-byte gate', async () => {
    const fake = new TextEncoder().encode('definitely not an image at all....');
    const fakeBuf = fake.buffer.slice(
      fake.byteOffset,
      fake.byteOffset + fake.byteLength
    ) as ArrayBuffer;
    const r = await fetchImportMedia(new URL('https://cdn.example/f.png'), {
      fetchFn: (async () =>
        new Response(fakeBuf, { status: 200, headers: { 'content-type': 'image/png' } })) as typeof fetch,
      resolveHost: PUBLIC,
    });
    expect(failureOf(r).code).toBe('bad_type');
  });

  it('follows a redirect but blocks a hop to a private address', async () => {
    const calls: string[] = [];
    const r = await fetchImportMedia(new URL('https://short.example/abc'), {
      fetchFn: (async (u: string) => {
        calls.push(u);
        return new Response(null, {
          status: 302,
          headers: { location: 'http://169.254.169.254/secret' },
        });
      }) as unknown as typeof fetch,
      resolveHost: async (h) => (h === 'short.example' ? ['93.184.216.34'] : ['169.254.169.254']),
    });
    expect(failureOf(r).code).toBe('blocked_host');
    expect(calls).toHaveLength(1); // never fetched the private hop
  });

  it('reports timeouts honestly', async () => {
    const r = await fetchImportMedia(new URL('https://slow.example/f.png'), {
      fetchFn: (async () => {
        throw new DOMException('timed out', 'TimeoutError');
      }) as typeof fetch,
      resolveHost: PUBLIC,
    });
    const f = failureOf(r);
    expect(f.code).toBe('timeout');
    expect(f.message).toMatch(/uploading it directly/i);
  });

  it('reports DNS failures honestly', async () => {
    const r = await fetchImportMedia(new URL('https://nope.invalid/f.png'), {
      fetchFn: (async () => okPng()) as typeof fetch,
      resolveHost: async () => {
        throw new Error('ENOTFOUND');
      },
    });
    expect(failureOf(r).code).toBe('network_error');
  });
});
