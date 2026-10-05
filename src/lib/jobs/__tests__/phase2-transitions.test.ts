/**
 * Pixaura Phase 2 — contract §1/§2: new job states + replaced JOB_TRANSITIONS map.
 *
 * Independent contract check (written against PHASE2_CONTRACT.md, not the
 * implementation): every edge in the §2 replacement map must be allowed, and
 * illegal jumps (READY→GENERATING, PAID→GENERATING,
 * AWAITING_OPERATOR_REVIEW→READY, …) must be rejected.
 */
import { describe, it, expect } from 'vitest';
import {
  canTransition,
  JOB_TRANSITIONS,
  type JobState,
} from '../../vilish/types';
import { assertTransition } from '../index';

/** Contract states may not exist in the JobState union until the DB agent lands §1. */
const st = (s: string): JobState => s as unknown as JobState;

// Contract §2 — the full replacement map, verbatim.
const EXPECTED_MAP: Record<string, string[]> = {
  DRAFT: ['QUOTED', 'FAILED_VALIDATION'],
  QUOTED: ['PAYMENT_PENDING', 'DRAFT'],
  PAYMENT_PENDING: ['PAID', 'FAILED_TIMEOUT'],
  PAID: ['QUEUED', 'AWAITING_OPERATOR_REVIEW', 'REFUND_PENDING'],
  QUEUED: ['SUBMITTED', 'FAILED_PROVIDER'],
  SUBMITTED: ['GENERATING', 'FAILED_PROVIDER'],
  GENERATING: [
    'POST_PROCESSING',
    'RESULT_UPLOADED',
    'FAILED_PROVIDER',
    'FAILED_TIMEOUT',
  ],
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

describe('JOB_TRANSITIONS — contract §2 replacement map', () => {
  it('matches the contract map exactly (no missing or extra edges)', () => {
    expect(JOB_TRANSITIONS).toEqual(EXPECTED_MAP);
  });

  it('covers all 21 states (14 existing + 7 new)', () => {
    expect(Object.keys(JOB_TRANSITIONS).sort()).toEqual(
      Object.keys(EXPECTED_MAP).sort()
    );
  });
});

describe('canTransition — every new Phase-2 edge is allowed', () => {
  const NEW_EDGES: Array<[string, string]> = [
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
    ['REFUND_REQUIRED', 'REFUNDED'],
    ['REFUND_REQUIRED', 'REFUND_PENDING'],
    ['FAILED_PROVIDER', 'AWAITING_OPERATOR_REVIEW'],
    ['FAILED_TIMEOUT', 'AWAITING_OPERATOR_REVIEW'],
  ];
  for (const [from, to] of NEW_EDGES) {
    it(`allows ${from} -> ${to}`, () => {
      expect(canTransition(st(from), st(to))).toBe(true);
      expect(assertTransition(st(from), st(to))).toBe(st(to));
    });
  }
});

describe('canTransition — illegal jumps rejected', () => {
  const ILLEGAL: Array<[string, string]> = [
    // terminal states
    ['READY', 'GENERATING'],
    ['READY', 'DRAFT'],
    ['READY', 'APPROVED_FOR_GENERATION'],
    ['REFUNDED', 'DRAFT'],
    ['REFUNDED', 'GENERATING'],
    // operator lane must not skip review / generation / QC
    ['PAID', 'GENERATING'], // via AWAITING_OPERATOR_REVIEW or QUEUED first
    ['PAID', 'READY'],
    ['AWAITING_OPERATOR_REVIEW', 'READY'], // approve → generate → QC first
    ['AWAITING_OPERATOR_REVIEW', 'GENERATING'], // via APPROVED_FOR_GENERATION
    ['AWAITING_OPERATOR_REVIEW', 'OPERATOR_QC'],
    ['APPROVED_FOR_GENERATION', 'READY'],
    ['APPROVED_FOR_GENERATION', 'OPERATOR_QC'],
    ['APPROVED_FOR_GENERATION', 'RESULT_UPLOADED'],
    ['RESULT_UPLOADED', 'READY'], // via OPERATOR_QC
    ['RESULT_UPLOADED', 'PAID'],
    ['OPERATOR_QC', 'APPROVED_FOR_GENERATION'],
    ['OPERATOR_QC', 'RESULT_UPLOADED'],
    ['OPERATOR_QC', 'PAID'],
    ['NEEDS_CLARIFICATION', 'GENERATING'],
    ['NEEDS_CLARIFICATION', 'READY'],
    ['NEEDS_CLARIFICATION', 'REJECTED'],
    ['REJECTED', 'GENERATING'],
    ['REJECTED', 'AWAITING_OPERATOR_REVIEW'],
    ['REJECTED', 'READY'],
    ['REFUND_REQUIRED', 'PAID'],
    ['REFUND_REQUIRED', 'GENERATING'],
    ['REFUND_REQUIRED', 'READY'],
    // provider lane unchanged: GENERATING still cannot jump to READY
    ['GENERATING', 'READY'],
    ['GENERATING', 'QUEUED'],
    ['QUEUED', 'READY'],
    ['QUEUED', 'AWAITING_OPERATOR_REVIEW'],
  ];
  for (const [from, to] of ILLEGAL) {
    it(`rejects ${from} -> ${to}`, () => {
      expect(canTransition(st(from), st(to))).toBe(false);
      expect(() => assertTransition(st(from), st(to))).toThrow(
        /Illegal job transition/
      );
    });
  }

  it('READY and REFUNDED stay terminal (no outgoing transitions)', () => {
    expect(JOB_TRANSITIONS[st('READY')]).toEqual([]);
    expect(JOB_TRANSITIONS[st('REFUNDED')]).toEqual([]);
  });
});
