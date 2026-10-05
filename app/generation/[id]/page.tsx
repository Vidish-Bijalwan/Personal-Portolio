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
  Pencil,
  RefreshCcw,
  Send,
  ShieldAlert,
} from "lucide-react";
import { cn } from "@/lib/utils";
import VilishNav from "@/components/vilish/nav";
import VilishFooter from "@/components/vilish/footer";
import { formatINR } from "@/src/lib/vilish/types";
import {
  startManualPayment,
  type ManualPayment,
} from "@/components/vilish/payment";
import PaymentModal from "@/components/vilish/payment-modal";
import AuthModal from "@/components/vilish/auth-modal";

interface JobPayload {
  id: string;
  state: string;
  prompt: string;
  aspectRatio: string;
  quality: string;
  customerPrice: number;
  outputUrl?: string;
  errorMessage?: string;
  clarificationRequest?: string;
  clarificationResponse?: string;
}

/* Truthful customer timeline (contract §6). */
const PIPELINE = [
  "Order created",
  "Payment confirmed",
  "Creative review",
  "Generating",
  "Quality check",
  "Ready",
] as const;

function pipelineIndex(state: string): number {
  switch (state) {
    case "DRAFT":
    case "QUOTED":
      return 0;
    case "PAYMENT_PENDING":
    case "PAYMENT_SUBMITTED":
    case "PAID":
      return 1;
    case "AWAITING_OPERATOR_REVIEW":
    case "NEEDS_CLARIFICATION":
      return 2;
    case "APPROVED_FOR_GENERATION":
    case "GENERATING":
    case "QUEUED":
    case "SUBMITTED":
      return 3;
    case "RESULT_UPLOADED":
    case "OPERATOR_QC":
    case "POST_PROCESSING":
      return 4;
    case "READY":
      return 5;
    default:
      return -1;
  }
}

function statusCopy(state: string): string {
  switch (state) {
    case "DRAFT":
    case "QUOTED":
      return "Draft";
    case "PAYMENT_PENDING":
    case "PAYMENT_SUBMITTED":
      return "Payment pending";
    case "PAID":
      return "Payment confirmed — we received your order.";
    case "AWAITING_OPERATOR_REVIEW":
      return "Creative review — your references and instructions are being checked.";
    case "APPROVED_FOR_GENERATION":
    case "GENERATING":
      return "Generating — your media is being created.";
    case "RESULT_UPLOADED":
    case "OPERATOR_QC":
      return "Quality check — we're reviewing the output before delivery.";
    case "READY":
      return "Ready";
    case "NEEDS_CLARIFICATION":
      return "We need a quick clarification before we continue.";
    case "REJECTED":
    case "REFUND_REQUIRED":
    case "REFUNDED":
    case "REFUND_PENDING":
      return "Refunded / cancelled — we'll reach out with next steps.";
    default:
      return "Processing your order.";
  }
}

function isFailed(state: string): boolean {
  return (
    state === "FAILED_PROVIDER" ||
    state === "FAILED_VALIDATION" ||
    state === "FAILED_TIMEOUT"
  );
}

function isTerminal(state: string): boolean {
  return (
    state === "READY" ||
    isFailed(state) ||
    state === "REFUND_PENDING" ||
    state === "REFUNDED" ||
    state === "REJECTED" ||
    state === "REFUND_REQUIRED"
  );
}

function isVideoUrl(url?: string) {
  return !!url && /\.(mp4|mov|webm)(\?|$)/i.test(url);
}

