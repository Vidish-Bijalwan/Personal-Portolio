/**
 * Madam Muse — conversational revision client helpers (backend workstream).
 *
 * Pure helpers the UI workstream calls around POST /api/create/revise
 * (contract §2; the route itself is the compiler workstream's):
 *
 *   const body = buildRevisionRequest(brief, instruction);
 *   const res = await fetch('/api/create/revise', {
 *     method: 'POST',
 *     headers: { 'content-type': 'application/json' },
 *     body: JSON.stringify(body),
 *   });
 *   const revised = applyRevisedBrief(brief, parseReviseResponse(await res.json()));
 *
 * TYPE NOTE: CreativeBrief is imported from `./projects` (contract §1
 * local copy) — reconcile with `src/lib/muse/brief.ts` at integration
 * (compiler workstream owns that file).
 */
import { isValidBrief, type CreativeBrief } from './projects';

export const REVISE_ENDPOINT = '/api/create/revise';

/** POST body for /api/create/revise (contract §2). */
export interface ReviseRequestBody {
  brief: CreativeBrief;
  instruction: string;
}

/**
 * Build the POST body for /api/create/revise. Throws on invalid input so
 * the caller fails fast instead of sending a doomed request.
 */
export function buildRevisionRequest(
  brief: CreativeBrief,
  instruction: string
): ReviseRequestBody {
  if (!isValidBrief(brief)) {
    throw new Error('buildRevisionRequest: brief is not a valid CreativeBrief');
  }
  const clean = (instruction ?? '').trim();
  if (!clean) {
    throw new Error('buildRevisionRequest: instruction must be a non-empty string');
  }
  if (clean.length > 2000) {
    throw new Error(
      'buildRevisionRequest: instruction must be at most 2000 characters'
    );
  }
  return { brief, instruction: clean };
}

/**
 * Parse + validate the /api/create/revise response body. Throws when the
 * shape is wrong so bad server output never silently becomes the brief.
 */
export function parseReviseResponse(body: unknown): CreativeBrief {
  if (!body || typeof body !== 'object') {
    throw new Error('parseReviseResponse: response is not an object');
  }
  const brief = (body as Record<string, unknown>).brief;
  if (!isValidBrief(brief)) {
    throw new Error(
      'parseReviseResponse: response.brief is not a valid CreativeBrief'
    );
  }
  return brief;
}

/**
 * Adopt the revised brief. The server is the authority on the revision
 * (contract: targeted patch, untouched fields echoed byte-identical), so
 * nothing is merged client-side — the revised brief replaces the current
 * one. Pure; kept as a named step so the UI call-site reads clearly.
 */
export function applyRevisedBrief(
  _current: CreativeBrief,
  revised: CreativeBrief
): CreativeBrief {
  if (!isValidBrief(revised)) {
    throw new Error('applyRevisedBrief: revised brief is not a valid CreativeBrief');
  }
  return revised;
}
