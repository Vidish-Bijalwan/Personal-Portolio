"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Copy, Loader2, RefreshCcw, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatINR } from "@/src/lib/vilish/types";
import BurgerGrill from "./burger-grill";
import {
  checkManualPayment,
  claimPaymentPaid,
  reorderManualPayment,
  type ManualPayment,
} from "./payment";

type ModalPhase = "pay" | "processing" | "expired";

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
  const [vpaCopied, setVpaCopied] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [formError, setFormError] = useState("");
  const [statusMsg, setStatusMsg] = useState("");
  const [notConfirmed, setNotConfirmed] = useState(false);
  const [longWait, setLongWait] = useState(false);
  const [reordering, setReordering] = useState(false);
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
      navigate(`/generation/${jobId}`);
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
      setNotConfirmed(false);
      setLongWait(false);
      setStatusMsg("");
    } finally {
      setReordering(false);
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
        className="max-h-[92dvh] w-full max-w-md overflow-y-auto rounded-t-[20px] border border-white/[0.1] bg-[#121214] p-6 sm:rounded-[20px]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div>
            <h2 className="font-display text-[18px] font-semibold tracking-[0.01em]">Pay with UPI</h2>
            <p className="mt-1 text-[12px] text-white/45 tabular-nums">Order {payment.code}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close payment dialog"
            className="rounded-[8px] p-2.5 text-white/50 hover:bg-white/[0.06] hover:text-white/85"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {phase === "pay" && (
          <>
            {qrSrc ? (
              <div className="mx-auto mt-5 w-52 overflow-hidden rounded-[14px] border border-white/[0.1] bg-white p-3">
                <img src={qrSrc} alt="UPI payment QR code" className="h-auto w-full" />
              </div>
            ) : (
              <div className="mx-auto mt-5 flex w-52 items-center justify-center rounded-[14px] border border-white/[0.1] bg-[#0D0D0F] p-8 text-center text-[13px] text-white/50">
                Scan not available — pay to the VPA below
              </div>
            )}

            {/* mobile: open UPI app */}
            <a
              href={payment.upiUri}
              className="mt-4 block rounded-[10px] bg-[#18181B] px-4 py-3 text-center text-[14px] font-semibold text-[#F5F5F3] ring-1 ring-white/[0.12] hover:ring-white/25 sm:hidden"
            >
              Open UPI App
            </a>

            <button
              type="button"
              onClick={copyVpa}
              className="mt-3 flex w-full items-center justify-between rounded-[10px] border border-white/[0.1] bg-[#0D0D0F] px-4 py-3 hover:border-white/25"
            >
              <span className="text-left">
                <span className="block text-[11px] text-white/40">Pay to VPA ({payment.payeeName})</span>
                <span className="text-[15px] font-medium tabular-nums">{payment.vpa}</span>
              </span>
              {vpaCopied ? <Check className="h-4 w-4 text-emerald-300" /> : <Copy className="h-4 w-4 text-white/50" />}
            </button>

            <div className="mt-4 flex items-center justify-between border-t border-white/[0.06] pt-4">
              <div>
                <p className="text-[11px] text-white/40">Pay exactly</p>
                <p className="text-[22px] font-semibold tabular-nums">{formatINR(payment.amountPaise)}</p>
              </div>
              <p className="text-[13px] text-white/50 tabular-nums">
                Expires in <span className="font-semibold text-[#F5F5F3]">{countdown.label}</span>
              </p>
            </div>

            {formError && <p className="mt-3 text-[13px] text-red-300/80">{formError}</p>}

            <button
              type="button"
              onClick={handleClaimPaid}
              disabled={claiming}
              className={cn(
                "mt-4 flex w-full items-center justify-center gap-2 rounded-[10px] bg-[#D7FF3F] px-4 py-3 text-[14px] font-semibold text-[#080808]",
                claiming ? "cursor-wait opacity-70" : "hover:opacity-95",
              )}
            >
              {claiming && <Loader2 className="h-4 w-4 animate-spin" />}
              I&apos;ve paid {formatINR(payment.amountPaise)}
            </button>
            <p className="mt-3 text-center text-[12px] text-white/35">
              Pay the exact amount in your UPI app, then tap &ldquo;I&apos;ve
              paid&rdquo; — no UTR, no screenshot needed. The studio confirms it
              directly.
            </p>
            <p className="mt-2 text-center text-[12px] leading-5 text-white/35">
              AI generation with human quality review — every paid generation is
              reviewed before delivery.
            </p>
          </>
        )}

        {phase === "processing" && (
          <div className="mt-6 text-center">
            <div className="mx-auto max-w-[280px]">
              <BurgerGrill frame={2} />
            </div>
            {/* indeterminate progress */}
            <div
              className="mx-auto mt-2 h-[3px] w-48 overflow-hidden rounded-full bg-white/[0.08]"
              aria-hidden="true"
            >
              <div className="fg-bar h-full w-1/3 rounded-full bg-[#D7FF3F]" />
            </div>
            <p className="mt-4 text-[15px] font-medium text-[#F5F5F3]">
              Confirming your payment with the studio…
            </p>
            <p className="mt-2 text-[13px] leading-6 text-white/55">
              The owner has been pinged and usually confirms within a couple of
              minutes. Your order is saved — you can keep this open.
            </p>
            <p className="mt-2 text-[12px] text-white/40 tabular-nums">Order {payment.code}</p>
            {longWait && (
              <p className="mt-3 rounded-[10px] border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-[13px] leading-6 text-white/60">
                Still waiting — the owner has been notified. This usually takes
                a couple of minutes; your order is saved and nothing is lost.
              </p>
            )}
            {notConfirmed && (
              <div className="mt-4 rounded-[10px] border border-amber-200/[0.14] bg-amber-200/[0.05] px-4 py-3">
                <p className="text-[13px] leading-6 text-amber-200/90">
                  Payment not confirmed — please check your UPI app that the
                  exact amount went through, then try again.
                </p>
                <button
                  type="button"
                  onClick={handleClaimPaid}
                  disabled={claiming}
                  className={cn(
                    "mt-3 flex min-h-[44px] w-full items-center justify-center gap-2 rounded-[10px] bg-[#D7FF3F] px-4 py-2.5 text-[14px] font-semibold text-[#080808]",
                    claiming ? "cursor-wait opacity-70" : "hover:opacity-95",
                  )}
                >
                  {claiming && <Loader2 className="h-4 w-4 animate-spin" />}
                  I&apos;ve paid — check again
                </button>
              </div>
            )}
            {statusMsg && <p className="mt-3 text-[13px] text-amber-200/80">{statusMsg}</p>}
          </div>
        )}

        {phase === "expired" && (
          <div className="mt-6 text-center">
            <p className="text-[15px] font-medium">This payment order expired</p>
            <p className="mt-2 text-[13px] leading-6 text-white/55">
              Nothing was charged. Create a new payment order to try again.
            </p>
            {statusMsg && <p className="mt-3 text-[13px] text-red-300/80">{statusMsg}</p>}
            <button
              type="button"
              onClick={handleReorder}
              disabled={reordering}
              className={cn(
                "mt-5 inline-flex w-full items-center justify-center gap-2 rounded-[10px] bg-[#D7FF3F] px-4 py-3 text-[14px] font-semibold text-[#080808]",
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
  );
}
