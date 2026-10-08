/**
 * Etch fast-gen — speculative pre-generation primitives.
 *
 * Shared by the browser (composer) and the server (API routes): both sides
 * MUST compute the identical spec hash, so this module is pure, sync, and
 * dependency-free (no node:crypto, no WebCrypto) — it runs unchanged in
 * the browser bundle and in serverless functions.
 *
 * The hash is a cache key, not a security boundary: cyrb53 is a fast
 * non-cryptographic 64-bit hash. Collision risk across distinct prompts is
 * negligible for this use, and a collision only ever causes a wrong-image
 * *preview* on a free row the user can discard — it can never charge
 * anyone (speculative rows carry tier='speculative' and are un-unlockable).
 */

/** Non-charging speculative rows live this long before the claim endpoint reaps them. */
export const SPEC_TTL_MS = 10 * 60 * 1000;

/** Client-side idle debounce before a speculative request fires. */
export const SPEC_DEBOUNCE_MS = 3000;

/** Minimum prompt length worth speculating on (matches the composer's promptOk). */
export const SPEC_MIN_PROMPT_CHARS = 3;

export interface SpecInput {
  prompt: string;
  quality: string;
  aspectRatio: string;
  mediaType: string;
}

/** Canonical form of a prompt for hashing: trimmed, inner whitespace
 *  collapsed, lowercased. Case/whitespace edits alone must not defeat a
 *  speculative hit. */
export function normalizeSpecPrompt(prompt: string): string {
  return prompt.trim().replace(/\s+/g, ' ').toLowerCase();
}

/** Canonical serialization of everything that defines a speculative render. */
export function specKey(input: SpecInput): string {
  return [
    normalizeSpecPrompt(input.prompt),
    input.quality.trim().toLowerCase(),
    input.aspectRatio.trim(),
    input.mediaType.trim().toLowerCase(),
  ].join('|');
}

/** cyrb53 (public-domain 64-bit string hash) → 16 lowercase hex chars. */
export function hash64(str: string): string {
  let h1 = 0xdeadbeef;
  let h2 = 0x41c6ce57;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
  h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507);
  h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (h2 >>> 0).toString(16).padStart(8, '0') + (h1 >>> 0).toString(16).padStart(8, '0');
}

/** Deterministic spec hash both client and server compute identically. */
export function speculativeHash(input: SpecInput): string {
  return hash64(specKey(input));
}

/** True when both sides agree the hash matches the given inputs. */
export function specHashMatches(hash: string, input: SpecInput): boolean {
  return typeof hash === 'string' && hash.length > 0 && speculativeHash(input) === hash;
}

/** True when a speculative row's TTL has passed (stale → reap / no match). */
export function specIsExpired(specExpiresAt: Date | string | null | undefined, now: Date = new Date()): boolean {
  if (!specExpiresAt) return true;
  const t = specExpiresAt instanceof Date ? specExpiresAt.getTime() : new Date(specExpiresAt).getTime();
  return Number.isNaN(t) || t <= now.getTime();
}
