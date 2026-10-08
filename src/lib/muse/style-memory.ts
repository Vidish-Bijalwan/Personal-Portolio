/**
 * Madam Muse — approved-style memory (Phase 2).
 *
 * Persists small, structured style fingerprints of results the user
 * APPROVES, so the prompt compiler can bias its DEFAULTS toward the
 * user's taste. The canonical playbooks (many_images.md / many.md) always
 * win: memory only fills gaps — it never overrides an explicit instruction
 * and never replaces a playbook recipe, it only selects WHICH family
 * default and WHICH palette defaults the compiler starts from.
 *
 * A fingerprint is deliberately small and structured — no blobs of
 * everything: visual family, palette descriptors, texture, typography
 * hints. Capped at the last 20 per user.
 */
import { and, desc, eq, inArray } from 'drizzle-orm';
import type { VilishDb } from '@/lib/db/client';
import { museStyleMemory } from '@/lib/db/schema';
import { VISUAL_FAMILIES } from './intent-compiler';
import { familyRecipeFor } from './prompt-compiler';
import type { Project } from './projects';

/* ---------------- type ---------------- */

export interface StyleFingerprint {
  /** One of the 15 playbook families. */
  visualFamily: string;
  /** 1–5 color descriptors (hex codes or plain words like "warm off-white"). */
  palette: string[];
  /** Texture/material hint, e.g. "matte paper grain". */
  texture: string;
  /** Typography hint, e.g. "bold grotesk headline". */
  typography: string;
  /** What the accent color is for, when known. */
  accentRole?: string;
  /** Where this fingerprint came from: "project:<id>" | "manual". */
  source?: string;
}

/** A stored row: fingerprint + metadata. */
export interface StoredStyle {
  id: string;
  fingerprint: StyleFingerprint;
  createdAt: string;
}

/** Modest cap: only the most recent N fingerprints per user are kept. */
export const STYLE_MEMORY_CAP = 20;

const STR_MAX = 500;

/* ---------------- validation ---------------- */

function isShortString(v: unknown): v is string {
  return (
    typeof v === 'string' && v.trim().length > 0 && v.length <= STR_MAX
  );
}

export function isValidStyleFingerprint(v: unknown): v is StyleFingerprint {
  if (!v || typeof v !== 'object') return false;
  const f = v as Record<string, unknown>;
  if (
    typeof f.visualFamily !== 'string' ||
    !(VISUAL_FAMILIES as readonly string[]).includes(f.visualFamily)
  )
    return false;
  if (
    !Array.isArray(f.palette) ||
    f.palette.length === 0 ||
    f.palette.length > 5 ||
    !f.palette.every(isShortString)
  )
    return false;
  if (!isShortString(f.texture)) return false;
  if (!isShortString(f.typography)) return false;
  if (f.accentRole !== undefined && !isShortString(f.accentRole)) return false;
  if (f.source !== undefined && !isShortString(f.source)) return false;
  return true;
}

/* ---------------- persistence (all user-scoped) ---------------- */

function serialize(row: typeof museStyleMemory.$inferSelect): StoredStyle {
  return {
    id: row.id,
    fingerprint: row.fingerprint as StyleFingerprint,
    createdAt: row.createdAt ? row.createdAt.toISOString() : new Date(0).toISOString(),
  };
}

/**
 * Record an approved style. Invalid fingerprints are rejected (returns
 * null); valid ones are inserted and older entries beyond the cap are
 * trimmed so the table stays modest.
 */
export async function recordStyleApproval(
  database: VilishDb,
  userId: string,
  fingerprint: unknown
): Promise<StoredStyle | null> {
  if (!isValidStyleFingerprint(fingerprint)) return null;
  const [row] = await database
    .insert(museStyleMemory)
    .values({
      userId,
      fingerprint: fingerprint as unknown as Record<string, unknown>,
    })
    .returning();

  // Trim to the cap: keep the newest STYLE_MEMORY_CAP rows.
  const rows = await database
    .select({ id: museStyleMemory.id })
    .from(museStyleMemory)
    .where(eq(museStyleMemory.userId, userId))
    .orderBy(desc(museStyleMemory.createdAt));
  const stale = rows.slice(STYLE_MEMORY_CAP).map((r) => r.id);
  if (stale.length > 0) {
    await database
      .delete(museStyleMemory)
      .where(
        and(eq(museStyleMemory.userId, userId), inArray(museStyleMemory.id, stale))
      );
  }
  return serialize(row);
}

/** Newest first. */
export async function listStyleMemory(
  database: VilishDb,
  userId: string
): Promise<StoredStyle[]> {
  const rows = await database
    .select()
    .from(museStyleMemory)
    .where(eq(museStyleMemory.userId, userId))
    .orderBy(desc(museStyleMemory.createdAt));
  return rows.map(serialize);
}

/** Remove one fingerprint; returns true when something was deleted. */
export async function removeStyleMemory(
  database: VilishDb,
  userId: string,
  id: string
): Promise<boolean> {
  const deleted = await database
    .delete(museStyleMemory)
    .where(and(eq(museStyleMemory.id, id), eq(museStyleMemory.userId, userId)))
    .returning({ id: museStyleMemory.id });
  return deleted.length > 0;
}

/** Clear the whole memory; returns the number of rows removed. */
export async function clearStyleMemory(
  database: VilishDb,
  userId: string
): Promise<number> {
  const deleted = await database
    .delete(museStyleMemory)
    .where(eq(museStyleMemory.userId, userId))
    .returning({ id: museStyleMemory.id });
  return deleted.length;
}

/* ---------------- derive from an approved project ---------------- */

/**
 * Build a fingerprint from a project's brief — the "approve this result"
 * path. Palette: the palette-role ref's hexes win (they were the user's
 * explicit choice); otherwise the playbook family recipe's palette.
 * Texture/typography always come from the playbook recipe — memory
 * describes the user's taste, the playbook stays canonical.
 */
export function deriveFingerprintFromProject(
  project: Project
): StyleFingerprint | null {
  const family = project.brief.visualFamily;
  if (
    typeof family !== 'string' ||
    !(VISUAL_FAMILIES as readonly string[]).includes(family)
  ) {
    return null;
  }
  const recipe = familyRecipeFor(family);
  const paletteRef = project.brief.references.find(
    (r) => r.role === 'palette' && r.palette && r.palette.length > 0
  );
  return {
    visualFamily: family,
    palette: paletteRef
      ? paletteRef.palette!.slice(0, 5)
      : [...recipe.palette],
    texture: recipe.texture,
    typography: recipe.typography,
    accentRole: recipe.accentRole,
    source: `project:${project.id}`,
  };
}

/**
 * The top (most recent) valid family default from memory, or null.
 * The compiler uses this only when the brief carries no explicit family.
 */
export function topMemoryFamily(
  memory: StyleFingerprint[] | undefined
): string | null {
  if (!memory) return null;
  for (const f of memory) {
    if (
      f &&
      typeof f.visualFamily === 'string' &&
      (VISUAL_FAMILIES as readonly string[]).includes(f.visualFamily)
    ) {
      return f.visualFamily;
    }
  }
  return null;
}
