"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  AudioLines,
  Captions,
  Check,
  Download,
  ImagePlay,
  Loader2,
  Mic,
  Minimize2,
  Music,
  RefreshCcw,
  Scissors,
  Sparkles,
  TriangleAlert,
  Waves,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import VilishNav from "@/components/vilish/nav";
import VilishFooter from "@/components/vilish/footer";
import PopcornReel, { reelFrameForStage } from "@/components/vilish/popcorn-reel";
import { progressForStage } from "@/src/lib/vilish/progress";
import { formatINR } from "@/src/lib/vilish/types";
import { priceOf } from "@/lib/pricing/catalog";
import PaymentModal from "@/components/vilish/payment-modal";
import AuthModal from "@/components/vilish/auth-modal";
import type { ManualPayment } from "@/components/vilish/payment";
import type { VideoTool } from "@/lib/video/constants";

/** Live catalog price — never hardcoded. */
const JOB_PRICE = formatINR(priceOf("video-studio"));

interface JobStatus {
  tool: VideoTool;
  status: "queued" | "processing" | "done" | "failed";
  stage: string | null;
  unlocked: boolean;
  pricePaise: number;
  error?: string;
}

const TOOL_META: Record<
  VideoTool,
  { label: string; icon: LucideIcon; captions: string[]; badge: string; fileNoun: string }
> = {
  tts: {
    label: "Voice-over",
    icon: Mic,
    captions: [
      "Warming up the voice…",
      "Recording the narration…",
      "Ducking the music…",
      "Mixing the final cut…",
    ],
    badge: "AI-generated",
    fileNoun: "video",
  },
  caption: {
    label: "Captions",
    icon: Captions,
    captions: [
      "Listening to the audio…",
      "Timing every line…",
      "Styling the captions…",
      "Burning them in…",
    ],
    badge: "AI-generated",
    fileNoun: "video",
  },
  trim: {
    label: "Trim & text",
    icon: Scissors,
    captions: [
      "Finding the cut points…",
      "Trimming the frames…",
      "Setting the title card…",
      "Exporting the final cut…",
    ],
    badge: "AI-generated",
    fileNoun: "video",
  },
  compress: {
    label: "Compressor",
    icon: Minimize2,
    captions: [
      "Reading the frames…",
      "Squeezing the file…",
      "Keeping the detail…",
      "Writing the final cut…",
    ],
    badge: "Real processing",
    fileNoun: "video",
  },
  convert: {
    label: "MP4 → MP3",
    icon: Music,
    captions: [
      "Reading the video…",
      "Extracting the audio…",
      "Encoding the MP3…",
      "Finishing the track…",
    ],
    badge: "Real processing",
    fileNoun: "audio",
  },
  gif: {
    label: "GIF maker",
    icon: ImagePlay,
    captions: [
      "Finding the frames…",
      "Tuning the palette…",
      "Looping the moment…",
      "Writing the GIF…",
    ],
    badge: "Real processing",
    fileNoun: "GIF",
  },
  "add-audio": {
    label: "Add audio",
    icon: AudioLines,
    captions: [
      "Loading your track…",
      "Mixing the audio…",
      "Syncing the sound…",
      "Writing the final cut…",
    ],
    badge: "Real processing",
    fileNoun: "video",
  },
  denoise: {
    label: "Noise reducer",
    icon: Waves,
    captions: [
      "Listening to the noise…",
      "Filtering the hum…",
      "Keeping the voices…",
      "Writing the final cut…",
    ],
    badge: "Real processing",
    fileNoun: "video",
  },
};

function videoJobPaymentStorageKey(id: string) {
  return `etch:video-job-payment:${id}`;
}

