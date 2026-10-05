/**
 * VILISH Studio — job lifecycle helpers (pure, no network).
 * The worker cron's hard eligibility rule lives here so it is unit-testable:
 * only jobs in QUEUED / SUBMITTED / GENERATING may be advanced.
 */
import { canTransition, type JobState } from '../vilish/types';

/** States the generation worker is allowed to advance. */
export const WORKER_GENERATION_STATES: readonly JobState[] = [
  'QUEUED',
  'SUBMITTED',
  'GENERATING',
];

/**
 * HARD RULE: the worker only ever touches jobs in
 * QUEUED / SUBMITTED / GENERATING. PAYMENT_PENDING jobs (payments not yet
 * verified by an admin) and every other state are never touched.
 */
export function isWorkerEligible(state: JobState): boolean {
  return (WORKER_GENERATION_STATES as readonly string[]).includes(state);
}

/** Throw an Error on an illegal transition; otherwise return the target. */
export function assertTransition(from: JobState, to: JobState): JobState {
  if (!canTransition(from, to)) {
    throw new Error(`Illegal job transition: ${from} -> ${to}`);
  }
  return to;
}
