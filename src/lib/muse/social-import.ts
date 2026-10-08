/**
 * Madam Muse — social URL import (server-side media fetch).
 *
 * Lets the intake accept an Instagram/Pinterest/etc. link, download the
 * media SERVER-SIDE, and hand the bytes back so the client attaches them
 * through the normal intake file path (same validation, same brief flow).
 *
 * Honesty rules (hard):
 *  - When a site blocks the server download (login walls, 403/429, bot
 *    blocks) we return an honest error telling the user to save + upload
 *    the file directly. We NEVER fake success and NEVER hotlink — the
 *    bytes we serve are bytes we actually fetched and verified.
 *  - A post/page URL (HTML) is rejected as bad_type with a plain-language
 *    explanation — only direct media files are accepted.
 *
 * Safety rules (hard):
 *  - http/https only. No private/loopback/link-local hosts: the hostname
 *    is DNS-resolved and every resolved address must be public. Redirect
 *    hops are re-validated one by one (max 5), so a redirect cannot smuggle
 *    the fetch to an internal address (SSRF guard).
 *  - Hard size cap (8 MB, the muse upload policy): content-length is
 *    checked up front AND the body is streamed with a running cap, so a
 *    lying header cannot blow memory.
 *  - Fetch timeout (15 s default); page content-types (HTML/text) are
 *    rejected up front, and magic bytes are sniffed with the existing
 *    `sniffMime` gate — the bytes are authoritative, the header advisory.
 */

import { lookup } from 'node:dns';
import { promisify } from 'node:util';
import { ATTACH_MAX_FILE_BYTES } from '@/lib/vilish/attachments';
import { sniffMime } from './uploads';

const lookupAsync = promisify(lookup);

/* ---------------- error shape ---------------- */

export type ImportErrorCode =
  | 'invalid_url'
  | 'blocked_host'
  | 'network_error'
  | 'timeout'
  | 'too_large'
  | 'bad_type'
  | 'login_wall';

export interface ImportFailure {
  ok: false;
  code: ImportErrorCode;
  message: string;
  /** Suggested HTTP status for the API route. */
  status: number;
}

export interface ImportedMedia {
  ok: true;
  bytes: Uint8Array;
  mime: string;
  filename: string;
}

export type ImportResult = ImportedMedia | ImportFailure;

function fail(
  code: ImportErrorCode,
  message: string,
  status: number
): ImportFailure {
  return { ok: false, code, message, status };
}

/* ---------------- URL validation ---------------- */

/** Hostnames we never fetch from, ever. */
const BLOCKED_HOST_RE =
  /^(localhost|localhost\.localdomain|.*\.localhost|.*\.localhost\.localdomain)$/i;

function isIpLiteral(host: string): boolean {
  return /^[0-9a-fA-F:.]+$/.test(host) && (host.includes('.') || host.includes(':'));
}

/** True for loopback / private / link-local / multicast / reserved ranges. */
export function isNonPublicIp(ip: string): boolean {
  const v = ip.toLowerCase();
  // IPv4-mapped IPv6
  const m = v.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
  const addr = m ? m[1] : v;
  if (addr.includes(':')) {
    // IPv6: loopback, link-local, unique-local, multicast, unspecified
    return (
      addr === '::1' ||
      addr === '::' ||
      addr.startsWith('fe80:') ||
      addr.startsWith('fc') ||
      addr.startsWith('fd') ||
      addr.startsWith('ff')
    );
  }
  const parts = addr.split('.').map(Number);
  if (parts.length !== 4 || parts.some((p) => !Number.isInteger(p) || p < 0 || p > 255))
    return true; // unparseable — treat as unsafe
  const [a, b] = parts;
  return (
    a === 10 || // 10/8
    a === 127 || // 127/8 loopback
    (a === 172 && b >= 16 && b <= 31) || // 172.16/12
    (a === 192 && b === 168) || // 192.168/16
    (a === 169 && b === 254) || // 169.254/16 link-local
    a === 0 || // 0/8 "this network"
    a >= 224 // 224/4 multicast + 240/4 reserved
  );
}

export interface ValidatedImportUrl {
  ok: true;
  url: URL;
}

export function validateImportUrl(
  raw: unknown
): ValidatedImportUrl | ImportFailure {
  if (typeof raw !== 'string' || !raw.trim()) {
    return fail(
      'invalid_url',
      'Please paste a link to import — the field was empty.',
      400
    );
  }
  let url: URL;
  try {
    url = new URL(raw.trim());
  } catch {
    return fail(
      'invalid_url',
      'That doesn\u2019t look like a valid link. Paste the full URL (starting with https://).',
      400
    );
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    return fail(
      'invalid_url',
      'Only http(s) links can be imported.',
      400
    );
  }
  if (!url.hostname) {
    return fail('invalid_url', 'That link has no website address in it.', 400);
  }
  if (BLOCKED_HOST_RE.test(url.hostname)) {
    return fail(
      'blocked_host',
      'Links to this computer can\u2019t be imported for safety reasons.',
      400
    );
  }
  // WHATWG URL keeps IPv6 brackets on .hostname ("[::1]") — strip them
  // before the literal/range checks so they can't slip past the SSRF gate.
  const hostForIpCheck = url.hostname.replace(/^\[|\]$/g, '');
  if (isIpLiteral(hostForIpCheck) && isNonPublicIp(hostForIpCheck)) {
    return fail(
      'blocked_host',
      'That address isn\u2019t publicly reachable — only public links can be imported.',
      400
    );
  }
  return { ok: true, url };
}

