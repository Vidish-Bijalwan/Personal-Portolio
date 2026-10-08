/**
 * Etch — cinema-grade prompt bank: shared types.
 *
 * The bank is a typed collection of short, licensable prompt fragments
 * (lighting, lens, film-stock, composition, quality vocabulary) gathered
 * from public prompt references and cinematography sources. Each fragment
 * is a plain string the builder appends ADDITIVELY to the user's own words
 * — the user's prompt is never rewritten or contradicted.
 *
 * Sources (see PROMPT_BANK_SOURCES.md in the workdir):
 *  - belentani7/cinematic-prompt-formatter (MIT)
 *  - thesephist gist "Collection of useful Stable Diffusion prompt modifiers"
 *  - willwulfken/MidJourney-Styles-and-Keywords-Reference (Lighting.md, Camera.md)
 *  - realaman90/ai-film-skills (nano-banana.md)
 *  - yuri-schmaltz/my-directors-console (AI_MODEL_PROMPTING.md)
 *  - avaray/dav.one (mastering-realistic-photography-using-stable-diffusion-xl)
 */

/**
 * One prompt-bank term.
 * - `fragment`: the exact text appended to the prompt when selected.
 * - `aliases`: alternate wordings the builder treats as "already present"
 *   so it never duplicates a term the user already wrote (e.g. user writes
 *   "rim light" and the bank's fragment is "rim lighting").
 * - `tags`: lowercase keywords used to score the term against the user's
 *   prompt. A term is selected when its tags overlap the prompt text.
 */
export interface BankTerm {
  id: string;
  fragment: string;
  aliases: string[];
  tags: string[];
}

/** A cinema style preset: one or more fragments applied together. */
export interface CinemaStyle {
  id: string;
  label: string;
  description: string;
  /** Fragments appended in order when this style is selected. */
  fragments: string[];
  /** Lowercase keywords scored against the user's prompt. */
  tags: string[];
  /** When true, the style is illustrative — photographic quality terms
   *  and photographic negatives are withheld to avoid contradiction. */
  illustrative?: boolean;
}

export type MediaKind = 'image' | 'video';

export interface EnhanceOptions {
  /** 'image' | 'video' — currently affects nothing structural, kept so
   *  future video-specific terms (camera movement) can branch cleanly. */
  media?: MediaKind;
  /** Hard cap on the returned prompt length. The user's words are NEVER
   *  truncated — only bank fragments are dropped to fit. */
  maxLength?: number;
  /**
   * Extra text the caller prepends outside this builder (e.g. a detected
   * style prefix). It is NOT part of the output, but it counts as
   * "already present" for deduplication so fragments don't echo it.
   */
  context?: string;
  /** Override the default negative prompt. */
  negativePrompt?: string;
}

export interface EnhanceResult {
  /** User's words verbatim first, bank fragments appended after. */
  enhanced: string;
  negativePrompt: string;
  /** Fragments the builder actually appended (for tests / debugging). */
  applied: {
    styles: string[];
    lighting: string[];
    lens: string[];
    composition: string[];
    quality: string[];
  };
}
