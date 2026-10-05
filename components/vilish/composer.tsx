"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2, Paperclip, Sparkles, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  formatINR,
  type AspectRatio,
  type QualityTier,
} from "@/src/lib/vilish/types";
import {
  ATTACH_MAX_FILES,
  ATTACH_MAX_FILE_BYTES,
  ATTACH_MAX_TOTAL_BYTES,
  validateUploads,
} from "@/src/lib/vilish/attachments";
import {
  PROMPT_MAX_LENGTH,
  countPromptChars,
  formatPromptCount,
} from "@/src/lib/vilish/prompt-limits";
import {
  startManualPayment,
  type ManualPayment,
} from "./payment";
import PaymentModal from "./payment-modal";
import AuthModal from "./auth-modal";

const QUALITIES: { id: QualityTier; label: string; hint: string }[] = [
  { id: "quick", label: "Quick", hint: "Fast drafts" },
  { id: "studio", label: "Studio", hint: "Balanced" },
  { id: "cinema", label: "Cinema", hint: "Best quality" },
];

const ASPECTS: { id: AspectRatio; label: string }[] = [
  { id: "1:1", label: "1:1" },
  { id: "4:5", label: "4:5" },
  { id: "9:16", label: "9:16" },
  { id: "16:9", label: "16:9" },
];

type QuotePhase =
  | "idle"
  | "loading"
  | "quoted"
  | "blocked"
  | "unavailable";

interface QuoteResult {
  quoteId: string;
  totalPaise: number;
  expiresAt: string;
}

interface ComposerProps {
  variant?: "hero" | "page";
  className?: string;
}

