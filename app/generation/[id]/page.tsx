"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Check,
  Copy,
  Download,
  Loader2,
  RefreshCcw,
  ShieldAlert,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  formatINR,
  type JobState,
} from "@/src/lib/vilish/types";
import {
  startManualPayment,
  type ManualPayment,
} from "@/components/vilish/payment";
import PaymentModal from "@/components/vilish/payment-modal";

interface JobPayload {
  id: string;
  state: JobState;
  prompt: string;
  aspectRatio: string;
  quality: string;
  customerPrice: number;
  outputUrl?: string;
  errorMessage?: string;
}

const STAGES = ["Quoted", "Paid", "Generating", "Ready"] as const;

function stageIndex(state: JobState): number {
  switch (state) {
    case "DRAFT":
    case "QUOTED":
    case "PAYMENT_PENDING":
      return 0;
    case "PAID":
    case "QUEUED":
    case "SUBMITTED":
      return 1;
    case "GENERATING":
    case "POST_PROCESSING":
      return 2;
    case "READY":
      return 3;
    default:
      return -1;
  }
}

function isFailed(state: JobState): boolean {
  return (
    state === "FAILED_PROVIDER" ||
    state === "FAILED_VALIDATION" ||
    state === "FAILED_TIMEOUT"
  );
}

function isTerminal(state: JobState): boolean {
  return state === "READY" || isFailed(state) || state === "REFUND_PENDING" || state === "REFUNDED";
}

