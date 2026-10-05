import { describe, it, expect } from 'vitest';
import {
  canTransition,
  JOB_TRANSITIONS,
  type JobState,
} from '../../vilish/types';

const HAPPY_PATHS: Array<[JobState, JobState]> = [
  ['DRAFT', 'QUOTED'],
  ['DRAFT', 'FAILED_VALIDATION'],
  ['QUOTED', 'PAYMENT_PENDING'],
  ['QUOTED', 'DRAFT'],
  ['PAYMENT_PENDING', 'PAID'],
  ['PAYMENT_PENDING', 'FAILED_TIMEOUT'],
  ['PAID', 'QUEUED'],
  ['PAID', 'REFUND_PENDING'],
  ['QUEUED', 'SUBMITTED'],
  ['QUEUED', 'FAILED_PROVIDER'],
  ['SUBMITTED', 'GENERATING'],
  ['SUBMITTED', 'FAILED_PROVIDER'],
  ['GENERATING', 'POST_PROCESSING'],
  ['GENERATING', 'FAILED_PROVIDER'],
  ['GENERATING', 'FAILED_TIMEOUT'],
  ['POST_PROCESSING', 'READY'],
  ['POST_PROCESSING', 'FAILED_PROVIDER'],
  ['FAILED_PROVIDER', 'QUEUED'],
  ['FAILED_PROVIDER', 'REFUND_PENDING'],
  ['FAILED_VALIDATION', 'DRAFT'],
  ['FAILED_TIMEOUT', 'QUEUED'],
  ['FAILED_TIMEOUT', 'REFUND_PENDING'],
  ['REFUND_PENDING', 'REFUNDED'],
];

describe('canTransition — happy paths', () => {
  for (const [from, to] of HAPPY_PATHS) {
    it(`allows ${from} -> ${to}`, () => {
      expect(canTransition(from, to)).toBe(true);
    });
  }
});

describe('canTransition — illegal jumps rejected', () => {
  const ILLEGAL: Array<[JobState, JobState]> = [
    ['DRAFT', 'READY'],
    ['DRAFT', 'PAID'],
    ['DRAFT', 'QUEUED'],
    ['QUOTED', 'PAID'], // must go through PAYMENT_PENDING
    ['QUOTED', 'READY'],
    ['PAYMENT_PENDING', 'QUEUED'], // must go through PAID
    ['PAID', 'READY'],
    ['QUEUED', 'READY'],
    ['GENERATING', 'READY'], // must go through POST_PROCESSING
    ['GENERATING', 'QUEUED'], // retry must go via FAILED_PROVIDER
    ['READY', 'DRAFT'],
    ['READY', 'QUOTED'],
    ['READY', 'REFUNDED'],
    ['REFUNDED', 'DRAFT'],
    ['REFUNDED', 'QUOTED'],
    ['REFUND_PENDING', 'QUEUED'],
    ['FAILED_PROVIDER', 'READY'],
  ];
  for (const [from, to] of ILLEGAL) {
    it(`rejects ${from} -> ${to}`, () => {
      expect(canTransition(from, to)).toBe(false);
    });
  }

  it('READY and REFUNDED are terminal (no outgoing transitions)', () => {
    expect(JOB_TRANSITIONS['READY']).toEqual([]);
    expect(JOB_TRANSITIONS['REFUNDED']).toEqual([]);
  });
});
