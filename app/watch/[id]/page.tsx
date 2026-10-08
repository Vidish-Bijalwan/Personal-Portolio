"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Check,
  Download,
  Loader2,
  RefreshCcw,
  SearchX,
  Sparkles,
  TriangleAlert,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { cssAspectRatio } from "@/src/lib/media/aspect";
import VilishNav from "@/components/vilish/nav";
import VilishFooter from "@/components/vilish/footer";
import BurgerGrill, { burgerFrameForStage } from "@/components/vilish/burger-grill";
import { displayStage } from "@/src/lib/vilish/stage-copy";
import WaitingPanel from "@/components/vilish/waiting-panel";
import { REMIX_PRESETS } from "@/components/vilish/waiting-panel";
import { MoreFromGrill, ResultPanel } from "@/components/vilish/result-panel";
import type { PromptInsight } from "@/src/lib/vilish/prompt-insight";
import { progressForStage } from "@/src/lib/vilish/progress";
import PaymentModal from "@/components/vilish/payment-modal";
import AuthModal from "@/components/vilish/auth-modal";
import { formatINR } from "@/src/lib/vilish/types";
import { priceOf } from "@/src/lib/pricing/catalog";
import { UNLOCK_PRICE_PAISE } from "@/src/lib/free/policy";
import type { ManualPayment } from "@/components/vilish/payment";

interface GenStatus {
  media_type: "image" | "video";
  tier: "free" | "paid";
  status: "queued" | "generating" | "done" | "failed";
  stage: string | null;
  unlocked: boolean;
  error?: string;
  error_code?: "content_refused" | "technical";
  stuck?: boolean;
  suggested_prompt?: string;
  /** Waiting-room transparency fields (from /api/gen/[id]/status). */
  created_at: string;
  queue_position: number | null;
  prompt_insight: PromptInsight | null;
  /** The owner's own prompt — powers the remix buttons. */
  prompt?: string | null;
  /** Result-page details (from /api/gen/[id]/status). */
  aspect_ratio: string;
  finished_at: string;
  /** Video rows: server-side unlock price (paise) + clip length. */
  unlock_price_paise?: number | null;
  duration_seconds?: number | null;
}

