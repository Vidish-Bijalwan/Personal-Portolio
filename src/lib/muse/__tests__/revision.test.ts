/**
 * Madam Muse revision helper tests: buildRevisionRequest / parseReviseResponse
 * / applyRevisedBrief (pure client helpers around POST /api/create/revise).
 */
import { describe, expect, it } from 'vitest';
import {
  applyRevisedBrief,
  buildRevisionRequest,
  parseReviseResponse,
  REVISE_ENDPOINT,
} from '../revision';
import type { CreativeBrief } from '../projects';

function makeBrief(instruction: string): CreativeBrief {
  return {
    version: 1,
    taskType: 'image-generate',
    instruction,
    primary: null,
    references: [],
    preserve: [],
    modifiers: [],
    exclusions: [],
    outputSpec: { media: 'image', aspectRatio: '1:1', quality: 'studio' },
  };
}

describe('buildRevisionRequest', () => {
  it('builds the contract POST body', () => {
    const brief = makeBrief('make a poster');
    const body = buildRevisionRequest(brief, 'make it darker');
    expect(body).toEqual({ brief, instruction: 'make it darker' });
  });
  it('trims the instruction', () => {
    const body = buildRevisionRequest(makeBrief('x'), '  darker  ');
    expect(body.instruction).toBe('darker');
  });
  it('throws on empty instruction', () => {
    expect(() => buildRevisionRequest(makeBrief('x'), '   ')).toThrow();
  });
  it('throws on an invalid brief', () => {
    expect(() =>
      buildRevisionRequest({} as CreativeBrief, 'darker')
    ).toThrow();
  });
  it('targets the contract endpoint', () => {
    expect(REVISE_ENDPOINT).toBe('/api/create/revise');
  });
});

describe('parseReviseResponse', () => {
  it('accepts a valid { brief } response', () => {
    const brief = makeBrief('revised');
    expect(parseReviseResponse({ brief })).toEqual(brief);
  });
  it('throws on malformed responses', () => {
    expect(() => parseReviseResponse(null)).toThrow();
    expect(() => parseReviseResponse({})).toThrow();
    expect(() => parseReviseResponse({ brief: { version: 9 } })).toThrow();
  });
});

describe('applyRevisedBrief', () => {
  it('adopts the revised brief as the new brief', () => {
    const current = makeBrief('make a poster');
    const revised = makeBrief('make a darker poster');
    expect(applyRevisedBrief(current, revised)).toBe(revised);
  });
  it('throws on an invalid revised brief', () => {
    expect(() =>
      applyRevisedBrief(makeBrief('x'), {} as CreativeBrief)
    ).toThrow();
  });
});
