/**
 * Etch — edit-video flow logic (Video Studio, Oct 2026 rework).
 *
 * The primary "edit video" path is source-first:
 *   1. Add your video — upload an MP4, or pick one of your AI-generated clips.
 *   2. Choose your edit — the 8 tools are secondary choices on step 2,
 *      no longer the landing.
 *
 * Pure logic: no JSX, no I/O, no imports from server modules.
 * Unit-testable in isolation. The VideoStudioPanel component consumes
 * these helpers; nothing here may drift from the /api/video-jobs
 * backend contract (only the tts tool accepts a generated-clip source).
 */
import { VIDEO_TOOLS, type VideoTool } from './constants';

/** Step 1 of the edit-video flow: where the source video comes from. */
export type EditSourceKind = 'upload' | 'clip';

/**
 * Only the voice-over tool can run on an AI-generated clip — the
 * /api/video-jobs backend only accepts sourceKind:"clip" for tts.
 * Every other tool needs an uploaded MP4.
 */
export function toolSupportsClipSource(tool: VideoTool): boolean {
  return tool === 'tts';
}

/**
 * Tools selectable for a given source kind.
 * Upload → all 8 tools. Generated clip → voice-over only.
 */
export function toolsForSource(kind: EditSourceKind): readonly VideoTool[] {
  return kind === 'clip' ? (['tts'] as const) : VIDEO_TOOLS;
}

/**
 * Step-1 completeness gate: the Continue button is enabled only when the
 * chosen source actually has a video attached.
 */
export function sourceReady(
  kind: EditSourceKind,
  file: { size: number } | null,
  clipId: string,
): boolean {
  return kind === 'upload' ? file !== null : clipId.length > 0;
}

/** Default tool when the user picks a generated clip as the source. */
export const DEFAULT_TOOL_FOR_CLIP: VideoTool = 'tts';
