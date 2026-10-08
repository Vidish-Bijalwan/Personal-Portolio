"use client";

import { lazy, Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Clapperboard, Loader2, Paperclip, Sparkles, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTypewriterPlaceholder } from "./use-typewriter-placeholder";
import {
  formatINR,
  type AspectRatio,
  type QualityTier,
} from "@/src/lib/vilish/types";
import {
  COMPOSER_SERVICES,
  composerServiceById,
  priceOf,
  servicePricePaise,
  type ComposerServiceId,
} from "@/src/lib/pricing/catalog";
import type { Template } from "@/src/lib/trends/templates";
import {
  VIDEO_DURATION_MAX_S,
  VIDEO_DURATION_MIN_S,
  videoClipPricePaise,
} from "@/src/lib/pricing/engine";
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
  MISSING_REFERENCE_MESSAGE,
  needsReferencePhoto,
  referenceFieldState,
} from "@/lib/person-reference";
import {
  UPLOAD_EDGE_LIMIT_BYTES,
  type ManualPayment,
} from "./payment";
import PaymentModal from "./payment-modal";
import AuthModal from "./auth-modal";

const QUALITIES: { id: QualityTier; label: string; hint: string }[] = [
  { id: "quick", label: "Quick", hint: "Fast drafts" },
  { id: "studio", label: "Studio", hint: "Balanced" },
  { id: "cinema", label: "Cinema", hint: "Best quality" },
];

const IMAGE_ASPECTS: { id: AspectRatio; label: string }[] = [
  { id: "1:1", label: "1:1" },
  { id: "4:5", label: "4:5" },
  { id: "9:16", label: "9:16" },
  { id: "16:9", label: "16:9" },
];

