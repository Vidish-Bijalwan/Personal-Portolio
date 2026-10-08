/**
 * Etch — cinema-grade prompt bank.
 *
 * Typed modules of short, licensable prompt fragments + a deterministic
 * additive builder. Every generation on /create and /ads gets a
 * cinema-grade foundation: the user's words lead verbatim, the bank adds
 * cinematic craft around them.
 *
 * See PROMPT_BANK_SOURCES.md in the workdir for source attribution.
 */
export type {
  BankTerm,
  CinemaStyle,
  EnhanceOptions,
  EnhanceResult,
  MediaKind,
} from './types';

import {
  CINEMA_STYLES,
  DEFAULT_CINEMA_FRAGMENTS,
  CINEMA_STYLES_SOURCES,
} from './cinema-styles';

import {
  LIGHTING_TERMS,
  DEFAULT_LIGHTING_FRAGMENT,
  LIGHTING_SOURCES,
} from './lighting';

import {
  LENS_TERMS,
  FILM_STOCK_TERMS,
  CAMERA_TERMS,
  OPTICS_TERMS,
  OPTICS_SOURCES,
} from './lenses';

import {
  COMPOSITION_TERMS,
  DEFAULT_COMPOSITION_FRAGMENT,
  COMPOSITION_SOURCES,
} from './composition';

import {
  QUALITY_SUFFIXES,
  CORE_QUALITY_TERMS,
  QUALITY_SOURCES,
} from './quality-suffixes';

import {
  NEGATIVE_QUALITY,
  NEGATIVE_MEDIA,
  DEFAULT_NEGATIVE_PROMPT,
  DEFAULT_NEGATIVE_PROMPT_ILLUSTRATIVE,
  NEGATIVE_SOURCES,
} from './negative-prompts';

export {
  CINEMA_STYLES,
  DEFAULT_CINEMA_FRAGMENTS,
  CINEMA_STYLES_SOURCES,
  LIGHTING_TERMS,
  DEFAULT_LIGHTING_FRAGMENT,
  LIGHTING_SOURCES,
  LENS_TERMS,
  FILM_STOCK_TERMS,
  CAMERA_TERMS,
  OPTICS_TERMS,
  OPTICS_SOURCES,
  COMPOSITION_TERMS,
  DEFAULT_COMPOSITION_FRAGMENT,
  COMPOSITION_SOURCES,
  QUALITY_SUFFIXES,
  CORE_QUALITY_TERMS,
  QUALITY_SOURCES,
  NEGATIVE_QUALITY,
  NEGATIVE_MEDIA,
  DEFAULT_NEGATIVE_PROMPT,
  DEFAULT_NEGATIVE_PROMPT_ILLUSTRATIVE,
  NEGATIVE_SOURCES,
};

export { enhancePrompt } from './builder';

/** Flat list of every source-attribution line across bank modules. */
export const PROMPT_BANK_SOURCE_LINES: string[] = [
  ...CINEMA_STYLES_SOURCES,
  ...LIGHTING_SOURCES,
  ...OPTICS_SOURCES,
  ...COMPOSITION_SOURCES,
  ...QUALITY_SOURCES,
  ...NEGATIVE_SOURCES,
];
