/**
 * Etch — cinema-grade prompt bank: the prompt builder.
 *
 * `enhancePrompt(raw, opts)` assembles the final generation prompt:
 *
 *   <user's words VERBATIM>, <cinema style>, <lighting>, <optics>,
 *   <composition>, <quality>
 *
 * HARD RULES (additive only):
 *  1. The user's words are preserved verbatim and ALWAYS lead the prompt.
 *  2. Bank fragments are only ever APPENDED, never interleaved or rewritten.
 *  3. A fragment is skipped when the user already wrote it or an alias —
 *     no duplication ("golden hour" in the prompt means no second one).
 *  4. Fragments that would contradict the prompt are skipped:
 *     photographic boosters and media negatives are withheld from
 *     illustrative styles (anime etc.).
 *  5. maxLength trims bank fragments from the tail only; the user's words
 *     are never truncated.
 *
 * Deterministic: same input → same output. No randomness, no network.
 */
import {
  CINEMA_STYLES,
  DEFAULT_CINEMA_FRAGMENTS,
} from './cinema-styles';
import type { CinemaStyle } from './types';
import {
  DEFAULT_LIGHTING_FRAGMENT,
  LIGHTING_TERMS,
} from './lighting';
import { OPTICS_TERMS } from './lenses';
import {
  COMPOSITION_TERMS,
  DEFAULT_COMPOSITION_FRAGMENT,
} from './composition';
import {
  CORE_QUALITY_TERMS,
  QUALITY_SUFFIXES,
} from './quality-suffixes';
import {
  DEFAULT_NEGATIVE_PROMPT,
  DEFAULT_NEGATIVE_PROMPT_ILLUSTRATIVE,
} from './negative-prompts';
import type {
  BankTerm,
  EnhanceOptions,
  EnhanceResult,
} from './types';

/* ------------------------------------------------------------------ */
/* helpers                                                             */
/* ------------------------------------------------------------------ */

function norm(s: string): string {
  return s.toLowerCase().replace(/\s+/g, ' ').trim();
}

/** True when any alias appears in the (normalized) haystack. */
function mentions(haystack: string, aliases: string[]): boolean {
  const n = norm(haystack);
  return aliases.some((a) => n.includes(norm(a)));
}

/** Score a term by how many of its tags the prompt mentions. */
function score(prompt: string, tags: string[]): number {
  let s = 0;
  for (const t of tags) if (mentions(prompt, [t])) s += 1;
  return s;
}

/** Pick the single best-scoring term with score > 0, or null. */
function bestMatch(
  prompt: string,
  terms: BankTerm[]
): BankTerm | null {
  let best: BankTerm | null = null;
  let bestScore = 0;
  for (const term of terms) {
    const s = score(prompt, term.tags);
    if (s > bestScore) {
      bestScore = s;
      best = term;
    }
  }
  return best;
}

/** Pick the best-scoring cinema style, or null when nothing matches. */
function bestStyle(prompt: string): CinemaStyle | null {
  let best: CinemaStyle | null = null;
  let bestScore = 0;
  for (const style of CINEMA_STYLES) {
    const s = score(prompt, style.tags);
    if (s > bestScore) {
      bestScore = s;
      best = style;
    }
  }
  return best;
}

/* ------------------------------------------------------------------ */
/* main entry                                                          */
/* ------------------------------------------------------------------ */

export function enhancePrompt(
  raw: string,
  opts: EnhanceOptions = {}
): EnhanceResult {
  const user = typeof raw === 'string' ? raw.trim() : '';
  const maxLength =
    typeof opts.maxLength === 'number' && opts.maxLength > 0
      ? Math.floor(opts.maxLength)
      : 2000;

  const applied: EnhanceResult['applied'] = {
    styles: [],
    lighting: [],
    lens: [],
    composition: [],
    quality: [],
  };
  const picked: string[] = [];

  /** Append a fragment when it adds something new. */
  const add = (
    bucket: keyof EnhanceResult['applied'],
    fragment: string,
    aliases: string[] = [fragment]
  ): void => {
    const seen =
      user +
      ' ' +
      (typeof opts.context === 'string' ? opts.context : '') +
      ' ' +
      picked.join(' ');
    if (mentions(seen, aliases)) return; // user wrote it or already added
    picked.push(fragment);
    applied[bucket].push(fragment);
  };

  /* 1 — cinema style: best tag match, else the neutral default foundation. */
  const style = bestStyle(user);
  const illustrative = style?.illustrative === true;
  if (style) {
    for (const f of style.fragments) add('styles', f);
  } else {
    for (const f of DEFAULT_CINEMA_FRAGMENTS) add('styles', f);
  }

  /* 2 — lighting: best tag match, else the mild default. */
  const lighting = bestMatch(user, LIGHTING_TERMS);
  if (lighting) {
    add('lighting', lighting.fragment, lighting.aliases);
  } else {
    add('lighting', DEFAULT_LIGHTING_FRAGMENT);
  }

  /* 3 — optics (lens / film stock / camera): best tag match only.
   * No default — forcing a lens on every prompt would contradict too often. */
  const optics = bestMatch(user, OPTICS_TERMS);
  if (optics) {
    add('lens', optics.fragment, optics.aliases);
  }

  /* 4 — composition: best tag match, else the mild default. */
  const composition = bestMatch(user, COMPOSITION_TERMS);
  if (composition) {
    add('composition', composition.fragment, composition.aliases);
  } else {
    add('composition', DEFAULT_COMPOSITION_FRAGMENT);
  }

  /* 5 — quality: core tail always, plus any mentioned-tag quality terms.
   * Photographic boosters are withheld for illustrative styles. */
  for (const q of CORE_QUALITY_TERMS) add('quality', q.fragment, q.aliases);
  if (!illustrative) {
    for (const q of QUALITY_SUFFIXES) {
      if (score(user, q.tags) > 0) add('quality', q.fragment, q.aliases);
    }
  }

  /* Assemble: user words lead; fragments append. Trim the bank tail to
   * fit maxLength — the user's words are never truncated. */
  let tail = picked.join(', ');
  let enhanced = user ? `${user}, ${tail}` : tail;
  while (enhanced.length > maxLength && picked.length > 0) {
    picked.pop();
    tail = picked.join(', ');
    enhanced = user ? `${user}, ${tail}` : tail;
  }

  const negativePrompt =
    typeof opts.negativePrompt === 'string' && opts.negativePrompt.trim()
      ? opts.negativePrompt
      : illustrative
        ? DEFAULT_NEGATIVE_PROMPT_ILLUSTRATIVE
        : DEFAULT_NEGATIVE_PROMPT;

  return { enhanced, negativePrompt, applied };
}
