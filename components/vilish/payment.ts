/**
 * Vidish — Manual UPI payment flow.
 * No payment gateway: the user pays to our VPA manually, then submits the
 * UTR reference (+ optional screenshot) for human verification.
 */

export interface ManualPayment {
  code: string;
  upiUri: string;
  qrDataUri?: string;
  qrImageUrl?: string;
  vpa: string;
  payeeName: string;
  /** integer paise */
  amountPaise: number;
  expiresAt: string;
}

export interface StartResult {
  jobId: string;
  payment: ManualPayment;
}

export type StartError =
  | { kind: 'unauthorized' }
  | { kind: 'intl' }
  | { kind: 'paused' }
  | { kind: 'failed'; message: string };

export async function startManualPayment(
  quoteId: string,
  country: string = 'IN',
): Promise<{ ok: true; result: StartResult } | { ok: false; error: StartError }> {
  const res = await fetch('/api/generation/start', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ quoteId, country }),
  });

  if (res.status === 401) return { ok: false, error: { kind: 'unauthorized' } };

  const body = await res.json().catch(() => null);
  if (res.status === 403 && (body?.error === 'ORDERS_PAUSED' || body?.code === 'ORDERS_PAUSED')) {
    return { ok: false, error: { kind: 'paused' } };
  }
  if (res.status === 400 && body?.code === 'INTL_PAYMENTS_COMING_SOON') {
    return { ok: false, error: { kind: 'intl' } };
  }
  if (!res.ok || !body?.jobId || !body?.payment) {
    return {
      ok: false,
      error: { kind: 'failed', message: 'Could not create the payment order. Please try again.' },
    };
  }
  return { ok: true, result: body as StartResult };
}

/** Create a fresh manual payment order for an existing job (after expiry). */
export async function reorderManualPayment(jobId: string): Promise<StartResult | null> {
  const res = await fetch('/api/payments/manual/order', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ jobId }),
  });
  if (!res.ok) return null;
  const body = await res.json().catch(() => null);
  if (!body?.payment) return null;
  return { jobId: body.jobId ?? jobId, ...body } as StartResult;
}

export async function uploadScreenshot(file: File): Promise<{ assetId: string; url: string } | null> {
  const form = new FormData();
  form.append('file', file);
  const res = await fetch('/api/assets/upload', { method: 'POST', body: form });
  if (!res.ok) return null;
  return res.json().catch(() => null);
}

export async function submitManualPayment(opts: {
  code: string;
  utrReference: string;
  screenshotAssetId?: string;
}): Promise<boolean> {
  const res = await fetch('/api/payments/manual/submit', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(opts),
  });
  return res.ok;
}

export type PaymentCheckStatus =
  | 'PAYMENT_PENDING'
  | 'PAYMENT_VERIFIED'
  | 'GENERATION_QUEUED'
  | 'PAYMENT_REJECTED'
  | 'AMOUNT_MISMATCH'
  | 'PAYMENT_EXPIRED';

export async function checkManualPayment(code: string): Promise<PaymentCheckStatus | null> {
  const res = await fetch(`/api/payments/manual/${encodeURIComponent(code)}`, { cache: 'no-store' });
  if (!res.ok) return null;
  const body = await res.json().catch(() => null);
  return (body?.status as PaymentCheckStatus) ?? null;
}
