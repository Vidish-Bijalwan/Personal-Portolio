import { describe, it, expect } from 'vitest';
import {
  compileBrief,
  deriveTaskType,
  extractPreserve,
  extractModifiers,
  extractUserExclusions,
  buildExclusions,
  resolveReferenceRoles,
  classifyVisualFamily,
  ANTI_GENERIC_EXCLUSIONS,
  reviseBrief,
} from '../intent-compiler';
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

function ref(id: string, role: RefMeta['role']): RefMeta {
  return {
    ...img,
    id,
    role,
    roleConfidence: 0.9,
    roleUserOverride: false,
  };
}

describe('deriveTaskType', () => {
  it('null primary => image-generate', () => {
    expect(deriveTaskType('a retro poster', null)).toBe('image-generate');
  });
  it('video primary => video-edit', () => {
    expect(deriveTaskType('trim the silences', vid)).toBe('video-edit');
    expect(deriveTaskType('a poster', vid)).toBe('video-edit');
  });
  it('image + edit verbs + photo ref => image-edit', () => {
    expect(deriveTaskType('keep my face, change the background of this photo', img)).toBe('image-edit');
    expect(deriveTaskType('remove the background from my picture', img)).toBe('image-edit');
    expect(deriveTaskType('restyle this image in anime', img)).toBe('image-edit');
  });
  it('image + no edit verbs => image-generate', () => {
    expect(deriveTaskType('a retro collage poster of a watch', img)).toBe('image-generate');
  });
  it('image + edit verbs but no photo ref => image-generate', () => {
    expect(deriveTaskType('change the world', img)).toBe('image-generate');
  });
});

describe('compileBrief structure', () => {
  it('has all required fields and version 1', () => {
    const b = compileBrief({ instruction: 'a cinematic poster', primary: null, references: [] });
    expect(b.version).toBe(1);
    expect(b.taskType).toBe('image-generate');
    expect(b.instruction).toBe('a cinematic poster');
    expect(b.primary).toBeNull();
    expect(Array.isArray(b.references)).toBe(true);
    expect(Array.isArray(b.preserve)).toBe(true);
    expect(Array.isArray(b.modifiers)).toBe(true);
    expect(Array.isArray(b.exclusions)).toBe(true);
    expect(b.outputSpec.media).toBe('image');
    expect(['1:1', '4:5', '9:16', '16:9']).toContain(b.outputSpec.aspectRatio);
    expect(['quick', 'studio', 'cinema']).toContain(b.outputSpec.quality);
  });

  it('video-edit gets a storyPlan, image does not', () => {
    const v = compileBrief({ instruction: 'trim my vlog', primary: vid, references: [] });
    expect(v.storyPlan).toBeDefined();
    expect(v.storyPlan!.beats.length).toBeGreaterThan(0);
    expect(v.outputSpec.durationSec).toBe(24);
    const i = compileBrief({ instruction: 'a poster', primary: null, references: [] });
    expect(i.storyPlan).toBeUndefined();
    expect(i.visualFamily).toBeDefined();
  });
});

describe('extractPreserve', () => {
  it('"keep my face" => includes face', () => {
    expect(extractPreserve('keep my face, make it darker')).toContain('face');
  });
  it('extracts product, logo, text, background, geometry', () => {
    const p = extractPreserve("don't change the background, keep the logo and text same, preserve my pose");
    expect(p).toContain('background');
    expect(p).toContain('logo');
    expect(p).toContain('text');
    expect(p).toContain('geometry');
  });
  it('no keep cue => empty', () => {
    expect(extractPreserve('a car poster with a watch')).toEqual([]);
  });
});

describe('extractModifiers', () => {
  it('parses common descriptors', () => {
    const m = extractModifiers('make it darker, warmer, with more grain and minimal clutter');
    expect(m).toContain('darker');
    expect(m).toContain('warmer');
    expect(m).toContain('more grain');
    expect(m).toContain('minimal');
  });
});

