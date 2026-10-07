/**
 * Pure helpers for the /me profile + history APIs (app/api/me/*).
 *
 * Kept free of Next.js / DB imports so the validation and pricing rules
 * are unit-testable in isolation. Server-side prices always come from the
 * catalog / engine — never from the client.
 */
import { priceOf } from '@/lib/pricing/catalog';
import { videoClipPricePaise, VIDEO_DURATION_MIN_S } from '@/lib/pricing/engine';
import { UNLOCK_PRICE_PAISE } from '@/lib/free/policy';

/** Creations grid retention window ("stored up to a month or so"). */
export const RETENTION_DAYS = 30;

export function retentionCutoff(now: Date = new Date()): Date {
  return new Date(now.getTime() - RETENTION_DAYS * 24 * 60 * 60 * 1000);
}

/* ---------------- profile patch validation ---------------- */

export interface ProfilePatchInput {
  displayName?: unknown;
  avatarUrl?: unknown;
}

export type ProfilePatchResult =
  | { ok: true; displayName?: string; avatarUrl?: string | null }
  | { ok: false; error: string };

/** Max decoded avatar bytes accepted by PATCH /api/me/profile. */
export const MAX_AVATAR_BYTES = 200_000;

const AVATAR_DATA_URL_RE =
  /^data:image\/(jpeg|png|webp);base64,([A-Za-z0-9+/=]+)$/;
const HTTPS_URL_RE = /^https:\/\/[^\s]{1,500}$/;

function cleanDisplayName(v: string): string {
  // Strip control characters, trim, cap length. Never trust client text.
  return v.replace(/[\u0000-\u001f\u007f]/g, '').trim().slice(0, 40);
}

/**
 * Validate a PATCH /api/me/profile body. Only displayName and avatarUrl
 * are ever accepted — email, id, role can never be changed through this.
 */
export function validateProfilePatch(body: unknown): ProfilePatchResult {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { ok: false, error: 'Invalid request body' };
  }
  const b = body as Record<string, unknown>;
  const hasName = Object.prototype.hasOwnProperty.call(b, 'displayName');
  const hasAvatar = Object.prototype.hasOwnProperty.call(b, 'avatarUrl');
  if (!hasName && !hasAvatar) {
    return { ok: false, error: 'Nothing to update' };
  }
  const out: { displayName?: string; avatarUrl?: string | null } = {};

  if (hasName) {
    const v = b.displayName;
    if (typeof v !== 'string') {
      return { ok: false, error: 'Display name must be text' };
    }
    const name = cleanDisplayName(v);
    if (!name) {
      return { ok: false, error: 'Display name cannot be empty' };
    }
    out.displayName = name;
  }

  if (hasAvatar) {
    const v = b.avatarUrl;
    if (v === null || v === '') {
      out.avatarUrl = null; // clear avatar
    } else if (typeof v !== 'string') {
      return { ok: false, error: 'Avatar must be a URL or image upload' };
    } else if (v.length > 500_000) {
      return { ok: false, error: 'Avatar too large' };
    } else {
      const m = AVATAR_DATA_URL_RE.exec(v);
      if (m) {
        // base64 → approx decoded bytes (no need to decode to validate size)
        const approxBytes = Math.floor((m[2].length * 3) / 4);
        if (approxBytes > MAX_AVATAR_BYTES) {
          return {
            ok: false,
            error: 'Avatar image too large (max 200KB)',
          };
        }
        out.avatarUrl = v;
      } else if (HTTPS_URL_RE.test(v)) {
        out.avatarUrl = v;
      } else {
        return {
          ok: false,
          error: 'Avatar must be an https:// URL or an image upload',
        };
      }
    }
  }

  return { ok: true, ...out };
}

/* ---------------- unlock pricing (server-side, mirrors unlock routes) ---------------- */

export interface GenerationPriceInput {
  tier: string;
  mediaType: string;
  status: string;
  unlocked: boolean;
  durationSeconds: number | null;
  /** generationJobs.customerPrice via gen.jobId (paid images only) */
  jobCustomerPrice: number | null;
}

/**
 * Server-side unlock price for a generation, in paise — or null when the
 * row is not unlockable (not done, already unlocked, unknown kind).
 * Mirrors POST /api/generation/unlock (paid images) and
 * POST /api/gen/[id]/unlock (free images, paid videos) exactly.
 */
export function unlockPricePaiseForGeneration(
  g: GenerationPriceInput
): number | null {
  if (g.status !== 'done' || g.unlocked) return null;
  if (g.tier === 'paid' && g.mediaType === 'image') {
    if (
      typeof g.jobCustomerPrice === 'number' &&
      Number.isFinite(g.jobCustomerPrice) &&
      g.jobCustomerPrice > 0
    ) {
      return Math.round(g.jobCustomerPrice);
    }
    return priceOf('single-image');
  }
  if (g.tier === 'free' && g.mediaType === 'image') {
    return UNLOCK_PRICE_PAISE;
  }
  if (g.tier === 'paid' && g.mediaType === 'video') {
    const seconds = g.durationSeconds ?? VIDEO_DURATION_MIN_S;
    try {
      return videoClipPricePaise(seconds);
    } catch {
      return videoClipPricePaise(VIDEO_DURATION_MIN_S);
    }
  }
  return null;
}

export interface UnlockEndpoint {
  url: string;
  method: 'POST';
  /** JSON body to send (empty object for path-param routes). */
  body: Record<string, string>;
}

/**
 * Which unlock route mints the payment order for a generation — the same
 * routing the watch room uses. Null when not unlockable.
 */
export function unlockEndpointForGeneration(g: {
  id: string;
  tier: string;
  mediaType: string;
  status: string;
  unlocked: boolean;
}): UnlockEndpoint | null {
  if (g.status !== 'done' || g.unlocked) return null;
  if (g.tier === 'paid' && g.mediaType === 'image') {
    return {
      url: '/api/generation/unlock',
      method: 'POST',
      body: { generationId: g.id },
    };
  }
  if (
    (g.tier === 'free' && g.mediaType === 'image') ||
    (g.tier === 'paid' && g.mediaType === 'video')
  ) {
    return { url: `/api/gen/${g.id}/unlock`, method: 'POST', body: {} };
  }
  return null;
}

/* ---------------- purchase-history labels ---------------- */

/**
 * Human label for a purchase-history row from the generation_orders
 * purpose + linked generation media type.
 */
export function orderItemLabel(
  purpose: string | null,
  mediaType: string | null
): string {
  if (purpose === 'video') {
    return mediaType === 'video' ? 'Video unlock' : 'Video order';
  }
  if (purpose === 'unlock') {
    return 'Image unlock';
  }
  return 'Etch order';
}

const PROMPT_PREVIEW_CHARS = 120;

/** Truncate a prompt for card display (server-side, keeps payloads small). */
export function promptPreview(prompt: string): string {
  const clean = prompt.replace(/\s+/g, ' ').trim();
  if (clean.length <= PROMPT_PREVIEW_CHARS) return clean;
  return clean.slice(0, PROMPT_PREVIEW_CHARS - 1).trimEnd() + '…';
}
