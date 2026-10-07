/**
 * Etch — Manual UPI payment flow.
 * No payment gateway: the user pays to our VPA manually, then taps
 * "I've paid" — the owner gets a phone ping and confirms. No UTR,
 * no screenshot required.
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
  | { kind: 'too_large' }
  | { kind: 'failed'; message: string };

export interface StartOptions {
  /** Reference files to attach to the job (validated client + server). */
  files?: File[];
  /** Upload progress 0..1 — only called when files are present. */
  onProgress?: (fraction: number) => void;
}

/**
 * Serverless-edge request-body ceiling (Vercel: ~4.5MB). The product caps
 * (8MB/file, 20MB total) can exceed what the edge accepts in one POST, so
 * the composer pre-flights the total payload against this and the client
 * maps an edge 413 to the 'too_large' error kind. Kept conservative
 * (4MB) to leave room for multipart framing overhead.
 */
export const UPLOAD_EDGE_LIMIT_BYTES = 4 * 1024 * 1024;

/**
 * Upload the multipart body via XHR so we can report real upload progress
 * (fetch has no upload-progress events). Response shape is identical to
 * the JSON path.
 */
function startWithFiles(
  quoteId: string,
  country: string,
  files: File[],
  onProgress?: (fraction: number) => void,
): Promise<Response> {
  return new Promise((resolve, reject) => {
    const form = new FormData();
    form.append('quoteId', quoteId);
    form.append('country', country);
    for (const f of files) form.append('files', f);

    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/api/generation/start');
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && e.total > 0) {
        onProgress?.(Math.min(1, e.loaded / e.total));
      }
    };
    xhr.onload = () => {
      resolve(
        new Response(xhr.responseText, {
          status: xhr.status,
          headers: { 'content-type': xhr.getResponseHeader('content-type') ?? '' },
        }),
      );
    };
    xhr.onerror = () => reject(new Error('network'));
    xhr.send(form);
  });
}

export async function startManualPayment(
  quoteId: string,
  country: string = 'IN',
  opts: StartOptions = {},
): Promise<{ ok: true; result: StartResult } | { ok: false; error: StartError }> {
  let res: Response;
  try {
    if (opts.files && opts.files.length > 0) {
      res = await startWithFiles(quoteId, country, opts.files, opts.onProgress);
    } else {
      res = await fetch('/api/generation/start', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ quoteId, country }),
      });
    }
  } catch {
    return {
      ok: false,
      error: { kind: 'failed', message: 'Network error. Please try again.' },
    };
  }

  if (res.status === 401) return { ok: false, error: { kind: 'unauthorized' } };

  // 413: the request body exceeded the serverless edge's size ceiling
  // (Vercel rejects bodies > ~4.5MB before our route ever runs). The
  // advertised per-file/total caps can exceed that ceiling, so map it to
  // a dedicated kind — the generic 'failed' message ("Could not create
  // the payment order") misleads the user about what went wrong.
  if (res.status === 413) return { ok: false, error: { kind: 'too_large' } };

  const body = await res.json().catch(() => null);
  if (res.status === 403 && (body?.error === 'ORDERS_PAUSED' || body?.code === 'ORDERS_PAUSED')) {
    return { ok: false, error: { kind: 'paused' } };
  }
  if (res.status === 400 && body?.code === 'INTL_PAYMENTS_COMING_SOON') {
    return { ok: false, error: { kind: 'intl' } };
  }
  if (!res.ok || !body?.jobId || !body?.payment) {
    const serverMsg =
      typeof body?.error === 'string' && body.error
        ? body.error
        : 'Could not create the payment order. Please try again.';
    return { ok: false, error: { kind: 'failed', message: serverMsg } };
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

/**
 * Payment-claim flow: the user paid in their UPI app and tapped "I've paid".
 * No UTR, no screenshot — the owner gets a phone ping and confirms.
 */
export async function claimPaymentPaid(
  code: string
): Promise<{ ok: true; shortCode: string | null } | { ok: false; message: string }> {
  let res: Response;
  try {
    res = await fetch(`/api/orders/${encodeURIComponent(code)}/claim-paid`, {
      method: 'POST',
    });
  } catch {
    return { ok: false, message: 'Network error. Please try again.' };
  }
  const body = await res.json().catch(() => null);
  if (!res.ok) {
    return {
      ok: false,
      message:
        typeof body?.message === 'string' && body.message
          ? body.message
          : 'Could not claim your payment. Please try again.',
    };
  }
  return { ok: true, shortCode: body?.shortCode ?? null };
}

export type PaymentCheckStatus =
  | 'PAYMENT_PENDING'
  | 'PAYMENT_SUBMITTED'
  | 'PAYMENT_AWAITING_OWNER'
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