/** Aspect ratios offered for video clips. */
const VIDEO_ASPECTS: { id: AspectRatio; label: string }[] = [
  { id: "9:16", label: "9:16" },
  { id: "16:9", label: "16:9" },
  { id: "1:1", label: "1:1" },
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

type MediaMode = "image" | "video";
type BillingMode = "free" | "paid";

interface ComposerProps {
  variant?: "hero" | "page";
  className?: string;
  /** Deep-link support, e.g. /create?media=video from the pricing page. */
  initialMedia?: MediaMode;
  /** Deep-link support, e.g. /create?service=product-photo — selects the
   *  paid image service. Only applies when initialMedia is "image". */
  initialService?: ComposerServiceId;
  /** Trend-template deep link, e.g. /create?template=neon-noir-portrait —
   *  pre-fills the prompt and aspect. The service comes from the template. */
  initialTemplate?: Template;
  /** Raw prompt deep link, e.g. /create?prompt=... from the watch-room remix
   *  fallback — pre-fills the prompt box. Template wins when both are set. */
  initialPrompt?: string;
}

const ACCEPT_ATTR = ".png,.jpg,.jpeg,.webp,.gif,.pdf,.doc,.docx,.txt,.md";

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const VideoStudioPanel = lazy(() => import("./video-studio-panel"));

export default function Composer({ variant = "hero", className, initialMedia = "image", initialService, initialTemplate, initialPrompt }: ComposerProps) {
  const router = useRouter();
  const [prompt, setPrompt] = useState(initialTemplate?.prompt ?? initialPrompt ?? "");
  const [quality, setQuality] = useState<QualityTier>("studio");
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>(
    initialTemplate?.aspect ?? (initialMedia === "video" ? "9:16" : "1:1")
  );
  // Paid image service: single-image | 4-pack | product-photo. The estimate
  // and the server quote both derive from the price catalog — never hardcoded.
  const [service, setService] = useState<ComposerServiceId>(
    initialService ?? "single-image"
  );
  const [phase, setPhase] = useState<QuotePhase>("idle");
  const [quote, setQuote] = useState<QuoteResult | null>(null);
  const [starting, setStarting] = useState(false);
  const [status, setStatus] = useState("");
  const [authNeeded, setAuthNeeded] = useState(false);
  const [pendingAuth, setPendingAuth] = useState<"paid" | "free" | "video" | null>(null);
  const [ordersAccepting, setOrdersAccepting] = useState<boolean | null>(null);
  const [turnaround, setTurnaround] = useState("");
  const abortRef = useRef<AbortController | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── free trial + media mode ──────────────────────────────────────────────
  const [mediaMode, setMediaMode] = useState<MediaMode>(initialMedia);
  const [billingMode, setBillingMode] = useState<BillingMode>("paid");
  const [freeLeft, setFreeLeft] = useState<number | null>(null);
  const [freeCap, setFreeCap] = useState(3);
  const [freeSending, setFreeSending] = useState(false);
  const [videoSending, setVideoSending] = useState(false);
  // Clip length for paid video clips: 5..60s. The unlock price scales with
  // it (engine videoClipPricePaise); the API validates the same range.
  const [videoDuration, setVideoDuration] = useState(VIDEO_DURATION_MIN_S);
  // Inline Video Studio: renders the edit-video tools here instead of
  // navigating away.
  const [showVideoStudio, setShowVideoStudio] = useState(false);

  // reference attachments (stored with the order, shown to the operator)
  const [files, setFiles] = useState<File[]>([]);
  // Live reference-photo requirement: the label and the pre-submit guard
  // share this state, so they can never contradict each other.
  const refField = referenceFieldState(prompt, files.length > 0);
  const [fileError, setFileError] = useState("");
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  // typewriter placeholder: cycles example prompts while the box is empty
  // and unfocused; pauses the moment the user focuses or types.
  const [promptFocused, setPromptFocused] = useState(false);
  const animatedPlaceholder = useTypewriterPlaceholder(
    prompt === "" && !promptFocused && mediaMode === "image"
  );
  const typing = prompt.trim().length > 0;

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

  // free-trial quota
  const refreshFreeRemaining = useCallback(async () => {
    try {
      const r = await fetch("/api/free/remaining", { cache: "no-store" });
      if (!r.ok) return;
      const b = await r.json().catch(() => null);
      if (typeof b?.left === "number") setFreeLeft(b.left);
      if (typeof b?.cap === "number") setFreeCap(b.cap);
    } catch {
      /* quota unknown — free mode stays usable, server enforces */
    }
  }, []);

  useEffect(() => {
    void refreshFreeRemaining();
  }, [refreshFreeRemaining]);

  const runQuote = useCallback(async (text: string, q: QualityTier, ar: AspectRatio, svc: ComposerServiceId) => {
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
        body: JSON.stringify({ spec, product: svc }),
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
  const promptOk = prompt.trim().length >= 3 && !overLimit;

  // price quote only runs for the paid image flow
  useEffect(() => {
    if (mediaMode !== "image" || billingMode !== "paid" || !promptOk) {
      setPhase("idle");
      setQuote(null);
      setAuthNeeded(false);
      return;
    }
    setPhase("loading");
    const t = setTimeout(() => runQuote(prompt.trim(), quality, aspectRatio, service), 600);
    return () => clearTimeout(t);
  }, [prompt, quality, aspectRatio, service, promptOk, runQuote, mediaMode, billingMode]);

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

  /**
   * Paid image generation — generate-first: the generation starts
   * immediately with NO payment order. POST /api/generation/start queues
   * a paid generations row and returns its id; the watch room shows the
   * watermarked preview on completion, and the unlock order (with the
   * server-side quoted price) is created only when the user clicks
   * "Download clean HD".
   */
  const handleGenerate = async () => {
    if (!quote || starting) return;
    if (overLimit) {
      setStatus(
        `That prompt is over the ${PROMPT_MAX_LENGTH.toLocaleString("en-IN")}-character limit — shorten it first.`
      );
      return;
    }
    if (needsReferencePhoto(prompt) && files.length === 0) {
      setStatus(MISSING_REFERENCE_MESSAGE);
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
      // Pre-flight: the serverless edge rejects bodies over
      // UPLOAD_EDGE_LIMIT_BYTES before our route runs. Fail fast with a
      // truthful message instead of attempting a doomed upload.
      const totalBytes = files.reduce((sum, f) => sum + f.size, 0);
      if (totalBytes > UPLOAD_EDGE_LIMIT_BYTES) {
        setUploadProgress(null);
        setStatus(
          "Those files are too large to upload in one go — try fewer or smaller files (keep the total under 4 MB)."
        );
        return;
      }
      let res: Response;
      try {
        if (files.length > 0) {
          // XHR for real upload progress (fetch has no upload-progress
          // events). Response shape is identical to the JSON path.
          const form = new FormData();
          form.append("quoteId", quote.quoteId);
          form.append("country", "IN");
          for (const f of files) form.append("files", f);
          res = await new Promise<Response>((resolvePromise, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open("POST", "/api/generation/start");
            xhr.upload.onprogress = (e) => {
              if (e.lengthComputable && e.total > 0) {
                setUploadProgress(Math.min(1, e.loaded / e.total));
              }
            };
            xhr.onload = () =>
              resolvePromise(
                new Response(xhr.responseText, {
                  status: xhr.status,
                  headers: {
                    "content-type":
                      xhr.getResponseHeader("content-type") ?? "",
                  },
                })
              );
            xhr.onerror = () => reject(new Error("network"));
            xhr.send(form);
          });
        } else {
          res = await fetch("/api/generation/start", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ quoteId: quote.quoteId, country: "IN" }),
          });
        }
      } catch {
        setStatus("Network error. Please try again.");
        return;
      }
      setUploadProgress(null);
      if (res.status === 401) {
        setPendingAuth("paid");
        setAuthNeeded(true);
        return;
      }
      if (res.status === 413) {
        setStatus(
          "Those files are too large to upload in one go — try fewer or smaller files (keep the total under 4 MB)."
        );
        return;
      }
      const body = await res.json().catch(() => null);
      if (res.status === 403 && (body?.error === "ORDERS_PAUSED" || body?.code === "ORDERS_PAUSED")) {
        setStatus("New generation orders are temporarily paused.");
        return;
      }
      if (res.status === 400 && body?.code === "INTL_PAYMENTS_COMING_SOON") {
        setStatus("International payments coming soon — India (UPI) only for now.");
        return;
      }
      if (!res.ok || !body?.generationId) {
        setStatus(
          typeof body?.error === "string" && body.error
            ? body.error
            : "Could not start your generation. Please try again."
        );
        return;
      }
      // Generation started — straight to the watch room. Payment happens
      // later, only if the user wants the clean HD file.
      router.push(`/watch/${body.generationId}`);
    } finally {
      setStarting(false);
      setUploadProgress(null);
    }
  };

  /** Free-tier image generation: no quote, no payment — straight to the watch room. */
  const handleFreeGenerate = async () => {
    if (freeSending || !promptOk) return;
    if (freeLeft === 0) {
      setStatus(
        `That's all ${freeCap} free previews for today — back tomorrow. The paid route is open whenever you want it.`
      );
      return;
    }
    if (needsReferencePhoto(prompt) && files.length === 0) {
      setStatus(MISSING_REFERENCE_MESSAGE);
      return;
    }
    // Pre-flight: the serverless edge rejects bodies over
    // UPLOAD_EDGE_LIMIT_BYTES before our route runs.
    if (files.length > 0) {
      const totalBytes = files.reduce((sum, f) => sum + f.size, 0);
      if (totalBytes > UPLOAD_EDGE_LIMIT_BYTES) {
        setStatus(
          "Those files are too large to upload in one go — try fewer or smaller files (keep the total under 4 MB)."
        );
        return;
      }
    }
    setFreeSending(true);
    setStatus("");
    setAuthNeeded(false);
    try {
      let res: Response;
      if (files.length > 0) {
        const form = new FormData();
        form.append("prompt", prompt.trim());
        form.append("quality", quality);
        form.append("aspectRatio", aspectRatio);
        for (const f of files) form.append("files", f);
        res = await fetch("/api/free/generate", { method: "POST", body: form });
      } else {
        res = await fetch("/api/free/generate", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ prompt: prompt.trim(), quality, aspectRatio }),
        });
      }
      if (res.status === 401) {
        setPendingAuth("free");
        setAuthNeeded(true);
        return;
      }
      const body = await res.json().catch(() => null);
      if (res.status === 429 && body?.code === "FREE_CAP_REACHED") {
        setFreeLeft(0);
        setStatus(
          `That's all ${freeCap} free previews for today — back tomorrow. The paid route is open whenever you want it.`
        );
        return;
      }
      if (res.status === 413) {
        setStatus(
          "Those files are too large to upload in one go — try fewer or smaller files (keep the total under 4 MB)."
        );
        return;
      }
      if (res.status === 400 && body?.code === "INVALID_ATTACHMENTS") {
        setStatus(
          typeof body?.error === "string" && body.error
            ? body.error
            : "Those files couldn't be attached. Please try different files."
        );
        return;
      }
      if (!res.ok || !body?.id) {
        setStatus(
          typeof body?.error === "string" && body.error
            ? body.error
            : "Could not start your free preview. Please try again."
        );
        return;
      }
      void refreshFreeRemaining();
      router.push(`/watch/${body.id}`);
    } finally {
      setFreeSending(false);
    }
  };

  /** Generate-first video: queue the clip immediately — no order, no payment
      gate. The watch room shows progress, then the watermarked preview;
      payment unlocks the clean HD file after. */
  const handleVideoGenerate = async () => {
    if (videoSending || !promptOk) return;
    if (needsReferencePhoto(prompt)) {
      setStatus(
        "This prompt asks for a specific person, but video clips cannot use a reference photo yet — describe the person instead."
      );
      return;
    }
    setVideoSending(true);
    setStatus("");
    setAuthNeeded(false);
    try {
      const res = await fetch("/api/video/order", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ prompt: prompt.trim(), aspectRatio, durationSeconds: videoDuration }),
      });
      if (res.status === 401) {
        setPendingAuth("video");
        setAuthNeeded(true);
        return;
      }
      const body = await res.json().catch(() => null);
      if (!res.ok || !body?.id) {
        setStatus(
          typeof body?.error === "string" && body.error
            ? body.error
            : "Could not start your video. Please try again."
        );
        return;
      }
      router.push(`/watch/${body.id}`);
    } finally {
      setVideoSending(false);
    }
  };

  const resumeAfterAuth = () => {
    setAuthNeeded(false);
    const which = pendingAuth;
    setPendingAuth(null);
    if (which === "free") void handleFreeGenerate();
    else if (which === "video") void handleVideoGenerate();
    else void handleGenerate();
  };

  const canGenerate = phase === "quoted" && !!quote && !starting && ordersAccepting !== false && !overLimit;
  const canFreeGenerate = promptOk && freeLeft !== 0 && !freeSending;
  const canVideoGenerate = promptOk && !videoSending;

  const selectMedia = (m: MediaMode) => {
    setMediaMode(m);
    setStatus("");
    setAuthNeeded(false);
    setPendingAuth(null);
    setPhase("idle");
    setQuote(null);
    if (m === "video") {
      setAspectRatio("9:16");
    } else {
      setAspectRatio("1:1");
    }
  };

  const selectService = (s: ComposerServiceId) => {
    if (s === service) return;
    setService(s);
    setStatus("");
    setPhase("idle");
    setQuote(null);
  };

  const aspects = mediaMode === "video" ? VIDEO_ASPECTS : IMAGE_ASPECTS;
  // Reference attachments are supported for image generations in both
  // billing modes: paid orders store them on generation_attachments for the
  // operator; free trials store them on free_generation_attachments for
  // the generation watcher.
  const showAttachments = mediaMode === "image";

  return (
    <div
      className={cn(
        "w-full rounded-[20px] border p-5 sm:p-6 transition-shadow duration-300 motion-reduce:transition-none",
        typing
          ? "border-[var(--pro-accent)]/25 bg-[var(--pro-bg-elev)] shadow-[0_0_0_1px_rgba(0,0,0,0.4),0_24px_64px_-24px_rgba(0,0,0,0.8)]"
          : "border-[var(--pro-border)] bg-[var(--pro-bg-elev)] shadow-[0_0_0_1px_rgba(0,0,0,0.4),0_24px_64px_-24px_rgba(0,0,0,0.8)]",
        className,
      )}
    >
      {/* media toggle: image vs 5s video clip vs edit-your-video */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div
          role="group"
          aria-label="What to create"
          className="flex rounded-[12px] border border-[var(--pro-border)] bg-[var(--pro-bg-elev)] p-1"
        >
          {(
            [
              { id: "image", label: "Image" },
              { id: "video", label: "Video clip" },
            ] as const
          ).map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => selectMedia(m.id)}
              aria-pressed={mediaMode === m.id}
              className={cn(
                "min-h-[44px] rounded-[9px] px-4 py-2 text-[13px] font-semibold transition-colors",
                mediaMode === m.id
                  ? "bg-[var(--pro-btn)] text-[var(--pro-btn-ink)]"
                  : "text-[var(--pro-muted)] hover:text-[var(--pro-fg)]",
              )}
            >
              {m.label}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setShowVideoStudio((v) => !v)}
          aria-expanded={showVideoStudio}
          title={`Voice-over & TTS, auto-captioning, trim + text overlay — ${formatINR(priceOf("video-studio"))} per finished video`}
          className="inline-flex min-h-[44px] items-center gap-1.5 rounded-[12px] border border-dashed border-[var(--pro-border)] px-4 py-2 text-[13px] font-semibold text-[var(--pro-muted)] transition-colors hover:border-[var(--pro-accent)]/50 hover:text-[var(--pro-fg)]"
        >
          <Clapperboard className="h-3.5 w-3.5" aria-hidden />
          Edit video
          <span className="text-[11px] font-medium text-[var(--pro-faint)]">{formatINR(priceOf("video-studio"))}</span>
        </button>
        {showVideoStudio && (
          <div className="mt-4 rounded-[16px] border border-[var(--pro-border)] bg-[var(--pro-bg-elev)] p-4 sm:p-6">
            <Suspense
              fallback={
                <p className="py-8 text-center text-[13px] text-[var(--pro-muted)]">
                  Loading Video Studio…
                </p>
              }
            >
              <VideoStudioPanel chrome={false} />
            </Suspense>
          </div>
        )}
        {mediaMode === "image" && (
          <div
            role="group"
            aria-label="Image pricing"
            className="flex rounded-[12px] border border-[var(--pro-border)] bg-[var(--pro-bg-elev)] p-1"
          >
            <button
              type="button"
              onClick={() => setBillingMode("free")}
              aria-pressed={billingMode === "free"}
              className={cn(
                "min-h-[44px] rounded-[9px] px-4 py-2 text-[13px] font-semibold transition-colors",
                billingMode === "free"
                  ? "bg-[var(--pro-btn)] text-[var(--pro-btn-ink)]"
                  : "text-[var(--pro-muted)] hover:text-[var(--pro-fg)]",
              )}
            >
              {freeLeft === 0
                ? "Free trial (0 left — back tomorrow)"
                : freeLeft === null
                  ? "Free trial"
                  : `Free trial (${freeLeft} left today)`}
            </button>
            <button
              type="button"
              onClick={() => setBillingMode("paid")}
              aria-pressed={billingMode === "paid"}
              className={cn(
                "min-h-[44px] rounded-[9px] px-4 py-2 text-[13px] font-semibold transition-colors",
                billingMode === "paid"
                  ? "bg-[var(--pro-btn)] text-[var(--pro-btn-ink)]"
                  : "text-[var(--pro-muted)] hover:text-[var(--pro-fg)]",
              )}
            >
              Paid
            </button>
          </div>
        )}
      </div>
      {mediaMode === "image" && billingMode === "free" && (
        <p className="mb-4 text-[12px] leading-5 text-[var(--pro-faint)]">
          Free previews carry a Etch watermark. Unlock the clean HD file
          for {formatINR(priceOf("single-image"))}.
        </p>
      )}
      {/* service selector: which paid product to create — prices live from the catalog */}
      {mediaMode === "image" && billingMode === "paid" && (
        <div className="mb-4">
          <div
            role="group"
            aria-label="Choose a service"
            className="grid grid-cols-1 gap-2 min-[420px]:grid-cols-3"
          >
            {COMPOSER_SERVICES.map((s) => {
              const active = service === s.id;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => selectService(s.id)}
                  aria-pressed={active}
                  title={s.blurb}
                  className={cn(
                    "rounded-[12px] border px-3 py-2.5 text-left transition-colors min-h-[44px]",
                    active
                      ? "border-[var(--pro-accent)]/60 bg-[var(--pro-accent)]/[0.07]"
                      : "border-[var(--pro-border)] bg-[var(--pro-bg-elev)] hover:border-[var(--pro-border)]",
                  )}
                >
                  <span className={cn(
                    "block text-[13px] font-semibold",
                    active ? "text-[var(--pro-fg)]" : "text-[var(--pro-fg)]",
                  )}>
                    {s.label}
                  </span>
                  <span className={cn(
                    "mt-0.5 block text-[13px] font-semibold tabular-nums",
                    active ? "text-[var(--pro-accent)]" : "text-[var(--pro-muted)]",
                  )}>
                    {formatINR(servicePricePaise(s.id))}
                  </span>
                </button>
              );
            })}
          </div>
          <p className="mt-2 text-[12px] leading-5 text-[var(--pro-faint)]">
            {COMPOSER_SERVICES.find((s) => s.id === service)?.blurb}
          </p>
        </div>
      )}
      {mediaMode === "video" && (
        <div className="mb-4">
          <div className="flex items-center justify-between gap-3">
            <label
              htmlFor="video-duration"
              className="text-[13px] font-semibold text-[var(--pro-fg)]"
            >
              Clip length
            </label>
            <p className="text-[13px] tabular-nums text-[var(--pro-muted)]">
              <span className="font-semibold text-[var(--pro-fg)]">{videoDuration}s</span>
              {" · "}
              {formatINR(videoClipPricePaise(videoDuration))}
            </p>
          </div>
          <input
            id="video-duration"
            type="range"
            min={VIDEO_DURATION_MIN_S}
            max={VIDEO_DURATION_MAX_S}
            step={1}
            value={videoDuration}
            onChange={(e) => setVideoDuration(Number(e.target.value))}
            className="mt-2 w-full accent-[var(--pro-accent)]"
            aria-valuetext={`${videoDuration} seconds, ${formatINR(videoClipPricePaise(videoDuration))}`}
          />
          <div className="mt-1 flex justify-between text-[11px] tabular-nums text-[var(--pro-faint)]">
            <span>5s · {formatINR(priceOf("clip-5s"))}</span>
            <span>60s · {formatINR(videoClipPricePaise(VIDEO_DURATION_MAX_S))}</span>
          </div>
          <p className="mt-2 text-[12px] leading-5 text-[var(--pro-faint)]">
            {formatINR(priceOf("clip-5s"))} per 5-second block (or part of one) —
            fulfilled by an operator with human QC. A watermarked preview shows
            until you unlock the clean HD file.
          </p>
        </div>
      )}
      {initialTemplate && (
        <div className="mb-4 flex items-center gap-2.5 rounded-[10px] border border-[var(--pro-accent)]/25 bg-[var(--pro-accent)]/[0.06] px-3.5 py-2.5">
          <Sparkles className="h-4 w-4 shrink-0 text-[var(--pro-accent)]" />
          <p className="text-[12.5px] leading-5 text-[var(--pro-fg)]">
            Template:{" "}
            <span className="font-semibold text-[var(--pro-fg)]">{initialTemplate.name}</span>
            {initialTemplate.photoSlots.length > 0 ? (
              <> — attach {initialTemplate.photoSlots.join(" + ")} below</>
            ) : (
              <> — your text prompt is ready to go</>
            )}
          </p>
        </div>
      )}

      <div className="flex items-start justify-between gap-3">
        <label htmlFor="vidish-prompt" className="sr-only">
          Describe the image you want to create
        </label>        <p
          className={cn(
            "shrink-0 pt-0.5 text-[12px] tabular-nums",
            overLimit ? "font-medium text-red-300/90" : "text-[var(--pro-faint)]"
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
        onFocus={() => setPromptFocused(true)}
        onBlur={() => setPromptFocused(false)}
        placeholder={mediaMode === "video" ? "Describe the 5-second clip…" : (animatedPlaceholder ?? "What do you want to make?")}
        rows={variant === "hero" ? 3 : 4}
        maxLength={PROMPT_MAX_LENGTH}
        aria-invalid={overLimit}
        aria-describedby="vidish-prompt-limit"
        className="w-full resize-none bg-transparent text-[15px] leading-6 text-[var(--pro-fg)] placeholder:text-[var(--pro-faint)] outline-none"
      />
      {overLimit && (
        <p id="vidish-prompt-limit" className="mt-2 text-[13px] text-red-300/90" role="alert">
          That&apos;s over the {PROMPT_MAX_LENGTH.toLocaleString("en-IN")}-character
          limit — shorten it to see your price.
        </p>
      )}

      {/* reference attachments — image flows (paid + free trial) */}
      {showAttachments && (
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
                  className="inline-flex max-w-full items-center gap-2 rounded-[10px] border border-[var(--pro-border)] bg-[var(--pro-bg-elev)] py-1.5 pl-3 pr-1.5"
                >
                  <span className="min-w-0">
                    <span className="block max-w-[180px] truncate text-[12px] font-medium text-[var(--pro-fg)]">
                      {f.name}
                    </span>
                    <span className="block text-[11px] text-[var(--pro-faint)] tabular-nums">
                      {formatBytes(f.size)}
                    </span>
                  </span>
                  <button
                    type="button"
                    onClick={() => removeFile(i)}
                    aria-label={`Remove ${f.name}`}
                    className="rounded-[6px] p-1.5 text-[var(--pro-muted)] hover:bg-[var(--pro-bg-sunken)] hover:text-[var(--pro-fg)]"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          )}
          <div className="mb-2 flex items-center gap-2">
            <span className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[var(--pro-muted)]">
              Reference photo{" "}
              <span
                className={
                  refField.required
                    ? "text-amber-500"
                    : "font-medium normal-case tracking-normal text-[var(--pro-faint)]"
                }
              >
                {refField.labelSuffix}
              </span>
            </span>
          </div>
          {refField.warning && (
            <p className="mb-2 text-[13px] font-medium text-amber-500" role="alert">
              {refField.warning}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={files.length >= ATTACH_MAX_FILES}
              className="inline-flex min-h-[44px] items-center gap-1.5 rounded-[8px] border border-[var(--pro-border)] bg-[var(--pro-bg-elev)] px-3 py-1.5 text-[12px] font-medium text-[var(--pro-muted)] transition-colors hover:border-[var(--pro-border)] hover:text-[var(--pro-fg)] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Paperclip className="h-3.5 w-3.5" />
              {files.length === 0
                ? "Attach references"
                : `Add more (${files.length}/${ATTACH_MAX_FILES})`}
            </button>
            <span className="text-[11px] text-[var(--pro-faint)]">
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
      )}

      {/* controls row */}
      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-3">
        {/* quality segmented control — image modes only */}
        {mediaMode === "image" && (
          <div
            role="group"
            aria-label="Quality"
            className="flex rounded-[10px] border border-[var(--pro-border)] bg-[var(--pro-bg-elev)] p-1"
          >
            {QUALITIES.map((qt) => (
              <button
                key={qt.id}
                type="button"
                onClick={() => setQuality(qt.id)}
                aria-pressed={quality === qt.id}
                title={qt.hint}
                className={cn(
                  "min-h-[44px] rounded-[8px] px-3 py-1.5 text-[13px] font-medium transition-colors",
                  quality === qt.id
                    ? "bg-[var(--pro-btn)] text-[var(--pro-btn-ink)]"
                    : "text-[var(--pro-muted)] hover:text-[var(--pro-fg)]",
                )}
              >
                {qt.label}
              </button>
            ))}
          </div>
        )}

        {/* aspect ratio pills */}
        <div role="group" aria-label="Aspect ratio" className="flex flex-wrap gap-1.5">
          {aspects.map((ar) => (
            <button
              key={ar.id}
              type="button"
              onClick={() => setAspectRatio(ar.id)}
              aria-pressed={aspectRatio === ar.id}
              className={cn(
                "min-h-[44px] rounded-full border px-3 py-1 text-[12px] font-medium tabular-nums transition-colors",
                aspectRatio === ar.id
                  ? "border-[var(--pro-accent)]/60 bg-[var(--pro-accent)]/[0.08] text-[var(--pro-fg)]"
                  : "border-[var(--pro-border)] text-[var(--pro-muted)] hover:border-[var(--pro-border)] hover:text-[var(--pro-fg)]",
              )}
            >
              {ar.label}
            </button>
          ))}
        </div>
      </div>

      {/* price + generate row */}
      <div className="mt-5 flex items-center justify-between gap-4 border-t border-[var(--pro-border)] pt-4">
        <div className="min-w-0">
          {mediaMode === "video" && (
            <p className="text-[13px] text-[var(--pro-faint)] tabular-nums">
              <span className="text-[18px] font-semibold text-[var(--pro-fg)]">{formatINR(priceOf("clip-5s"))}</span>{" "}
              per 5s clip
            </p>
          )}
          {mediaMode === "image" && billingMode === "free" && (
            <p className="text-[13px] text-[var(--pro-faint)]">
              Free trial ·{" "}
              <span className="font-medium text-[var(--pro-fg)]">
                {freeLeft === null ? `${freeCap} per day` : freeLeft === 0 ? "none left today" : `${freeLeft} of ${freeCap} left today`}
              </span>
            </p>
          )}
          {mediaMode === "image" && billingMode === "paid" && phase === "loading" && (
            <p className="text-[13px] text-[var(--pro-faint)] tabular-nums">
              Estimated <span className="text-[var(--pro-fg)]">{formatINR(servicePricePaise(service))}</span>
              <span className="ml-2 inline-block h-3 w-3 animate-spin rounded-full border-2 border-[var(--pro-border)] border-t-white/70 align-[-1px]" />
            </p>
          )}
          {mediaMode === "image" && billingMode === "paid" && phase === "idle" && (
            <p className="text-[13px] text-[var(--pro-faint)] tabular-nums">
              Estimated <span className="text-[var(--pro-fg)]">{formatINR(servicePricePaise(service))}</span>
            </p>
          )}
          {mediaMode === "image" && billingMode === "paid" && phase === "quoted" && quote && (
            <p key={quote.totalPaise} className="v-price-swap text-[13px] text-[var(--pro-muted)] tabular-nums">
              Exact price{" "}
              <span className="text-[18px] font-semibold text-[var(--pro-fg)]">
                {formatINR(quote.totalPaise)}
              </span>
            </p>
          )}
          {mediaMode === "image" && billingMode === "paid" && phase === "blocked" && (
            <p className="text-[13px] text-red-300/80">
              That prompt was blocked by content moderation.
            </p>
          )}
          {mediaMode === "image" && billingMode === "paid" && phase === "unavailable" && (
            <p className="text-[13px] text-[var(--pro-muted)]">
              Price unavailable right now — try again in a moment.
            </p>
          )}
        </div>

        {mediaMode === "video" ? (
          <button
            type="button"
            onClick={handleVideoGenerate}
            disabled={!canVideoGenerate}
            className={cn(
              "inline-flex shrink-0 items-center gap-2 rounded-[10px] bg-[var(--pro-btn)] px-5 py-2.5",
              "text-[14px] font-semibold text-[var(--pro-btn-ink)] transition-opacity",
              canVideoGenerate ? "hover:opacity-95 active:opacity-90" : "cursor-not-allowed opacity-40",
            )}
          >
            {videoSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            Generate video
            <ArrowRight className="h-4 w-4" />
          </button>
        ) : billingMode === "free" ? (
          <button
            type="button"
            onClick={handleFreeGenerate}
            disabled={!canFreeGenerate}
            className={cn(
              "inline-flex shrink-0 items-center gap-2 rounded-[10px] bg-[var(--pro-btn)] px-5 py-2.5",
              "text-[14px] font-semibold text-[var(--pro-btn-ink)] transition-opacity",
              canFreeGenerate ? "hover:opacity-95 active:opacity-90" : "cursor-not-allowed opacity-40",
            )}
          >
            {freeSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            Generate free
            <ArrowRight className="h-4 w-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleGenerate}
            disabled={!canGenerate}
            className={cn(
              "inline-flex shrink-0 items-center gap-2 rounded-[10px] bg-[var(--pro-btn)] px-5 py-2.5",
              "text-[14px] font-semibold text-[var(--pro-btn-ink)] transition-opacity",
              canGenerate ? "hover:opacity-95 active:opacity-90" : "cursor-not-allowed opacity-40",
            )}
          >
            {starting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            Generate
            <ArrowRight className="h-4 w-4" />
          </button>
        )}
      </div>
      {uploadProgress !== null && (
        <div className="mt-4" role="status" aria-label="Uploading reference files">
          <div className="flex items-center justify-between text-[12px] text-[var(--pro-muted)] tabular-nums">
            <span>Uploading reference files…</span>
            <span>{Math.round(uploadProgress * 100)}%</span>
          </div>
          <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-[var(--pro-bg-sunken)]">
            <div
              className="h-full rounded-full bg-[var(--pro-btn)] transition-[width] motion-reduce:transition-none"
              style={{ width: `${Math.round(uploadProgress * 100)}%` }}
            />
          </div>
        </div>
      )}
      {status && (
        <p className="mt-3 text-[13px] text-[var(--pro-muted)]" role="status">
          {status}
        </p>
      )}
      {/* Lazy auth: login is required only at submit time. After sign-in the
          pending generate action resumes automatically. */}
      <AuthModal
        open={authNeeded}
        onClose={() => {
          setAuthNeeded(false);
          setPendingAuth(null);
        }}
        onAuthenticated={resumeAfterAuth}
      />
      {mediaMode === "image" && billingMode === "paid" && phase === "quoted" && quote && (
        <>
          <p className="mt-3 text-[12px] text-[var(--pro-faint)]">
            No subscription · Pay only if you love the preview · Failed renders are never charged
          </p>
          <p className="mt-1.5 text-[12px] leading-5 text-[var(--pro-faint)]">
            AI generation with human quality review — every paid generation is
            reviewed before delivery.
            {turnaround ? ` ${turnaround}` : ""}
          </p>
        </>
      )}
      {mediaMode === "image" && billingMode === "free" && (
        <p className="mt-3 text-[12px] leading-5 text-[var(--pro-faint)]">
          3 free AI previews a day, no payment needed. This is a preview, not a
          finished order — unlock the clean HD file for {formatINR(priceOf("single-image"))} if you love it.
        </p>
      )}
      {ordersAccepting === false && (
        <p className="mt-3 text-[13px] font-medium text-amber-200/90" role="status">
          New generation orders are temporarily paused.
        </p>
      )}
    </div>
  );
}
