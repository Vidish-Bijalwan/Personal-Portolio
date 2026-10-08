/**
 * Etch — tests for the edit-video flow helpers (Video Studio, Oct 2026
 * rework): source-first primary path, 8 tools secondary.
 *
 * Pure logic only — no DB, no network, no DOM.
 */
import { describe, expect, it } from 'vitest';
import {
  DEFAULT_TOOL_FOR_CLIP,
  sourceReady,
  toolSupportsClipSource,
  toolsForSource,
  type EditSourceKind,
} from '../edit-flow';
import { VIDEO_TOOLS, type VideoTool } from '../constants';

describe('toolSupportsClipSource', () => {
  it('allows only voice-over on a generated clip (backend contract)', () => {
    for (const tool of VIDEO_TOOLS) {
      expect(toolSupportsClipSource(tool)).toBe(tool === 'tts');
    }
  });

  it('keeps all 8 tools in the upload path', () => {
    const uploadTools = VIDEO_TOOLS.filter((t) => !toolSupportsClipSource(t));
    expect(uploadTools).toHaveLength(7);
    expect(VIDEO_TOOLS).toHaveLength(8);
  });
});

describe('toolsForSource', () => {
  it('returns all 8 tools for an uploaded video', () => {
    expect(toolsForSource('upload')).toEqual(VIDEO_TOOLS);
    expect(toolsForSource('upload')).toHaveLength(8);
  });

  it('returns only voice-over for a generated clip', () => {
    const tools = toolsForSource('clip');
    expect(tools).toEqual(['tts']);
  });

  it('every returned tool is a valid VideoTool', () => {
    const all: VideoTool[] = [...toolsForSource('upload'), ...toolsForSource('clip')];
    for (const t of all) {
      expect(VIDEO_TOOLS).toContain(t);
    }
  });
});

describe('sourceReady', () => {
  it('gates Continue on an attached file for uploads', () => {
    expect(sourceReady('upload', null, '')).toBe(false);
    expect(sourceReady('upload', { size: 1024 }, '')).toBe(true);
  });

  it('gates Continue on a picked clip for generated clips', () => {
    expect(sourceReady('clip', null, '')).toBe(false);
    expect(sourceReady('clip', { size: 1024 }, '')).toBe(false);
    expect(sourceReady('clip', null, 'gen-123')).toBe(true);
  });

  it('upload and clip kinds never cross-contaminate', () => {
    // A stale clip selection must not unlock the upload path and vice versa.
    const kind: EditSourceKind = 'upload';
    expect(sourceReady(kind, null, 'gen-123')).toBe(false);
  });
});

describe('DEFAULT_TOOL_FOR_CLIP', () => {
  it('defaults a clip source to voice-over', () => {
    expect(DEFAULT_TOOL_FOR_CLIP).toBe('tts');
    expect(toolsForSource('clip')).toContain(DEFAULT_TOOL_FOR_CLIP);
  });
});
