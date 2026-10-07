"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Check, Copy, Loader2, RefreshCcw, X, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatINR } from "@/src/lib/vilish/types";
import BurgerGrill from "./burger-grill";
import {
  checkManualPayment,
  claimPaymentPaid,
  createCashfreeSession,
  loadCashfreeSdk,
  reorderManualPayment,
  type ManualPayment,
} from "./payment";

type ModalPhase = "pay" | "processing" | "expired";
type PayMode = "upi" | "online";

interface PaymentModalProps {
  jobId: string;
  initialPayment: ManualPayment;
  onClose: () => void;
  navigate: (url: string) => void;
  /** When set, called on payment verification instead of navigating to /generation/[jobId]. */
  onPaymentVerified?: (jobId: string) => void;
}

function useCountdown(expiresAt: string, active: boolean) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!active) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [active]);
  const ms = new Date(expiresAt).getTime() - now;
  const s = Math.max(0, Math.floor(ms / 1000));
  return {
    expired: ms <= 0,
    label: `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`,
  };
}

/** Gentle notice threshold while waiting for the owner: 10 minutes. */
const LONG_WAIT_MS = 10 * 60 * 1000;

export default function PaymentModal({ jobId, initialPayment, onClose, navigate, onPaymentVerified }: PaymentModalProps) {
  const [payment, setPayment] = useState<ManualPayment>(initialPayment);
  const [phase, setPhase] = useState<ModalPhase>("pay");
  const [payMode, setPayMode] = useState<PayMode>("upi");
  const [vpaCopied, setVpaCopied] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [formError, setFormError] = useState("");
  const [statusMsg, setStatusMsg] = useState("");
  const [notConfirmed, setNotConfirmed] = useState(false);
  const [longWait, setLongWait] = useState(false);
  const [reordering, setReordering] = useState(false);
  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [onlineLoading, setOnlineLoading] = useState(false);
  const [onlineError, setOnlineError] = useState("");
  const claimStartRef = useRef(0);
  const countdown = useCountdown(payment.expiresAt, phase === "pay");

  // esc to close
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // flip to expired when countdown runs out on the pay screen
  useEffect(() => {
    if (phase === "pay" && countdown.expired) setPhase("expired");
  }, [phase, countdown.expired]);

  const handleVerified = () => {
    if (onPaymentVerified) {
      onPaymentVerified(jobId);
    } else {
      // ?paid=1 shows the one-time thank-you banner on the order page.
      navigate(`/generation/${jobId}?paid=1`);
    }
  };

  // poll for the owner's confirmation after the user taps "I've paid"
  useEffect(() => {
    if (phase !== "processing") return;
    let stopped = false;
    const tick = async () => {
      const status = await checkManualPayment(payment.code);
      if (!status || stopped) return;
      if (status === "PAYMENT_VERIFIED" || status === "GENERATION_QUEUED") {
        handleVerified();
      } else if (status === "PAYMENT_PENDING") {
        // The owner didn't see the payment: back to pending, let them retry.
        setNotConfirmed(true);
      } else if (status === "PAYMENT_REJECTED") {
        setStatusMsg("Payment rejected — contact support");
      } else if (status === "AMOUNT_MISMATCH") {
        setStatusMsg("Amount mismatch — our team will resolve it");
      } else if (status === "PAYMENT_EXPIRED") {
        setPhase("expired");
      }
      // PAYMENT_AWAITING_OWNER / PAYMENT_SUBMITTED → keep waiting
      if (Date.now() - claimStartRef.current > LONG_WAIT_MS) setLongWait(true);
    };
    tick();
    const id = setInterval(tick, 5000);
    return () => {
      stopped = true;
      clearInterval(id);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, payment.code, jobId]);

  const copyVpa = async () => {
    try {
      await navigator.clipboard.writeText(payment.vpa);
      setVpaCopied(true);
      setTimeout(() => setVpaCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  };

  const handleClaimPaid = async () => {
    setFormError("");
    setNotConfirmed(false);
    setLongWait(false);
    setClaiming(true);
    try {
      const res = await claimPaymentPaid(payment.code);
      if (!res.ok) {
        setFormError(res.message);
        return;
      }
      claimStartRef.current = Date.now();
      setPhase("processing");
    } finally {
      setClaiming(false);
    }
  };

  const handleReorder = async () => {
    setReordering(true);
    try {
      const next = await reorderManualPayment(jobId);
      if (!next) {
        setStatusMsg("Could not create a new payment order. Please try again.");
        return;
      }
      setPayment(next.payment);
      setPhase("pay");
      setPayMode("upi");
      setNotConfirmed(false);
      setLongWait(false);
      setStatusMsg("");
    } finally {
      setReordering(false);
    }
  };

  const handlePayOnline = async () => {
    setPhoneError("");
    setOnlineError("");
    const digits = phone.replace(/\D/g, "");
    if (!/^[6-9]\d{9}$/.test(digits)) {
      setPhoneError("Enter a valid 10-digit Indian mobile number");
      return;
    }
    setOnlineLoading(true);
    try {
      const res = await createCashfreeSession(payment.code, digits);
      if (!res.ok) {
        if (res.error.kind === "invalid_phone") {
          setPhoneError("Enter a valid 10-digit Indian mobile number");
        } else {
          setOnlineError(res.error.message);
        }
        return;
      }
      const cf = await loadCashfreeSdk();
      const cashfree = cf({ mode: res.session.mode });
      const result = await cashfree.checkout({
        paymentSessionId: res.session.paymentSessionId,
        redirectTarget: "_self",
      });
      if (result?.error) {
        setOnlineError(
          result.error.message || "Payment could not be started. Please try again."
        );
      }
      // result.redirect → the browser navigates to our return URL, which
      // verifies the payment server-side. Nothing more to do here.
    } catch (e) {
      setOnlineError(
        e instanceof Error ? e.message : "Could not start online payment. Please try again."
      );
    } finally {
      setOnlineLoading(false);
    }
  };

  const qrSrc = payment.qrDataUri || payment.qrImageUrl;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-0 sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label="Pay with UPI"
      onClick={onClose}
    >
      <div
        className="flex max-h-[92dvh] w-full max-w-md flex-col overflow-hidden rounded-t-[20px] border border-[var(--pro-border)] bg-[var(--pro-bg-elev)] text-[var(--pro-fg)] shadow-2xl sm:rounded-[20px] pb-[env(safe-area-inset-bottom)] sm:pb-0"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Fixed header — never scrolls or clips away */}
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-[var(--pro-border-soft)] px-6 pb-4 pt-5">
          <div className="min-w-0">
            <h2 className="font-display text-[18px] font-semibold tracking-[0.01em] text-[var(--pro-fg)]">Pay with UPI</h2>
            <p className="mt-1 text-[12px] text-[var(--pro-muted)] tabular-nums">Order {payment.code}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close payment dialog"
            className="rounded-[8px] p-2.5 text-[var(--pro-muted)] hover:bg-[var(--pro-bg-sunken)] hover:text-[var(--pro-fg)]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        {/* Scrollable body — long content scrolls under the fixed header */}
        <div className="overflow-y-auto px-6 pb-6">

        {phase === "pay" && payMode === "upi" && (
          <>
            {/* Online alternative — kept secondary so manual UPI stays the default */}
            <button
              type="button"
              onClick={() => {
                setPayMode("online");
                setOnlineError("");
                setPhoneError("");
              }}
              className="mt-5 flex w-full items-center justify-between gap-3 rounded-[12px] border border-[var(--pro-accent)]/35 bg-[var(--pro-accent)]/[0.07] px-4 py-3.5 text-left transition hover:bg-[var(--pro-accent)]/[0.12]"
            >
              <span className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-[var(--pro-accent)]/15">
                  <Zap className="h-4 w-4 text-[var(--pro-accent)]" />
                </span>
                <span>
                  <span className="block text-[14px] font-semibold text-[var(--pro-fg)]">
                    Pay online instantly
                  </span>
                  <span className="mt-0.5 block text-[12px] text-[var(--pro-muted)]">
                    UPI, cards, netbanking — confirmed automatically
                  </span>
                </span>
              </span>
              <ArrowRight className="h-4 w-4 shrink-0 text-[var(--pro-muted)]" />
            </button>

            {qrSrc ? (
              <div className="mx-auto mt-5 w-52 overflow-hidden rounded-[14px] border border-[var(--pro-border)] bg-white p-3">
                <img src={qrSrc} alt="UPI payment QR code" className="h-auto w-full" />
              </div>
            ) : (
              <div className="mx-auto mt-5 flex w-52 items-center justify-center rounded-[14px] border border-[var(--pro-border)] bg-[var(--pro-bg-sunken)] p-8 text-center text-[13px] text-[var(--pro-muted)]">
                Scan not available — pay to the VPA below
              </div>
            )}

            {/* mobile: open UPI app */}
            <a
              href={payment.upiUri}
              className="mt-4 block rounded-[10px] bg-[var(--pro-bg-sunken)] px-4 py-3 text-center text-[14px] font-semibold text-[var(--pro-fg)] ring-1 ring-[var(--pro-border)] hover:ring-[var(--pro-accent)]/50 sm:hidden"
            >
              Open UPI App
            </a>

            <button
              type="button"
              onClick={copyVpa}
              className="mt-3 flex w-full items-center justify-between rounded-[10px] border border-[var(--pro-border)] bg-[var(--pro-bg-sunken)] px-4 py-3 hover:border-[var(--pro-accent)]/50"
            >
              <span className="text-left">
                <span className="block text-[11px] text-[var(--pro-faint)]">Pay to VPA{payment.payeeName ? ` (${payment.payeeName})` : ""}</span>
                <span className="text-[15px] font-medium tabular-nums text-[var(--pro-fg)]">{payment.vpa}</span>
              </span>
              {vpaCopied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4 text-[var(--pro-muted)]" />}
            </button>

            <div className="mt-4 flex items-center justify-between border-t border-[var(--pro-border-soft)] pt-4">
              <div>
                <p className="text-[11px] text-[var(--pro-faint)]">Pay exactly</p>
                <p className="text-[22px] font-semibold tabular-nums">{formatINR(payment.amountPaise)}</p>
              </div>
              <p className="text-[13px] text-[var(--pro-muted)] tabular-nums">
                Expires in <span className="font-semibold text-[var(--pro-fg)]">{countdown.label}</span>
              </p>
            </div>

            {formError && <p className="mt-3 text-[13px] text-[#e5484d]">{formError}</p>}

            <button
              type="button"
              onClick={handleClaimPaid}
              disabled={claiming}
              className={cn(
                "mt-4 flex w-full items-center justify-center gap-2 rounded-[10px] bg-[var(--pro-btn)] px-4 py-3 text-[14px] font-semibold text-[var(--pro-btn-ink)]",
                claiming ? "cursor-wait opacity-70" : "hover:opacity-95",
              )}
            >
              {claiming && <Loader2 className="h-4 w-4 animate-spin" />}
              I&apos;ve paid {formatINR(payment.amountPaise)}
            </button>
            <p className="mt-3 text-center text-[12px] text-[var(--pro-faint)]">
              Pay the exact amount in your UPI app, then tap &ldquo;I&apos;ve
              paid&rdquo; — no UTR, no screenshot needed. The studio confirms it
              directly.
            </p>
            <p className="mt-2 text-center text-[12px] leading-5 text-[var(--pro-faint)]">
              AI generation with human quality review — every paid generation is
              reviewed before delivery.
            </p>
          </>
        )}

        {phase === "pay" && payMode === "online" && (
          <>
            <button
              type="button"
              onClick={() => setPayMode("upi")}
              className="mt-5 inline-flex items-center gap-1.5 text-[13px] text-[var(--pro-muted)] hover:text-[var(--pro-fg)]"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to manual UPI (no extra fee)
            </button>

            <div className="mt-3 rounded-[14px] border border-[var(--pro-border)] bg-[var(--pro-bg-sunken)] p-5">
              <div className="flex items-center justify-between">
                <p className="text-[11px] text-[var(--pro-faint)]">Pay securely online</p>
                <p className="text-[20px] font-semibold tabular-nums">
                  {formatINR(payment.amountPaise)}
                </p>
              </div>
              <p className="mt-1 text-[12px] leading-5 text-[var(--pro-muted)]">
                UPI, cards and netbanking via Cashfree. You&apos;ll be redirected
                to a secure checkout and your payment is confirmed automatically
                — no waiting.
              </p>

              <label
                htmlFor="cf-phone"
                className="mt-4 block text-[12px] font-medium text-[var(--pro-muted)]"
              >
                Mobile number
              </label>
              <div className="mt-1.5 flex overflow-hidden rounded-[10px] border border-[var(--pro-border)] bg-[var(--pro-bg-elev)] focus-within:border-[var(--pro-accent)]/60">
                <span className="flex items-center border-r border-[var(--pro-border-soft)] px-3 text-[14px] text-[var(--pro-muted)]">
                  +91
                </span>
                <input
                  id="cf-phone"
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel"
                  maxLength={10}
                  value={phone}
                  onChange={(e) =>
                    setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))
                  }
                  placeholder="98765 43210"
                  className="w-full bg-transparent px-3 py-3 text-[15px] tabular-nums text-[var(--pro-fg)] outline-none placeholder:text-[var(--pro-faint)]"
                />
              </div>
              {phoneError && (
                <p className="mt-2 text-[13px] text-[#e5484d]">{phoneError}</p>
              )}
              {onlineError && (
                <p className="mt-2 text-[13px] text-[#e5484d]">{onlineError}</p>
              )}

              <button
                type="button"
                onClick={handlePayOnline}
                disabled={onlineLoading}
                className={cn(
                  "mt-4 flex w-full items-center justify-center gap-2 rounded-[10px] bg-[var(--pro-btn)] px-4 py-3 text-[14px] font-semibold text-[var(--pro-btn-ink)]",
                  onlineLoading ? "cursor-wait opacity-70" : "hover:opacity-95"
                )}
              >
                {onlineLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                Pay {formatINR(payment.amountPaise)} online
              </button>
              <p className="mt-3 text-center text-[11px] leading-5 text-[var(--pro-faint)]">
                Order {payment.code} · Secured by Cashfree
              </p>
            </div>
          </>
        )}

        {phase === "processing" && (
          <div className="mt-6 text-center">
            <div className="mx-auto max-w-[280px]">
              <BurgerGrill frame={2} />
            </div>
            {/* indeterminate progress */}
            <div
              className="mx-auto mt-2 h-[3px] w-48 overflow-hidden rounded-full bg-[var(--pro-border-soft)]"
              aria-hidden="true"
            >
              <div className="fg-bar h-full w-1/3 rounded-full bg-[var(--pro-btn)]" />
            </div>
            <p className="mt-4 text-[15px] font-medium text-[var(--pro-fg)]">
              Confirming your payment with the studio…
            </p>
            <p className="mt-2 text-[13px] leading-6 text-[var(--pro-muted)]">
              The owner has been pinged and usually confirms within a couple of
              minutes. Your order is saved — you can keep this open.
            </p>
            <p className="mt-2 text-[12px] text-[var(--pro-faint)] tabular-nums">Order {payment.code}</p>
            {longWait && (
              <p className="mt-3 rounded-[10px] border border-[var(--pro-border-soft)] bg-[var(--pro-bg-sunken)] px-4 py-3 text-[13px] leading-6 text-[var(--pro-muted)]">
                Still waiting — the owner has been notified. This usually takes
                a couple of minutes; your order is saved and nothing is lost.
              </p>
            )}
            {notConfirmed && (
              <div className="mt-4 rounded-[10px] border border-amber-500/30 bg-amber-500/10 px-4 py-3">
                <p className="text-[13px] leading-6 text-amber-600">
                  Payment not confirmed — please check your UPI app that the
                  exact amount went through, then try again.
                </p>
                <button
                  type="button"
                  onClick={handleClaimPaid}
                  disabled={claiming}
                  className={cn(
                    "mt-3 flex min-h-[44px] w-full items-center justify-center gap-2 rounded-[10px] bg-[var(--pro-btn)] px-4 py-2.5 text-[14px] font-semibold text-[var(--pro-btn-ink)]",
                    claiming ? "cursor-wait opacity-70" : "hover:opacity-95",
                  )}
                >
                  {claiming && <Loader2 className="h-4 w-4 animate-spin" />}
                  I&apos;ve paid — check again
                </button>
              </div>
            )}
            {statusMsg && <p className="mt-3 text-[13px] text-amber-600">{statusMsg}</p>}
          </div>
        )}

        {phase === "expired" && (
          <div className="mt-6 text-center">
            <p className="text-[15px] font-medium text-[var(--pro-fg)]">This payment order expired</p>
            <p className="mt-2 text-[13px] leading-6 text-[var(--pro-muted)]">
              Nothing was charged. Create a new payment order to try again.
            </p>
            {statusMsg && <p className="mt-3 text-[13px] text-[#e5484d]">{statusMsg}</p>}
            <button
              type="button"
              onClick={handleReorder}
              disabled={reordering}
              className={cn(
                "mt-5 inline-flex w-full items-center justify-center gap-2 rounded-[10px] bg-[var(--pro-btn)] px-4 py-3 text-[14px] font-semibold text-[var(--pro-btn-ink)]",
                reordering ? "cursor-wait opacity-70" : "hover:opacity-95",
                )}
              >
              {reordering ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCcw className="h-4 w-4" />}
              Create a new payment order
            </button>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