export default function VideoStudioWatchPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params.id;
  const [data, setData] = useState<JobStatus | null>(null);
  const [fetchError, setFetchError] = useState("");
  const [captionIdx, setCaptionIdx] = useState(0);
  const [previewOk, setPreviewOk] = useState(true);
  const dataRef = useRef<JobStatus | null>(null);
  dataRef.current = data;

  // payment flow
  const [payBusy, setPayBusy] = useState(false);
  const [payError, setPayError] = useState("");
  const [payModal, setPayModal] = useState<{ jobId: string; payment: ManualPayment } | null>(null);
  const [authNeeded, setAuthNeeded] = useState(false);
  const [pendingPayment, setPendingPayment] = useState(false);

  const fetchStatus = async () => {
    try {
      const r = await fetch(`/api/video-jobs/${encodeURIComponent(id)}/status`, {
        cache: "no-store",
      });
      if (!r.ok) throw new Error(`status ${r.status}`);
      const b = (await r.json()) as JobStatus;
      setData(b);
      setFetchError("");
      return b;
    } catch {
      setFetchError("Lost the studio for a moment — retrying…");
      return null;
    }
  };

  // poll every 3s until terminal
  useEffect(() => {
    let alive = true;
    let timer: ReturnType<typeof setInterval> | null = null;
    const tick = async () => {
      const cur = dataRef.current;
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

  /** Open the job payment (per-tool catalog price): stored payment first, then server resume. */
  const openPayment = async () => {
    setPayBusy(true);
    setPayError("");
    try {
      try {
        const raw = sessionStorage.getItem(videoJobPaymentStorageKey(id));
        if (raw) {
          const parsed = JSON.parse(raw) as { jobId?: string; payment?: ManualPayment };
          if (parsed?.payment) {
            setPayModal({ jobId: parsed.jobId ?? id, payment: parsed.payment });
            return;
          }
        }
      } catch {
        /* fall through to server resume */
      }
      const res = await fetch(`/api/video-jobs/${encodeURIComponent(id)}/payment`, {
        method: "POST",
      });
      if (res.status === 401) {
        setPendingPayment(true);
        setAuthNeeded(true);
        return;
      }
      const body = await res.json().catch(() => null);
      if (!res.ok || !body?.payment) {
        setPayError(
          typeof body?.error === "string" && body.error
            ? body.error
            : "Could not open payment. Please try again."
        );
        return;
      }
      setPayModal({ jobId: body.id ?? id, payment: body.payment as ManualPayment });
    } finally {
      setPayBusy(false);
    }
  };

  const previewUrl = `/api/video-jobs/${encodeURIComponent(id)}/preview`;
  const cleanUrl = `/api/video-jobs/${encodeURIComponent(id)}/clean`;

  const meta = data ? TOOL_META[data.tool] ?? TOOL_META.tts : TOOL_META.tts;
  const ToolIcon = meta.icon;
  const captions = meta.captions;
  const caption = captions[captionIdx % captions.length];
  const stageText = data?.stage ?? "Getting your video ready…";
  // Real progress from the watcher's stage + status — the bar below
  // reflects actual pipeline position, not a fixed indeterminate width.
  const progress = data ? progressForStage(data.stage, data.status) : 8;

  return (
    <div className="flex min-h-screen flex-col bg-[#080808] font-sans text-[#F5F5F3] antialiased">
      <VilishNav />
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 pb-16 pt-8 sm:pt-12">
        <Link
          href="/video-studio"
          className="inline-flex w-fit items-center gap-1.5 text-[13px] text-white/50 hover:text-white/85"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Video Studio
        </Link>

        {/* initial load */}
        {!data && !fetchError && (
          <div className="flex flex-1 flex-col items-center justify-center py-24 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-[var(--pro-accent)]" />
            <p className="mt-4 text-[14px] text-white/50">Finding your job…</p>
          </div>
        )}

        {/* fetch error before first status */}
        {!data && fetchError && (
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

        {/* failed */}
        {data && data.status === "failed" && (
          <section className="flex flex-1 flex-col items-center py-12 text-center">
            <h1 className="font-display text-[26px] font-semibold tracking-[-0.02em] sm:text-[32px]">
              The studio couldn&apos;t finish this one
            </h1>
            <p className="mt-3 max-w-md text-[14px] leading-6 text-white/60">
              Your {meta.label.toLowerCase()} job didn&apos;t make it — nothing
              was charged.
            </p>
            {data.error && (
              <p className="mt-3 max-w-md text-[13px] text-white/40">{data.error}</p>
            )}
            <Link
              href="/video-studio"
              className="mt-7 inline-flex items-center gap-2 min-h-[44px] rounded-[10px] bg-[var(--pro-btn)] px-5 py-2.5 text-[14px] font-semibold text-[var(--pro-btn-ink)] hover:opacity-95"
            >
              <RefreshCcw className="h-4 w-4" />
              Try again
            </Link>
          </section>
        )}

        {/* processing / queued */}
        {data && data.status !== "failed" && data.status !== "done" && (
          <section className="flex flex-1 flex-col items-center py-8 text-center" aria-live="polite">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--pro-accent)]">
              {meta.label} · {JOB_PRICE} · {meta.badge}
            </p>
            <h1 className="font-display mt-2 text-[26px] font-semibold tracking-[-0.02em] sm:text-[32px]">
              Your video is in the studio
            </h1>

            <div className="mt-6 w-full max-w-[420px]">
              <PopcornReel frame={reelFrameForStage(data.stage)} />
            </div>

            <p className="font-display mt-4 flex items-center gap-2 text-[16px] font-medium text-[#F5F5F3]">
              <ToolIcon className="h-4 w-4 text-[var(--pro-accent)]" />
              {stageText}
            </p>
            <p key={captionIdx} className="fg-caption mt-1.5 h-6 text-[13px] text-white/45">
              {caption}
            </p>

            <div
              className="mt-6 w-full max-w-[320px]"
              role="progressbar"
              aria-label="Video progress"
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

            {/* pay-ping: payment can be completed while the job runs */}
            <div className="mt-8 w-full max-w-md rounded-[14px] border border-white/[0.08] bg-white/[0.02] p-4 text-left">
              <p className="text-[13px] font-semibold text-[#F5F5F3]">
                Pay {JOB_PRICE} while you wait
              </p>
              <p className="mt-1 text-[12px] leading-5 text-white/50">
                One UPI payment, no subscription. Tap “I&apos;ve paid” after
                paying — the clean HD file unlocks here as soon as the payment
                is confirmed.
              </p>
              <button
                type="button"
                onClick={openPayment}
                disabled={payBusy}
                className={cn(
                  "pro-cta mt-3 flex min-h-[44px] w-full items-center justify-center gap-2 rounded-[10px] px-5 py-2.5 text-[14px] font-semibold text-[var(--pro-btn-ink)]",
                  payBusy ? "cursor-wait opacity-70" : "hover:opacity-95",
                )}
              >
                {payBusy && <Loader2 className="h-4 w-4 animate-spin" />}
                Open payment — {JOB_PRICE}
              </button>
              {payError && (
                <p className="mt-2 text-[12px] text-red-300/80" role="alert">
                  {payError}
                </p>
              )}
            </div>
            {fetchError && <p className="mt-3 text-[12px] text-white/40">{fetchError}</p>}
          </section>
        )}

        {/* done + locked: watermarked preview with unlock CTA */}
        {data && data.status === "done" && !data.unlocked && (
          <section className="flex flex-1 flex-col items-center py-8 text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--pro-accent)]/40 bg-[var(--pro-accent)]/[0.08] px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.1em] text-[var(--pro-accent)]">
              <Sparkles className="h-3.5 w-3.5" />
              Your {meta.label.toLowerCase()} preview — {meta.badge}
            </span>

            <div className="mt-6 w-full max-w-md overflow-hidden rounded-[16px] border border-white/[0.1]">
              {previewOk ? (
                meta.fileNoun === "audio" ? (
                  <audio
                    src={previewUrl}
                    controls
                    className="block w-full bg-[#121214] px-4 py-6"
                    onError={() => setPreviewOk(false)}
                  />
                ) : (
                  <video
                    src={previewUrl}
                    muted
                    loop
                    playsInline
                    autoPlay
                    controls
                    className="block w-full bg-black object-contain"
                    style={{ maxHeight: "72vh" }}
                    onError={() => setPreviewOk(false)}
                  />
                )
              ) : (
                <p className="px-6 py-12 text-[13px] text-white/45">
                  The preview file isn&apos;t ready to show yet — try refreshing in a moment.
                </p>
              )}
              <p className="border-t border-white/[0.08] bg-[#121214] px-4 py-2 text-[11px] uppercase tracking-[0.08em] text-white/40">
                {meta.fileNoun === "audio"
                  ? "Audio preview · listen before you unlock"
                  : `Watermarked preview · ${meta.badge}`}
              </p>
            </div>

            <p className="mt-5 max-w-md text-[14px] leading-6 text-white/60">
              {meta.fileNoun === "audio"
                ? `Listen to your MP3 above — the download is yours for ${JOB_PRICE}.`
                : `Watermarked preview. The clean ${meta.fileNoun} is yours for ${JOB_PRICE}.`}
            </p>

            <button
              type="button"
              onClick={openPayment}
              disabled={payBusy}
              className={cn(
                "pro-cta mt-5 inline-flex items-center gap-2 rounded-[10px] px-6 py-3 text-[15px] font-semibold text-[var(--pro-btn-ink)]",
                payBusy ? "cursor-wait opacity-70" : "hover:opacity-95",
              )}
            >
              {payBusy && <Loader2 className="h-4 w-4 animate-spin" />}
              Unlock clean {meta.fileNoun} — {JOB_PRICE}
            </button>
            {payError && (
              <p className="mt-3 max-w-md text-[13px] text-red-300/80" role="alert">
                {payError}
              </p>
            )}
            <p className="mt-3 text-[12px] text-white/35">
              This is a preview, not a finished order — unlock only if you love it.
            </p>
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
              Your clean {meta.fileNoun} is ready
            </h1>

            <div className="mt-6 w-full max-w-md overflow-hidden rounded-[16px] border border-white/[0.1]">
              {meta.fileNoun === "audio" ? (
                <audio src={cleanUrl} controls className="block w-full bg-[#121214] px-4 py-6" />
              ) : (
                <video src={cleanUrl} controls playsInline className="block w-full bg-black object-contain" style={{ maxHeight: "72vh" }} />
              )}
              <p className="border-t border-white/[0.08] bg-[#121214] px-4 py-2 text-[11px] uppercase tracking-[0.08em] text-white/40">
                {meta.badge}
              </p>
            </div>

            <a
              href={cleanUrl}
              download
              className="mt-6 inline-flex items-center gap-2 rounded-[10px] bg-[var(--pro-btn)] px-6 py-3 text-[15px] font-semibold text-[var(--pro-btn-ink)] hover:opacity-95"
            >
              <Download className="h-4 w-4" />
              Download clean {meta.fileNoun}
            </a>
            <Link
              href="/video-studio"
              className="mt-4 text-[13px] text-white/50 hover:text-white/85"
            >
              Make another one
            </Link>
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
        />
      )}
      <AuthModal
        open={authNeeded}
        onClose={() => {
          setAuthNeeded(false);
          setPendingPayment(false);
        }}
        onAuthenticated={() => {
          setAuthNeeded(false);
          if (pendingPayment) {
            setPendingPayment(false);
            void openPayment();
          }
        }}
      />
    </div>
  );
}
