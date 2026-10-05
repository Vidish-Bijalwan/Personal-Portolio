/**
 * Vidish Studio — reference-file attachment policy for the composer.
 *
 * Customers can attach reference files (images, PDFs, docs, notes) to a
 * generation request. Files are stored in Postgres `bytea` on the
 * `generation_attachments` table — never on the local filesystem, which is
 * ephemeral on Vercel.
 *
 * Limits are enforced BOTH client-side (composer) and server-side
 * (/api/generation/start) via the same validateUploads() pure function.
 */
export const ATTACH_MAX_FILES = 5;
export const ATTACH_MAX_FILE_BYTES = 8 * 1024 * 1024; // 8 MB per file
export const ATTACH_MAX_TOTAL_BYTES = 20 * 1024 * 1024; // 20 MB per request

interface AllowedKind {
  extensions: string[];
  mimes: string[];
}

/** Extension + MIME allowlist. Browsers may report an empty MIME (e.g. .txt
 *  on some platforms), so the extension is the primary gate and a present
 *  MIME must additionally be on the allowlist. */
const ALLOWLIST: AllowedKind[] = [
  { extensions: ['png'], mimes: ['image/png'] },
  { extensions: ['jpg', 'jpeg'], mimes: ['image/jpeg'] },
  { extensions: ['webp'], mimes: ['image/webp'] },
  { extensions: ['gif'], mimes: ['image/gif'] },
  { extensions: ['pdf'], mimes: ['application/pdf'] },
  { extensions: ['doc'], mimes: ['application/msword'] },
  {
    extensions: ['docx'],
    mimes: [
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ],
  },
  { extensions: ['txt'], mimes: ['text/plain'] },
  { extensions: ['md', 'markdown'], mimes: ['text/markdown', 'text/x-markdown'] },
];

const EXTENSION_TO_MIMES = new Map<string, Set<string>>();
const EXTENSION_PRIMARY_MIME = new Map<string, string>();
for (const kind of ALLOWLIST) {
  for (const ext of kind.extensions) {
    EXTENSION_TO_MIMES.set(ext, new Set(kind.mimes));
    // Prefer the most specific/standard MIME for storage + serving.
    if (!EXTENSION_PRIMARY_MIME.has(ext)) {
      EXTENSION_PRIMARY_MIME.set(ext, kind.mimes[0]);
    }
  }
}

/**
 * Conservative executable/script denylist. Checked BEFORE the allowlist so
 * a double-extension trick (e.g. "reference.pdf.exe") is rejected even if
 * the trailing extension looks innocent.
 */
const DENIED_EXTENSIONS = new Set([
  'exe', 'msi', 'bat', 'cmd', 'com', 'scr', 'pif', 'ps1', 'psm1',
  'sh', 'bash', 'zsh', 'ksh', 'csh',
  'js', 'mjs', 'cjs', 'ts', 'jsx', 'tsx', 'py', 'pyc', 'pyo',
  'rb', 'php', 'pl', 'pm', 'jar', 'class',
  'vbs', 'vbe', 'jse', 'wsf', 'wsh', 'hta',
  'html', 'htm', 'xhtml', 'shtml', 'svg',
  'lnk', 'dll', 'so', 'dylib', 'sys', 'drv',
  'apk', 'ipa', 'app', 'dmg', 'iso', 'img',
  'bin', 'dat', 'reg', 'gadget', 'cpl', 'msc', 'vb',
]);

export type AttachmentInput = {
  /** Original file name (used for the extension gate). */
  name: string;
  /** Size in bytes. */
  size: number;
  /** Browser-reported MIME, may be empty. */
  type: string;
};

export interface UploadCheck {
  ok: boolean;
  code?:
    | 'TOO_MANY_FILES'
    | 'FILE_TOO_LARGE'
    | 'TOTAL_TOO_LARGE'
    | 'FILE_TYPE_NOT_ALLOWED'
    | 'EMPTY_FILE';
  message?: string;
}