export default function GenerationPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const [job, setJob] = useState<JobPayload | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [copied, setCopied] = useState(false);
  const [turnaround, setTurnaround] = useState("");

  // remake
  const [remakePaying, setRemakePaying] = useState(false);
  const [remakeStatus, setRemakeStatus] = useState("");
  const [remakeAuth, setRemakeAuth] = useState(false);
  const [modal, setModal] = useState<{ jobId: string; payment: ManualPayment } | null>(null);

  // edit
  const [editOpen, setEditOpen] = useState(false);
  const [revision, setRevision] = useState("");
  const [editBusy, setEditBusy] = useState(false);
  const [editError, setEditError] = useState("");

  // clarification response
  const [clarifyMsg, setClarifyMsg] = useState("");
  const [clarifyBusy, setClarifyBusy] = useState(false);
  const [clarifyError, setClarifyError] = useState("");
  const [clarifyDone, setClarifyDone] = useState(false);

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

  useEffect(() => {
    fetch("/api/config/public", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((b) => {
        if (b?.turnaround) setTurnaround(String(b.turnaround));
      })
      .catch(() => {});
  }, []);

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
        } else if (startRes.error.kind === "paused") {
          setRemakeStatus("New generation orders are temporarily paused.");
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

  const handleEdit = async () => {
    if (editBusy) return;
    setEditBusy(true);
    setEditError("");
    try {
      const res = await fetch(`/api/generation/${id}/edit`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(
          revision.trim() ? { revision: revision.trim() } : {},
        ),
      });
      if (!res.ok) {
        setEditError("Could not start an edit. Please try again.");
        return;
      }
      const body = await res.json().catch(() => null);
      const childId: string | undefined = body?.id ?? body?.jobId;
      if (!childId) {
        setEditError("Could not start an edit. Please try again.");
        return;
      }
      router.push(`/generation/${childId}`);
    } catch {
      setEditError("Network error. Try again.");
    } finally {
      setEditBusy(false);
    }
  };

  const handleClarify = async () => {
    const msg = clarifyMsg.trim();
    if (!msg || clarifyBusy) return;
    setClarifyBusy(true);
    setClarifyError("");
    try {
      const res = await fetch(`/api/fulfillment/${id}/respond`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ message: msg }),
      });
      if (!res.ok) {
        setClarifyError("Could not send your reply. Please try again.");
        return;
      }
      setClarifyDone(true);
      fetchJob();
    } catch {
      setClarifyError("Network error. Try again.");
    } finally {
      setClarifyBusy(false);
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
  const refunded = job
    ? ["REJECTED", "REFUND_REQUIRED", "REFUND_PENDING", "REFUNDED"].includes(job.state)
    : false;
  const idx = job ? pipelineIndex(job.state) : -1;
  const needsClarification = job?.state === "NEEDS_CLARIFICATION";
  const video = isVideoUrl(job?.outputUrl);

  return (
    <div className="flex min-h-screen flex-col bg-[#080808] font-sans text-[#F5F5F3] antialiased">
      <VilishNav />
      <div className="mx-auto w-full max-w-3xl flex-1 px-4 pb-16 pt-6 sm:pt-10">
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
            {/* status line */}
            <p className="text-[14px] font-medium text-[#F5F5F3]" role="status">
              {statusCopy(job.state)}
            </p>

            {/* stage indicator */}
            {!failed && !refunded && idx >= 0 && (
              <div className="mt-4">
                <div className="sm:hidden">
                  <p className="text-[12px] font-medium text-white/70" role="status">
                    Step {idx + 1} of {PIPELINE.length}: {PIPELINE[idx]}
                  </p>
                  <div
                    className="mt-2 h-1 overflow-hidden rounded-full bg-white/[0.08]"
                    aria-hidden
                  >
                    <div
                      className="h-full rounded-full bg-[#D7FF3F]"
                      style={{ width: `${((idx + 1) / PIPELINE.length) * 100}%` }}
                    />
                  </div>
                </div>
                <ol
                  className="hidden items-center gap-1 sm:flex sm:gap-2"
                  aria-label="Generation progress"
                >
                {PIPELINE.map((s, i) => {
                  const done = i < idx;
                  const current = i === idx;
                  return (
                    <li key={s} className="flex flex-1 items-center gap-1 sm:gap-2">
                      <div className="flex flex-1 flex-col gap-1.5">
                        <div
                          className={cn(
                            "h-1 rounded-full transition-colors",
                            done || current ? "bg-[#D7FF3F]" : "bg-white/[0.08]",
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
              </div>
            )}

            {/* clarification request */}
            {needsClarification && (
              <div className="mt-6 rounded-[16px] border border-amber-300/25 bg-amber-300/[0.05] p-6">
                <h2 className="text-[15px] font-semibold text-amber-100">
                  Quick question before we continue
                </h2>
                {job.clarificationRequest && (
                  <p className="mt-2 whitespace-pre-wrap text-[14px] leading-6 text-white/80">
                    {job.clarificationRequest}
                  </p>
                )}
                {clarifyDone ? (
                  <p className="mt-4 text-[13px] text-emerald-200/90">
                    Thanks — your reply is with our team. We&apos;ll continue
                    your order shortly.
                  </p>
                ) : (
                  <div className="mt-4">
                    <label htmlFor="clarify-reply" className="sr-only">
                      Your reply
                    </label>
                    <textarea
                      id="clarify-reply"
                      value={clarifyMsg}
                      onChange={(e) => setClarifyMsg(e.target.value)}
                      rows={3}
                      placeholder="Type your reply…"
                      className="w-full resize-y rounded-[10px] border border-white/[0.12] bg-[#0D0D0F] px-3.5 py-2.5 text-[14px] text-[#F5F5F3] placeholder:text-white/30 outline-none focus:border-white/30"
                    />
                    {clarifyError && (
                      <p className="mt-2 text-[13px] text-red-300/80">{clarifyError}</p>
                    )}
                    <button
                      type="button"
                      onClick={handleClarify}
                      disabled={clarifyBusy || !clarifyMsg.trim()}
                      className="mt-3 inline-flex items-center gap-2 rounded-[10px] bg-[#D7FF3F] px-5 py-2.5 text-[14px] font-semibold text-[#080808] hover:opacity-95 disabled:opacity-40"
                    >
                      {clarifyBusy ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                      Send reply
                    </button>
                  </div>
                )}
              </div>
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
            ) : refunded ? (
              <div className="mt-6 rounded-[16px] border border-white/[0.1] bg-[#18181B] p-6">
                <h2 className="text-[17px] font-semibold">Refunded / cancelled</h2>
                <p className="mt-3 text-[14px] leading-6 text-white/60">
                  {statusCopy(job.state)}
                </p>
                <p className="mt-5 text-[13px] text-white/50">
                  Paid <span className="font-semibold text-[#F5F5F3] tabular-nums">{formatINR(job.customerPrice)}</span>
                </p>
              </div>
            ) : (
              <>
                {/* artwork */}
                <div className="mt-6 overflow-hidden rounded-[16px] border border-white/[0.08] bg-[#121214]">
                  {job.state === "READY" && job.outputUrl ? (
                    video ? (
                      <video
                        src={job.outputUrl}
                        controls
                        playsInline
                        preload="metadata"
                        className="h-auto w-full"
                      />
                    ) : (
                      <img
                        src={job.outputUrl}
                        alt={job.prompt}
                        className="h-auto w-full object-contain"
                      />
                    )
                  ) : (
                    <div className="flex min-h-[240px] items-center justify-center bg-[#0D0D0F] p-6">
                      <div className="w-full max-w-sm rounded-[14px] border border-white/[0.08] bg-[#121214] p-5">
                        <p role="status" className="text-[14px] font-semibold text-[#F5F5F3]">
                          {statusCopy(job.state)}
                        </p>
                        <p className="mt-2 text-[13px] leading-6 text-white/55">
                          What happens next:{" "}
                          <span className="text-white/80">
                            human review → creation → quality check
                          </span>
                          , then your finished piece is delivered to you.
                        </p>
                        <p className="mt-3 text-[12px] leading-5 text-white/40">
                          Your order is queued and safe — no need to keep this
                          page open.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* prompt caption + meta */}
                <p className="mt-5 text-[15px] leading-7 text-[#F5F5F3]">{job.prompt}</p>
                <p className="mt-2 text-[13px] text-white/45 tabular-nums">
                  {job.aspectRatio} · {job.quality} ·{" "}
                  <span className="font-medium text-white/70">{formatINR(job.customerPrice)}</span>
                </p>
                <p className="mt-2 text-[12px] leading-5 text-white/40">
                  AI generation with human quality review. Every paid generation
                  is reviewed before delivery.
                  {turnaround ? ` ${turnaround}` : ""}
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
                          "inline-flex items-center gap-2 rounded-[10px] bg-[#D7FF3F] px-5 py-2.5 text-[14px] font-semibold text-[#080808]",
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
                      <button
                        type="button"
                        onClick={() => setEditOpen((v) => !v)}
                        className="inline-flex items-center gap-2 rounded-[10px] border border-white/[0.12] bg-[#18181B] px-5 py-2.5 text-[14px] font-medium text-[#F5F5F3] hover:border-white/25"
                      >
                        <Pencil className="h-4 w-4" /> Edit
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

                    {editOpen && (
                      <div className="mt-4 rounded-[12px] border border-white/[0.08] bg-[#121214] p-4">
                        <label htmlFor="edit-revision" className="text-[13px] font-medium text-white/70">
                          What should change? <span className="text-white/35">(optional)</span>
                        </label>
                        <textarea
                          id="edit-revision"
                          value={revision}
                          onChange={(e) => setRevision(e.target.value)}
                          rows={3}
                          placeholder="e.g. warmer tones, add a mountain in the background…"
                          className="mt-2 w-full resize-y rounded-[10px] border border-white/[0.1] bg-[#0D0D0F] px-3.5 py-2.5 text-[14px] text-[#F5F5F3] placeholder:text-white/30 outline-none focus:border-white/30"
                        />
                        {editError && (
                          <p className="mt-2 text-[13px] text-red-300/80">{editError}</p>
                        )}
                        <button
                          type="button"
                          onClick={handleEdit}
                          disabled={editBusy}
                          className="mt-3 inline-flex items-center gap-2 rounded-[10px] bg-[#D7FF3F] px-5 py-2.5 text-[14px] font-semibold text-[#080808] hover:opacity-95 disabled:opacity-40"
                        >
                          {editBusy && <Loader2 className="h-4 w-4 animate-spin" />}
                          Start edit
                        </button>
                      </div>
                    )}

                    {remakeStatus && (
                      <p className="mt-3 text-[13px] text-white/55" role="status">{remakeStatus}</p>
                    )}
                    {/* Lazy auth: sign-in required only at pay time; the pending
                        remake payment resumes automatically afterwards. */}
                    <AuthModal
                      open={remakeAuth}
                      onClose={() => setRemakeAuth(false)}
                      onAuthenticated={() => {
                        setRemakeAuth(false);
                        void handleRemake();
                      }}
                    />
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
      <VilishFooter />
    </div>
  );
}