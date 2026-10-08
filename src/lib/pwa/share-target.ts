/**
 * PWA Web Share Target — shared logic between the /share-target route
 * handler and its tests. DOM-free (vitest runs in node).
 *
 * Flow:
 *   1. Installed PWA's share sheet POSTs multipart/form-data to /share-target
 *      (fields per the manifest: title, text, url, files[]).
 *   2. The route validates files with the EXISTING Madam Muse upload policy
 *      (`validateMuseUploads` in src/lib/muse/uploads.ts) — same MIME /
 *      size / magic-byte rules as the intake, no new validation invented.
 *   3. Valid files are stored with the EXISTING storage provider
 *      (src/lib/storage, local driver -> public/storage/shared/<token>/)
 *      together with a meta.json, then the route 303-redirects to
 *      /create?shared=<token>.
 *   4. /create passes the token to the intake, which fetches the bundle via
 *      /api/share-bundle and ingests the files through the EXISTING
 *      intake path (ingestFiles -> validateFile -> role detection).
 *
 * No new storage invented: the storage provider from src/lib/storage is
 * reused as-is. Bundles expire after SHARE_BUNDLE_TTL_MS (best-effort
 * cleanup on receipt; the bundle API also 410s expired tokens).
 */
import { randomUUID } from 'node:crypto';

export { composeSharedInstruction } from './share-text';

/** Storage key prefix under which share bundles live. */
export const SHARE_STORAGE_PREFIX = 'shared';

/** How long a stored share bundle stays retrievable (24h). */
export const SHARE_BUNDLE_TTL_MS = 24 * 60 * 60 * 1000;

/** Max files per share receipt — mirrors the intake's 5-file cap. */
export const SHARE_MAX_FILES = 5;

/** Error codes the /create page understands on `?shareError=<code>`. */
export type ShareErrorCode = 'too_large' | 'bad_type' | 'empty' | 'failed';

export interface ParsedShare {
  title: string;
  text: string;
  url: string;
  files: File[];
}

export interface ShareBundleFile {
  /** Original client file name (sanitized at receipt). */
  name: string;
  mime: string;
  size: number;
  /** Storage key, e.g. shared/<token>/0-photo.png */
  key: string;
}

export interface ShareBundleMeta {
  title: string;
  text: string;
  url: string;
  files: ShareBundleFile[];
  createdAt: number;
}

function textField(form: FormData, name: string): string {
  const v = form.get(name);
  return typeof v === 'string' ? v.slice(0, 2000) : '';
}

/**
 * Pull title/text/url + the shared files out of a share-target POST body.
 * The manifest maps params title/text/url and files[] (name "files").
 */
export function parseShareFormData(form: FormData): ParsedShare {
  const files = form
    .getAll('files')
    .filter((v): v is File => v instanceof File && v.size > 0);
  return {
    title: textField(form, 'title'),
    text: textField(form, 'text'),
    url: textField(form, 'url'),
    files,
  };
}

/**
 * Make a client-supplied file name safe for storage: strip directories,
 * control chars and anything outside a conservative allowlist. Never
 * returns an empty string.
 */
export function sanitizeShareFileName(name: string): string {
  const base = (name ?? '').split(/[\\/]/).pop() ?? '';
  const cleaned = base
    .replace(/[\u0000-\u001f\u007f]/g, '')
    .replace(/[^A-Za-z0-9._-]/g, '_')
    .replace(/^\.+/, '')
    .slice(0, 120);
  return cleaned || 'shared-file';
}

/** Opaque bundle id, safe for URLs and storage keys. */
export function newShareToken(): string {
  return randomUUID();
}

/** Storage key for one stored bundle file: shared/<token>/<i>-<name>. */
export function shareFileKey(token: string, index: number, name: string): string {
  return `${SHARE_STORAGE_PREFIX}/${token}/${index}-${sanitizeShareFileName(name)}`;
}

/** Storage key for the bundle descriptor. */
export function shareMetaKey(token: string): string {
  return `${SHARE_STORAGE_PREFIX}/${token}/meta.json`;
}

/** Where a valid receipt lands: /create?shared=<token>. */
export function buildSharedRedirectUrl(token: string): string {
  return `/create?shared=${encodeURIComponent(token)}`;
}

/**
 * Where a failed receipt lands: /create?shareError=<code>&shareMsg=<msg>.
 * The /create page shows the human message in a dismissible notice —
 * the share sheet itself gives the OS no error surface, so the notice
 * is the feedback channel.
 */
export function buildShareErrorUrl(code: ShareErrorCode, message: string): string {
  return (
    `/create?shareError=${encodeURIComponent(code)}` +
    `&shareMsg=${encodeURIComponent(message.slice(0, 300))}`
  );
}

export function isShareBundleExpired(createdAt: number, now = Date.now()): boolean {
  return now - createdAt > SHARE_BUNDLE_TTL_MS;
}

/** Loose token-shape check for the bundle API (uuids from newShareToken). */
export function isPlausibleShareToken(token: string): boolean {
  return /^[A-Za-z0-9-]{8,64}$/.test(token);
}
