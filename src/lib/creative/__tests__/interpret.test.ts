import { describe, it, expect } from 'vitest';
import { interpretCreative, ModerationBlockedError } from '../interpret';

describe('interpretCreative — aspect ratio detection', () => {
  it('detects 9:16 from reel/shorts/vertical/story hints', () => {
    expect(
      interpretCreative({ prompt: 'a dancer, vertical reel for tiktok' })
        .aspectRatio
    ).toBe('9:16');
    expect(
      interpretCreative({ prompt: 'shorts thumbnail style art' }).aspectRatio
    ).toBe('9:16');
    expect(
      interpretCreative({ prompt: 'a story cover illustration' }).aspectRatio
    ).toBe('9:16');
  });

  it('detects 16:9 from youtube/banner/widescreen hints', () => {
    expect(
      interpretCreative({ prompt: 'youtube banner, widescreen mountains' })
        .aspectRatio
    ).toBe('16:9');
    expect(
      interpretCreative({ prompt: 'cover art for a channel' }).aspectRatio
    ).toBe('16:9');
  });

  it('detects 1:1 from square/pfp/avatar/post hints', () => {
    expect(
      interpretCreative({ prompt: 'square pfp avatar of a robot' }).aspectRatio
    ).toBe('1:1');
    expect(
      interpretCreative({ prompt: 'profile picture, neon style' }).aspectRatio
    ).toBe('1:1');
  });

  it('detects 4:5 from portrait hint', () => {
    expect(
      interpretCreative({ prompt: 'portrait orientation fashion shot' })
        .aspectRatio
    ).toBe('4:5');
  });

  it('defaults to 1:1 when no hint present', () => {
    expect(interpretCreative({ prompt: 'a cat sleeping' }).aspectRatio).toBe(
      '1:1'
    );
  });

  it('honors a valid provided aspectRatio over hints', () => {
    expect(
      interpretCreative({ prompt: 'youtube video art', aspectRatio: '16:9' })
        .aspectRatio
    ).toBe('16:9');
  });

  it('ignores an invalid provided aspectRatio and falls back to hints', () => {
    expect(
      interpretCreative({ prompt: 'reel dance clip', aspectRatio: '3:2' })
        .aspectRatio
    ).toBe('9:16');
  });
});

describe('interpretCreative — quality detection', () => {
  it("detects 'quick' from fast/draft/sketch hints", () => {
    expect(
      interpretCreative({ prompt: 'fast draft sketch of a car' }).quality
    ).toBe('quick');
    expect(interpretCreative({ prompt: 'cheap quick mockup' }).quality).toBe(
      'quick'
    );
  });

  it("detects 'cinema' from premium/ultra/photoreal hints", () => {
    expect(
      interpretCreative({ prompt: 'ultra photoreal cinematic city' }).quality
    ).toBe('cinema');
    expect(
      interpretCreative({ prompt: 'premium best quality render' }).quality
    ).toBe('cinema');
  });

  it("defaults to 'studio'", () => {
    expect(interpretCreative({ prompt: 'a cat sleeping' }).quality).toBe(
      'studio'
    );
  });

  it('honors a valid provided quality', () => {
    expect(
      interpretCreative({ prompt: 'a cat', quality: 'cinema' }).quality
    ).toBe('cinema');
  });
});

describe('interpretCreative — genre/style/platform detection', () => {
  it('detects product genre and instagram platform', () => {
    const spec = interpretCreative({
      prompt: 'product shot of sneakers for instagram',
    });
    expect(spec.genre).toBe('product');
    expect(spec.platform).toBe('instagram');
  });

  it('detects anime style and poster genre', () => {
    const spec = interpretCreative({ prompt: 'anime poster of a robot' });
    expect(spec.style).toBe('anime');
    expect(spec.genre).toBe('poster');
  });

  it('detects cyberpunk style', () => {
    expect(interpretCreative({ prompt: 'cyberpunk street at night' }).style).toBe(
      'cyberpunk'
    );
  });

  it('detects minimal style and logo genre', () => {
    const spec = interpretCreative({ prompt: 'minimal logo for a cafe' });
    expect(spec.style).toBe('minimal');
    expect(spec.genre).toBe('logo');
  });

  it('detects portrait genre', () => {
    expect(
      interpretCreative({ prompt: 'oil painting portrait of a sailor' }).genre
    ).toBe('portrait');
  });

  it('detects ad genre', () => {
    expect(
      interpretCreative({ prompt: 'a bold ad for a watch brand' }).genre
    ).toBe('ad');
  });

  it('detects youtube, linkedin and x platforms', () => {
    expect(
      interpretCreative({ prompt: 'linkedin banner design' }).platform
    ).toBe('linkedin');
    expect(
      interpretCreative({ prompt: 'youtube thumbnail art' }).platform
    ).toBe('youtube');
    expect(interpretCreative({ prompt: 'x post graphic' }).platform).toBe('x');
  });

  it('leaves genre/style/platform undefined when nothing matches', () => {
    const spec = interpretCreative({ prompt: 'a quiet lake at dawn' });
    expect(spec.genre).toBeUndefined();
    expect(spec.style).toBeUndefined();
    expect(spec.platform).toBeUndefined();
  });
});

