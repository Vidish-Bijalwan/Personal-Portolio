/**
 * PWA share-target unit tests: request parsing, URL/token building, and
 * the handoff contract into /create. The validation gate itself is the
 * EXISTING validateMuseUploads — these tests pin that the share-target
 * path actually runs through it (real JPEG passes, masquerading .exe
 * renamed to .png is rejected).
 */
import { describe, expect, it } from 'vitest';
import {
  buildShareErrorUrl,
  buildSharedRedirectUrl,
  isPlausibleShareToken,
  isShareBundleExpired,
  newShareToken,
  parseShareFormData,
  sanitizeShareFileName,
  SHARE_BUNDLE_TTL_MS,
  SHARE_STORAGE_PREFIX,
  shareFileKey,
  shareMetaKey,
} from '../share-target';
import { composeSharedInstruction } from '../share-text';
import { validateMuseUploads, type MuseUploadFile } from '../../muse/uploads';

function jpegFile(name = 'photo.jpg', size = 1024): File {
  const bytes = new Uint8Array(size);
  bytes[0] = 0xff;
  bytes[1] = 0xd8;
  bytes[2] = 0xff; // real JPEG magic
  return new File([bytes], name, { type: 'image/jpeg' });
}

function exeAsPng(): File {
  const bytes = new Uint8Array(64);
  bytes[0] = 0x4d;
  bytes[1] = 0x5a; // MZ — an executable wearing a .png name
  return new File([bytes], 'evil.png', { type: 'image/png' });
}

describe('parseShareFormData', () => {
  it('extracts title/text/url and every shared file', () => {
    const form = new FormData();
    form.set('title', 'My product');
    form.set('text', 'make an ad');
    form.set('url', 'https://example.com/p');
    form.append('files', jpegFile('a.jpg'));
    form.append('files', jpegFile('b.jpg'));
    const parsed = parseShareFormData(form);
    expect(parsed.title).toBe('My product');
    expect(parsed.text).toBe('make an ad');
    expect(parsed.url).toBe('https://example.com/p');
    expect(parsed.files).toHaveLength(2);
    expect(parsed.files[0].name).toBe('a.jpg');
  });

  it('ignores empty files and non-file fields', () => {
    const form = new FormData();
    form.append('files', new File([], 'empty.jpg', { type: 'image/jpeg' }));
    form.set('title', 't');
    const parsed = parseShareFormData(form);
    expect(parsed.files).toHaveLength(0);
    expect(parsed.title).toBe('t');
  });

  it('defaults missing fields to empty strings', () => {
    const parsed = parseShareFormData(new FormData());
    expect(parsed).toEqual({ title: '', text: '', url: '', files: [] });
  });

  it('caps text fields at 2000 chars', () => {
    const form = new FormData();
    form.set('text', 'x'.repeat(5000));
    expect(parseShareFormData(form).text).toHaveLength(2000);
  });
});

describe('sanitizeShareFileName', () => {
  it('strips directory traversal', () => {
    expect(sanitizeShareFileName('../../etc/passwd')).toBe('passwd');
    expect(sanitizeShareFileName('C:\\temp\\pic.png')).toBe('pic.png');
  });

  it('replaces unsafe characters, keeps the extension', () => {
    expect(sanitizeShareFileName('my photo (1).jpg')).toBe('my_photo__1_.jpg');
  });

  it('never returns empty', () => {
    expect(sanitizeShareFileName('')).toBe('shared-file');
    expect(sanitizeShareFileName('...')).toBe('shared-file');
  });

  it('truncates very long names', () => {
    expect(sanitizeShareFileName('a'.repeat(200) + '.png')).toHaveLength(120);
  });
});

