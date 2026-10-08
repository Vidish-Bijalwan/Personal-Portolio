/**
 * Madam Muse — client-side reference-role heuristics (CONTRACTS.md §4/§5).
 *
 * Pure helpers (classifyOrientation, kindOfMime, suggestRole,
 * extractPaletteFromPixels) are DOM-free and unit-testable. detectRoles()
 * wires them to browser APIs (canvas sampling, video metadata) and degrades
 * gracefully outside a browser (dims 0, no palette, filename heuristics only).
 */
import type { RefMeta, RefRole } from './brief';

export type Orientation = 'landscape' | 'portrait' | 'square';

export const REF_ROLES: RefRole[] = [
  'subject',
  'style',
  'composition',
  'palette',
  'typography',
  'texture',
  'mood',
];

export function classifyOrientation(width: number, height: number): Orientation {
  if (width <= 0 || height <= 0) return 'square';
  if (width > height * 1.05) return 'landscape';
  if (height > width * 1.05) return 'portrait';
  return 'square';
}

export function kindOfMime(mime: string): 'image' | 'video' {
  return mime.toLowerCase().startsWith('video/') ? 'video' : 'image';
}

/** text-presence hint: true only when the filename/metadata suggests text. No OCR. */
export function textHintForName(name: string): boolean {
  return /(logo|brand|text|caption|poster|flyer|menu|card|banner|headline|typo)/i.test(name);
}

interface RoleSuggestion {
  role: RefRole;
  roleConfidence: number;
}

/**
 * Auto role suggestion. Never forced — the UI always offers an override
 * dropdown, and roleUserOverride stays false until the user touches it.
 */
export function suggestRole(
  file: { name: string; type: string },
  index: number,
): RoleSuggestion {
  const name = file.name ?? '';
  if (kindOfMime(file.type ?? '') === 'video') {
    return { role: 'subject', roleConfidence: 0.85 }; // source footage
  }
  if (/(palette|swatch|colors?|colour)/i.test(name)) {
    return { role: 'palette', roleConfidence: 0.65 };
  }
  if (/(texture|grain|paper|fabric|noise|marble|wood)/i.test(name)) {
    return { role: 'texture', roleConfidence: 0.6 };
  }
  if (textHintForName(name)) {
    return { role: 'typography', roleConfidence: 0.6 };
  }
  if (/(layout|grid|composition|wireframe|mockup)/i.test(name)) {
    return { role: 'composition', roleConfidence: 0.6 };
  }
  if (/(mood|vibe|style|aesthetic|reference)/i.test(name)) {
    return { role: index === 0 ? 'subject' : 'style', roleConfidence: 0.5 };
  }
  // Positional fallback, deliberately low confidence.
  switch (index) {
    case 0:
      return { role: 'subject', roleConfidence: 0.55 };
    case 1:
      return { role: 'style', roleConfidence: 0.5 };
    case 2:
      return { role: 'composition', roleConfidence: 0.5 };
    case 3:
      return { role: 'palette', roleConfidence: 0.5 };
    default:
      return { role: 'mood', roleConfidence: 0.5 };
  }
}

function toHex(r: number, g: number, b: number): string {
  const c = (v: number) =>
    Math.max(0, Math.min(255, Math.round(v)))
      .toString(16)
      .padStart(2, '0');
  return `#${c(r)}${c(g)}${c(b)}`;
}

/**
 * Top-N dominant colors from raw RGBA pixels. Bucketed histogram on 4-bit
 * channels (4096 buckets) with centroid refinement — a median-cut-lite that
 * stays dependency-free. Transparent pixels are skipped.
 */
export function extractPaletteFromPixels(
  data: ArrayLike<number>,
  width: number,
  height: number,
  maxColors = 5,
): string[] {
  const px = width * height;
  if (px <= 0 || data.length < px * 4) return [];
  const stride = Math.max(1, Math.floor(px / 4096)); // sample ≤ ~4k px
  const buckets = new Map<number, { n: number; r: number; g: number; b: number }>();
  for (let i = 0; i < px; i += stride) {
    const o = i * 4;
    if (data[o + 3] < 128) continue;
    const r = data[o];
    const g = data[o + 1];
    const b = data[o + 2];
    const key = ((r >> 4) << 8) | ((g >> 4) << 4) | (b >> 4);
    let e = buckets.get(key);
    if (!e) {
      e = { n: 0, r: 0, g: 0, b: 0 };
      buckets.set(key, e);
    }
    e.n += 1;
    e.r += r;
    e.g += g;
    e.b += b;
  }
  return [...buckets.values()]
    .sort((a, b) => b.n - a.n)
    .slice(0, Math.max(1, maxColors))
    .map((e) => toHex(e.r / e.n, e.g / e.n, e.b / e.n));
}

/** Enriched detection result: exact RefMeta shape plus UI-useful extras. */
export interface DetectedRef extends RefMeta {
  orientation: Orientation;
  textHint: boolean;
}

const SAMPLE_EDGE = 96; // downscale target for palette sampling

