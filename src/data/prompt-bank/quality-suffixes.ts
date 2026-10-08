/**
 * Etch — cinema-grade prompt bank: quality suffixes.
 *
 * Vocabulary drawn from (short fragments only, attributed; see
 * PROMPT_BANK_SOURCES.md):
 *  - realaman90/ai-film-skills nano-banana.md — Quality Keywords
 *  - yuri-schmaltz/my-directors-console (AI_MODEL_PROMPTING.md) —
 *    Quality token table
 *  - avaray/dav.one (mastering-realistic-photography-using-stable-
 *    diffusion-xl) — Positive Prompt guidance
 *
 * Deliberately medium-agnostic ("ultra-detailed", "sharp focus") so the
 * suffixes never contradict an illustrative style like anime — the builder
 * skips purely photographic boosters for illustrative styles anyway.
 */
import type { BankTerm } from './types';

export const QUALITY_SUFFIXES: BankTerm[] = [
  {
    id: 'ultra-detailed',
    fragment: 'ultra-detailed',
    aliases: ['ultra-detailed', 'ultra detailed', 'incredible details'],
    tags: ['detailed', 'detail'],
  },
  {
    id: 'sharp-focus',
    fragment: 'sharp focus',
    aliases: ['sharp focus', 'tack sharp'],
    tags: ['sharp'],
  },
  {
    id: 'high-resolution',
    fragment: 'high resolution',
    aliases: ['high resolution', '8k', '8k uhd', '4k', 'high-res'],
    tags: ['8k', '4k', 'high resolution', 'high-res'],
  },
  {
    id: 'color-grading',
    fragment: 'professional color grading',
    aliases: ['professional color grading', 'color grading', 'color grade'],
    tags: ['color grading', 'color grade'],
  },
  {
    id: 'rich-tonality',
    fragment: 'rich tonality',
    aliases: ['rich tonality', 'rich tones'],
    tags: ['tonality', 'tonal range'],
  },
  {
    id: 'crisp-details',
    fragment: 'crisp fine details',
    aliases: ['crisp details', 'crisp fine details', 'fine details'],
    tags: ['crisp'],
  },
  {
    id: 'masterpiece',
    fragment: 'masterpiece',
    aliases: ['masterpiece', 'best quality'],
    tags: ['masterpiece'],
  },
  {
    id: 'award-winning',
    fragment: 'award-winning',
    aliases: ['award-winning', 'award winning'],
    tags: ['award-winning', 'award winning'],
  },
];

/** Always-on core quality tail (deduped against the user's own words). */
export const CORE_QUALITY_TERMS = QUALITY_SUFFIXES.filter((t) =>
  ['ultra-detailed', 'sharp-focus'].includes(t.id)
);

/** Source attribution line for PROMPT_BANK_SOURCES.md. */
export const QUALITY_SOURCES = [
  'realaman90/ai-film-skills nano-banana.md — Quality Keywords',
  'yuri-schmaltz/my-directors-console (AI_MODEL_PROMPTING.md) — Quality token table',
  'avaray/dav.one — Positive Prompt guidance',
];
