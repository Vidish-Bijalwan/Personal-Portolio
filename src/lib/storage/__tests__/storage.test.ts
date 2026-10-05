import { describe, it, expect, afterEach } from 'vitest';
import { mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { existsSync } from 'node:fs';
import { getStorage } from '../index';

afterEach(() => {
  delete process.env.STORAGE_DIR;
  delete process.env.STORAGE_DRIVER;
});

describe('local storage driver', () => {
  it('roundtrip: put -> file exists -> delete -> gone', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'vilish-storage-'));
    process.env.STORAGE_DIR = dir;
    process.env.STORAGE_DRIVER = 'local';

    const storage = getStorage();
    const { url } = await storage.put(
      'projects/abc123/ref.png',
      Buffer.from([0x89, 0x50, 0x4e, 0x47]),
      'image/png'
    );

    expect(url).toBe('/storage/projects/abc123/ref.png');
    expect(existsSync(join(dir, 'projects/abc123', 'ref.png'))).toBe(true);

    await storage.delete('projects/abc123/ref.png');
    expect(existsSync(join(dir, 'projects/abc123', 'ref.png'))).toBe(false);
  });

  it('rejects path traversal keys', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'vilish-storage-'));
    process.env.STORAGE_DIR = dir;
    process.env.STORAGE_DRIVER = 'local';

    const storage = getStorage();
    await expect(
      storage.put('../../etc/evil.txt', Buffer.from('x'), 'text/plain')
    ).rejects.toThrow(/path traversal/i);
  });
});
