import { describe, it, expect } from 'vitest';
import {
  isWorkerEligible,
  assertTransition,
  type WorkerEligibleJob,
} from '../index';
import type { JobState, FulfillmentMode } from '../../vilish/types';

const job = (
  state: JobState,
  fulfillmentMode?: FulfillmentMode | string | null
): WorkerEligibleJob => ({ state, fulfillmentMode });

describe('isWorkerEligible — contract §3: provider mode only', () => {
  it('admits provider-mode jobs in the generation pipeline states', () => {
    for (const state of ['QUEUED', 'SUBMITTED', 'GENERATING'] as const) {
      expect(isWorkerEligible(job(state, 'provider')), state).toBe(true);
    }
  });

  it('NEVER admits operator-mode jobs, even in generation states', () => {
    for (const state of ['QUEUED', 'SUBMITTED', 'GENERATING'] as const) {
      expect(isWorkerEligible(job(state, 'operator')), state).toBe(false);
    }
  });

  it('rejects provider-mode jobs outside the pipeline states', () => {
    const rejected: JobState[] = [
      'DRAFT',
      'QUOTED',
      'PAYMENT_PENDING',
      'PAID',
      'POST_PROCESSING',
      'READY',
      'AWAITING_OPERATOR_REVIEW',
      'APPROVED_FOR_GENERATION',
      'RESULT_UPLOADED',
      'OPERATOR_QC',
      'NEEDS_CLARIFICATION',
      'REJECTED',
      'REFUND_REQUIRED',
      'FAILED_PROVIDER',
      'FAILED_VALIDATION',
      'FAILED_TIMEOUT',
      'REFUND_PENDING',
      'REFUNDED',
    ];
    for (const s of rejected) {
      expect(isWorkerEligible(job(s, 'provider')), s).toBe(false);
    }
  });

  it('NEVER admits PAYMENT_PENDING (unverified payment)', () => {
    expect(isWorkerEligible(job('PAYMENT_PENDING', 'provider'))).toBe(false);
    expect(isWorkerEligible(job('PAYMENT_PENDING', 'operator'))).toBe(false);
    expect(isWorkerEligible('PAYMENT_PENDING')).toBe(false);
  });

  it('fail-closed: bare-state input (unknown mode) is never eligible', () => {
    const states: JobState[] = ['QUEUED', 'SUBMITTED', 'GENERATING', 'READY'];
    for (const s of states) {
      expect(isWorkerEligible(s), s).toBe(false);
    }
  });

  it('fail-closed: missing or null fulfillmentMode is never eligible', () => {
    expect(isWorkerEligible(job('QUEUED'))).toBe(false);
    expect(isWorkerEligible(job('GENERATING', null))).toBe(false);
  });

  it('a filter over a mixed job list only surfaces provider pipeline jobs', () => {
    const jobs: Array<{ id: string; state: JobState; fulfillmentMode: FulfillmentMode }> = [
      { id: 'a', state: 'PAYMENT_PENDING', fulfillmentMode: 'provider' },
      { id: 'b', state: 'QUEUED', fulfillmentMode: 'provider' },
      { id: 'c', state: 'READY', fulfillmentMode: 'provider' },
      { id: 'd', state: 'GENERATING', fulfillmentMode: 'provider' },
      { id: 'e', state: 'PAID', fulfillmentMode: 'provider' },
      { id: 'f', state: 'GENERATING', fulfillmentMode: 'operator' },
      { id: 'g', state: 'QUEUED', fulfillmentMode: 'operator' },
    ];
    const picked = jobs.filter((j) => isWorkerEligible(j));
    expect(picked.map((j) => j.id)).toEqual(['b', 'd']);
    expect(picked.some((j) => j.fulfillmentMode === 'operator')).toBe(false);
    expect(picked.some((j) => j.state === 'PAYMENT_PENDING')).toBe(false);
  });
});

describe('assertTransition', () => {
  it('passes legal transitions through', () => {
    expect(assertTransition('QUEUED', 'SUBMITTED')).toBe('SUBMITTED');
    expect(assertTransition('PAYMENT_PENDING', 'PAID')).toBe('PAID');
    expect(
      assertTransition('AWAITING_OPERATOR_REVIEW', 'APPROVED_FOR_GENERATION')
    ).toBe('APPROVED_FOR_GENERATION');
    expect(assertTransition('GENERATING', 'RESULT_UPLOADED')).toBe(
      'RESULT_UPLOADED'
    );
  });

  it('throws on illegal transitions', () => {
    expect(() => assertTransition('PAYMENT_PENDING', 'QUEUED')).toThrow();
    expect(() => assertTransition('READY', 'DRAFT')).toThrow();
    expect(() => assertTransition('READY', 'GENERATING')).toThrow();
    expect(() => assertTransition('PAID', 'GENERATING')).toThrow();
  });
});
