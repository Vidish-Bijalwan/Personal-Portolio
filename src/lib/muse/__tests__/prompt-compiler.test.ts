import { describe, it, expect } from 'vitest';
import { compilePrompt, buildReferenceDirectives } from '../prompt-compiler';
import { compileBrief, ANTI_GENERIC_EXCLUSIONS } from '../intent-compiler';
import type { AssetMeta, RefMeta } from '../brief';

const img: AssetMeta = {
  kind: 'image',
  name: 'selfie.jpg',
  mime: 'image/jpeg',
  width: 1080,
  height: 1350,
  sizeBytes: 420_000,
};

const vid: AssetMeta = {
  kind: 'video',
  name: 'clip.mp4',
  mime: 'video/mp4',
  width: 1080,
  height: 1920,
  sizeBytes: 9_000_000,
  durationSec: 24,
};

function ref(id: string, role: RefMeta['role'], palette?: string[]): RefMeta {
  return {
    ...img,
    id,
    role,
    roleConfidence: 0.9,
    roleUserOverride: false,
    ...(palette ? { palette } : {}),
  };
}

describe('compilePrompt — image 10-part formula', () => {
  const brief = compileBrief({
    instruction: 'a retro collage poster with the text "STAY WILD", no lens flare',
    primary: null,
    references: [
      ref('ref_01', 'style'),
      ref('ref_02', 'style'),
      ref('ref_03', 'palette', ['#ff0000', '#000000', '#f5f0e8']),
    ],
  });
  const { prompt, referenceDirectives } = compilePrompt(brief);

  it('contains all 10 labeled parts', () => {
    for (let i = 1; i <= 10; i++) {
      expect(prompt).toContain(`### ${i}.`);
    }
  });

  it('carries the anti-generic exclusions', () => {
    for (const a of ANTI_GENERIC_EXCLUSIONS) {
      expect(prompt).toContain(a);
    }
    expect(prompt).toContain('lens flare');
  });

  it('every reference id appears in referenceDirectives with its role', () => {
    expect(referenceDirectives).toHaveLength(3);
    for (const r of brief.references) {
      const d = referenceDirectives.find((x) => x.startsWith(r.id));
      expect(d).toBeDefined();
      expect(d).toContain(`role: ${r.role}`);
    }
  });

  it('conflicting style refs => lead + supporting, never averaged', () => {
    const lead = referenceDirectives.find((x) => x.startsWith('ref_01'))!;
    const support = referenceDirectives.find((x) => x.startsWith('ref_02'))!;
    expect(lead).toContain('LEAD');
    expect(support).toContain('SUPPORTING');
    expect(support).toMatch(/never blend/i);
  });

  it('palette ref hexes are used in the palette section', () => {
    expect(prompt).toContain('#ff0000');
  });

  it('quoted text becomes exact-text typography direction', () => {
    expect(prompt).toContain('STAY WILD');
  });

  it('main prompt references directive ids', () => {
    expect(prompt).toContain('ref_01');
    expect(prompt).toContain('ref_02');
    expect(prompt).toContain('ref_03');
  });
});

describe('compilePrompt — image-edit', () => {
  it('names preservation and the edit source', () => {
    const brief = compileBrief({
      instruction: 'keep my face, change the background of this photo',
      primary: img,
      references: [],
    });
    expect(brief.taskType).toBe('image-edit');
    const { prompt } = compilePrompt(brief);
    expect(prompt).toContain('### 3.');
    expect(prompt).toContain('face');
    expect(prompt).toContain('background');
  });
});

describe('compilePrompt — video-edit', () => {
  const brief = compileBrief({
    instruction: 'trim my travel vlog and make it punchy',
    primary: vid,
    references: [ref('ref_01', 'mood')],
  });
  const { prompt, referenceDirectives } = compilePrompt(brief);

  it('produces story beats + pacing/music/caption/color notes', () => {
    expect(prompt).toContain('Story skeleton');
    expect(prompt).toContain('Hook');
    expect(prompt).toContain('CTA');
    expect(prompt).toContain('Pacing');
    expect(prompt).toContain('Music');
    expect(prompt).toContain('Captions');
    expect(prompt).toContain('Color');
  });

  it('encodes many.md rules: Murch order, hard cuts, J/L cuts, dialogue > music, correct-before-grade', () => {
    expect(prompt).toContain('51%');
    expect(prompt).toContain('hard cuts');
    expect(prompt).toContain('J-cut');
    expect(prompt).toContain('L-cut');
    expect(prompt.toLowerCase()).toContain('dialogue');
    expect(prompt).toContain('Correct before grading');
  });

  it('anti-generic exclusions present and ref directive spelled out', () => {
    for (const a of ANTI_GENERIC_EXCLUSIONS) {
      expect(prompt).toContain(a);
    }
    expect(referenceDirectives[0]).toContain('ref_01');
    expect(referenceDirectives[0]).toContain('role: mood');
  });

  it('ad instructions pick the problem-proof-cta structure', () => {
    const ad = compileBrief({
      instruction: 'cut a launch ad for my product video',
      primary: vid,
      references: [],
    });
    expect(ad.storyPlan?.structure).toBe('problem-proof-cta');
    const { prompt: adPrompt } = compilePrompt(ad);
    expect(adPrompt).toContain('Problem');
  });
});

describe('buildReferenceDirectives', () => {
  it('empty references => empty directives', () => {
    expect(buildReferenceDirectives([])).toEqual([]);
  });
});
