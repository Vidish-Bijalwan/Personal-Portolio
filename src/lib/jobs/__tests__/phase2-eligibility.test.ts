/**
 * Pixaura Phase 2 — contract §3 worker eligibility.
 *
 * isWorkerEligible(job): job.fulfillmentMode === 'provider' AND state in
 * QUEUED | SUBMITTED | GENERATING. In operator mode the worker never touches
 * jobs — the cron keeps running but finds nothing eligible.
 */
import { describe, it, expect } from 'vitest';
import { isWorkerEligible } from '../index';

type FulfillmentMode = 'operator' | 'provider';

const jobOf = (fulfillmentMode: FulfillmentMode, state: string) =>
  ({ fulfillmentMode, state }) as unknown as Parameters<
    typeof isWorkerEligible
  >[0];

const ALL_STATES = [
  'DRAFT',
  'QUOTED',
  'PAYMENT_PENDING',
  'PAID',
  'QUEUED',
  'SUBMITTED',
  'GENERATING',
  'POST_PROCESSING',
  'READY',
  'FAILED_PROVIDER',
  'FAILED_VALIDATION',
  'FAILED_TIMEOUT',
  'REFUND_PENDING',
  'REFUNDED',
  'AWAITING_OPERATOR_REVIEW',
  'APPROVED_FOR_GENERATION',
  'RESULT_UPLOADED',
  'OPERATOR_QC',
  'NEEDS_CLARIFICATION',
  'REJECTED',
  'REFUND_REQUIRED',
];

const WORKER_STATES = ['QUEUED', 'SUBMITTED', 'GENERATING'];

describe('isWorkerEligible — contract §3', () => {
  it('admits provider-mode jobs in QUEUED / SUBMITTED / GENERATING', () => {
    for (const s of WORKER_STATES) {
      expect(isWorkerEligible(jobOf('provider', s)), `provider/${s}`).toBe(
        true
      );
    }
  });

  it('operator-mode jobs are NEVER eligible — in any state', () => {
    for (const s of ALL_STATES) {
      expect(isWorkerEligible(jobOf('operator', s)), `operator/${s}`).toBe(
        false
      );
    }
  });

  it('rejects provider-mode jobs outside the pipeline states', () => {
    const rejected = ALL_STATES.filter((s) => !WORKER_STATES.includes(s));
    for (const s of rejected) {
      expect(isWorkerEligible(jobOf('provider', s)), `provider/${s}`).toBe(
        false
      );
    }
  });

  it('operator review/generation/QC states are never worker-eligible, even in provider mode', () => {
    for (const s of [
      'AWAITING_OPERATOR_REVIEW',
      'APPROVED_FOR_GENERATION',
      'RESULT_UPLOADED',
      'OPERATOR_QC',
    ]) {
      expect(isWorkerEligible(jobOf('provider', s)), s).toBe(false);
    }
  });

  it('a mixed queue filter surfaces only provider-mode pipeline jobs', () => {
    const mk = (id: string, mode: FulfillmentMode, state: string) => ({
      id,
      job: jobOf(mode, state),
    });
    const jobs = [
      mk('op-review', 'operator', 'AWAITING_OPERATOR_REVIEW'),
      mk('op-approved', 'operator', 'APPROVED_FOR_GENERATION'),
      mk('op-generating', 'operator', 'GENERATING'),
      mk('op-qc', 'operator', 'OPERATOR_QC'),
      mk('pv-queued', 'provider', 'QUEUED'),
      mk('pv-generating', 'provider', 'GENERATING'),
      mk('pv-paid', 'provider', 'PAID'),
      mk('pv-ready', 'provider', 'READY'),
      mk('op-ready', 'operator', 'READY'),
    ];
    const picked = jobs.filter((j) => isWorkerEligible(j.job));
    expect(picked.map((j) => j.id).sort()).toEqual([
      'pv-generating',
      'pv-queued',
    ]);
    expect(
      picked.some(
        (j) => typeof j.job !== 'string' && j.job.fulfillmentMode === 'operator'
      )
    ).toBe(false);
  });
});
