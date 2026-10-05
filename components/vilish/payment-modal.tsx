"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Copy, Loader2, RefreshCcw, Upload, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatINR } from "@/src/lib/vilish/types";
import {
  checkManualPayment,
  reorderManualPayment,
  submitManualPayment,
  uploadScreenshot,
  type ManualPayment,
} from "./payment";

type ModalPhase = "pay" | "paid-form" | "submitted" | "expired";

interface PaymentModalProps {
  jobId: string;
  initialPayment: ManualPayment;
  onClose: () => void;
  navigate: (url: string) => void;
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

export default function PaymentModal({ jobId, initialPayment, onClose, navigate }: PaymentModalProps) {
  const [payment, setPayment] = useState<ManualPayment>(initialPayment);
  const [phase, setPhase] = useState<ModalPhase>("pay");
  const [vpaCopied, setVpaCopied] = useState(false);
  const [utr, setUtr] = useState("");
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [statusMsg, setStatusMsg] = useState("");
  const [reordering, setReordering] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
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

  // poll for verification after the user submits
  useEffect(() => {
    if (phase !== "submitted") return;
    const tick = async () => {
      const status = await checkManualPayment(payment.code);
      if (!status) return;
      if (status === "PAYMENT_VERIFIED" || status === "GENERATION_QUEUED") {
        if (pollRef.current) clearInterval(pollRef.current);
        navigate(`/generation/${jobId}`);
      } else if (status === "PAYMENT_REJECTED") {
        if (pollRef.current) clearInterval(pollRef.current);
        setStatusMsg("Payment rejected — contact support");
      } else if (status === "AMOUNT_MISMATCH") {
        if (pollRef.current) clearInterval(pollRef.current);
        setStatusMsg("Amount mismatch — our team will resolve it");
      } else if (status === "PAYMENT_EXPIRED") {
        if (pollRef.current) clearInterval(pollRef.current);
        setPhase("expired");
      }
    };
    tick();
    pollRef.current = setInterval(tick, 3000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [phase, payment.code, jobId, navigate]);

  const copyVpa = async () => {
    try {
      await navigator.clipboard.writeText(payment.vpa);
      setVpaCopied(true);
      setTimeout(() => setVpaCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  };

  const handleSubmitPaid = async () => {
    setFormError("");
    const ref = utr.trim();
    if (ref.length < 6) {
      setFormError("Enter the UTR / reference number from your UPI payment (12 digits usually).");
      return;
    }
    setSubmitting(true);
    try {
      let screenshotAssetId: string | undefined;
      if (screenshot) {
        const up = await uploadScreenshot(screenshot);
        if (!up) {
          setFormError("Screenshot upload failed — try again or submit without it.");
          setSubmitting(false);
          return;
        }
        screenshotAssetId = up.assetId;
      }
      const ok = await submitManualPayment({ code: payment.code, utrReference: ref, screenshotAssetId });
      if (!ok) {
        setFormError("Could not submit your payment. Please try again.");
        return;
      }
      setPhase("submitted");
    } finally {
      setSubmitting(false);
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
      setUtr("");
      setScreenshot(null);
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
        className="w-full max-w-md rounded-t-[20px] border border-white/[0.1] bg-[#121214] p-6 sm:rounded-[20px]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-[17px] font-semibold">Pay with UPI</h2>
            <p className="mt-1 text-[12px] text-white/45 tabular-nums">Order {payment.code}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close payment dialog"
            className="rounded-[8px] p-1.5 text-white/50 hover:bg-white/[0.06] hover:text-white/85"
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

            <button
              type="button"
              onClick={() => setPhase("paid-form")}
              className="v-iris-bg mt-4 w-full rounded-[10px] px-4 py-3 text-[14px] font-semibold text-white hover:opacity-95"
            >
              I&apos;ve paid
            </button>
            <p className="mt-3 text-center text-[12px] text-white/35">
              Pay the exact amount, then tap “I&apos;ve paid”.
            </p>
          </>
        )}

        {phase === "paid-form" && (
          <div className="mt-5">
            <label htmlFor="utr" className="text-[13px] font-medium text-white/70">
              UTR / reference number
            </label>
            <input
              id="utr"
              type="text"
              value={utr}
              onChange={(e) => setUtr(e.target.value)}
              placeholder="e.g. 412345678901"
              inputMode="numeric"
              autoComplete="off"
              className="mt-2 w-full rounded-[10px] border border-white/[0.1] bg-[#0D0D0F] px-3.5 py-2.5 text-[14px] tabular-nums text-[#F5F5F3] placeholder:text-white/30 outline-none focus:border-white/30"
            />

            <label htmlFor="screenshot" className="mt-4 block text-[13px] font-medium text-white/70">
              Payment screenshot <span className="text-white/35">(optional)</span>
            </label>
            <label
              htmlFor="screenshot"
              className="mt-2 flex cursor-pointer items-center gap-2.5 rounded-[10px] border border-dashed border-white/[0.14] bg-[#0D0D0F] px-4 py-3 text-[13px] text-white/60 hover:border-white/30"
            >
              <Upload className="h-4 w-4 shrink-0" />
              {screenshot ? screenshot.name : "Upload screenshot"}
            </label>
            <input
              id="screenshot"
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(e) => setScreenshot(e.target.files?.[0] ?? null)}
            />

            {formError && <p className="mt-3 text-[13px] text-red-300/80">{formError}</p>}

            <button
              type="button"
              onClick={handleSubmitPaid}
              disabled={submitting}
              className={cn(
                "v-iris-bg mt-5 flex w-full items-center justify-center gap-2 rounded-[10px] px-4 py-3 text-[14px] font-semibold text-white",
                submitting ? "cursor-wait opacity-70" : "hover:opacity-95",
              )}
            >
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Submit payment
            </button>
            <button
              type="button"
              onClick={() => setPhase("pay")}
              className="mt-2 w-full rounded-[10px] px-4 py-2.5 text-[13px] text-white/55 hover:text-white/85"
            >
              Back
            </button>
          </div>
        )}

        {phase === "submitted" && (
          <div className="mt-6 text-center">
            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full border border-white/[0.12] bg-[#18181B]">
              <Loader2 className="h-5 w-5 animate-spin text-white/70" />
            </div>
            <p className="mt-4 text-[14px] leading-6 text-[#F5F5F3]">
              Payment submitted — waiting for confirmation. Your creation enters
              the generation queue after confirmation.
            </p>
            <p className="mt-2 text-[12px] text-white/40 tabular-nums">Order {payment.code}</p>
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
                "v-iris-bg mt-5 inline-flex w-full items-center justify-center gap-2 rounded-[10px] px-4 py-3 text-[14px] font-semibold text-white",
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