/* ---------------- download ---------------- */

export interface FetchDeps {
  fetchFn?: typeof fetch;
  /** Injectable for tests. Defaults to node:dns lookup. */
  resolveHost?: (host: string) => Promise<string[]>;
  /** Injectable for tests. Defaults to 15000 ms. */
  timeoutMs?: number;
}

const MAX_REDIRECTS = 5;

async function defaultResolveHost(host: string): Promise<string[]> {
  const records = await lookupAsync(host, { all: true });
  return records.map((r) => r.address);
}

async function assertPublicHost(
  hostname: string,
  resolveHost: (host: string) => Promise<string[]>
): Promise<ImportFailure | null> {
  let addrs: string[];
  try {
    addrs = await resolveHost(hostname);
  } catch {
    return fail(
      'network_error',
      `We couldn\u2019t reach ${hostname} (DNS failed). Check the link, or download the file and upload it directly.`,
      502
    );
  }
  if (addrs.some(isNonPublicIp)) {
    return fail(
      'blocked_host',
      'That link resolves to a private address — it can\u2019t be imported.',
      400
    );
  }
  return null;
}

function honestBlocked(hostname: string): ImportFailure {
  return fail(
    'login_wall',
    `We couldn\u2019t download this link — ${hostname} blocks server downloads ` +
      `(many social sites require a login or block bots). Nothing was imported. ` +
      `The quickest fix: open the link on your device, save the image or video, ` +
      `and upload the file here directly — it works exactly the same.`,
    422
  );
}


/** Best-effort body drain so we don't hold the socket; never throws. */
function dropBody(res: Response): void {
  try {
    void res.body?.cancel()?.catch(() => {});
  } catch {
    /* ignore */
  }
}

