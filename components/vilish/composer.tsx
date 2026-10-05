"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  formatINR,
  type AspectRatio,
  type QualityTier,
} from "@/src/lib/vilish/types";
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

  useEffect(() => {
    if (prompt.trim().length < 3) {
      setPhase("idle");
      setQuote(null);
      setAuthNeeded(false);
      return;
    }
    setPhase("loading");
    const t = setTimeout(() => runQuote(prompt.trim(), quality, aspectRatio), 600);
    return () => clearTimeout(t);
  }, [prompt, quality, aspectRatio, runQuote]);

  const handleGenerate = async () => {
    if (!quote || starting) return;
    setStarting(true);
    setStatus("");
    setAuthNeeded(false);
    try {
      if (ordersAccepting === false) {
        setStatus("New generation orders are temporarily paused.");
        return;
      }
      const res = await startManualPayment(quote.quoteId);
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
    }
  };

  const canGenerate = phase === "quoted" && !!quote && !starting && ordersAccepting !== false;

  return (
    <div
      className={cn(
        "w-full rounded-[20px] border border-white/[0.08] bg-[#121214] p-5 sm:p-6",
        "shadow-[0_0_0_1px_rgba(0,0,0,0.4),0_24px_64px_-24px_rgba(0,0,0,0.8)]",
        className,
      )}
    >
      <label htmlFor="vidish-prompt" className="sr-only">
        Describe the image you want to create
      </label>
      <textarea
        id="vidish-prompt"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="What do you want to make?"
        rows={variant === "hero" ? 3 : 4}
        className="w-full resize-none bg-transparent text-[15px] leading-6 text-[#F5F5F3] placeholder:text-white/30 outline-none"
      />

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
                  ? "v-iris-bg text-white"
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
                  ? "v-iris-border text-[#F5F5F3]"
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
            "v-iris-bg inline-flex shrink-0 items-center gap-2 rounded-[10px] px-5 py-2.5",
            "text-[14px] font-semibold text-white transition-opacity",
            canGenerate ? "hover:opacity-95 active:opacity-90" : "cursor-not-allowed opacity-40",
          )}
        >
          {starting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          Generate
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
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
