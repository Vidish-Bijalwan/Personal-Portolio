/**
 * Etch — attachment upload policy tests.
 * The same validateUploads() gates the composer UI and
 * POST /api/generation/start server-side.
 */
import { describe, it, expect } from 'vitest';
import {
  ATTACH_MAX_FILES,
  ATTACH_MAX_FILE_BYTES,
  ATTACH_MAX_TOTAL_BYTES,
  canonicalMimeFor,
  validateUploads,
  type AttachmentInput,
} from '../attachments';

const MB = 1024 * 1024;

function file(
  name: string,
  size: number,
  type: string = '',
): AttachmentInput {
  return { name, size, type };
}

describe('validateUploads allowlist', () => {
  const accepted: Array<[string, string]> = [
    ['photo.png', 'image/png'],
    ['photo.jpg', 'image/jpeg'],
    ['photo.jpeg', 'image/jpeg'],
    ['anim.webp', 'image/webp'],
    ['anim.gif', 'image/gif'],
    ['brief.pdf', 'application/pdf'],
    ['notes.doc', 'application/msword'],
    [
      'notes.docx',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ],
    ['readme.txt', 'text/plain'],
    ['idea.md', 'text/markdown'],
  ];
  for (const [name, type] of accepted) {
    it(`accepts ${name} (${type})`, () => {
      expect(validateUploads([file(name, 1000, type)])).toEqual({ ok: true });
    });
  }

  it('accepts allowed extensions when the browser reports no MIME', () => {
    // Some platforms report an empty MIME for .txt/.md — extension is the gate.
    expect(validateUploads([file('note.txt', 500, '')])).toEqual({ ok: true });
    expect(validateUploads([file('shot.PNG', 500, '')])).toEqual({ ok: true });
  });

  it('accepts exactly 5 files', () => {
    const files = Array.from({ length: 5 }, (_, i) =>
      file(`img${i}.png`, 1000, 'image/png'),
    );
    expect(validateUploads(files)).toEqual({ ok: true });
  });
});

describe('validateUploads rejections', () => {
  it('rejects executables and scripts conservatively', () => {
    for (const name of [
      'evil.exe',
      'run.sh',
      'setup.bat',
      'x.js',
      'page.html',
      'macro.ps1',
      'app.apk',
      'lib.dll',
    ]) {
      const r = validateUploads([file(name, 1000, '')]);
      expect(r.ok).toBe(false);
      expect(r.code).toBe('FILE_TYPE_NOT_ALLOWED');
    }
  });

  it('rejects double-extension tricks (reference.pdf.exe)', () => {
    const r = validateUploads([file('reference.pdf.exe', 1000, '')]);
    expect(r.ok).toBe(false);
    expect(r.code).toBe('FILE_TYPE_NOT_ALLOWED');
  });

  it('rejects unknown extensions', () => {
    const r = validateUploads([file('data.zip', 1000, 'application/zip')]);
    expect(r.ok).toBe(false);
    expect(r.code).toBe('FILE_TYPE_NOT_ALLOWED');
    expect(r.message).toContain('.zip');
  });

  it('rejects files with no extension', () => {
    const r = validateUploads([file('README', 1000, 'text/plain')]);
    expect(r.ok).toBe(false);
    expect(r.code).toBe('FILE_TYPE_NOT_ALLOWED');
  });

  it('rejects a MIME that contradicts the extension', () => {
    // Claims .png but arrived as an executable MIME.
    const r = validateUploads([file('photo.png', 1000, 'application/x-msdownload')]);
    expect(r.ok).toBe(false);
    expect(r.code).toBe('FILE_TYPE_NOT_ALLOWED');
  });

  it('rejects empty files', () => {
    const r = validateUploads([file('photo.png', 0, 'image/png')]);
    expect(r.ok).toBe(false);
    expect(r.code).toBe('EMPTY_FILE');
  });

  it('rejects more than the max file count', () => {
    const files = Array.from({ length: ATTACH_MAX_FILES + 1 }, (_, i) =>
      file(`img${i}.png`, 1000, 'image/png'),
    );
    const r = validateUploads(files);
    expect(r.ok).toBe(false);
    expect(r.code).toBe('TOO_MANY_FILES');
    expect(r.message).toContain(String(ATTACH_MAX_FILES));
  });

  it('rejects a single file over the per-file cap', () => {
    const r = validateUploads([
      file('huge.png', ATTACH_MAX_FILE_BYTES + 1, 'image/png'),
    ]);
    expect(r.ok).toBe(false);
    expect(r.code).toBe('FILE_TOO_LARGE');
  });

  it('accepts a file at exactly the per-file cap', () => {
    expect(
      validateUploads([file('edge.png', ATTACH_MAX_FILE_BYTES, 'image/png')]),
    ).toEqual({ ok: true });
  });

  it('rejects a batch over the total cap even when each file is small enough', () => {
    // 3 x 8MB = 24MB > 20MB total
    const r = validateUploads([
      file('a.png', 8 * MB, 'image/png'),
      file('b.png', 8 * MB, 'image/png'),
      file('c.png', 8 * MB, 'image/png'),
    ]);
    expect(r.ok).toBe(false);
    expect(r.code).toBe('TOTAL_TOO_LARGE');
    expect(r.message).toContain('20');
  });

  it('accepts a batch under the total cap', () => {
    // 2 x 8MB = 16MB < 20MB
    expect(
      validateUploads([
        file('a.png', 8 * MB, 'image/png'),
        file('b.png', 8 * MB, 'image/png'),
      ]),
    ).toEqual({ ok: true });
  });

  it('reports the first bad file in a mixed batch', () => {
    const r = validateUploads([
      file('ok.png', 1000, 'image/png'),
      file('evil.exe', 1000, ''),
    ]);
    expect(r.ok).toBe(false);
    expect(r.code).toBe('FILE_TYPE_NOT_ALLOWED');
    expect(r.message).toContain('evil.exe');
  });
});

describe('canonicalMimeFor', () => {
  it('maps extensions to canonical stored MIME', () => {
    expect(canonicalMimeFor('a.png')).toBe('image/png');
    expect(canonicalMimeFor('a.JPG')).toBe('image/jpeg');
    expect(canonicalMimeFor('a.docx')).toBe(
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    );
    expect(canonicalMimeFor('a.md')).toBe('text/markdown');
  });

  it('returns null for rejected extensions', () => {
    expect(canonicalMimeFor('a.exe')).toBeNull();
    expect(canonicalMimeFor('a.zip')).toBeNull();
  });

  it('reads the total-cap constant from the shared module', () => {
    expect(ATTACH_MAX_TOTAL_BYTES).toBe(20 * 1024 * 1024);
  });
});
