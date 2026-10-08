/**
 * MediaIndex — semantic media index abstraction for Madam Muse.
 *
 * Covers video transcription (speech → timestamped segments) and shot
 * detection (scene boundaries). The canonical video playbook
 * (~/workspace/user/files/many.md) requires ingest → semantic understanding
 * before story planning; this interface is the seam where that plugs in.
 *
 * HONEST STATUS (spiked 2026-10-08): there is no transcription or shot
 * detection pipeline reachable from the Next.js app today.
 * - The repo has zero transcription/shot-detection code.
 * - The only transcription in the whole system lives in the OFFLINE operator
 *   worker (~/workspace/vidish-free-watcher/vj_run.py → faster_whisper on CPU)
 *   and runs at fulfillment time for the paid Captions tool — it cannot be
 *   called synchronously from a Vercel serverless function (no model weights,
 *   CPU/timeout limits), and faster_whisper is not installed in the sandbox.
 * - No transcription API key exists in the app (no OpenAI/Deepgram/
 *   AssemblyAI dependency or env var).
 *
 * Wiring a real provider (e.g. a transcription API called server-side, or an
 * async operator lane the app can await) is new paid infra — a Vidish call.
 * Until then, `getMediaIndex()` returns the unavailable stub: callers must
 * surface the honest UI state ("not available yet") instead of faking results.
 */

export interface TranscriptSegment {
  /** seconds from video start */
  start: number;
  end: number;
  text: string;
}

export interface ShotBoundary {
  /** seconds from video start */
  start: number;
  end: number;
}

export type MediaIndexStatus = "available" | "unavailable";

export interface MediaIndex {
  status: MediaIndexStatus;
  /** Human-readable reason when status is "unavailable". Never shown raw secrets. */
  reason: string;
  transcribe(videoBytes: Uint8Array, mime: string): Promise<TranscriptSegment[]>;
  detectShots(videoBytes: Uint8Array, mime: string): Promise<ShotBoundary[]>;
}

export class MediaIndexUnavailableError extends Error {
  constructor(reason: string) {
    super(reason);
    this.name = "MediaIndexUnavailableError";
  }
}

const UNAVAILABLE_REASON =
  "Auto transcript and shot detection are not wired up yet — " +
  "they need a transcription service or the operator pipeline. " +
  "Describe key moments in your instruction instead.";

/**
 * The stub implementation. Throws MediaIndexUnavailableError from the
 * analysis methods; never returns fabricated segments or shots.
 */
export function getMediaIndex(): MediaIndex {
  return {
    status: "unavailable",
    reason: UNAVAILABLE_REASON,
    async transcribe() {
      throw new MediaIndexUnavailableError(UNAVAILABLE_REASON);
    },
    async detectShots() {
      throw new MediaIndexUnavailableError(UNAVAILABLE_REASON);
    },
  };
}

/** Swap point for a future real provider. Keeps one call site for callers. */
export function isMediaIndexAvailable(index: MediaIndex): boolean {
  return index.status === "available";
}
