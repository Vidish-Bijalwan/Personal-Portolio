/**
 * Madam Muse style-memory compiler defaults tests.
 *
 * Contract: approved-style memory biases the visual-family classification
 * and the palette defaults; explicit instruction always overrides memory;
 * the playbook recipes themselves are never replaced.
 */
import { describe, expect, it } from 'vitest';
import { classifyVisualFamily, compileBrief } from '../intent-compiler';
import { compilePrompt } from '../prompt-compiler';
import type { StyleFingerprint } from '../style-memory';
import type { CreativeBrief } from '../brief';

const RETRO: StyleFingerprint = {
  visualFamily: 'retro collage',
  palette: ['#f4ead8', '#2a7f7f'],
  texture: 'grainy paper',
  typography: 'hand-drawn retro display headline',
  source: 'manual',
};

const MINIMAL: StyleFingerprint = {
  visualFamily: 'minimal soft',
  palette: ['soft cream', 'warm beige'],
  texture: 'soft matte finish',
  typography: 'quiet refined type',
  source: 'manual',
};

function briefWith(overrides: Partial<CreativeBrief> = {}): CreativeBrief {
  return {
    version: 1,
    taskType: 'image-generate',
    instruction: 'a poster for my coffee brand',
    primary: null,
    references: [],
    preserve: [],
    modifiers: [],
    exclusions: ['no stock look'],
    outputSpec: { media: 'image', aspectRatio: '4:5', quality: 'studio' },
    ...overrides,
  };
}

describe('classifyVisualFamily with memory', () => {
  it('uses the memory family on zero keyword hits', () => {
    expect(classifyVisualFamily('a birthday card for my sister', [], [RETRO])).toBe(
      'retro collage'
    );
  });

  it('explicit instruction keywords always beat memory', () => {
    expect(
      classifyVisualFamily('make it cinematic and moody', [], [RETRO])
    ).toBe('cinematic moody');
    expect(
      classifyVisualFamily('design a minimal logo', [], [RETRO])
    ).toBe('minimal soft');
  });

  it('falls back to cinematic moody with no memory and no hits', () => {
    expect(classifyVisualFamily('a birthday card for my sister')).toBe(
      'cinematic moody'
    );
    expect(classifyVisualFamily('a birthday card for my sister', [], [])).toBe(
      'cinematic moody'
    );
  });

  it('ignores invalid memory families', () => {
    expect(
      classifyVisualFamily('a birthday card', [], [
        { ...RETRO, visualFamily: 'bogus family' },
      ])
    ).toBe('cinematic moody');
  });

  it('keeps the newest memory family first', () => {
    expect(
      classifyVisualFamily('a birthday card', [], [MINIMAL, RETRO])
    ).toBe('minimal soft');
  });
});

describe('compileBrief with styleMemory', () => {
  it('biases the brief family when the instruction names none', () => {
    const brief = compileBrief({
      instruction: 'a birthday card for my sister',
      primary: null,
      references: [],
      styleMemory: [RETRO],
    });
    expect(brief.visualFamily).toBe('retro collage');
  });

  it('explicit family keywords override memory in the brief', () => {
    const brief = compileBrief({
      instruction: 'make it cinematic and moody',
      primary: null,
      references: [],
      styleMemory: [RETRO],
    });
    expect(brief.visualFamily).toBe('cinematic moody');
  });

  it('behaves as before when no memory is passed', () => {
    const brief = compileBrief({
      instruction: 'a birthday card for my sister',
      primary: null,
      references: [],
    });
    expect(brief.visualFamily).toBe('cinematic moody');
  });
});

describe('compilePrompt with styleMemory', () => {
  it('uses the memory family when the brief has none, and says so', () => {
    const { prompt } = compilePrompt(briefWith(), { styleMemory: [RETRO] });
    expect(prompt).toContain('retro collage');
    expect(prompt).toContain('approved-style default');
    // Playbook recipe still governs the family section, not the raw memory.
    expect(prompt).toContain('Layered cutout elements');
  });

  it('explicit brief family wins over memory, with no memory note', () => {
    const { prompt } = compilePrompt(
      briefWith({ visualFamily: 'minimal soft' }),
      { styleMemory: [RETRO] }
    );
    expect(prompt).toContain('minimal soft');
    expect(prompt).not.toContain('approved-style default');
    expect(prompt).toContain('Bold focal subject on a soft, uncluttered ground');
  });

  it('memory palette is the default when no palette ref exists', () => {
    const { prompt } = compilePrompt(briefWith(), { styleMemory: [RETRO] });
    expect(prompt).toContain('#f4ead8');
    expect(prompt).toContain('learned default from your approved styles');
  });

  it('a palette reference beats the memory palette', () => {
    const brief = briefWith({
      visualFamily: 'retro collage',
      references: [
        {
          id: 'ref_01',
          kind: 'image',
          name: 'pal.png',
          mime: 'image/png',
          width: 10,
          height: 10,
          sizeBytes: 10,
          role: 'palette',
          roleConfidence: 1,
          roleUserOverride: true,
          palette: ['#abcdef'],
        },
      ],
    });
    const { prompt } = compilePrompt(brief, { styleMemory: [RETRO] });
    expect(prompt).toContain('#abcdef');
    expect(prompt).not.toContain('learned default');
  });

  it('no memory behaves exactly as before', () => {
    const { prompt } = compilePrompt(briefWith());
    expect(prompt).toContain('cinematic moody');
    expect(prompt).not.toContain('approved-style');
    expect(prompt).not.toContain('learned default');
  });
});