describe('interpretCreative — enhancedPrompt shape', () => {
  it('appends the cinema-grade bank foundation to a plain prompt', () => {
    const spec = interpretCreative({ prompt: 'a fox in snow' });
    // User's words lead verbatim; the prompt bank adds craft around them.
    expect(spec.enhancedPrompt.startsWith('a fox in snow, ')).toBe(true);
    expect(spec.enhancedPrompt).toContain('cinematic film still');
    expect(spec.enhancedPrompt).toContain('professional composition');
    expect(spec.enhancedPrompt).toContain('balanced cinematic lighting');
    expect(spec.enhancedPrompt).toContain('ultra-detailed');
    expect(spec.enhancedPrompt).toContain('sharp focus');
  });

  it('prefixes style and genre when detected', () => {
    const spec = interpretCreative({ prompt: 'cyberpunk poster of a fox' });
    // Template: "<style>, <genre> <raw prompt>, <bank fragments>"
    expect(spec.enhancedPrompt.startsWith('cyberpunk, poster ')).toBe(true);
    expect(spec.enhancedPrompt).toContain('cyberpunk poster of a fox');
    // No doubled "cyberpunk": the bank fragment dedups against the prefix.
    expect(spec.enhancedPrompt.match(/cyberpunk/g)?.length).toBe(2);
    expect(spec.enhancedPrompt).toContain('neon glow');
    expect(spec.enhancedPrompt).toContain('ultra-detailed');
  });

  it('sets a bank negative prompt on the spec', () => {
    const spec = interpretCreative({ prompt: 'a fox in snow' });
    expect(typeof spec.negativePrompt).toBe('string');
    expect(spec.negativePrompt).toContain('watermark');
    expect(spec.negativePrompt).toContain('low quality');
  });

  it('caps enhancedPrompt at 1000 chars', () => {
    const spec = interpretCreative({ prompt: 'x'.repeat(2000) });
    expect(spec.enhancedPrompt.length).toBeLessThanOrEqual(1000);
  });

  it("always sets task to 'text_to_image'", () => {
    expect(interpretCreative({ prompt: 'hello' }).task).toBe('text_to_image');
  });
});

describe('interpretCreative — moderation blocklist', () => {
  it('blocks sexual content involving minors with code MODERATION_BLOCKED', () => {
    try {
      interpretCreative({ prompt: 'a nude child photo' });
      expect.unreachable('should have thrown');
    } catch (err: any) {
      expect(err).toBeInstanceOf(ModerationBlockedError);
      expect(err.status).toBe(400);
      expect(err.code).toBe('MODERATION_BLOCKED');
      expect(err.matched).toContain('sexual_content_minors');
    }
  });

  it('does not block a benign prompt mentioning a child', () => {
    expect(
      interpretCreative({ prompt: 'a child flying a kite' }).aspectRatio
    ).toBe('1:1');
  });

  it('blocks bestiality', () => {
    expect(() =>
      interpretCreative({ prompt: 'dog sex image' })
    ).toThrowError(ModerationBlockedError);
  });

  it('blocks non-consensual content', () => {
    try {
      interpretCreative({ prompt: 'non-consensual intimate photo' });
      expect.unreachable('should have thrown');
    } catch (err: any) {
      expect(err).toBeInstanceOf(ModerationBlockedError);
      expect(err.code).toBe('MODERATION_BLOCKED');
      expect(err.matched).toContain('non_consensual');
    }
  });

  it('blocks graphic gore', () => {
    try {
      interpretCreative({ prompt: 'gory dismembered zombie' });
      expect.unreachable('should have thrown');
    } catch (err: any) {
      expect(err).toBeInstanceOf(ModerationBlockedError);
      expect(err.code).toBe('MODERATION_BLOCKED');
      expect(err.matched).toContain('graphic_gore');
    }
  });

  it('blocks weapons-making instructions', () => {
    try {
      interpretCreative({ prompt: 'how to make a pipe bomb' });
      expect.unreachable('should have thrown');
    } catch (err: any) {
      expect(err).toBeInstanceOf(ModerationBlockedError);
      expect(err.code).toBe('MODERATION_BLOCKED');
      expect(err.matched).toContain('weapons_making');
    }
  });

  it('blocks self-harm instructions', () => {
    try {
      interpretCreative({ prompt: 'how to commit suicide painlessly' });
      expect.unreachable('should have thrown');
    } catch (err: any) {
      expect(err).toBeInstanceOf(ModerationBlockedError);
      expect(err.code).toBe('MODERATION_BLOCKED');
      expect(err.matched).toContain('self_harm_instructions');
    }
  });
});

describe('interpretCreative — input validation', () => {
  it('rejects empty/blank prompts', () => {
    expect(() => interpretCreative({ prompt: '   ' })).toThrow();
    expect(() => interpretCreative({ prompt: '' })).toThrow();
  });

  it('enforces the 2000-character prompt ceiling (token-cost guard)', () => {
    expect(() =>
      interpretCreative({ prompt: 'a'.repeat(2000) }),
    ).not.toThrow();
    try {
      interpretCreative({ prompt: 'a'.repeat(2001) });
      expect.unreachable('should have thrown');
    } catch (err: any) {
      expect(err.code).toBe('INVALID_PROMPT');
      expect(err.message).toContain('2000');
    }
  });
});
