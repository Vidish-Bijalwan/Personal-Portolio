/**
 * Pixaura — job lifecycle helpers (pure, no network).
 * The worker cron's hard eligibility rule lives here so it is unit-testable:
 * only PROVIDER-mode jobs in QUEUED / SUBMITTED / GENERATING may be advanced.
 * In operator mode the worker never touches jobs (contract §3: the cron keeps
 * running, it simply finds nothing eligible).
 */
import {
  canTransition,
  type JobState,
  type FulfillmentMode,
} from '../vilish/types';

/** States the generation worker is allowed to advance. */
export const WORKER_GENERATION_STATES: readonly JobState[] = [
  'QUEUED',
  'SUBMITTED',
  'GENERATING',
];

/**
 * Minimal job shape the eligibility gate needs. Full generation-job rows
 * (drizzle select results) satisfy this via their `state`/`fulfillmentMode`
 * columns.
 */
export interface WorkerEligibleJob {
  state: JobState;
  fulfillmentMode?: FulfillmentMode | string | null;
}

/**
 * Input accepted by isWorkerEligible: either a full job object (preferred)
 * or a bare JobState (legacy callers). The bare-state form is fail-closed:
 * without a known fulfillmentMode the job cannot be proven provider-mode,
 * so it is never eligible.
 */
export type WorkerEligibilityInput = JobState | WorkerEligibleJob;

/**
 * HARD RULE: the worker only ever touches PROVIDER-mode jobs in
 * QUEUED / SUBMITTED / GENERATING. Anything else — operator-mode jobs,
 * PAYMENT_PENDING jobs (payments not yet verified by an admin), unknown
 * mode — is never touched.
 */
export function isWorkerEligible(input: WorkerEligibilityInput): boolean {
  const state: JobState =
    typeof input === 'string' ? input : input.state;
  const fulfillmentMode =
    typeof input === 'string' ? null : (input.fulfillmentMode ?? null);
  if (fulfillmentMode !== 'provider') return false;
  return (WORKER_GENERATION_STATES as readonly string[]).includes(state);
}

/** Throw an Error on an illegal transition; otherwise return the target. */
export function assertTransition(from: JobState, to: JobState): JobState {
  if (!canTransition(from, to)) {
    throw new Error(`Illegal job transition: ${from} -> ${to}`);
  }
  return to;
}
