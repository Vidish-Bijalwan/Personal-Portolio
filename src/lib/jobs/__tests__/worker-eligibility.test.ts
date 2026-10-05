import { describe, it, expect } from 'vitest';
import { isWorkerEligible, assertTransition } from '../index';
import type { JobState } from '../../vilish/types';

describe('isWorkerEligible — hard rule', () => {
  it('admits the generation pipeline states', () => {
    expect(isWorkerEligible('QUEUED')).toBe(true);
    expect(isWorkerEligible('SUBMITTED')).toBe(true);
    expect(isWorkerEligible('GENERATING')).toBe(true);
  });

  it('NEVER admits PAYMENT_PENDING (unverified payment)', () => {
    expect(isWorkerEligible('PAYMENT_PENDING')).toBe(false);
  });

  it('rejects every other state', () => {
    const rejected: JobState[] = [
      'DRAFT',
      'QUOTED',
      'PAID',
      'POST_PROCESSING',
      'READY',
      'FAILED_PROVIDER',
      'FAILED_VALIDATION',
      'FAILED_TIMEOUT',
      'REFUND_PENDING',
      'REFUNDED',
    ];
    for (const s of rejected) {
      expect(isWorkerEligible(s), s).toBe(false);
    }
  });

  it('a filter over a mixed job list never surfaces PAYMENT_PENDING jobs', () => {
    const jobs: Array<{ id: string; state: JobState }> = [
      { id: 'a', state: 'PAYMENT_PENDING' },
      { id: 'b', state: 'QUEUED' },
      { id: 'c', state: 'READY' },
      { id: 'd', state: 'GENERATING' },
      { id: 'e', state: 'PAID' },
    ];
    const picked = jobs.filter((j) => isWorkerEligible(j.state));
    expect(picked.map((j) => j.id)).toEqual(['b', 'd']);
    expect(picked.some((j) => j.state === 'PAYMENT_PENDING')).toBe(false);
  });
});

describe('assertTransition', () => {
  it('passes legal transitions through', () => {
    expect(assertTransition('QUEUED', 'SUBMITTED')).toBe('SUBMITTED');
    expect(assertTransition('PAYMENT_PENDING', 'PAID')).toBe('PAID');
  });

  it('throws on illegal transitions', () => {
    expect(() => assertTransition('PAYMENT_PENDING', 'QUEUED')).toThrow();
    expect(() => assertTransition('READY', 'DRAFT')).toThrow();
  });
});
