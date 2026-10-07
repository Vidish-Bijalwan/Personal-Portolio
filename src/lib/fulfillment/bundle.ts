/**
 * Etch — reference bundle builder (Phase 2 contract §5).
 *
 * Produces the operator download ZIP:
 *   <orderCode>/order.json
 *   <orderCode>/prompt.txt
 *   <orderCode>/references/<filename>
 *
 * NOTE: requires the `jszip` package (being installed by a parallel agent;
 * do NOT npm-install from here). Import will fail until it lands in
 * node_modules.
 */
import JSZip from 'jszip';
import path from 'node:path';
import { readFile } from 'node:fs/promises';

export interface BundleJobInput {
  id: string;
  prompt: string | null;
  task: string;
  jobKind: string | null;
  aspectRatio: string | null;
  quality: string | null;
  state: string;
  createdAt: Date | null;
}

export interface BundleOrderInput {
  code: string;
  amountPaise: number | null;
  status: string;
  userId: string | null;
}

export interface BundleReferenceInput {
  id: string;
  url: string;
  mimeType: string | null;
  filename?: string | null;
}

function localStorageRoot(): string {
  return (
    process.env.STORAGE_DIR ?? path.join(process.cwd(), 'public', 'storage')
  );
}

/** Resolve reference bytes: local driver reads from disk, remote URLs fetch. */
async function fetchReferenceBytes(url: string): Promise<Buffer> {
  if (url.startsWith('/storage/')) {
    const root = localStorageRoot();
    const rel = url.slice('/storage/'.length);
    const resolved = path.resolve(root, rel);
    const rootResolved = path.resolve(root);
    if (
      resolved !== rootResolved &&
      !resolved.startsWith(rootResolved + path.sep)
    ) {
      throw new Error('path traversal denied');
    }
    return await readFile(resolved);
  }
  const res = await fetch(url);
  if (!res.ok) throw new Error(`reference fetch failed: ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

function filenameFor(ref: BundleReferenceInput, index: number): string {
  if (ref.filename && ref.filename.trim()) return ref.filename.trim();
  try {
    const u = new URL(ref.url, 'http://localhost');
    const base = path.basename(u.pathname);
    if (base && base !== '/') return base;
  } catch {
    /* fall through */
  }
  const ext =
    ref.mimeType?.split('/')[1]?.replace(/[^a-z0-9]/gi, '') || 'bin';
  return `reference-${index + 1}.${ext}`;
}

function uniqueName(name: string, seen: Set<string>): string {
  if (!seen.has(name)) {
    seen.add(name);
    return name;
  }
  const dot = name.lastIndexOf('.');
  const stem = dot > 0 ? name.slice(0, dot) : name;
  const ext = dot > 0 ? name.slice(dot) : '';
  let n = 2;
  let candidate = `${stem}_${n}${ext}`;
  while (seen.has(candidate)) {
    n += 1;
    candidate = `${stem}_${n}${ext}`;
  }
  seen.add(candidate);
  return candidate;
}

/**
 * Build the reference bundle ZIP. Returns the ZIP bytes (node Buffer).
 * Missing/unfetchable references are replaced with a .MISSING.txt note so
 * the operator always knows exactly what was unavailable.
 */
export async function buildReferenceBundle(
  job: BundleJobInput,
  order: BundleOrderInput,
  references: BundleReferenceInput[]
): Promise<Buffer> {
  const zip = new JSZip();
  const root = zip.folder(order.code) ?? zip;

  const orderJson = {
    orderCode: order.code,
    amountPaise: order.amountPaise,
    orderStatus: order.status,
    jobId: job.id,
    jobKind: job.jobKind ?? 'generation',
    task: job.task,
    aspectRatio: job.aspectRatio,
    quality: job.quality,
    state: job.state,
    createdAt: job.createdAt ? job.createdAt.toISOString() : null,
  };
  root.file('order.json', JSON.stringify(orderJson, null, 2));
  root.file('prompt.txt', job.prompt ?? '');

  const refDir = root.folder('references');
  if (refDir) {
    const seen = new Set<string>();
    for (let i = 0; i < references.length; i++) {
      const ref = references[i];
      const name = uniqueName(filenameFor(ref, i), seen);
      try {
        const bytes = await fetchReferenceBytes(ref.url);
        refDir.file(name, bytes);
      } catch (e) {
        refDir.file(
          `${name}.MISSING.txt`,
          `Reference could not be fetched.\nurl: ${ref.url}\nerror: ${
            e instanceof Error ? e.message : String(e)
          }`
        );
      }
    }
  }

  return await zip.generateAsync({ type: 'nodebuffer', compression: 'STORE' });
}
