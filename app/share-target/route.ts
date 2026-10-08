/**
 * PWA Web Share Target receiver (manifest share_target.action).
 *
 * The OS share sheet POSTs multipart/form-data here with fields
 * title/text/url and files[] (see app/manifest.ts). This handler:
 *
 *   1. Parses the body with parseShareFormData().
 *   2. Validates every file with the EXISTING Madam Muse upload policy
 *      (validateMuseUploads: MIME allowlist + 8MB/file + 20MB total +
 *      magic-byte sniffing). Rejected shares redirect to /create with a
 *      human-readable ?shareError notice — the share sheet gives the OS
 *      no error surface, so the notice is the feedback channel.
 *   3. Stores valid files + a meta.json via the EXISTING storage provider
 *      (src/lib/storage, local driver -> public/storage/shared/<token>/)
 *      and 303-redirects to /create?shared=<token>, where the intake
 *      fetches the bundle and pre-attaches the files.
 *
 * No new storage or validation invented; bundles expire after 24h
 * (best-effort sweep on receipt, /api/share-bundle also 410s them).
 */
import { readdir, readFile, rm } from 'node:fs/promises';
import path from 'node:path';
import { NextRequest, NextResponse } from 'next/server';
import { validateMuseUploads, type MuseUploadFile } from '@/lib/muse/uploads';
import {
  SHARE_STORAGE_PREFIX,
  buildShareErrorUrl,
  buildSharedRedirectUrl,
  composeSharedInstruction,
  isShareBundleExpired,
  newShareToken,
  parseShareFormData,
  sanitizeShareFileName,
  shareFileKey,
  shareMetaKey,
  type ShareBundleMeta,
} from '@/lib/pwa/share-target';
import { localStorage, localStorageRoot } from '@/lib/storage';

export const dynamic = 'force-dynamic';

const HEAD_BYTES = 4096; // magic-byte sniffing only needs the head

async function toMuseUploadFile(f: File): Promise<MuseUploadFile> {
  const head = new Uint8Array(await f.slice(0, HEAD_BYTES).arrayBuffer());
  return { name: f.name, type: f.type, size: f.size, data: head };
}

/** Best-effort: drop share bundles older than the TTL. Never throws. */
async function sweepExpiredBundles(): Promise<void> {
  try {
    const prefixDir = path.join(localStorageRoot(), SHARE_STORAGE_PREFIX);
    const entries = await readdir(prefixDir, { withFileTypes: true });
    await Promise.all(
      entries
        .filter((e) => e.isDirectory())
        .map(async (e) => {
          try {
            const metaPath = path.join(prefixDir, e.name, 'meta.json');
            const meta = JSON.parse(await readFile(metaPath, 'utf8')) as ShareBundleMeta;
            if (isShareBundleExpired(meta.createdAt)) {
              await rm(path.join(prefixDir, e.name), { recursive: true, force: true });
            }
          } catch {
            /* unreadable bundle — leave it for the next sweep */
          }
        }),
    );
  } catch {
    /* storage dir missing on first run — nothing to sweep */
  }
}

function redirectTo(req: NextRequest, to: string): NextResponse {
  return NextResponse.redirect(new URL(to, req.nextUrl.origin), 303);
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return redirectTo(req, buildShareErrorUrl('failed', "That share couldn't be read — please try sharing again."));
  }

  const parsed = parseShareFormData(form);

  if (parsed.files.length === 0) {
    // Text/URL-only share: still useful — hand the text to the intake.
    if (composeSharedInstruction(parsed)) {
      const token = newShareToken();
      const meta: ShareBundleMeta = {
        title: parsed.title,
        text: parsed.text,
        url: parsed.url,
        files: [],
        createdAt: Date.now(),
      };
      try {
        const store = localStorage();
        await store.put(shareMetaKey(token), Buffer.from(JSON.stringify(meta)), 'application/json');
      } catch {
        return redirectTo(req, buildShareErrorUrl('failed', "That share couldn't be saved — please try again."));
      }
      void sweepExpiredBundles();
      return redirectTo(req, buildSharedRedirectUrl(token));
    }
    return redirectTo(req, buildShareErrorUrl('empty', 'Nothing to share was attached — pick an image or video and share it to Etch.'));
  }

  // Existing Madam Muse upload policy: allowlist + size caps + magic bytes.
  const uploadFiles = await Promise.all(parsed.files.map(toMuseUploadFile));
  const check = validateMuseUploads(uploadFiles);
  if (!check.ok) {
    const code = check.error === 'too_large' ? 'too_large' : 'bad_type';
    return redirectTo(req, buildShareErrorUrl(code, check.message ?? 'Those files could not be accepted.'));
  }

  const token = newShareToken();
  const store = localStorage();
  try {
    const stored = await Promise.all(
      parsed.files.map(async (f, i) => {
        const key = shareFileKey(token, i, f.name);
        await store.put(key, Buffer.from(await f.arrayBuffer()), f.type || 'application/octet-stream');
        return {
          name: sanitizeShareFileName(f.name),
          mime: f.type,
          size: f.size,
          key,
        };
      }),
    );
    const meta: ShareBundleMeta = {
      title: parsed.title,
      text: parsed.text,
      url: parsed.url,
      files: stored,
      createdAt: Date.now(),
    };
    await store.put(shareMetaKey(token), Buffer.from(JSON.stringify(meta)), 'application/json');
  } catch {
    return redirectTo(req, buildShareErrorUrl('failed', "That share couldn't be saved — please try again."));
  }

  void sweepExpiredBundles();
  return redirectTo(req, buildSharedRedirectUrl(token));
}

/** A bare GET on the action URL just lands on the intake. */
export async function GET(req: NextRequest): Promise<NextResponse> {
  return redirectTo(req, '/create');
}
