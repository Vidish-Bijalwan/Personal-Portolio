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
  // phase 2 — operator fulfillment (§2)
  ['PAID', 'AWAITING_OPERATOR_REVIEW'],
  ['GENERATING', 'RESULT_UPLOADED'],
  ['AWAITING_OPERATOR_REVIEW', 'APPROVED_FOR_GENERATION'],
  ['AWAITING_OPERATOR_REVIEW', 'NEEDS_CLARIFICATION'],
  ['AWAITING_OPERATOR_REVIEW', 'REJECTED'],
  ['AWAITING_OPERATOR_REVIEW', 'REFUND_REQUIRED'],
  ['APPROVED_FOR_GENERATION', 'GENERATING'],
  ['APPROVED_FOR_GENERATION', 'AWAITING_OPERATOR_REVIEW'],
  ['RESULT_UPLOADED', 'OPERATOR_QC'],
  ['RESULT_UPLOADED', 'GENERATING'],
  ['OPERATOR_QC', 'READY'],
  ['OPERATOR_QC', 'GENERATING'],
  ['OPERATOR_QC', 'REJECTED'],
  ['NEEDS_CLARIFICATION', 'AWAITING_OPERATOR_REVIEW'],
  ['NEEDS_CLARIFICATION', 'REFUND_REQUIRED'],
  ['REJECTED', 'REFUND_REQUIRED'],
  ['REJECTED', 'REFUNDED'],
  ['REFUND_REQUIRED', 'REFUND_PENDING'],
  ['FAILED_PROVIDER', 'AWAITING_OPERATOR_REVIEW'],
  ['FAILED_TIMEOUT', 'AWAITING_OPERATOR_REVIEW'],
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
    ['PAID', 'GENERATING'], // operator jobs review before generation
    ['QUEUED', 'READY'],
    ['GENERATING', 'READY'], // must go through POST_PROCESSING / RESULT_UPLOADED
    ['GENERATING', 'QUEUED'], // retry must go via FAILED_PROVIDER
    ['READY', 'GENERATING'], // READY is terminal
    ['READY', 'DRAFT'],
    ['READY', 'QUOTED'],
    ['READY', 'REFUNDED'],
    ['REFUNDED', 'DRAFT'],
    ['REFUNDED', 'QUOTED'],
    ['REFUND_PENDING', 'QUEUED'],
    ['FAILED_PROVIDER', 'READY'],
    ['AWAITING_OPERATOR_REVIEW', 'READY'], // must flow through approve → generate → QC
    ['OPERATOR_QC', 'REFUNDED'], // QC must reject first
    ['NEEDS_CLARIFICATION', 'READY'],
    ['REJECTED', 'GENERATING'],
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

  it('matches the phase-2 contract (§2) map exactly', () => {
    const expected: Record<JobState, JobState[]> = {
      DRAFT: ['QUOTED', 'FAILED_VALIDATION'],
      QUOTED: ['PAYMENT_PENDING', 'DRAFT'],
      PAYMENT_PENDING: ['PAID', 'FAILED_TIMEOUT'],
      PAID: ['QUEUED', 'AWAITING_OPERATOR_REVIEW', 'REFUND_PENDING'],
      QUEUED: ['SUBMITTED', 'FAILED_PROVIDER'],
      SUBMITTED: ['GENERATING', 'FAILED_PROVIDER'],
      GENERATING: ['POST_PROCESSING', 'RESULT_UPLOADED', 'FAILED_PROVIDER', 'FAILED_TIMEOUT'],
      POST_PROCESSING: ['READY', 'FAILED_PROVIDER'],
      READY: [],
      AWAITING_OPERATOR_REVIEW: [
        'APPROVED_FOR_GENERATION',
        'NEEDS_CLARIFICATION',
        'REJECTED',
        'REFUND_REQUIRED',
      ],
      APPROVED_FOR_GENERATION: ['GENERATING', 'AWAITING_OPERATOR_REVIEW'],
      RESULT_UPLOADED: ['OPERATOR_QC', 'GENERATING'],
      OPERATOR_QC: ['READY', 'GENERATING', 'REJECTED'],
      NEEDS_CLARIFICATION: ['AWAITING_OPERATOR_REVIEW', 'REFUND_REQUIRED'],
      REJECTED: ['REFUND_REQUIRED', 'REFUNDED'],
      REFUND_REQUIRED: ['REFUNDED', 'REFUND_PENDING'],
      FAILED_PROVIDER: ['QUEUED', 'REFUND_PENDING', 'AWAITING_OPERATOR_REVIEW'],
      FAILED_VALIDATION: ['DRAFT'],
      FAILED_TIMEOUT: ['QUEUED', 'REFUND_PENDING', 'AWAITING_OPERATOR_REVIEW'],
      REFUND_PENDING: ['REFUNDED'],
      REFUNDED: [],
    };
    expect(JOB_TRANSITIONS).toEqual(expected);
  });
});
