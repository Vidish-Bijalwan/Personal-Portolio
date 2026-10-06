/**
 * Tiny authoring helpers for blog posts — keeps post files readable.
 * p("text") → paragraph block; link("text", href) → linked segment.
 */
import type { BlogBlock, RichText } from "../types";

export const t = (text: string) => ({ t: text });
export const link = (text: string, href: string) => ({ t: text, href });

export const p = (...segments: RichText): BlogBlock => ({
  kind: "p",
  text: segments.flat(),
});
export const h2 = (text: string): BlogBlock => ({ kind: "h2", text });
export const list = (...items: RichText[]): BlogBlock => ({
  kind: "list",
  items,
});
export const table = (
  head: string[],
  rows: string[][]
): BlogBlock => ({ kind: "table", head, rows });
export const callout = (
  tone: "tip" | "note" | "warn",
  ...segments: RichText
): BlogBlock => ({ kind: "callout", tone, text: segments.flat() });
export const cta = (
  title: string,
  body: string,
  label: string,
  href: string
): BlogBlock => ({ kind: "cta", title, body, label, href });
