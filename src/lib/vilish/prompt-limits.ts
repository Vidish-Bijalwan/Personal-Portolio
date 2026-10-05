/**
 * Pixaura — prompt length policy.
 *
 * A single 2000-character ceiling protects provider token costs. Enforced
 * in two places:
 *   1. composer UI — live counter + submit blocked client-side, and
 *   2. server-side — /api/creative/interpret, /api/generation/quote and
 *      /api/generation/[id]/remake return 400 when the prompt is too long.
 */
export const PROMPT_MAX_LENGTH = 2000;
export const PROMPT_MIN_LENGTH = 3;

export interface PromptLengthCheck {
  ok: boolean;
  code?: 'PROMPT_TOO_LONG' | 'PROMPT_TOO_SHORT';
  message?: string;
}

/** Character count, UTF-16 code units — matches textarea maxlength semantics
 *  and the server-side checks, so the client and API agree exactly. */
export function countPromptChars(prompt: string): number {
  return prompt.length;
}

/** Human-readable char count for the live counter, e.g. "1,234 / 2,000". */
export function formatPromptCount(prompt: string): string {
  const n = countPromptChars(prompt);
  return `${n.toLocaleString('en-IN')} / ${PROMPT_MAX_LENGTH.toLocaleString('en-IN')}`;
}

/** Shared length check used by both the composer and the API routes. */
export function checkPromptLength(
  prompt: string,
  opts: { minLength?: number } = {},
): PromptLengthCheck {
  const minLength = opts.minLength ?? PROMPT_MIN_LENGTH;
  const len = countPromptChars(prompt.trim());
  if (len > PROMPT_MAX_LENGTH) {
    return {
      ok: false,
      code: 'PROMPT_TOO_LONG',
      message: `Prompts are limited to ${PROMPT_MAX_LENGTH.toLocaleString('en-IN')} characters — yours is ${len.toLocaleString('en-IN')}. Shorten it to get your price.`,
    };
  }
  if (len < minLength) {
    return {
      ok: false,
      code: 'PROMPT_TOO_SHORT',
      message: `Describe your idea in at least ${minLength} characters.`,
    };
  }
  return { ok: true };
}
