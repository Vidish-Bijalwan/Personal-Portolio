/**
 * Pixaura — Video Studio params validation.
 *
 * Pure logic: no JSX, no I/O. Validates the tool-specific `params`
 * jsonb payloads for video_jobs. Unit-testable in isolation.
 */
import {
  INPUT_MIMES,
  MAX_INPUT_BYTES,
  SCRIPT_MAX,
  TEXT_POSITIONS,
  TTS_VOICES,
  VIDEO_TOOLS,
  type VideoTool,
} from './constants';

export interface ValidationOk<T> {
  ok: true;
  value: T;
}
export interface ValidationErr {
  ok: false;
  code: string;
  error: string;
}
export type Validation<T> = ValidationOk<T> | ValidationErr;

const err = (code: string, error: string): ValidationErr => ({ ok: false, code, error });

export function isValidTool(tool: unknown): tool is VideoTool {
  return typeof tool === 'string' && (VIDEO_TOOLS as readonly string[]).includes(tool);
}

/* ---------------- shared shapes ---------------- */

/** tts params: { script, voice, source: {kind:'upload'} | {kind:'clip', generationId} } */
export interface TtsParams {
  script: string;
  voice: string;
  sourceKind: 'upload' | 'clip';
  generationId?: string;
}

/** caption params: { mode:'auto' } | { mode:'script', text } */
export interface CaptionParams {
  mode: 'auto' | 'script';
  text?: string;
}

/** trim params: { start, end, text?, position? } */
export interface TrimParams {
  start: number;
  end: number;
  text?: string;
  position?: string;
}

function nonEmptyString(v: unknown, max: number): v is string {
  return typeof v === 'string' && v.trim().length >= 1 && v.trim().length <= max;
}

function validVoice(v: unknown): v is string {
  return typeof v === 'string' && TTS_VOICES.some((x) => x.id === v);
}

function validPosition(v: unknown): v is string {
  return typeof v === 'string' && TEXT_POSITIONS.some((x) => x.id === v);
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function validateTtsParams(p: unknown): Validation<TtsParams> {
  const o = (p ?? {}) as Record<string, unknown>;
  if (!nonEmptyString(o.script, SCRIPT_MAX)) {
    return err('INVALID_SCRIPT', `script must be 1..${SCRIPT_MAX} characters`);
  }
  if (!validVoice(o.voice)) {
    return err('INVALID_VOICE', 'voice must be one of: warm, energetic, calm, bold');
  }
  const sourceKind = o.sourceKind;
  if (sourceKind !== 'upload' && sourceKind !== 'clip') {
    return err('INVALID_SOURCE', "sourceKind must be 'upload' or 'clip'");
  }
  let generationId: string | undefined;
  if (sourceKind === 'clip') {
    if (typeof o.generationId !== 'string' || !UUID_RE.test(o.generationId)) {
      return err('INVALID_CLIP', 'generationId must be a valid UUID of your clip');
    }
    generationId = o.generationId;
  }
  return {
    ok: true,
    value: {
      script: (o.script as string).trim(),
      voice: o.voice as string,
      sourceKind,
      ...(generationId ? { generationId } : {}),
    },
  };
}

export function validateCaptionParams(p: unknown): Validation<CaptionParams> {
  const o = (p ?? {}) as Record<string, unknown>;
  const mode = o.mode;
  if (mode !== 'auto' && mode !== 'script') {
    return err('INVALID_MODE', "mode must be 'auto' or 'script'");
  }
  if (mode === 'script') {
    if (!nonEmptyString(o.text, SCRIPT_MAX)) {
      return err(
        'INVALID_TEXT',
        `text must be 1..${SCRIPT_MAX} characters for script captions`
      );
    }
    return { ok: true, value: { mode, text: (o.text as string).trim() } };
  }
  return { ok: true, value: { mode } };
}

function isFiniteNumber(v: unknown): v is number {
  return typeof v === 'number' && Number.isFinite(v);
}

export function validateTrimParams(p: unknown): Validation<TrimParams> {
  const o = (p ?? {}) as Record<string, unknown>;
  if (!isFiniteNumber(o.start) || (o.start as number) < 0) {
    return err('INVALID_TRIM', 'start must be a non-negative number of seconds');
  }
  if (!isFiniteNumber(o.end) || (o.end as number) <= 0) {
    return err('INVALID_TRIM', 'end must be a positive number of seconds');
  }
  const start = o.start as number;
  const end = o.end as number;
  if (end <= start) {
    return err('INVALID_TRIM', 'end must be after start');
  }
  if (end - start > 600) {
    return err('INVALID_TRIM', 'trim length is capped at 10 minutes');
  }
  const out: TrimParams = { start, end };
  if (o.text !== undefined && o.text !== null && o.text !== '') {
    if (!nonEmptyString(o.text, 140)) {
      return err('INVALID_TEXT', 'text overlay must be 1..140 characters');
    }
    out.text = (o.text as string).trim();
    if (o.position !== undefined && !validPosition(o.position)) {
      return err('INVALID_POSITION', 'position must be top, center or bottom');
    }
    out.position = (o.position as string | undefined) ?? 'bottom';
  }
  return { ok: true, value: out };
}

export function validateToolParams(
  tool: VideoTool,
  p: unknown
): Validation<TtsParams | CaptionParams | TrimParams> {
  switch (tool) {
    case 'tts':
      return validateTtsParams(p);
    case 'caption':
      return validateCaptionParams(p);
    case 'trim':
      return validateTrimParams(p);
  }
}

/** Server-side uploaded file check: mp4 magic + 50MB cap. */
export function validateInputFile(input: {
  mime?: string | null;
  bytes: number;
}): ValidationErr | null {
  if (input.bytes > MAX_INPUT_BYTES) {
    return err('FILE_TOO_LARGE', 'Video must be 50MB or smaller');
  }
  if (input.bytes <= 0) {
    return err('FILE_EMPTY', 'Video file is empty');
  }
  if (input.mime && !(INPUT_MIMES as readonly string[]).includes(input.mime)) {
    return err('INVALID_FILE_TYPE', 'Video must be an .mp4 file');
  }
  return null;
}

/** Strict base64 decode: rejects strings that don't round-trip. */
export function decodeB64Strict(label: string, value: unknown): Buffer {
  if (typeof value !== 'string' || value.length === 0) {
    throw new Error(`${label}: missing`);
  }
  const compact = value.replace(/\s+/g, '');
  let buf: Buffer;
  try {
    buf = Buffer.from(compact, 'base64');
  } catch {
    throw new Error(`${label}: invalid base64`);
  }
  if (buf.toString('base64') !== compact) {
    throw new Error(`${label}: invalid base64`);
  }
  return buf;
}