function filenameFromUrl(url: URL, mime: string): string {
  const base = (url.pathname.split('/').pop() ?? '').split(/[?#]/)[0];
  const clean = base.replace(/[^a-zA-Z0-9._-]/g, '').slice(0, 80);
  const ext =
    mime === 'image/jpeg'
      ? 'jpg'
      : mime === 'image/png'
        ? 'png'
        : mime === 'image/webp'
          ? 'webp'
          : mime === 'image/gif'
            ? 'gif'
            : mime === 'video/webm'
              ? 'webm'
              : mime.startsWith('video/')
                ? 'mp4'
                : 'bin';
  if (clean && /\.[a-z0-9]{2,5}$/i.test(clean)) return clean;
  const stem = clean.replace(/\.[a-z0-9]{2,5}$/i, '') || 'imported-media';
  return `${stem}.${ext}`;
}

const MEDIA_CT_RE = /^(image|video)\/[a-z0-9.+-]+/i;

/**
 * Download the media at a validated URL. Follows redirects manually
 * (re-validating every hop), caps size, verifies content-type and magic
 * bytes. Returns honest failures — never a half success.
 */
export async function fetchImportMedia(
  validated: URL,
  deps: FetchDeps = {}
): Promise<ImportResult> {
  const fetchFn = deps.fetchFn ?? fetch;
  const resolveHost = deps.resolveHost ?? defaultResolveHost;
  const timeoutMs = deps.timeoutMs ?? 15_000;

  let current = validated;
  let response: Response | null = null;

  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    const v = validateImportUrl(current.toString());
    if (!v.ok) return v;
    const blocked = await assertPublicHost(v.url.hostname, resolveHost);
    if (blocked) return blocked;

    let res: Response;
    try {
      res = await fetchFn(v.url.toString(), {
        redirect: 'manual',
        signal: AbortSignal.timeout(timeoutMs),
        headers: {
          // A real browser UA: many CDNs 403 bare fetch/curl UAs.
          'user-agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36',
          accept: 'image/*,video/*,*/*;q=0.8',
        },
      });
    } catch (err) {
      if (err instanceof DOMException && err.name === 'TimeoutError') {
        return fail(
          'timeout',
          `The download from ${v.url.hostname} timed out. The file may be large or the site slow — ` +
            `try saving it to your device and uploading it directly.`,
          504
        );
      }
      return fail(
        'network_error',
        `We couldn\u2019t reach ${v.url.hostname}. Check the link, or download the file and upload it directly.`,
        502
      );
    }

    if (res.status >= 300 && res.status < 400) {
      const loc = res.headers.get('location');
      dropBody(res);
      if (!loc) {
        return fail(
          'network_error',
          `The link redirected without a destination. Try the direct media link, or upload the file yourself.`,
          502
        );
      }
      if (hop === MAX_REDIRECTS) {
        return fail(
          'network_error',
          `That link redirected too many times. Paste the direct media link, or upload the file yourself.`,
          502
        );
      }
      try {
        current = new URL(loc, v.url);
      } catch {
        return fail(
          'network_error',
          `That link redirected somewhere invalid. Paste the direct media link, or upload the file yourself.`,
          502
        );
      }
      continue;
    }

    response = res;
    break;
  }

  if (!response) {
    return fail('network_error', 'The download failed unexpectedly. Please try uploading the file directly.', 502);
  }

  // Login walls / bot blocks are honest errors, not retries.
  if (response.status === 401 || response.status === 403 || response.status === 429) {
    dropBody(response);
    return honestBlocked(current.hostname);
  }
  if (response.status < 200 || response.status >= 300) {
    dropBody(response);
    return fail(
      'network_error',
      `The site answered with an error (HTTP ${response.status}). Nothing was imported — ` +
        `download the file and upload it directly instead.`,
      502
    );
  }

  const rawCt = (response.headers.get('content-type') ?? '').split(';')[0].trim();
  // Fast path: a page URL (HTML/text) is rejected before downloading.
  // octet-stream/empty headers are tolerated here — the magic-byte gate
  // below is authoritative.
  if (rawCt && !MEDIA_CT_RE.test(rawCt) && !/octet-stream|binary/i.test(rawCt)) {
    dropBody(response);
    // Almost always: the user pasted a post/page URL, not the media file.
    return fail(
      'bad_type',
      `That link opened a web page, not an image or video file (got "${rawCt || 'unknown'}"). ` +
        `On a post page, save the media to your device first and upload it here — or paste a direct link to the image/video file.`,
      422
    );
  }

  const declared = Number(response.headers.get('content-length'));
  if (Number.isFinite(declared) && declared > ATTACH_MAX_FILE_BYTES) {
    dropBody(response);
    return fail(
      'too_large',
      `That file is ${(declared / (1024 * 1024)).toFixed(1)} MB — imports are capped at ` +
        `${(ATTACH_MAX_FILE_BYTES / (1024 * 1024)).toFixed(0)} MB. Save a smaller copy and upload it directly.`,
      413
    );
  }

  // Stream with a running cap — a lying content-length can't blow memory.
  const chunks: Uint8Array[] = [];
  let total = 0;
  try {
    const reader = response.body?.getReader();
    if (!reader) {
      return fail('network_error', 'The download returned no data. Try uploading the file directly.', 502);
    }
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > ATTACH_MAX_FILE_BYTES) {
        try {
          await reader.cancel();
        } catch {
          /* ignore */
        }
        return fail(
          'too_large',
          `That file is over ${(ATTACH_MAX_FILE_BYTES / (1024 * 1024)).toFixed(0)} MB — imports are capped there. ` +
            `Save a smaller copy and upload it directly.`,
          413
        );
      }
      chunks.push(value);
    }
  } catch (err) {
    if (err instanceof DOMException && err.name === 'TimeoutError') {
      return fail(
        'timeout',
        `The download from ${current.hostname} timed out mid-file. Try saving it to your device and uploading it directly.`,
        504
      );
    }
    return fail(
      'network_error',
      `The download broke partway. Nothing was imported — try uploading the file directly.`,
      502
    );
  }

  const bytes = new Uint8Array(total);
  let off = 0;
  for (const c of chunks) {
    bytes.set(c, off);
    off += c.byteLength;
  }
  if (bytes.length === 0) {
    return fail('bad_type', 'The download was empty. Try uploading the file directly.', 422);
  }

  // Magic-byte gate (authoritative): the bytes must actually BE a known
  // image/video format. The content-type header is advisory only.
  const sniffed = sniffMime(bytes.length > 4096 ? bytes.subarray(0, 4096) : bytes);
  if (!sniffed || !MEDIA_CT_RE.test(sniffed)) {
    const hint = `(got "${rawCt || 'unknown'}")`;
    const message = /html|text\//i.test(rawCt)
      ? `That link opened a web page, not an image or video file ${hint}. ` +
        `On a post page, save the media to your device first and upload it here — or paste a direct link to the image/video file.`
      : `The downloaded file doesn\u2019t look like a real image or video ${hint}. Nothing was imported — ` +
        `download the file yourself and upload it directly.`;
    return fail('bad_type', message, 422);
  }

  return {
    ok: true,
    bytes,
    mime: sniffed,
    filename: filenameFromUrl(current, sniffed),
  };
}