describe('tokens and storage keys', () => {
  it('newShareToken is uuid-shaped and unique', () => {
    const a = newShareToken();
    const b = newShareToken();
    expect(a).toMatch(/^[0-9a-f-]{36}$/);
    expect(a).not.toBe(b);
  });

  it('keys live under the shared prefix with sanitized names', () => {
    const token = newShareToken();
    expect(shareFileKey(token, 0, '../../x.png')).toBe(
      `${SHARE_STORAGE_PREFIX}/${token}/0-x.png`,
    );
    expect(shareMetaKey(token)).toBe(`${SHARE_STORAGE_PREFIX}/${token}/meta.json`);
  });

  it('isPlausibleShareToken rejects traversal and junk', () => {
    expect(isPlausibleShareToken(newShareToken())).toBe(true);
    expect(isPlausibleShareToken('../x')).toBe(false);
    expect(isPlausibleShareToken('')).toBe(false);
    expect(isPlausibleShareToken('a b')).toBe(false);
  });

  it('isShareBundleExpired honors the 24h TTL', () => {
    expect(SHARE_BUNDLE_TTL_MS).toBe(24 * 60 * 60 * 1000);
    expect(isShareBundleExpired(Date.now())).toBe(false);
    expect(isShareBundleExpired(Date.now() - SHARE_BUNDLE_TTL_MS - 1)).toBe(true);
  });
});

describe('redirect URL building (/create contract)', () => {
  it('valid receipts land on /create?shared=<token>', () => {
    const token = newShareToken();
    expect(buildSharedRedirectUrl(token)).toBe(`/create?shared=${token}`);
  });

  it('rejections land on /create?shareError=<code>&shareMsg=<msg>', () => {
    const url = buildShareErrorUrl('too_large', '"a.jpg" is 9.0 MB — too big.');
    expect(url.startsWith('/create?shareError=too_large&shareMsg=')).toBe(true);
    expect(url).toContain(encodeURIComponent('"a.jpg" is 9.0 MB — too big.'));
  });

  it('truncates very long error messages', () => {
    const url = buildShareErrorUrl('failed', 'x'.repeat(1000));
    const msg = new URL(url, 'https://etch.test').searchParams.get('shareMsg');
    expect(msg!.length).toBeLessThanOrEqual(300);
  });
});

describe('composeSharedInstruction', () => {
  it('joins title, text, url on separate lines', () => {
    expect(
      composeSharedInstruction({ title: 'Watch ad', text: 'darker', url: 'https://e.com' }),
    ).toBe('Watch ad\ndarker\nhttps://e.com');
  });

  it('drops empty parts, never emits blank lines', () => {
    expect(composeSharedInstruction({ title: '', text: '  ', url: 'https://e.com' })).toBe(
      'https://e.com',
    );
    expect(composeSharedInstruction({ title: '', text: '', url: '' })).toBe('');
  });
});

describe('share-target runs the existing muse upload policy', () => {
  async function toMuseFile(f: File): Promise<MuseUploadFile> {
    const head = new Uint8Array(await f.slice(0, 4096).arrayBuffer());
    return { name: f.name, type: f.type, size: f.size, data: head };
  }

  it('accepts a real JPEG shared from the sheet', async () => {
    const check = validateMuseUploads([await toMuseFile(jpegFile())]);
    expect(check.ok).toBe(true);
  });

  it('rejects an executable masquerading as a PNG', async () => {
    const check = validateMuseUploads([await toMuseFile(exeAsPng())]);
    expect(check.ok).toBe(false);
    expect(check.error).toBe('bad_type');
  });

  it('rejects oversize shares at the 8MB/file cap', async () => {
    const big = jpegFile('big.jpg', 9 * 1024 * 1024);
    const check = validateMuseUploads([await toMuseFile(big)]);
    expect(check.ok).toBe(false);
    expect(check.error).toBe('too_large');
  });

  it('rejects more than 5 files (intake cap)', async () => {
    const files = await Promise.all(
      Array.from({ length: 6 }, (_, i) => toMuseFile(jpegFile(`p${i}.jpg`))),
    );
    const check = validateMuseUploads(files);
    expect(check.ok).toBe(false);
  });
});
