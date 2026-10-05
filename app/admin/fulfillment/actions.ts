/**
 * Shared fulfillment action helper — OPERATOR FULFILLMENT MODE (§9).
 *
 * UI rule: a state-changing action button renders ONLY when the transition
 * is legal from the current job state. This module is the single source of
 * truth, derived from the contract's JOB_TRANSITIONS map.
 */

export type FulfillmentAction =
  | 'approve' // AWAITING_OPERATOR_REVIEW -> APPROVED_FOR_GENERATION
  | 'start' // APPROVED_FOR_GENERATION -> GENERATING
  | 'clarify' // AWAITING_OPERATOR_REVIEW -> NEEDS_CLARIFICATION
  | 'upload' // GENERATING | OPERATOR_QC -> RESULT_UPLOADED
  | 'to-qc' // RESULT_UPLOADED -> OPERATOR_QC
  | 'deliver' // OPERATOR_QC -> READY
  | 'rework' // OPERATOR_QC -> GENERATING
  | 'reject'; // AWAITING_OPERATOR_REVIEW | OPERATOR_QC | NEEDS_CLARIFICATION -> REJECTED

/** The API endpoint each action POSTs to (job id interpolated by the caller). */
export const ACTION_ENDPOINTS: Record<FulfillmentAction, string> = {
  approve: 'approve',
  start: 'start',
  clarify: 'clarify',
  upload: 'upload',
  'to-qc': 'to-qc',
  deliver: 'deliver',
  rework: 'rework',
  reject: 'reject',
};

export const ACTION_LABELS: Record<FulfillmentAction, string> = {
  approve: 'Approve for generation',
  start: 'Start generation',
  clarify: 'Request clarification',
  upload: 'Upload result',
  'to-qc': 'Send to QC',
  deliver: 'Approve & deliver',
  rework: 'Rework',
  reject: 'Reject',
};

/**
 * Legal operator actions for a job state. Returns [] for states with no
 * operator action (e.g. READY, PAID, DRAFT-family) — never invent buttons.
 */
export function availableActions(state: string): FulfillmentAction[] {
  switch (state) {
    case 'AWAITING_OPERATOR_REVIEW':
      return ['approve', 'clarify', 'reject'];
    case 'APPROVED_FOR_GENERATION':
      return ['start'];
    case 'GENERATING':
      return ['upload'];
    case 'RESULT_UPLOADED':
      return ['to-qc'];
    case 'OPERATOR_QC':
      return ['deliver', 'rework', 'upload', 'reject'];
    case 'NEEDS_CLARIFICATION':
      return ['reject'];
    default:
      return [];
  }
}

/** Bucket the queue table groups a job under (contract §5). */
export type QueueBucket =
  | 'new'
  | 'paid'
  | 'review'
  | 'generating'
  | 'qc'
  | 'ready'
  | 'problem';

export const BUCKETS: { id: QueueBucket; label: string }[] = [
  { id: 'new', label: 'New' },
  { id: 'paid', label: 'Paid' },
  { id: 'review', label: 'Waiting for review' },
  { id: 'generating', label: 'Generating' },
  { id: 'qc', label: 'QC' },
  { id: 'ready', label: 'Ready' },
  { id: 'problem', label: 'Problem' },
];

export function bucketOf(state: string): QueueBucket | null {
  if (['DRAFT', 'QUOTED', 'PAYMENT_PENDING'].includes(state)) return 'new';
  if (state === 'PAID') return 'paid';
  if (state === 'AWAITING_OPERATOR_REVIEW') return 'review';
  if (['APPROVED_FOR_GENERATION', 'GENERATING'].includes(state)) return 'generating';
  if (['RESULT_UPLOADED', 'OPERATOR_QC'].includes(state)) return 'qc';
  if (state === 'READY') return 'ready';
  if (
    ['NEEDS_CLARIFICATION', 'REJECTED', 'REFUND_REQUIRED', 'FAILED_PROVIDER', 'FAILED_TIMEOUT'].includes(state)
  )
    return 'problem';
  return null;
}
