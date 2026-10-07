/**
 * Etch Ad Studio — accordion state helpers (pure, no JSX).
 *
 * Kept in a .ts module so the toggle rule is unit-testable under the repo's
 * vitest config (which cannot transform .tsx — tsconfig sets jsx:preserve).
 */

export const ACCORDION_SECTION_IDS = [
  "concept",
  "palette",
  "typography",
  "layout",
] as const;

export type AccordionSectionId = (typeof ACCORDION_SECTION_IDS)[number];

/**
 * Pure toggle rule: exactly one section open at a time.
 * Clicking a closed section opens it (closing whichever was open);
 * clicking the open section collapses everything.
 */
export function nextAccordionOpen(
  current: string | null,
  clicked: string
): string | null {
  return current === clicked ? null : clicked;
}
