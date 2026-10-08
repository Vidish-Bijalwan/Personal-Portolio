/**
 * Etch — cinema-grade prompt bank: negative prompts.
 *
 * Vocabulary drawn from (short fragments only, attributed; see
 * PROMPT_BANK_SOURCES.md):
 *  - yuri-schmaltz/my-directors-console (AI_MODEL_PROMPTING.md) — Negative
 *    Prompts section (SDXL list + cinematic-specific negatives)
 *  - avaray/dav.one (mastering-realistic-photography-using-stable-
 *    diffusion-xl) — Negative Prompt guidance
 *
 * Two lists:
 *  - NEGATIVE_QUALITY: always safe (defects, artifacts, anatomy).
 *  - NEGATIVE_MEDIA: medium words (cartoon, illustration, anime, painting,
 *    3d render) — applied ONLY when the prompt is not illustrative, so we
 *    never contradict a user's anime/illustration request.
 */
export const NEGATIVE_QUALITY: string[] = [
  'low quality',
  'lowres',
  'blurry',
  'out of focus',
  'bad anatomy',
  'deformed',
  'distorted',
  'disfigured',
  'extra limbs',
  'missing fingers',
  'mutated hands',
  'grainy',
  'noisy',
  'jpeg artifacts',
  'pixelated',
  'watermark',
  'signature',
  'text overlay',
  'oversaturated',
  'overexposed',
  'underexposed',
  'amateur',
];

export const NEGATIVE_MEDIA: string[] = [
  'cartoon',
  'illustration',
  'anime',
  'painting',
  'drawing',
  '3d render',
];

/** Joined default negative prompt for photographic/cinematic generations. */
export const DEFAULT_NEGATIVE_PROMPT: string = NEGATIVE_QUALITY.concat(
  NEGATIVE_MEDIA
).join(', ');

/** Joined default negative prompt for illustrative styles (no media words). */
export const DEFAULT_NEGATIVE_PROMPT_ILLUSTRATIVE: string =
  NEGATIVE_QUALITY.join(', ');

/** Source attribution line for PROMPT_BANK_SOURCES.md. */
export const NEGATIVE_SOURCES = [
  'yuri-schmaltz/my-directors-console (AI_MODEL_PROMPTING.md) — Negative Prompts',
  'avaray/dav.one — Negative Prompt guidance',
];
