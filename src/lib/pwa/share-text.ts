/**
 * PWA share-target text helpers — DOM-free AND node-free, so both the
 * server route and the client intake component can import them.
 */

/**
 * Instruction prefill for the intake: title, then text, then the shared
 * URL on its own line. Empty parts are dropped — never produces a blank
 * or "undefined" line.
 */
export function composeSharedInstruction(parts: {
  title: string;
  text: string;
  url: string;
}): string {
  return [parts.title.trim(), parts.text.trim(), parts.url.trim()]
    .filter((p) => p.length > 0)
    .join('\n');
}