async function probeImagePixels(
  file: File,
): Promise<{ width: number; height: number; data: Uint8ClampedArray } | null> {
  try {
    if (typeof document === 'undefined') return null;
    let srcWidth: number;
    let srcHeight: number;
    let source: CanvasImageSource;
    if (typeof createImageBitmap === 'function') {
      const bmp = await createImageBitmap(file);
      srcWidth = bmp.width;
      srcHeight = bmp.height;
      source = bmp;
    } else {
      const url = URL.createObjectURL(file);
      try {
        const img = await new Promise<HTMLImageElement>((resolve, reject) => {
          const el = new Image();
          el.onload = () => resolve(el);
          el.onerror = () => reject(new Error('decode failed'));
          el.src = url;
        });
        srcWidth = img.naturalWidth;
        srcHeight = img.naturalHeight;
        source = img;
      } finally {
        URL.revokeObjectURL(url);
      }
    }
    if (!srcWidth || !srcHeight) return null;
    const scale = Math.min(1, SAMPLE_EDGE / Math.max(srcWidth, srcHeight));
    const w = Math.max(1, Math.round(srcWidth * scale));
    const h = Math.max(1, Math.round(srcHeight * scale));
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return null;
    ctx.drawImage(source, 0, 0, w, h);
    const img = ctx.getImageData(0, 0, w, h);
    if (typeof (source as ImageBitmap).close === 'function') {
      (source as ImageBitmap).close();
    }
    return { width: srcWidth, height: srcHeight, data: img.data };
  } catch {
    return null;
  }
}

function probeVideoMeta(file: File): Promise<{ width: number; height: number; durationSec?: number }> {
  return new Promise((resolve) => {
    if (typeof document === 'undefined') return resolve({ width: 0, height: 0 });
    const url = URL.createObjectURL(file);
    const el = document.createElement('video');
    el.preload = 'metadata';
    el.muted = true;
    const done = (meta: { width: number; height: number; durationSec?: number }) => {
      URL.revokeObjectURL(url);
      resolve(meta);
    };
    const timer = setTimeout(() => done({ width: 0, height: 0 }), 3000);
    el.onloadedmetadata = () => {
      clearTimeout(timer);
      done({
        width: el.videoWidth || 0,
        height: el.videoHeight || 0,
        durationSec: Number.isFinite(el.duration) ? Math.round(el.duration * 10) / 10 : undefined,
      });
    };
    el.onerror = () => {
      clearTimeout(timer);
      done({ width: 0, height: 0 });
    };
    el.src = url;
  });
}

/**
 * Detect roles + metadata for reference files. Matches the contract type
 * (Promise<RefMeta[]>); returned objects carry extra `orientation` and
 * `textHint` fields for the UI. Never throws — per-file failures degrade to
 * dims 0 / heuristic role.
 */
export async function detectRoles(files: File[]): Promise<DetectedRef[]> {
  const out: DetectedRef[] = [];
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const id = `ref_${String(i + 1).padStart(2, '0')}`;
    const kind = kindOfMime(file.type);
    const suggestion = suggestRole(file, i);
    try {
      if (kind === 'video') {
        const meta = await probeVideoMeta(file);
        out.push({
          id,
          kind,
          name: file.name,
          mime: file.type || 'video/mp4',
          width: meta.width,
          height: meta.height,
          sizeBytes: file.size,
          ...(meta.durationSec !== undefined ? { durationSec: meta.durationSec } : {}),
          role: suggestion.role,
          roleConfidence: suggestion.roleConfidence,
          roleUserOverride: false,
          orientation: classifyOrientation(meta.width, meta.height),
          textHint: false,
        });
      } else {
        const probed = await probeImagePixels(file);
        const width = probed?.width ?? 0;
        const height = probed?.height ?? 0;
        // Palette is extracted (contract: hex colors when role includes
        // palette) from the downsampled buffer probeImagePixels already made.
        let paletteHex: string[] | undefined;
        if (suggestion.role === 'palette' && probed && width > 0 && height > 0) {
          const scale = Math.min(1, SAMPLE_EDGE / Math.max(width, height));
          const sw = Math.max(1, Math.round(width * scale));
          const sh = Math.max(1, Math.round(height * scale));
          paletteHex = extractPaletteFromPixels(probed.data, sw, sh, 5);
        }
        out.push({
          id,
          kind,
          name: file.name,
          mime: file.type || 'image/png',
          width,
          height,
          sizeBytes: file.size,
          role: suggestion.role,
          roleConfidence: suggestion.roleConfidence,
          roleUserOverride: false,
          ...(paletteHex ? { palette: paletteHex } : {}),
          orientation: classifyOrientation(width, height),
          textHint: textHintForName(file.name),
        });
      }
    } catch {
      out.push({
        id,
        kind,
        name: file.name,
        mime: file.type || 'application/octet-stream',
        width: 0,
        height: 0,
        sizeBytes: file.size,
        role: suggestion.role,
        roleConfidence: suggestion.roleConfidence,
        roleUserOverride: false,
        orientation: 'square',
        textHint: textHintForName(file.name),
      });
    }
  }
  return out;
}
