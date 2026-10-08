/**
 * displaySrcFor — pure unit tests.
 *
 * Unlocked rows with a clean download show the clean file inline
 * (watermark-free); locked rows and unlocked rows without a download
 * keep the watermarked preview.
 */
import { describe, it, expect } from 'vitest';
import { displaySrcFor } from '@/lib/me/profile';

describe('displaySrcFor', () => {
  it('returns the clean inline URL when unlocked with a downloadUrl', () => {
    expect(
      displaySrcFor({
        unlocked: true,
        downloadUrl: '/api/gen/g1/clean',
        thumbnailUrl: '/api/gen/g1/preview',
      })
    ).toBe('/api/gen/g1/clean?inline=1');
  });

  it('returns the preview URL when locked', () => {
    expect(
      displaySrcFor({
        unlocked: false,
        downloadUrl: null,
        thumbnailUrl: '/api/gen/g1/preview',
      })
    ).toBe('/api/gen/g1/preview');
  });

  it('returns the preview URL when unlocked but downloadUrl is missing', () => {
    expect(
      displaySrcFor({
        unlocked: true,
        downloadUrl: null,
        thumbnailUrl: '/api/gen/g1/preview',
      })
    ).toBe('/api/gen/g1/preview');
  });
});
