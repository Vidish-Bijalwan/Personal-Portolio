'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, Loader2, RefreshCw, AlertTriangle, LogIn } from 'lucide-react';

interface StatusOrder {
  code: string;
  status: string;
  createdAt: string;
  destination: string;
}

type PageState =
  | { kind: 'loading' }
  | { kind: 'signin' }
  | { kind: 'verified'; order: StatusOrder }
  | { kind: 'confirming'; order: StatusOrder }
  | { kind: 'stale'; order: StatusOrder }
  | { kind: 'failed'; order: StatusOrder }
  | { kind: 'empty' };

const POLL_MS = 3000;

/**
 * /payment/status — the recovery page for the Cashfree return flow.
 * Cashfree's `_self` redirect does not always carry the order id, so the
 * return route may land here unidentified. This page polls the user's
 * recent cashfree orders and recovers gracefully instead of dumping them
 * on a dead `?payment=error` homepage.
 */
export default function PaymentStatusPage() {
  const [state, setState] = useState<PageState>({ kind: 'loading' });

  const poll = useCallback(async () => {
    try {
      const res = await fetch('/api/cashfree/status', { cache: 'no-store' });
      if (res.status === 401) {
        setState({ kind: 'signin' });
        return;
      }
      if (!res.ok) throw new Error('status failed');
      const data = await res.json();
      const s = data.state as { kind: string; order: StatusOrder | null };
      setState(
        s.order
          ? ({ kind: s.kind, order: s.order } as PageState)
          : ({ kind: s.kind } as PageState)
      );
    } catch {
      // Keep the last good state; polling continues.
    }
  }, []);

  useEffect(() => {
    poll();
    const t = setInterval(() => {
      // Stop polling once we reach a terminal state.
      setState((prev) => {
        if (prev.kind === 'verified' || prev.kind === 'failed') {
          clearInterval(t);
        }
        return prev;
      });
      poll();
    }, POLL_MS);
    return () => clearInterval(t);
  }, [poll]);

  return (
    <main className="mx-auto flex min-h-[70vh] w-full max-w-lg items-center justify-center px-5 py-16">
      <div className="w-full rounded-[20px] border border-[var(--pro-border)] bg-[var(--pro-bg-elev)] p-8 text-center shadow-xl sm:p-10">
        <StatusBody state={state} onRetry={poll} />
      </div>
    </main>
  );
}

function StatusBody({ state, onRetry }: { state: PageState; onRetry: () => void }) {
  switch (state.kind) {
    case 'loading':
      return (
        <>
          <Loader2 className="mx-auto h-10 w-10 animate-spin text-[var(--pro-accent)]" />
          <h1 className="mt-4 font-display text-[20px] font-semibold text-[var(--pro-fg)]">
            Checking your payment…
          </h1>
        </>
      );
    case 'signin':
      return (
        <>
          <LogIn className="mx-auto h-10 w-10 text-[var(--pro-muted)]" />
          <h1 className="mt-4 font-display text-[20px] font-semibold text-[var(--pro-fg)]">
            Sign in to check your payment
          </h1>
          <p className="mt-2 text-[14px] text-[var(--pro-muted)]">
            We need your account to look up the order.
          </p>
          <Link
            href="/"
            className="mt-6 inline-block rounded-[12px] bg-[var(--pro-accent)] px-6 py-3 text-[14px] font-semibold text-black transition hover:brightness-110"
          >
            Back to home
          </Link>
        </>
      );
    case 'verified':
      return (
        <>
          <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500" />
          <h1 className="mt-4 font-display text-[22px] font-semibold text-[var(--pro-fg)]">
            Payment confirmed
          </h1>
          <p className="mt-2 text-[14px] text-[var(--pro-muted)] tabular-nums">
            Order {state.order.code} — your download is ready.
          </p>
          <Link
            href={state.order.destination}
            className="mt-6 inline-block rounded-[12px] bg-[var(--pro-accent)] px-6 py-3 text-[14px] font-semibold text-black transition hover:brightness-110"
          >
            Open your download
          </Link>
        </>
      );
    case 'confirming':
      return (
        <>
          <Loader2 className="mx-auto h-10 w-10 animate-spin text-[var(--pro-accent)]" />
          <h1 className="mt-4 font-display text-[20px] font-semibold text-[var(--pro-fg)]">
            Confirming your payment…
          </h1>
          <p className="mt-2 text-[14px] text-[var(--pro-muted)] tabular-nums">
            Order {state.order.code}. This usually takes a few seconds —
            keep this page open.
          </p>
        </>
      );
    case 'stale':
      return (
        <>
          <AlertTriangle className="mx-auto h-10 w-10 text-amber-500" />
          <h1 className="mt-4 font-display text-[20px] font-semibold text-[var(--pro-fg)]">
            We couldn&apos;t confirm your payment yet
          </h1>
          <p className="mt-2 text-[14px] text-[var(--pro-muted)] tabular-nums">
            Order {state.order.code}. If money left your account, it will
            reflect shortly — nothing is lost.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <button
              onClick={onRetry}
              className="inline-flex items-center justify-center gap-2 rounded-[12px] bg-[var(--pro-accent)] px-6 py-3 text-[14px] font-semibold text-black transition hover:brightness-110"
            >
              <RefreshCw className="h-4 w-4" /> Check again
            </button>
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-[12px] border border-[var(--pro-border)] px-6 py-3 text-[14px] font-medium text-[var(--pro-fg)] transition hover:bg-[var(--pro-bg-sunken)]"
            >
              Back to home
            </Link>
          </div>
        </>
      );
    case 'failed':
      return (
        <>
          <AlertTriangle className="mx-auto h-10 w-10 text-red-500" />
          <h1 className="mt-4 font-display text-[20px] font-semibold text-[var(--pro-fg)]">
            Payment didn&apos;t go through
          </h1>
          <p className="mt-2 text-[14px] text-[var(--pro-muted)] tabular-nums">
            Order {state.order.code}. No money was taken — you can try again.
          </p>
          <Link
            href="/create"
            className="mt-6 inline-block rounded-[12px] bg-[var(--pro-accent)] px-6 py-3 text-[14px] font-semibold text-black transition hover:brightness-110"
          >
            Try again
          </Link>
        </>
      );
    case 'empty':
      return (
        <>
          <h1 className="font-display text-[20px] font-semibold text-[var(--pro-fg)]">
            No recent payments found
          </h1>
          <p className="mt-2 text-[14px] text-[var(--pro-muted)]">
            We couldn&apos;t find a recent online payment on this account.
          </p>
          <Link
            href="/create"
            className="mt-6 inline-block rounded-[12px] bg-[var(--pro-accent)] px-6 py-3 text-[14px] font-semibold text-black transition hover:brightness-110"
          >
            Start creating
          </Link>
        </>
      );
  }
}