const ACCEPT_ATTR = ".png,.jpg,.jpeg,.webp,.gif,.pdf,.doc,.docx,.txt,.md";

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function Composer({ variant = "hero", className }: ComposerProps) {
  const router = useRouter();
  const [prompt, setPrompt] = useState("");
  const [quality, setQuality] = useState<QualityTier>("studio");
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("1:1");
  const [phase, setPhase] = useState<QuotePhase>("idle");
  const [quote, setQuote] = useState<QuoteResult | null>(null);
  const [starting, setStarting] = useState(false);
  const [status, setStatus] = useState("");
  const [authNeeded, setAuthNeeded] = useState(false);
  const [modal, setModal] = useState<{ jobId: string; payment: ManualPayment } | null>(null);
  const [ordersAccepting, setOrdersAccepting] = useState<boolean | null>(null);
  const [turnaround, setTurnaround] = useState("");
  const abortRef = useRef<AbortController | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // reference attachments (stored with the order, shown to the operator)
  const [files, setFiles] = useState<File[]>([]);
  const [fileError, setFileError] = useState("");
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  // public fulfillment config: turnaround copy + paused gate
  useEffect(() => {
    fetch("/api/config/public", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((b) => {
        if (!b) return;
        setOrdersAccepting(b.ordersAccepting !== false);
        if (typeof b.turnaround === "string") setTurnaround(b.turnaround);
      })
      .catch(() => {});
  }, []);

  const runQuote = useCallback(async (text: string, q: QualityTier, ar: AspectRatio) => {
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    try {
      const interpretRes = await fetch("/api/creative/interpret", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ prompt: text, aspectRatio: ar, quality: q }),
        signal: ctrl.signal,
      });

      if (interpretRes.status === 400) {
        const body = await interpretRes.json().catch(() => null);
        if (body?.code === "MODERATION_BLOCKED") {
          setPhase("blocked");
          setQuote(null);
          return;
        }
      }
      if (!interpretRes.ok) {
        setPhase("unavailable");
        setQuote(null);
        return;
      }
      const spec = await interpretRes.json();

      const quoteRes = await fetch("/api/generation/quote", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ spec }),
        signal: ctrl.signal,
      });
      if (!quoteRes.ok) {
        setPhase("unavailable");
        setQuote(null);
        return;
      }
      const qbody = await quoteRes.json();
      setQuote({ quoteId: qbody.quoteId, totalPaise: qbody.totalPaise, expiresAt: qbody.expiresAt });
      setPhase("quoted");
    } catch (e) {
      if ((e as Error)?.name === "AbortError") return;
      setPhase("unavailable");
      setQuote(null);
    }
  }, []);

  const overLimit = countPromptChars(prompt) > PROMPT_MAX_LENGTH;

  useEffect(() => {
    if (prompt.trim().length < 3 || overLimit) {
      setPhase("idle");
      setQuote(null);
      setAuthNeeded(false);
      return;
    }
    setPhase("loading");
    const t = setTimeout(() => runQuote(prompt.trim(), quality, aspectRatio), 600);
    return () => clearTimeout(t);
  }, [prompt, quality, aspectRatio, overLimit, runQuote]);

  const addFiles = useCallback((picked: File[]) => {
    if (picked.length === 0) return;
    setFiles((prev) => {
      const next = [...prev, ...picked];
      const check = validateUploads(
        next.map((f) => ({ name: f.name, size: f.size, type: f.type }))
      );
      if (!check.ok) {
        setFileError(check.message ?? "Those files couldn't be attached.");
        return prev;
      }
      setFileError("");
      return next;
    });
  }, []);

  const removeFile = useCallback((index: number) => {
    setFiles((prev) => {
      const next = prev.filter((_, i) => i !== index);
      const check = validateUploads(
        next.map((f) => ({ name: f.name, size: f.size, type: f.type }))
      );
      setFileError(check.ok ? "" : (check.message ?? ""));
      return next;
    });
  }, []);

  const handleGenerate = async () => {
    if (!quote || starting) return;
    if (overLimit) {
      setStatus(
        `That prompt is over the ${PROMPT_MAX_LENGTH.toLocaleString("en-IN")}-character limit — shorten it first.`
      );
      return;
    }
    setStarting(true);
    setStatus("");
    setAuthNeeded(false);
    try {
      if (ordersAccepting === false) {
        setStatus("New generation orders are temporarily paused.");
        return;
      }
      if (files.length > 0) setUploadProgress(0);
      const res = await startManualPayment(quote.quoteId, "IN", {
        files,
        onProgress: (f) => setUploadProgress(f),
      });
      setUploadProgress(null);
      if (!res.ok) {
        if (res.error.kind === "unauthorized") {
          setAuthNeeded(true);
        } else if (res.error.kind === "paused") {
          setStatus("New generation orders are temporarily paused.");
        } else if (res.error.kind === "intl") {
          setStatus("International payments coming soon — India (UPI) only for now.");
        } else {
          setStatus(res.error.message);
        }
        return;
      }
      setModal({ jobId: res.result.jobId, payment: res.result.payment });
    } finally {
      setStarting(false);
      setUploadProgress(null);
    }
  };

  const canGenerate = phase === "quoted" && !!quote && !starting && ordersAccepting !== false && !overLimit;

  return (
    <div
      className={cn(
        "w-full rounded-[20px] border border-white/[0.08] bg-[#121214] p-5 sm:p-6",
        "shadow-[0_0_0_1px_rgba(0,0,0,0.4),0_24px_64px_-24px_rgba(0,0,0,0.8)]",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <label htmlFor="vidish-prompt" className="sr-only">
          Describe the image you want to create
        </label>
        <p
          className={cn(
            "shrink-0 pt-0.5 text-[12px] tabular-nums",
            overLimit ? "font-medium text-red-300/90" : "text-white/35"
          )}
          aria-live="polite"
        >
          {formatPromptCount(prompt)}
        </p>
      </div>
      <textarea
        id="vidish-prompt"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="What do you want to make?"
        rows={variant === "hero" ? 3 : 4}
        maxLength={PROMPT_MAX_LENGTH}
        aria-invalid={overLimit}
        aria-describedby="vidish-prompt-limit"
        className="w-full resize-none bg-transparent text-[15px] leading-6 text-[#F5F5F3] placeholder:text-white/30 outline-none"
      />
      {overLimit && (
        <p id="vidish-prompt-limit" className="mt-2 text-[13px] text-red-300/90" role="alert">
          That&apos;s over the {PROMPT_MAX_LENGTH.toLocaleString("en-IN")}-character
          limit — shorten it to see your price.
        </p>
      )}

      {/* reference attachments */}
      <div className="mt-3">
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={ACCEPT_ATTR}
          className="sr-only"
          aria-label="Attach reference files"
          onChange={(e) => {
            addFiles(Array.from(e.target.files ?? []));
            e.target.value = "";
          }}
        />
        {files.length > 0 && (
          <ul className="mb-2.5 flex flex-wrap gap-2" aria-label="Attached files">
            {files.map((f, i) => (
              <li
                key={`${f.name}-${f.size}-${i}`}
                className="inline-flex max-w-full items-center gap-2 rounded-[10px] border border-white/[0.1] bg-[#0D0D0F] py-1.5 pl-3 pr-1.5"
              >
                <span className="min-w-0">
                  <span className="block max-w-[180px] truncate text-[12px] font-medium text-white/80">
                    {f.name}
                  </span>
                  <span className="block text-[11px] text-white/40 tabular-nums">
                    {formatBytes(f.size)}
                  </span>
                </span>
                <button
                  type="button"
                  onClick={() => removeFile(i)}
                  aria-label={`Remove ${f.name}`}
                  className="rounded-[6px] p-1.5 text-white/45 hover:bg-white/[0.06] hover:text-white/90"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </li>
            ))}
          </ul>
        )}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={files.length >= ATTACH_MAX_FILES}
            className="inline-flex items-center gap-1.5 rounded-[8px] border border-white/[0.1] bg-[#0D0D0F] px-3 py-1.5 text-[12px] font-medium text-white/60 transition-colors hover:border-white/25 hover:text-white/90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Paperclip className="h-3.5 w-3.5" />
            {files.length === 0
              ? "Attach references"
              : `Add more (${files.length}/${ATTACH_MAX_FILES})`}
          </button>
          <span className="text-[11px] text-white/35">
            Images, PDF, docs or notes · {formatBytes(ATTACH_MAX_FILE_BYTES)} each ·{" "}
            {formatBytes(ATTACH_MAX_TOTAL_BYTES)} total — the creator sees them with your brief.
          </span>
        </div>
        {fileError && (
          <p className="mt-2 text-[13px] text-red-300/90" role="alert">
            {fileError}
          </p>
        )}
      </div>

      {/* controls row */}
      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-3">
        {/* quality segmented control */}
        <div
          role="group"
          aria-label="Quality"
          className="flex rounded-[10px] border border-white/[0.08] bg-[#0D0D0F] p-1"
        >
          {QUALITIES.map((qt) => (
            <button
              key={qt.id}
              type="button"
              onClick={() => setQuality(qt.id)}
              aria-pressed={quality === qt.id}
              title={qt.hint}
              className={cn(
                "rounded-[8px] px-3 py-1.5 text-[13px] font-medium transition-colors",
                quality === qt.id
                  ? "bg-[#D7FF3F] text-[#080808]"
                  : "text-white/55 hover:text-white/85",
              )}
            >
              {qt.label}
            </button>
          ))}
        </div>

        {/* aspect ratio pills */}
        <div role="group" aria-label="Aspect ratio" className="flex flex-wrap gap-1.5">
          {ASPECTS.map((ar) => (
            <button
              key={ar.id}
              type="button"
              onClick={() => setAspectRatio(ar.id)}
              aria-pressed={aspectRatio === ar.id}
              className={cn(
                "rounded-full border px-3 py-1 text-[12px] font-medium tabular-nums transition-colors",
                aspectRatio === ar.id
                  ? "border-[#D7FF3F]/60 bg-[#D7FF3F]/[0.08] text-[#F5F5F3]"
                  : "border-white/[0.08] text-white/50 hover:border-white/20 hover:text-white/80",
              )}
            >
              {ar.label}
            </button>
          ))}
        </div>
      </div>

      {/* price + generate row */}
      <div className="mt-5 flex items-center justify-between gap-4 border-t border-white/[0.06] pt-4">
        <div className="min-w-0">
          {phase === "loading" && (
            <p className="text-[13px] text-white/40 tabular-nums">
              Estimated <span className="text-[#F5F5F3]">₹29</span>
              <span className="ml-2 inline-block h-3 w-3 animate-spin rounded-full border-2 border-white/20 border-t-white/70 align-[-1px]" />
            </p>
          )}
          {phase === "idle" && (
            <p className="text-[13px] text-white/40 tabular-nums">
              Estimated <span className="text-[#F5F5F3]">₹29</span>
            </p>
          )}
          {phase === "quoted" && quote && (
            <p key={quote.totalPaise} className="v-price-swap text-[13px] text-white/60 tabular-nums">
              Exact price{" "}
              <span className="text-[18px] font-semibold text-[#F5F5F3]">
                {formatINR(quote.totalPaise)}
              </span>
            </p>
          )}
          {phase === "blocked" && (
            <p className="text-[13px] text-red-300/80">
              That prompt was blocked by content moderation.
            </p>
          )}
          {phase === "unavailable" && (
            <p className="text-[13px] text-white/50">
              Price unavailable right now — try again in a moment.
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={handleGenerate}
          disabled={!canGenerate}
          className={cn(
            "inline-flex shrink-0 items-center gap-2 rounded-[10px] bg-[#D7FF3F] px-5 py-2.5",
            "text-[14px] font-semibold text-[#080808] transition-opacity",
            canGenerate ? "hover:opacity-95 active:opacity-90" : "cursor-not-allowed opacity-40",
          )}
        >
          {starting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          Generate
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
      {uploadProgress !== null && (
        <div className="mt-4" role="status" aria-label="Uploading reference files">
          <div className="flex items-center justify-between text-[12px] text-white/55 tabular-nums">
            <span>Uploading reference files…</span>
            <span>{Math.round(uploadProgress * 100)}%</span>
          </div>
          <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-white/[0.08]">
            <div
              className="h-full rounded-full bg-[#D7FF3F] transition-[width] motion-reduce:transition-none"
              style={{ width: `${Math.round(uploadProgress * 100)}%` }}
            />
          </div>
        </div>
      )}
      {status && (
        <p className="mt-3 text-[13px] text-white/55" role="status">
          {status}
        </p>
      )}
      {/* Lazy auth: login is required only at submit time. After sign-in the
          pending generate action resumes automatically. */}
      <AuthModal
        open={authNeeded}
        onClose={() => setAuthNeeded(false)}
        onAuthenticated={() => {
          setAuthNeeded(false);
          void handleGenerate();
        }}
      />
      {phase === "quoted" && quote && (
        <>
          <p className="mt-3 text-[12px] text-white/35">
            No subscription · Pay once for this render · Failed renders refunded
          </p>
          <p className="mt-1.5 text-[12px] leading-5 text-white/35">
            AI generation with human quality review — every paid generation is
            reviewed before delivery.
            {turnaround ? ` ${turnaround}` : ""}
          </p>
        </>
      )}
      {ordersAccepting === false && (
        <p className="mt-3 text-[13px] font-medium text-amber-200/90" role="status">
          New generation orders are temporarily paused.
        </p>
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
  );
}