export default function GenerationPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const [job, setJob] = useState<JobPayload | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [copied, setCopied] = useState(false);
  const [remakePaying, setRemakePaying] = useState(false);
  const [remakeStatus, setRemakeStatus] = useState("");
  const [remakeAuth, setRemakeAuth] = useState(false);
  const [modal, setModal] = useState<{ jobId: string; payment: ManualPayment } | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopPolling = () => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  };

  const fetchJob = useCallback(async () => {
    const res = await fetch(`/api/generation/${id}`, { cache: "no-store" });
    if (res.status === 404) {
      setNotFound(true);
      stopPolling();
      return;
    }
    if (!res.ok) return;
    const data: JobPayload = await res.json();
    setJob(data);
    if (isTerminal(data.state)) stopPolling();
  }, [id]);

  useEffect(() => {
    fetchJob();
    pollRef.current = setInterval(fetchJob, 2000);
    return stopPolling;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchJob]);

  const handleRemake = async () => {
    if (remakePaying) return;
    setRemakePaying(true);
    setRemakeStatus("");
    setRemakeAuth(false);
    try {
      const res = await fetch(`/api/generation/${id}/remake`, { method: "POST" });
      if (res.status === 404) {
        const body = await res.json().catch(() => null);
        setRemakeStatus(
          body?.code === "NO_REMAKE_CREDIT"
            ? "No remake credit on this job."
            : "Remake is not available for this job.",
        );
        return;
      }
      if (!res.ok) {
        setRemakeStatus("Could not create a remake. Please try again.");
        return;
      }
      const body: { quoteId: string; jobId: string; totalPaise: number } = await res.json();
      const startRes = await startManualPayment(body.quoteId);
      if (!startRes.ok) {
        if (startRes.error.kind === "unauthorized") {
          setRemakeAuth(true);
        } else if (startRes.error.kind === "intl") {
          setRemakeStatus("International payments coming soon — India (UPI) only for now.");
        } else {
          setRemakeStatus(startRes.error.message);
        }
        return;
      }
      setModal({ jobId: startRes.result.jobId, payment: startRes.result.payment });
    } finally {
      setRemakePaying(false);
    }
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  };

  const failed = job ? isFailed(job.state) : false;
  const idx = job ? stageIndex(job.state) : -1;

  return (
    <div className="min-h-screen bg-[#080808] font-sans text-[#F5F5F3] antialiased">
    <div className="mx-auto w-full max-w-3xl px-4 pb-16 pt-6 sm:pt-10">
      <Link
        href="/create"
        className="inline-flex items-center gap-1.5 text-[13px] text-white/55 hover:text-white/90"
      >
        <ArrowLeft className="h-4 w-4" strokeWidth={1.8} /> Back to create
      </Link>

      {notFound && (
        <p className="mt-10 text-[15px] text-white/60">
          This generation doesn&apos;t exist or you don&apos;t have access to it.
        </p>
      )}

      {!notFound && !job && (
        <div className="mt-10 flex items-center gap-3 text-[14px] text-white/50">
          <Loader2 className="h-5 w-5 animate-spin" /> Loading generation…
        </div>
      )}

      {job && (
        <div className="mt-6">
          {/* stage indicator */}
          {!failed && (
            <ol className="flex items-center gap-1 sm:gap-2" aria-label="Generation progress">
              {STAGES.map((s, i) => {
                const done = i < idx;
                const current = i === idx;
                return (
                  <li key={s} className="flex flex-1 items-center gap-1 sm:gap-2">
                    <div className="flex flex-1 flex-col gap-1.5">
                      <div
                        className={cn(
                          "h-1 rounded-full transition-colors",
                          done || current ? "v-iris-bg" : "bg-white/[0.08]",
                        )}
                      />
                      <span
                        className={cn(
                          "text-[11px] font-medium sm:text-[12px]",
                          done || current ? "text-[#F5F5F3]" : "text-white/35",
                        )}
                      >
                        {s}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ol>
          )}

          {failed ? (
            <div className="mt-6 rounded-[16px] border border-red-400/20 bg-[#18181B] p-6">
              <div className="flex items-center gap-2.5">
                <ShieldAlert className="h-5 w-5 text-red-300" strokeWidth={1.8} />
                <h2 className="text-[17px] font-semibold">This render failed</h2>
              </div>
              <p className="mt-3 text-[14px] leading-6 text-white/60">
                Failed renders are automatically refunded. You were not charged —
                the refund is processed back to your original payment method.
              </p>
              {job.errorMessage && (
                <p className="mt-3 text-[13px] text-white/40">{job.errorMessage}</p>
              )}
              <p className="mt-5 text-[13px] text-white/50">
                Paid <span className="font-semibold text-[#F5F5F3] tabular-nums">{formatINR(job.customerPrice)}</span>
              </p>
            </div>
          ) : (
            <>
              {/* artwork */}
              <div className="mt-6 overflow-hidden rounded-[16px] border border-white/[0.08] bg-[#121214]">
                {job.state === "READY" && job.outputUrl ? (
                  <img
                    src={job.outputUrl}
                    alt={job.prompt}
                    className="h-auto w-full object-contain"
                  />
                ) : (
                  <div className="v-gen-glow flex aspect-square items-center justify-center bg-[#0D0D0F]">
                    <p className="text-[14px] text-white/50">
                      {idx === 0 && "Awaiting payment…"}
                      {idx === 1 && "Paid — queued for rendering…"}
                      {idx === 2 && "Generating your image…"}
                    </p>
                  </div>
                )}
              </div>

              {/* prompt caption + meta */}
              <p className="mt-5 text-[15px] leading-7 text-[#F5F5F3]">{job.prompt}</p>
              <p className="mt-2 text-[13px] text-white/45 tabular-nums">
                {job.aspectRatio} · {job.quality} ·{" "}
                <span className="font-medium text-white/70">{formatINR(job.customerPrice)}</span>
              </p>

              {/* actions */}
              {job.state === "READY" && (
                <div className="mt-6">
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={handleRemake}
                      disabled={remakePaying}
                      className={cn(
                        "v-iris-bg inline-flex items-center gap-2 rounded-[10px] px-5 py-2.5 text-[14px] font-semibold text-white",
                        remakePaying ? "cursor-wait opacity-70" : "hover:opacity-95",
                      )}
                    >
                      {remakePaying ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <RefreshCcw className="h-4 w-4" />
                      )}
                      Remake · ₹19
                    </button>
                    {job.outputUrl && (
                      <a
                        href={job.outputUrl}
                        download
                        className="inline-flex items-center gap-2 rounded-[10px] border border-white/[0.12] bg-[#18181B] px-5 py-2.5 text-[14px] font-medium text-[#F5F5F3] hover:border-white/25"
                      >
                        <Download className="h-4 w-4" /> Download
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={copyLink}
                      className="inline-flex items-center gap-2 rounded-[10px] border border-white/[0.12] bg-[#18181B] px-5 py-2.5 text-[14px] font-medium text-[#F5F5F3] hover:border-white/25"
                    >
                      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      {copied ? "Copied" : "Copy link"}
                    </button>
                  </div>
                  {remakeStatus && (
                    <p className="mt-3 text-[13px] text-white/55" role="status">{remakeStatus}</p>
                  )}
                  {remakeAuth && (
                    <p className="mt-3 text-[13px] text-white/70">
                      <Link href="/api/auth/signin" className="underline underline-offset-4 hover:text-white">
                        Sign in to generate
                      </Link>
                    </p>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {modal && (
        <PaymentModal
          jobId={modal.jobId}
          initialPayment={modal.payment}
          onClose={() => setModal(null)}
          navigate={(url) => router.push(url)}
        />
      )}
    </div>
    </div>
  );
}