describe('exclusions', () => {
  it('always includes the anti-generic set', () => {
    const e = buildExclusions('a poster');
    for (const a of ANTI_GENERIC_EXCLUSIONS) {
      expect(e).toContain(a);
    }
  });
  it('adds user exclusions from no/without/avoid clauses', () => {
    const e = extractUserExclusions('a poster, no lens flare, without text, avoid clutter');
    expect(e).toContain('lens flare');
    expect(e).toContain('text');
    expect(e).toContain('clutter');
  });
});

describe('resolveReferenceRoles', () => {
  it('trusts roles; first style ref is lead, rest are supporting', () => {
    const refs = [ref('ref_01', 'style'), ref('ref_02', 'palette'), ref('ref_03', 'style')];
    const r = resolveReferenceRoles(refs);
    expect(r[0].isLeadStyle).toBe(true);
    expect(r[0].isSupportingStyle).toBe(false);
    expect(r[1].isLeadStyle).toBe(false);
    expect(r[2].isLeadStyle).toBe(false);
    expect(r[2].isSupportingStyle).toBe(true);
  });
  it('single style ref is the lead', () => {
    const r = resolveReferenceRoles([ref('ref_01', 'style')]);
    expect(r[0].isLeadStyle).toBe(true);
  });
});

describe('classifyVisualFamily', () => {
  it('classifies by keyword', () => {
    expect(classifyVisualFamily('an anime character poster')).toBe('anime/manga');
    expect(classifyVisualFamily('a car blueprint poster')).toBe('automotive/blueprint');
    expect(classifyVisualFamily('study cheat sheet for biology')).toBe('infographic/study-sheet');
    expect(classifyVisualFamily('a quote in big typography')).toBe('typographic manifesto');
  });
  it('defaults to cinematic moody when unclear', () => {
    expect(classifyVisualFamily('something nice')).toBe('cinematic moody');
  });
});

describe('reviseBrief', () => {
  function base() {
    return compileBrief({
      instruction: 'a cinematic poster of a watch',
      primary: null,
      references: [ref('ref_01', 'style'), ref('ref_02', 'style'), ref('ref_03', 'palette')],
    });
  }

  it('"darker" changes modifiers but leaves everything else deep-equal', () => {
    const b = base();
    const r = reviseBrief(b, 'darker');
    expect(r.modifiers).toContain('darker');
    expect(r.taskType).toBe(b.taskType);
    expect(r.outputSpec).toEqual(b.outputSpec);
    expect(r.preserve).toEqual(b.preserve);
    expect(r.primary).toEqual(b.primary);
    expect(r.visualFamily).toBe(b.visualFamily);
    expect(r.storyPlan).toEqual(b.storyPlan);
    // references untouched: order + contents identical
    expect(r.references.map((x) => x.id)).toEqual(b.references.map((x) => x.id));
  });

  it('"use ref 2 more" promotes ref_02 to the front', () => {
    const b = base();
    const r = reviseBrief(b, 'use ref 2 more');
    expect(r.references[0].id).toBe('ref_02');
    expect(r.references.map((x) => x.id).sort()).toEqual(
      b.references.map((x) => x.id).sort()
    );
  });

  it('exclusion revision only touches exclusions (+ appended instruction)', () => {
    const b = base();
    const r = reviseBrief(b, 'no lens flare');
    expect(r.exclusions).toContain('lens flare');
    for (const a of ANTI_GENERIC_EXCLUSIONS) expect(r.exclusions).toContain(a);
    expect(r.modifiers).toEqual(b.modifiers);
    expect(r.visualFamily).toBe(b.visualFamily);
  });

  it('aspect-ratio revision only touches outputSpec.aspectRatio', () => {
    const b = base();
    const r = reviseBrief(b, 'make it vertical 9:16');
    expect(r.outputSpec.aspectRatio).toBe('9:16');
    expect(r.modifiers).toEqual(b.modifiers);
    expect(r.preserve).toEqual(b.preserve);
  });
});
