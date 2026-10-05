// Status: IMPLEMENTED (local driver dev; s3 driver READY_FOR_CREDENTIAL)
import { mkdir, writeFile, unlink } from 'node:fs/promises';
import path from 'node:path';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';

export interface StorageProvider {
  put(
    key: string,
    data: Buffer | Uint8Array,
    contentType: string
  ): Promise<{ url: string }>;
  delete(key: string): Promise<void>;
}

/* ---------------- local driver ----------------
 * NOTE: files land in public/storage/<key>. public/storage must be STRIPPED
 * before any repo push — the push tooling uploads the whole workdir and
 * stored media must never leave the sandbox that way.
 */
function localRoot(): string {
  return (
    process.env.STORAGE_DIR ?? path.join(process.cwd(), 'public', 'storage')
  );
}

function resolveLocalKey(root: string, key: string): string {
  const resolved = path.resolve(root, key);
  if (resolved !== path.resolve(root) && !resolved.startsWith(path.resolve(root) + path.sep)) {
    throw new Error('Invalid storage key: path traversal denied');
  }
  return resolved;
}

export function localStorage(): StorageProvider {
  return {
    async put(key, data, _contentType) {
      const root = localRoot();
      const dest = resolveLocalKey(root, key);
      await mkdir(path.dirname(dest), { recursive: true });
      await writeFile(dest, Buffer.from(data));
      return { url: `/storage/${key}` };
    },
    async delete(key) {
      const root = localRoot();
      const dest = resolveLocalKey(root, key);
      await unlink(dest);
    },
  };
}

/* ---------------- s3 driver ----------------
 * Status: READY_FOR_CREDENTIAL. Env required:
 *   S3_ENDPOINT, S3_REGION, S3_BUCKET, S3_KEY, S3_SECRET, S3_PUBLIC_BASE_URL
 */
function s3Config() {
  const {
    S3_ENDPOINT,
    S3_REGION,
    S3_BUCKET,
    S3_KEY,
    S3_SECRET,
  } = process.env;
  if (!S3_ENDPOINT || !S3_REGION || !S3_BUCKET || !S3_KEY || !S3_SECRET) {
    throw new Error(
      'S3 storage not configured: set S3_ENDPOINT, S3_REGION, S3_BUCKET, S3_KEY, S3_SECRET'
    );
  }
  return { S3_ENDPOINT, S3_REGION, S3_BUCKET, S3_KEY, S3_SECRET };
}

export function s3Storage(): StorageProvider {
  const cfg = s3Config();
  const client = new S3Client({
    endpoint: cfg.S3_ENDPOINT,
    region: cfg.S3_REGION,
    forcePathStyle: true,
    credentials: {
      accessKeyId: cfg.S3_KEY,
      secretAccessKey: cfg.S3_SECRET,
    },
  });
  return {
    async put(key, data, contentType) {
      await client.send(
        new PutObjectCommand({
          Bucket: cfg.S3_BUCKET,
          Key: key,
          Body: Buffer.from(data),
          ContentType: contentType,
        })
      );
      const base = process.env.S3_PUBLIC_BASE_URL;
      if (!base) throw new Error('S3_PUBLIC_BASE_URL not configured');
      return { url: `${base.replace(/\/$/, '')}/${key}` };
    },
    async delete(key) {
      await client.send(
        new DeleteObjectCommand({ Bucket: cfg.S3_BUCKET, Key: key })
      );
    },
  };
}

/** Factory: 's3' driver when STORAGE_DRIVER === 's3', otherwise local. */
export function getStorage(): StorageProvider {
  if (process.env.STORAGE_DRIVER === 's3') return s3Storage();
  return localStorage();
}
