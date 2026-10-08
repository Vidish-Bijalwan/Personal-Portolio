/**
 * Etch — cinema-grade prompt bank: builder tests.
 *
 * Mandatory cases:
 *  - user's words are preserved verbatim and lead the prompt
 *  - bank terms are applied (style / lighting / optics / composition / quality)
 *  - negative prompt is included
 *  - no duplication when the user already wrote a term
 *  - illustrative styles don't get photographic contradictions
 *  - maxLength never truncates the user's words
 *  - determinism (same input → same output)
 * Plus integration checks on the two wired call sites:
 *  - interpretCreative (/create image path)
 *  - buildFinalPrompt (/ads path)
 */
import { describe, expect, it } from 'vitest';
import {
  enhancePrompt,
  DEFAULT_NEGATIVE_PROMPT,
  DEFAULT_NEGATIVE_PROMPT_ILLUSTRATIVE,
} from '@/data/prompt-bank';

function countOccurrences(haystack: string, needle: string): number {
  return haystack
    .toLowerCase()
    .split(needle.toLowerCase()).length - 1;
}

describe('enhancePrompt — additive core', () => {
  it('preserves the user words verbatim and leads with them', () => {
    const raw = 'a red bicycle leaning against a brick wall';
    const { enhanced } = enhancePrompt(raw);
    expect(enhanced.startsWith(raw)).toBe(true);
  });

  it('applies the default cinema-grade foundation', () => {
    const { enhanced, applied } = enhancePrompt('a red bicycle');
    expect(enhanced).toContain('cinematic film still');
    expect(enhanced).toContain('professional color grading');
    expect(enhanced).toContain('balanced cinematic lighting');
    expect(enhanced).toContain('professional composition');
    expect(enhanced).toContain('ultra-detailed');
    expect(enhanced).toContain('sharp focus');
    expect(applied.styles.length).toBeGreaterThan(0);
    expect(applied.lighting.length).toBeGreaterThan(0);
    expect(applied.quality.length).toBeGreaterThan(0);
  });

  it('selects a matching cinema style from the prompt', () => {
    const { enhanced, applied } = enhancePrompt('a detective in a rainy alley, noir');
    expect(enhanced).toContain('film noir');
    expect(applied.styles).toContain('film noir');
  });

  it('selects matching lighting from the prompt', () => {
    // The user already wrote "golden hour" — the builder must NOT append
    // "golden hour lighting" on top of it (no duplication).
    const { enhanced, applied } = enhancePrompt('portrait at golden hour');
    expect(applied.lighting).toEqual([]);
    expect(countOccurrences(enhanced, 'golden hour')).toBe(1);
  });

  it('selects matching optics from the prompt', () => {
    const { enhanced, applied } = enhancePrompt('studio portrait of a woman');
    expect(applied.lens).toContain('85mm portrait lens, f/1.8');
  });

  it('selects matching composition from the prompt', () => {
    // The user already wrote "leading lines" — applied via dedup, not
    // re-added; the prompt still carries the composition exactly once.
    const { enhanced } = enhancePrompt('city skyline with leading lines');
    expect(countOccurrences(enhanced, 'leading lines')).toBe(1);
  });

  it('selects a composition term the user did not write', () => {
    const { applied } = enhancePrompt('city skyline at dusk');
    // No composition tags matched → mild default is applied.
    expect(applied.composition).toContain('professional composition');
  });
});

describe('enhancePrompt — no duplication', () => {
  it('does not repeat a lighting term the user already wrote', () => {
    const { enhanced } = enhancePrompt(
      'a lighthouse at golden hour, warm glow'
    );
    expect(countOccurrences(enhanced, 'golden hour')).toBe(1);
    expect(countOccurrences(enhanced, 'warm glow')).toBe(1);
  });

  it('dedups via aliases (rim light vs rim lighting)', () => {
    const { enhanced } = enhancePrompt('portrait with rim light');
    expect(countOccurrences(enhanced, 'rim light')).toBe(1);
    expect(countOccurrences(enhanced, 'rim lighting')).toBe(0);
  });

  it('does not repeat a composition term the user already wrote', () => {
    const { enhanced } = enhancePrompt('mountains, rule of thirds composition');
    expect(countOccurrences(enhanced, 'rule of thirds')).toBe(1);
  });

  it('does not repeat quality words the user already wrote', () => {
    const { enhanced } = enhancePrompt('ultra-detailed painting of a castle');
    expect(countOccurrences(enhanced, 'ultra-detailed')).toBe(1);
  });

  it('dedups against the caller context (style prefix)', () => {
    const { enhanced } = enhancePrompt('a fox', { context: 'cyberpunk, ' });
    // 'cyberpunk' appears in context; the bank must not re-add it.
    expect(countOccurrences(enhanced, 'cyberpunk')).toBe(0);
  });
});