/** "1m 23s" / "45s" / "2h 4m" — honest elapsed time, never a promise. */
function formatElapsed(ms: number): string {
  const s = Math.max(0, Math.floor(ms / 1000));
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ${String(s % 60).padStart(2, "0")}s`;
  return `${Math.floor(m / 60)}h ${String(m % 60).padStart(2, "0")}m`;
}

const IMAGE_CAPTIONS = [
  "Preparing your canvas…",
  "Composing the details…",
  "Refining the quality…",
  "Finalizing your file…",
];

const VIDEO_CAPTIONS = [
  "Preparing your clip…",
  "Rendering the frames…",
  "Polishing the cut…",
  "Finalizing your file…",
];

export default function WatchRoomPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params.id;
  const [data, setData] = useState<GenStatus | null>(null);
  const [fetchError, setFetchError] = useState("");
  const [notFound, setNotFound] = useState(false);
  const notFoundRef = useRef(false);
  const [captionIdx, setCaptionIdx] = useState(0);
  const [previewOk, setPreviewOk] = useState(true);
  const dataRef = useRef<GenStatus | null>(null);
  dataRef.current = data;

  // unlock flow
  const [unlockBusy, setUnlockBusy] = useState(false);
  const [unlockError, setUnlockError] = useState("");
  const [payModal, setPayModal] = useState<{ jobId: string; payment: ManualPayment } | null>(null);
  const [authNeeded, setAuthNeeded] = useState(false);
  const [pendingUnlock, setPendingUnlock] = useState(false);

  // retry flow: mint a fresh attempt (same prompt, or the safer rephrase)
  const [retrying, setRetrying] = useState<null | "same" | "safe">(null);
  const [retryError, setRetryError] = useState("");

  // waiting-room transparency: ticking elapsed clock (from created_at)
  const [nowMs, setNowMs] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNowMs(Date.now()), 1000);
    return () => clearInterval(t);
  }, [id]);

  // remix flow: same prompt + a style preset → new free generation
  const [remixBusy, setRemixBusy] = useState<string | null>(null);
  const [remixError, setRemixError] = useState("");
  const [pendingRemix, setPendingRemix] = useState<string | null>(null);

  const submitRemix = async (styledPrompt: string) => {
    setRemixError("");
    try {
      const r = await fetch("/api/free/generate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ prompt: styledPrompt }),
      });
      if (r.status === 401) {
        setPendingRemix(styledPrompt);
        setAuthNeeded(true);
        return;
      }
      const b = (await r.json().catch(() => null)) as {
        id?: string;
        code?: string;
        error?: string;
      } | null;
      if (r.status === 429 || b?.code === "FREE_CAP_REACHED") {
        // Free tries used up — hand the styled prompt to the composer
        // (paid flow) instead of failing.
        router.push(`/create?prompt=${encodeURIComponent(styledPrompt)}`);
        return;
      }
      if (!r.ok || !b?.id) {
        setRemixError(
          typeof b?.error === "string" && b.error
            ? b.error
            : "Could not start that remix. Please try again."
        );
        return;
      }
      router.push(`/watch/${b.id}`);
    } catch {
      setRemixError("Could not start that remix. Please try again.");
    }
  };

  const handleRemix = async (suffix: string) => {
    const base = (dataRef.current?.prompt ?? "").trim();
    if (!base) {
      setRemixError("We couldn't read your original prompt — please try again.");
      return;
    }
    // Server caps prompts at 2000 chars; keep the style suffix intact.
    const styled = `${base}, ${suffix}`.slice(0, 2000);
    setRemixBusy(suffix);
    try {
      await submitRemix(styled);
    } finally {
      setRemixBusy(null);
    }
  };

  const handleRetry = async (safer: boolean) => {
    setRetryError("");
    setRetrying(safer ? "safe" : "same");
    try {
      const body =
        safer && dataRef.current?.suggested_prompt
          ? { prompt: dataRef.current.suggested_prompt }
          : {};
      const r = await fetch(`/api/gen/${encodeURIComponent(id)}/retry`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      const b = (await r.json().catch(() => null)) as {
        id?: string;
        error?: string;
      } | null;
      if (!r.ok || !b?.id) {
        setRetryError(
          typeof b?.error === "string" && b.error
            ? b.error
            : "Could not start a new attempt. Please try again."
        );
        return;
      }
      router.push(`/watch/${b.id}`);
    } catch {
      setRetryError("Could not start a new attempt. Please try again.");
    } finally {
      setRetrying(null);
    }
  };

  const fetchStatus = async () => {
    try {
      const r = await fetch(`/api/gen/${encodeURIComponent(id)}/status`, { cache: "no-store" });
      if (r.status === 404 || r.status === 403) {
        notFoundRef.current = true;
        setNotFound(true);
        setFetchError("");
        return null;
      }
      if (!r.ok) throw new Error(`status ${r.status}`);
      const b = (await r.json()) as GenStatus;
      setData(b);
      setFetchError("");
      return b;
    } catch {
      setFetchError("Connection interrupted — retrying…");
      return null;
    }
  };

  // poll every 3s until terminal
  useEffect(() => {
    let alive = true;
    let timer: ReturnType<typeof setInterval> | null = null;
    const tick = async () => {
      const cur = dataRef.current;
      if (notFoundRef.current) {
        if (timer) clearInterval(timer);
        return;
      }
      if (cur && (cur.status === "done" || cur.status === "failed")) {
        if (timer) clearInterval(timer);
        return;
      }
      const next = await fetchStatus();
      if (alive && next && (next.status === "done" || next.status === "failed") && timer) {
        clearInterval(timer);
      }
    };
    void tick();
    timer = setInterval(() => void tick(), 3000);
    return () => {
      alive = false;
      if (timer) clearInterval(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // rotate witty captions
  useEffect(() => {
    const t = setInterval(() => setCaptionIdx((i) => i + 1), 2600);
    return () => clearInterval(t);
  }, []);

  const handleUnlock = async () => {
    setUnlockBusy(true);
    setUnlockError("");
    try {
      // Generate-first paid images create the unlock order here (at
      // "Download clean HD" click time) via the paid-image unlock route;
      // free-tier images and paid videos use /api/gen/[id]/unlock.
      const res = isPaidImage
        ? await fetch("/api/generation/unlock", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ generationId: id }),
          })
        : await fetch(`/api/gen/${encodeURIComponent(id)}/unlock`, {
            method: "POST",
          });
      if (res.status === 401) {
        setPendingUnlock(true);
        setAuthNeeded(true);
        return;
      }
      const body = await res.json().catch(() => null);
      if (body?.adminBypass) {
        // Owner bypass: already unlocked — reload to show the clean download.
        window.location.reload();
        return;
      }
      if (!res.ok || !body?.payment) {
        setUnlockError(
          typeof body?.error === "string" && body.error
            ? body.error
            : "Could not create the unlock order. Please try again."
        );
        return;
      }
      setPayModal({ jobId: body.generationId ?? body.id ?? id, payment: body.payment as ManualPayment });
    } finally {
      setUnlockBusy(false);
    }
  };

  /**
   * Reopen/reorder the paid-image unlock payment. Unlock orders are
   * idempotent per generation (POST /api/generation/unlock resumes a
   * still-pending order), so this doubles as the expired-order recovery.
   */
  const reorderPaidImagePayment = async (): Promise<ManualPayment | null> => {
    try {
      const res = await fetch("/api/generation/unlock", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ generationId: id }),
      });
      const body = await res.json().catch(() => null);
      if (body?.adminBypass) {
        window.location.reload();
        return null;
      }
      return (body?.payment as ManualPayment) ?? null;
    } catch {
      return null;
    }
  };

  const previewUrl = `/api/gen/${encodeURIComponent(id)}/preview`;
  const cleanUrl = `/api/gen/${encodeURIComponent(id)}/clean`;

  const isVideo = data?.media_type === "video";
  const isPaidImage = data?.tier === "paid" && data?.media_type === "image";
  // generate-first paid images: server-side unlock price for the CTA
  const [unlockPricePaise, setUnlockPricePaise] = useState<number | null>(null);

  // Fetch the server-side unlock price once a paid image is done & locked,
  // so the CTA shows the true quoted price ("Download clean HD — ₹X").
  useEffect(() => {
    if (!isPaidImage || data?.status !== "done" || data?.unlocked) {
      setUnlockPricePaise(null);
      return;
    }
    let alive = true;
    fetch(`/api/generation/unlock?generationId=${encodeURIComponent(id)}`, {
      cache: "no-store",
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((b) => {
        if (alive && typeof b?.pricePaise === "number") {
          setUnlockPricePaise(b.pricePaise);
        }
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPaidImage, data?.status, data?.unlocked, id]);
  const refused = data?.error_code === "content_refused";
  const captions = isVideo ? VIDEO_CAPTIONS : IMAGE_CAPTIONS;
  const caption = captions[captionIdx % captions.length];
  const stageText = displayStage(data?.stage);
  // Real progress from the pipeline stage + status.
  const progress = data ? progressForStage(data.stage, data.status) : 8;
  // Paid videos are generate-first: the unlock price comes from the
  // server (videoClipPricePaise(durationSeconds)); images stay flat.
  const unlockPrice =
    isVideo && data?.unlock_price_paise != null
      ? formatINR(data.unlock_price_paise)
      : "₹19";

  return (
    <div className="flex min-h-screen flex-col bg-[#080808] font-sans text-[#F5F5F3] antialiased">
      <VilishNav />
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 pb-16 pt-8 sm:pt-12">
        <Link
          href="/create"
          className="inline-flex w-fit items-center gap-1.5 text-[13px] text-white/50 hover:text-white/85"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to the composer
        </Link>

        {/* initial load */}
        {!data && !fetchError && (
          <div className="flex flex-1 flex-col items-center justify-center py-24 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-[var(--pro-accent)]" />
            <p className="mt-4 text-[14px] text-white/50">Finding your order…</p>
          </div>
        )}

        {/* unknown / inaccessible order id — not a transient error, stop here */}
        {!data && notFound && (
          <div className="flex flex-1 flex-col items-center justify-center py-24 text-center">
            <SearchX className="h-8 w-8 text-[var(--pro-muted)]" />
            <h1 className="font-display mt-4 text-[22px] font-semibold tracking-[-0.02em]">
              We couldn&apos;t find that creation
            </h1>
            <p className="mt-3 max-w-sm text-[14px] leading-6 text-white/60">
              This link may be old, mistyped, or belong to a different account.
            </p>
            <Link
              href="/create"
              className="mt-6 inline-flex items-center gap-2 rounded-[10px] bg-[var(--pro-btn)] px-5 py-2.5 text-[14px] font-medium text-[var(--pro-btn-ink)]"
            >
              Start a new creation
            </Link>
          </div>
        )}

        {/* fetch error before first status */}
        {!data && !notFound && fetchError && (
          <div className="flex flex-1 flex-col items-center justify-center py-24 text-center">
            <TriangleAlert className="h-8 w-8 text-amber-200/80" />
            <p className="mt-4 max-w-sm text-[14px] leading-6 text-white/60">{fetchError}</p>
            <button
              type="button"
              onClick={() => void fetchStatus()}
              className="mt-5 inline-flex items-center gap-2 rounded-[10px] border border-white/[0.12] bg-[#18181B] px-4 py-2.5 text-[13px] font-medium hover:border-white/30"
            >
              <RefreshCcw className="h-4 w-4" />
              Retry
            </button>
          </div>
        )}

        {data && data.status === "failed" && (
          <section className="flex flex-1 flex-col items-center py-12 text-center">
            <h1 className="font-display text-[26px] font-semibold tracking-[-0.02em] sm:text-[32px]">
              {refused
                ? "The model declined this prompt"
                : "Something went wrong"}
            </h1>
            <p className="mt-3 max-w-md text-[14px] leading-6 text-white/60">
              {refused
                ? "The image model refused this one — usually a word like “fire” or “blood” trips the safety filter. Try a gentler rephrase instead."
                : isVideo
                  ? "Your clip didn't make it this time — nothing was charged."
                  : isPaidImage
                    ? "Your image didn't make it this time — nothing was charged, since payment only happens when you unlock."
                    : "Try again — it's still free."}
            </p>
            {data.tier === "free" && (
              <p className="mt-2 max-w-md text-[13px] leading-6 text-white/40">
                Your free tries weren&apos;t used up — the daily cap only counts
                finished previews.
              </p>
            )}
            {data.error && (
              <p className="mt-3 max-w-md text-[13px] text-white/40">{data.error}</p>
            )}

            {refused && data.suggested_prompt && (
              <div className="mt-6 w-full max-w-md rounded-[14px] border border-[var(--pro-accent)]/25 bg-[var(--pro-accent)]/[0.06] px-5 py-4 text-left">
                <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-[var(--pro-accent)]">
                  Etch&apos;s safer suggestion
                </p>
                <p className="mt-2 text-[14px] leading-6 text-white/80">
                  &ldquo;{data.suggested_prompt}&rdquo;
                </p>
              </div>
            )}

            {refused && data.suggested_prompt ? (
              <button
                type="button"
                onClick={() => void handleRetry(true)}
                disabled={retrying !== null}
                className="mt-6 inline-flex items-center gap-2 min-h-[44px] rounded-[10px] bg-[var(--pro-btn)] px-5 py-2.5 text-[14px] font-semibold text-[var(--pro-btn-ink)] hover:opacity-95 disabled:cursor-wait disabled:opacity-60"
              >
                {retrying === "safe" ? (
                  <Loader2 className="h-4 w-4 animate-spin motion-reduce:animate-none" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                Try a safer rephrase
              </button>
            ) : (
              <button
                type="button"
                onClick={() => void handleRetry(false)}
                disabled={retrying !== null}
                className="mt-7 inline-flex items-center gap-2 min-h-[44px] rounded-[10px] bg-[var(--pro-btn)] px-5 py-2.5 text-[14px] font-semibold text-[var(--pro-btn-ink)] hover:opacity-95 disabled:cursor-wait disabled:opacity-60"
              >
                {retrying === "same" ? (
                  <Loader2 className="h-4 w-4 animate-spin motion-reduce:animate-none" />
                ) : (
                  <RefreshCcw className="h-4 w-4" />
                )}
                Start a new attempt
              </button>
            )}

            {refused && data.suggested_prompt && (
              <button
                type="button"
                onClick={() => void handleRetry(false)}
                disabled={retrying !== null}
                className="mt-3 text-[13px] text-white/50 underline underline-offset-4 hover:text-white/85 disabled:opacity-50"
              >
                Retry the original anyway
              </button>
            )}

            {retryError && (
              <p className="mt-3 max-w-md text-[13px] text-red-300/80" role="alert">
                {retryError}
              </p>
            )}

            <Link
              href={isVideo ? "/create?media=video" : "/create"}
              className="mt-4 text-[13px] text-white/50 hover:text-white/85"
            >
              Or write a brand-new prompt
            </Link>
          </section>
        )}

        {/* generating — the waiting room.
            Generate-first: no payment gate here for any tier; the
            watermarked preview unlocks clean HD after it lands. */}
        {data && data.status !== "failed" && data.status !== "done" && (
            <section aria-live="polite" className="w-full py-8">
              <div className="grid gap-8 lg:grid-cols-[1fr_340px] lg:items-start">
                {/* left: the showpiece + live status */}
                <div className="flex flex-col items-center text-center">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--pro-accent)]">
                    {data.tier === "free" ? "Free preview" : isVideo ? "Paid clip" : "Paid order"} · AI-generated
                  </p>
                  <h1 className="font-display mt-2 text-[26px] font-semibold tracking-[-0.02em] sm:text-[32px]">
                    {isVideo ? "Creating your video" : "Creating your image"}
                  </h1>
                  {isVideo && data.tier === "paid" && !data.unlocked && data.unlock_price_paise != null && (
                    <p className="mt-2 max-w-md text-[13px] leading-5 text-white/45">
                      Preview first — unlock the clean HD clip for{" "}
                      <span className="font-semibold text-white/80">{formatINR(data.unlock_price_paise)}</span>{" "}
                      when it lands.
                    </p>
                  )}
                  {isPaidImage && !data.unlocked && (
                    <p className="mt-2 max-w-md text-[13px] leading-5 text-white/45">
                      Preview first — unlock the clean HD file for{" "}
                      <span className="font-semibold text-white/80">
                        {unlockPricePaise !== null ? formatINR(unlockPricePaise) : "the quoted price"}
                      </span>{" "}
                      when it lands.
                    </p>
                  )}

                  <div className="mt-6 w-full max-w-[420px]">
                    <BurgerGrill frame={burgerFrameForStage(data?.stage)} />
                  </div>

                  <p className="font-display mt-4 text-[16px] font-medium text-[#F5F5F3]">
                    {stageText}
                  </p>
                  <p key={captionIdx} className="fg-caption mt-1.5 h-6 text-[13px] text-white/45">
                    {caption}
                  </p>

                  {/* real progress: reflects the pipeline stage, not a fixed width */}
                  <div
                    className="mt-6 w-full max-w-[320px]"
                    role="progressbar"
                    aria-label="Generation progress"
                    aria-valuenow={progress}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  >
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.08]">
                      <div
                        className="h-full rounded-full bg-[var(--pro-accent)] transition-[width] duration-700 ease-out motion-reduce:transition-none"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <p className="mt-2 text-[12px] font-medium tabular-nums text-white/45">
                      {progress}% · {stageText}
                    </p>
                  </div>

                  {/* honest transparency: elapsed time + queue position */}
                  {data.created_at && (
                    <p className="mt-3 text-[12.5px] tabular-nums text-white/45">
                      Waiting {formatElapsed(nowMs - new Date(data.created_at).getTime())}
                      {data.status === "queued" && data.queue_position != null && (
                        <>
                          {" "}· You&apos;re #{data.queue_position} in the queue
                        </>
                      )}
                    </p>
                  )}
                  {fetchError && (
                    <p className="mt-3 text-[12px] text-white/40">{fetchError}</p>
                  )}
                  {data.stuck && (
                    <div className="mt-5 w-full max-w-[420px] rounded-[14px] border border-amber-200/25 bg-amber-200/[0.06] px-5 py-4">
                      <p className="text-[13px] leading-6 text-amber-100/90">
                        We&apos;re experiencing high demand — this is taking longer
                        than usual.
                      </p>
                      <button
                        type="button"
                        onClick={() => void handleRetry(false)}
                        disabled={retrying !== null}
                        className="mt-3 inline-flex items-center gap-2 rounded-[10px] border border-white/[0.12] bg-[#18181B] px-4 py-2.5 text-[13px] font-medium hover:border-white/30 disabled:opacity-60"
                      >
                        {retrying === "same" ? (
                          <Loader2 className="h-4 w-4 animate-spin motion-reduce:animate-none" />
                        ) : (
                          <RefreshCcw className="h-4 w-4" />
                        )}
                        Re-queue this request
                      </button>
                      {retryError && (
                        <p className="mt-2 text-[12px] text-red-300/80" role="alert">
                          {retryError}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* right: while you wait */}
                <WaitingPanel
                  insight={data.prompt_insight}
                  showRemix={!isVideo}
                  busyPreset={remixBusy}
                  remixError={remixError}
                  onRemix={(suffix) => void handleRemix(suffix)}
                />
              </div>
            </section>
          )}

        {/* done + locked: reveal with unlock CTA + enriched result page */}
        {data && data.status === "done" && !data.unlocked && (
          <section className="w-full py-8">
            <div className="grid gap-8 lg:grid-cols-[1fr_340px] lg:items-start">
              {/* left: preview + unlock CTA + actions */}
              <div className="flex flex-col items-center text-center">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--pro-accent)]/40 bg-[var(--pro-accent)]/[0.08] px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.1em] text-[var(--pro-accent)]">
                  <Sparkles className="h-3.5 w-3.5" />
                  {isVideo ? "Your video preview — AI-generated" : "Your free preview — AI-generated"}
                </span>

                <div className="mt-6 w-full max-w-md overflow-hidden rounded-[16px] border border-white/[0.1]">
                  {previewOk ? (
                    isVideo ? (
                      <video
                        src={previewUrl}
                        muted
                        loop
                        playsInline
                        autoPlay
                        controls
                        className="block w-full bg-black object-contain"
                        style={{ aspectRatio: cssAspectRatio(data?.aspect_ratio) }}
                        onError={() => setPreviewOk(false)}
                      />
                    ) : (
                      <img
                        src={previewUrl}
                        alt="Your free AI-generated preview (watermarked)"
                        className="block w-full"
                        onError={() => setPreviewOk(false)}
                      />
                    )
                  ) : (
                    <p className="px-6 py-12 text-[13px] text-white/45">
                      The preview file isn&apos;t ready to show yet — try refreshing in a moment.
                    </p>
                  )}
                </div>

                <p className="mt-5 max-w-md text-[14px] leading-6 text-white/60">
                  Watermarked preview.{" "}
                  {isPaidImage
                    ? `The clean HD file is yours for ${
                        unlockPricePaise !== null
                          ? formatINR(unlockPricePaise)
                          : "the quoted price"
                      }.`
                    : `The clean HD ${isVideo ? "clip" : "file"} is yours
                  for ${formatINR(
                    isVideo && data?.unlock_price_paise != null
                      ? data.unlock_price_paise
                      : UNLOCK_PRICE_PAISE,
                  )}.`}
                </p>

                <button
                  type="button"
                  onClick={handleUnlock}
                  disabled={unlockBusy}
                  className={cn(
                    "mt-5 inline-flex min-h-[48px] items-center gap-2 rounded-[10px] bg-[var(--pro-btn)] px-6 py-3 text-[15px] font-semibold text-[var(--pro-btn-ink)]",
                    unlockBusy ? "cursor-wait opacity-70" : "hover:opacity-95",
                  )}
                >
                  {unlockBusy && <Loader2 className="h-4 w-4 animate-spin" />}
                  {isPaidImage
                    ? `Download clean HD — ${
                        unlockPricePaise !== null
                          ? formatINR(unlockPricePaise)
                          : "…"
                      }`
                    : `Unlock clean HD — ${formatINR(
                        isVideo && data?.unlock_price_paise != null
                          ? data.unlock_price_paise
                          : UNLOCK_PRICE_PAISE,
                      )}`}
                </button>
                {unlockError && (
                  <p className="mt-3 max-w-md text-[13px] text-red-300/80" role="alert">
                    {unlockError}
                  </p>
                )}
                <p className="mt-3 text-[12px] text-white/35">
                  This is a preview, not a finished order — unlock only if you love it.
                </p>

                {/* action row: everything here really works */}
                <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5">
                  <a
                    href={previewUrl}
                    download={isVideo ? "etch-preview.mp4" : "etch-preview.jpg"}
                    className="inline-flex min-h-[44px] items-center gap-2 rounded-[10px] border border-white/[0.12] bg-[#18181B] px-4 py-2.5 text-[13px] font-medium text-white/85 hover:border-white/30"
                  >
                    <Download className="h-4 w-4" />
                    Download preview
                  </a>
                  <Link
                    href={isVideo ? "/create?media=video" : "/create"}
                    className="inline-flex min-h-[44px] items-center gap-2 rounded-[10px] border border-white/[0.12] bg-[#18181B] px-4 py-2.5 text-[13px] font-medium text-white/85 hover:border-white/30"
                  >
                    <Sparkles className="h-4 w-4" />
                    New creation
                  </Link>
                </div>

                {/* remix variations — images only (free tier rejects video) */}
                {!isVideo && (
                  <div className="mt-7 w-full max-w-md text-left">
                    <p className="text-[13px] font-semibold text-white/85">
                      Remix variations
                    </p>
                    <p className="mt-1 text-[12px] leading-5 text-white/40">
                      Same idea, new style — starts a fresh free preview.
                    </p>
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      {REMIX_PRESETS.slice(0, 4).map((p) => {
                        const busy = remixBusy === p.suffix;
                        return (
                          <button
                            key={p.label}
                            type="button"
                            onClick={() => void handleRemix(p.suffix)}
                            disabled={remixBusy !== null}
                            className={cn(
                              "inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-[10px] border border-white/[0.1] bg-white/[0.04] px-3 py-2.5 text-[13px] font-medium text-white/85 transition-colors",
                              remixBusy === null && "hover:border-[var(--pro-accent)]/50 hover:text-white",
                              busy && "cursor-wait opacity-70"
                            )}
                          >
                            {busy && <Loader2 className="h-3.5 w-3.5 animate-spin motion-reduce:animate-none" />}
                            {p.label}
                          </button>
                        );
                      })}
                    </div>
                    {remixError && (
                      <p className="mt-2.5 text-[12.5px] leading-5 text-red-300/80" role="alert">
                        {remixError}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* right: creation details */}
              <ResultPanel
                prompt={data.prompt}
                insight={data.prompt_insight}
                aspectRatio={data.aspect_ratio}
                finishedAt={data.finished_at}
              />
            </div>

            <MoreFromGrill />
          </section>
        )}

        {/* done + unlocked: clean download */}
        {data && data.status === "done" && data.unlocked && (
          <section className="flex flex-1 flex-col items-center py-8 text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300/40 bg-emerald-300/[0.08] px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.1em] text-emerald-300">
              <Check className="h-3.5 w-3.5" />
              Unlocked!
            </span>
            <h1 className="font-display mt-3 text-[26px] font-semibold tracking-[-0.02em] sm:text-[32px]">
              Your clean HD {isVideo ? "clip" : "file"} is ready
            </h1>

            <div className="mt-6 w-full max-w-md overflow-hidden rounded-[16px] border border-white/[0.1]">
              {isVideo ? (
                <video src={cleanUrl} controls playsInline className="block w-full bg-black object-contain" style={{ aspectRatio: cssAspectRatio(data?.aspect_ratio) }} />
              ) : (
                <img src={cleanUrl} alt="Your unlocked AI-generated creation" className="block w-full" />
              )}
            </div>

            <a
              href={cleanUrl}
              download
              className="mt-6 inline-flex items-center gap-2 rounded-[10px] bg-[var(--pro-btn)] px-6 py-3 text-[15px] font-semibold text-[var(--pro-btn-ink)] hover:opacity-95"
            >
              <Download className="h-4 w-4" />
              Download clean HD
            </a>
            <Link
              href={isVideo ? "/create?media=video" : "/create"}
              className="mt-4 text-[13px] text-white/50 hover:text-white/85"
            >
              Make another one
            </Link>
            <MoreFromGrill />
          </section>
        )}
      </main>
      <VilishFooter />

      {payModal && (
        <PaymentModal
          jobId={payModal.jobId}
          initialPayment={payModal.payment}
          onClose={() => setPayModal(null)}
          navigate={(url) => router.push(url)}
          onPaymentVerified={() => {
            setPayModal(null);
            void fetchStatus();
          }}
          onReorder={isPaidImage ? reorderPaidImagePayment : undefined}
        />
      )}
      <AuthModal
        open={authNeeded}
        onClose={() => {
          setAuthNeeded(false);
          setPendingUnlock(false);
        }}
        onAuthenticated={() => {
          setAuthNeeded(false);
          if (pendingUnlock) {
            setPendingUnlock(false);
            void handleUnlock();
          }
          if (pendingRemix) {
            const styled = pendingRemix;
            setPendingRemix(null);
            setRemixBusy("auth");
            void submitRemix(styled).finally(() => setRemixBusy(null));
          }
        }}
      />
    </div>
  );
}
