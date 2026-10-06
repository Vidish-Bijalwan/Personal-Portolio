/**
 * Pixaura — Video Studio params validation.
 *
 * Pure logic: no JSX, no I/O. Validates the tool-specific `params`
 * jsonb payloads for video_jobs. Unit-testable in isolation.
 */
import {
  ADD_AUDIO_MODES,
  AUDIO_MIMES,
  COMPRESS_QUALITIES,
  DENOISE_STRENGTHS,
  GIF_FPS,
  GIF_MAX_SECONDS,
  GIF_WIDTHS,
  INPUT_MIMES,
  MAX_AUDIO_BYTES,
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

/** compress params: { quality: 'small' | 'balanced' | 'best' } */
export interface CompressParams {
  quality: string;
}

/** convert params: {} (MP4 → MP3 128k; no knobs needed) */
export interface ConvertParams {
  [key: string]: unknown;
}

/** gif params: { start, end, fps: 10|12|15, width: 320|480 } */
export interface GifParams {
  start: number;
  end: number;
  fps: number;
  width: number;
}

/** add-audio params: { mode: 'mix' | 'replace' } (audio track = input2) */
export interface AddAudioParams {
  mode: string;
}

/** denoise params: { strength: 'light' | 'medium' | 'strong' } */
export interface DenoiseParams {
  strength: string;
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
): Validation<
  | TtsParams
  | CaptionParams
  | TrimParams
  | CompressParams
  | ConvertParams
  | GifParams
  | AddAudioParams
  | DenoiseParams
> {
  switch (tool) {
    case 'tts':
      return validateTtsParams(p);
    case 'caption':
      return validateCaptionParams(p);
    case 'trim':
      return validateTrimParams(p);
    case 'compress':
      return validateCompressParams(p);
    case 'convert':
      return validateConvertParams(p);
    case 'gif':
      return validateGifParams(p);
    case 'add-audio':
      return validateAddAudioParams(p);
    case 'denoise':
      return validateDenoiseParams(p);
  }
}

function optionId(v: unknown, options: readonly { id: string }[]): v is string {
  return typeof v === 'string' && options.some((x) => x.id === v);
}

export function validateCompressParams(p: unknown): Validation<CompressParams> {
  const o = (p ?? {}) as Record<string, unknown>;
  if (!optionId(o.quality, COMPRESS_QUALITIES)) {
    return err('INVALID_QUALITY', 'quality must be small, balanced or best');
  }
  return { ok: true, value: { quality: o.quality as string } };
}

export function validateConvertParams(p: unknown): Validation<ConvertParams> {
  if (p !== undefined && p !== null && typeof p !== 'object') {
    return err('INVALID_PARAMS', 'params must be an object');
  }
  return { ok: true, value: (p ?? {}) as ConvertParams };
}

function positiveInt(v: unknown): v is number {
  return typeof v === 'number' && Number.isInteger(v) && v > 0;
}

export function validateGifParams(p: unknown): Validation<GifParams> {
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
  if (end - start > GIF_MAX_SECONDS) {
    return err(
      'INVALID_TRIM',
      `GIF length is capped at ${GIF_MAX_SECONDS} seconds`
    );
  }
  if (!positiveInt(o.fps) || !GIF_FPS.some((x) => x.id === String(o.fps))) {
    return err('INVALID_FPS', 'fps must be 10, 12 or 15');
  }
  if (!positiveInt(o.width) || !GIF_WIDTHS.some((x) => x.id === String(o.width))) {
    return err('INVALID_WIDTH', 'width must be 320 or 480');
  }
  return {
    ok: true,
    value: { start, end, fps: o.fps as number, width: o.width as number },
  };
}

export function validateAddAudioParams(p: unknown): Validation<AddAudioParams> {
  const o = (p ?? {}) as Record<string, unknown>;
  if (!optionId(o.mode, ADD_AUDIO_MODES)) {
    return err('INVALID_MODE', 'mode must be mix or replace');
  }
  return { ok: true, value: { mode: o.mode as string } };
}

export function validateDenoiseParams(p: unknown): Validation<DenoiseParams> {
  const o = (p ?? {}) as Record<string, unknown>;
  if (!optionId(o.strength, DENOISE_STRENGTHS)) {
    return err('INVALID_STRENGTH', 'strength must be light, medium or strong');
  }
  return { ok: true, value: { strength: o.strength as string } };
}

/* ---------------- media magic ---------------- */

/** Detect audio bytes: mp3 (ID3 or frame sync), wav (RIFF/WAVE), m4a (ftyp). */
export function audioMimeForMagic(
  bytes: Uint8Array
): 'audio/mpeg' | 'audio/wav' | 'audio/mp4' | null {
  if (bytes.length >= 3) {
    // ID3v2 tag
    if (bytes[0] === 0x49 && bytes[1] === 0x44 && bytes[2] === 0x33) {
      return 'audio/mpeg';
    }
    // MP3 frame sync: 0xFF Ex (11 set bits + layer bits)
    if (
      bytes[0] === 0xff &&
      (bytes[1] & 0xe0) === 0xe0 &&
      (bytes[1] & 0x18) !== 0x08
    ) {
      return 'audio/mpeg';
    }
  }
  if (
    bytes.length >= 12 &&
    bytes[0] === 0x52 && // R
    bytes[1] === 0x49 && // I
    bytes[2] === 0x46 && // F
    bytes[3] === 0x46 && // F
    bytes[8] === 0x57 && // W
    bytes[9] === 0x41 && // A
    bytes[10] === 0x56 && // V
    bytes[11] === 0x45 // E
  ) {
    return 'audio/wav';
  }
  if (
    bytes.length >= 12 &&
    bytes[4] === 0x66 && // f
    bytes[5] === 0x74 && // t
    bytes[6] === 0x79 && // y
    bytes[7] === 0x70 // p
  ) {
    const brand = String.fromCharCode(bytes[8], bytes[9], bytes[10], bytes[11]);
    if (brand === 'M4A ' || brand === 'M4B ' || brand === 'mp42') {
      return 'audio/mp4';
    }
  }
  return null;
}

/** Detect GIF bytes (GIF87a / GIF89a). */
export function gifMimeForMagic(bytes: Uint8Array): 'image/gif' | null {
  if (
    bytes.length >= 6 &&
    bytes[0] === 0x47 && // G
    bytes[1] === 0x49 && // I
    bytes[2] === 0x46 && // F
    bytes[3] === 0x38 && // 8
    (bytes[4] === 0x37 || bytes[4] === 0x39) && // 7 | 9
    bytes[5] === 0x61 // a
  ) {
    return 'image/gif';
  }
  return null;
}

/** Server-side audio file check: mp3/wav/m4a magic + 20MB cap. */
export function validateAudioFile(input: {
  mime?: string | null;
  bytes: number;
}): ValidationErr | null {
  if (input.bytes > MAX_AUDIO_BYTES) {
    return err('FILE_TOO_LARGE', 'Audio must be 20MB or smaller');
  }
  if (input.bytes <= 0) {
    return err('FILE_EMPTY', 'Audio file is empty');
  }
  if (input.mime && !(AUDIO_MIMES as readonly string[]).includes(input.mime)) {
    return err('INVALID_FILE_TYPE', 'Audio must be .mp3, .wav or .m4a');
  }
  return null;
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