describe('enhancePrompt — negative prompts', () => {
  it('returns the default negative prompt for photographic prompts', () => {
    const { negativePrompt } = enhancePrompt('a red bicycle');
    expect(negativePrompt).toBe(DEFAULT_NEGATIVE_PROMPT);
    expect(negativePrompt).toContain('watermark');
    expect(negativePrompt).toContain('low quality');
    expect(negativePrompt).toContain('cartoon');
  });

  it('withholds media negatives for illustrative styles', () => {
    const { negativePrompt } = enhancePrompt('an anime girl in tokyo');
    expect(negativePrompt).toBe(DEFAULT_NEGATIVE_PROMPT_ILLUSTRATIVE);
    expect(negativePrompt).not.toContain('anime');
    expect(negativePrompt).not.toContain('cartoon');
    expect(negativePrompt).toContain('watermark');
  });

  it('honors an explicit negativePrompt override', () => {
    const { negativePrompt } = enhancePrompt('a red bicycle', {
      negativePrompt: 'blurry',
    });
    expect(negativePrompt).toBe('blurry');
  });
});

describe('enhancePrompt — length + determinism', () => {
  it('never truncates the user words when maxLength is tight', () => {
    const raw = 'a very specific description the user wrote carefully';
    const { enhanced } = enhancePrompt(raw, { maxLength: 120 });
    expect(enhanced.length).toBeLessThanOrEqual(120);
    expect(enhanced.startsWith(raw)).toBe(true);
  });

  it('returns a bank-only prompt for empty input', () => {
    const { enhanced } = enhancePrompt('   ');
    expect(enhanced).toContain('cinematic film still');
  });

  it('is deterministic', () => {
    const raw = 'noir detective in a rainy alley at night';
    const a = enhancePrompt(raw);
    const b = enhancePrompt(raw);
    expect(a).toEqual(b);
  });
});

describe('prompt bank — wired call sites', () => {
  it('/create image path: interpretCreative applies the bank', async () => {
    const { interpretCreative } = await import('@/lib/creative/interpret');
    const spec = interpretCreative({ prompt: 'a fox in snow' });
    expect(spec.enhancedPrompt.startsWith('a fox in snow')).toBe(true);
    expect(spec.enhancedPrompt).toContain('ultra-detailed');
    expect(spec.negativePrompt).toContain('watermark');
  });

  it('/ads path: buildFinalPrompt applies the bank', async () => {
    const { buildFinalPrompt } = await import('@/lib/ads/concepts');
    const prompt = buildFinalPrompt(
      null,
      'handmade clay diya',
      undefined,
      undefined,
      undefined
    );
    expect(prompt.startsWith('Premium advertising photograph of handmade clay diya')).toBe(true);
    // The freeform ad template matches the "commercial" cinema style.
    expect(prompt).toContain('premium commercial photography');
    // "ultra detailed" from the base template dedups "ultra-detailed".
    expect(
      countOccurrences(prompt, 'ultra-detailed') +
        countOccurrences(prompt, 'ultra detailed')
    ).toBe(1);
    expect(prompt).toContain('sharp focus');
  });

  it('/ads path: double application does not stack terms', async () => {
    const { buildFinalPrompt } = await import('@/lib/ads/concepts');
    const { interpretCreative } = await import('@/lib/creative/interpret');
    // The /ads deep link feeds the enhanced prompt back through /create.
    const once = buildFinalPrompt(null, 'handmade clay diya');
    const twice = interpretCreative({ prompt: once }).enhancedPrompt;
    expect(countOccurrences(twice, 'premium commercial photography')).toBe(1);
    expect(countOccurrences(twice, 'crisp hero lighting')).toBe(1);
    expect(countOccurrences(twice, 'sharp focus')).toBe(1);
    expect(countOccurrences(twice, 'balanced cinematic lighting')).toBe(1);
    expect(countOccurrences(twice, 'professional composition')).toBe(1);
    expect(countOccurrences(twice, 'luxury aesthetic')).toBe(1);
    expect(twice).toContain('Premium advertising photograph of handmade clay diya');
    expect(twice).toContain('ultra detailed');
  });
});