function extensionOf(name: string): string {
  const base = name.split(/[\\/]/).pop() ?? '';
  const idx = base.lastIndexOf('.');
  if (idx <= 0) return '';
  return base.slice(idx + 1).toLowerCase();
}

function mb(bytes: number): string {
  return `${(bytes / (1024 * 1024)).toFixed(bytes >= 10 * 1024 * 1024 ? 0 : 1)} MB`;
}

/**
 * Canonical MIME for a filename's (allowlisted) extension, e.g. "docx" ->
 * the Word MIME. Used when persisting/serving so a spoofed or empty
 * browser-reported MIME is never trusted.
 */
export function canonicalMimeFor(filename: string): string | null {
  return EXTENSION_PRIMARY_MIME.get(extensionOf(filename)) ?? null;
}

/** Reason a single file is rejected, or null when the file is accepted. */
export function rejectionFor(file: AttachmentInput): {
  code: NonNullable<UploadCheck['code']>;
  message: string;
} | null {
  const name = file.name?.trim() ?? '';
  if (!name) {
    return { code: 'FILE_TYPE_NOT_ALLOWED', message: 'A file is missing its name.' };
  }
  const ext = extensionOf(name);
  if (!ext) {
    return {
      code: 'FILE_TYPE_NOT_ALLOWED',
      message: `"${name}" has no file extension — only ${['png', 'jpg', 'webp', 'gif', 'pdf', 'doc', 'docx', 'txt', 'md'].join(', ')} are accepted.`,
    };
  }
  if (DENIED_EXTENSIONS.has(ext)) {
    return {
      code: 'FILE_TYPE_NOT_ALLOWED',
      message: `"${name}" looks like an executable or script (.${ext}) — those are never accepted.`,
    };
  }
  const allowedMimes = EXTENSION_TO_MIMES.get(ext);
  if (!allowedMimes) {
    return {
      code: 'FILE_TYPE_NOT_ALLOWED',
      message: `"${name}" (.${ext}) isn't accepted. Allowed: images (png, jpg, webp, gif), pdf, doc/docx, txt, md.`,
    };
  }
  const mime = (file.type ?? '').toLowerCase().split(';')[0].trim();
  if (mime && !allowedMimes.has(mime)) {
    return {
      code: 'FILE_TYPE_NOT_ALLOWED',
      message: `"${name}" claims to be .${ext} but arrived as ${mime} — rejected to be safe.`,
    };
  }
  if (!Number.isFinite(file.size) || file.size <= 0) {
    return { code: 'EMPTY_FILE', message: `"${name}" is empty.` };
  }
  if (file.size > ATTACH_MAX_FILE_BYTES) {
    return {
      code: 'FILE_TOO_LARGE',
      message: `"${name}" is ${mb(file.size)} — each file must be under ${mb(ATTACH_MAX_FILE_BYTES)}.`,
    };
  }
  return null;
}

/** Back-compat alias: human-readable rejection reason, or null. */
export function rejectionReasonFor(file: AttachmentInput): string | null {
  return rejectionFor(file)?.message ?? null;
}

/**
 * Validate a batch of uploads. Order of checks is user-friendly: file type
 * problems are reported before aggregate limits.
 */
export function validateUploads(files: AttachmentInput[]): UploadCheck {
  if (files.length > ATTACH_MAX_FILES) {
    return {
      ok: false,
      code: 'TOO_MANY_FILES',
      message: `Attach at most ${ATTACH_MAX_FILES} files — you picked ${files.length}.`,
    };
  }
  for (const f of files) {
    const rejection = rejectionFor(f);
    if (rejection) {
      return { ok: false, code: rejection.code, message: rejection.message };
    }
  }
  const total = files.reduce((sum, f) => sum + f.size, 0);
  if (total > ATTACH_MAX_TOTAL_BYTES) {
    return {
      ok: false,
      code: 'TOTAL_TOO_LARGE',
      message: `All files together are ${mb(total)} — the limit is ${mb(ATTACH_MAX_TOTAL_BYTES)} per request.`,
    };
  }
  return { ok: true };
}
