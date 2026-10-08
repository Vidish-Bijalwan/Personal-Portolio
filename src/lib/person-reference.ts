/**
 * Person-reference detection for generation prompts.
 *
 * If a prompt asks for a specific person ("person in the reference",
 * "my photo", …) but no reference photo is attached, the generation
 * would queue, the user would wait, and then fail with missing_reference.
 * needsReferencePhoto() lets both the API routes and the composer catch
 * this BEFORE anything is queued.
 *
 * Conservative by design: only multi-word phrases that clearly imply an
 * external reference photo, matched on word boundaries. Single words like
 * "personal" or "face" alone must NOT match — and neither must longer
 * words that merely contain a phrase ("photographic" ≠ "my photo").
 */

const REFERENCE_PHRASES = [
  "person in the reference",
  "people in the reference",
  "reference photo",
  "reference image",
  "reference picture",
  "my photo",
  "my picture",
  "this person",
  "that person",
  "same person",
  "face of",
  "same face",
  "keep the face",
  "preserve the face",
  "keep her face",
  "keep his face",
  "person from the photo",
  "person in the photo",
  "man in the photo",
  "woman in the photo",
  "uploaded photo",
  "uploaded image",
  "attached photo",
  "attached image",
];

const REFERENCE_RES = REFERENCE_PHRASES.map(
  (phrase) =>
    new RegExp(`\\b${phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i"),
);

/** True when the prompt asks for a specific person via a reference photo. */
export function needsReferencePhoto(prompt: string | null | undefined): boolean {
  const p = (prompt ?? "").trim();
  if (!p) return false;
  return REFERENCE_RES.some((re) => re.test(p));
}

/**
 * Reference-field UI state, driven by the same detection as the server
 * guard so the label and the validation can never disagree.
 *
 * - Prompt asks for a person + no file attached → field is REQUIRED, with
 *   a warning explaining why.
 * - Prompt asks for a person + file attached → requirement satisfied.
 * - Prompt doesn't ask for a person → field stays optional.
 */
export interface ReferenceFieldState {
  required: boolean;
  labelSuffix: string;
  warning: string | null;
}

export function referenceFieldState(
  prompt: string | null | undefined,
  hasFile: boolean
): ReferenceFieldState {
  const needsPhoto = needsReferencePhoto(prompt);
  const required = needsPhoto && !hasFile;
  return {
    required,
    labelSuffix: required ? "(required)" : "(optional)",
    warning: required
      ? "Your prompt asks for a specific person — attach their photo to generate."
      : null,
  };
}

/** The explicit pre-submit block message (never contradicts the label). */
export const MISSING_REFERENCE_MESSAGE =
  "This prompt asks for a specific person — you have to attach their photo to generate.";
