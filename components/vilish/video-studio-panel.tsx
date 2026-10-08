"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  AudioLines,
  Captions,
  Check,
  ChevronRight,
  FileVideo,
  ImagePlay,
  Loader2,
  Mic,
  Minimize2,
  Music,
  Scissors,
  ShieldCheck,
  Sparkles,
  Upload,
  Waves,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import VilishNav from "@/components/vilish/nav";
import VilishFooter from "@/components/vilish/footer";
import AuthModal from "@/components/vilish/auth-modal";
import Reveal from "@/components/motion/Reveal";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import { priceOf } from "@/lib/pricing/catalog";
import { formatINR } from "@/src/lib/vilish/types";
import {
  ADD_AUDIO_MODES,
  COMPRESS_QUALITIES,
  DENOISE_STRENGTHS,
  GIF_FPS,
  GIF_WIDTHS,
  SCRIPT_MAX,
  TEXT_POSITIONS,
  TOOL_PRICE_PAISE,
  TTS_VOICES,
  type VideoTool,
} from "@/lib/video/constants";
import {
  DEFAULT_TOOL_FOR_CLIP,
  sourceReady,
  toolSupportsClipSource,
  type EditSourceKind,
} from "@/src/lib/video/edit-flow";

const MAX_FILE_BYTES = 50 * 1024 * 1024;
const MAX_AUDIO_BYTES = 20 * 1024 * 1024;

/** Live per-tool catalog price — trivial converters ₹5, heavier processing
 *  ₹10, AI jobs (voice-over, captions) ₹29. Never hardcoded. */
function toolPrice(t: VideoTool): string {
  return formatINR(TOOL_PRICE_PAISE[t]);
}

interface ToolMeta {
  id: VideoTool;
  label: string;
  icon: LucideIcon;
  tagline: string;
  desc: string;
  accent: string;
  border: string;
  /** Honest badge: AI-powered vs real processing. */
  badge: string;
}

const TOOLS: ToolMeta[] = [
  {
    badge: "AI-generated",
    id: "tts",
    label: "Voice-over",
    icon: Mic,
    tagline: "AI narration, ducked under your audio",
    desc: "Paste a script and choose a voice vibe — spoken over your video with the music ducked underneath.",
    accent: "text-[var(--pro-accent)]",
    border: "border-[var(--pro-accent)]/40",
  },
  {
    badge: "AI-generated",
    id: "caption",
    label: "Captions",
    icon: Captions,
    tagline: "Styled captions, burned in",
    desc: "Auto-transcribed by AI or set from your script text. Cyberpunk styling, readable and safe-area aware.",
    accent: "text-[var(--pro-accent)]",
    border: "border-[var(--pro-accent)]/40",
  },
  {
    badge: "AI-generated",
    id: "trim",
    label: "Trim & text",
    icon: Scissors,
    tagline: "Cut + title card",
    desc: "Set start and end seconds, add an optional title-card text overlay in three positions.",
    accent: "text-[var(--pro-accent)]",
    border: "border-[var(--pro-accent)]/40",
  },
  {
    badge: "Real processing",
    id: "compress",
    label: "Compressor",
    icon: Minimize2,
    tagline: "Shrink the file, keep the video",
    desc: "Re-encode to H.264 at a smaller size — pick how aggressive the squeeze is.",
    accent: "text-[var(--pro-accent)]",
    border: "border-[var(--pro-accent)]/40",
  },
  {
    badge: "Real processing",
    id: "convert",
    label: "MP4 → MP3",
    icon: Music,
    tagline: "Pull the audio out as MP3",
    desc: "Extract your video's soundtrack as a 128kbps MP3 — ringtones, voice notes, podcast cuts.",
    accent: "text-[var(--pro-accent)]",
    border: "border-[var(--pro-accent)]/40",
  },
  {
    badge: "Real processing",
    id: "gif",
    label: "GIF maker",
    icon: ImagePlay,
    tagline: "Clip → shareable GIF",
    desc: "Turn up to 10 seconds into an optimized looping GIF — palette-tuned, sized for sharing.",
    accent: "text-[var(--pro-accent)]",
    border: "border-[var(--pro-accent)]/40",
  },
  {
    badge: "Real processing",
    id: "add-audio",
    label: "Add audio",
    icon: AudioLines,
    tagline: "Lay music or VO over video",
    desc: "Upload an MP3/WAV/M4A track and mix it over your video — or replace its audio entirely.",
    accent: "text-[var(--pro-accent)]",
    border: "border-[var(--pro-accent)]/40",
  },
  {
    badge: "Real processing",
    id: "denoise",
    label: "Noise reducer",
    icon: Waves,
    tagline: "Tame hum, hiss and rumble",
    desc: "Reduce steady background noise from your video's audio. Honest cleanup — not a studio remaster.",
    accent: "text-[var(--pro-accent)]",
    border: "border-[var(--pro-accent)]/40",
  },
];

interface Clip {
  id: string;
  createdAt: string | null;
}

function videoJobPaymentStorageKey(id: string) {
  return `etch:video-job-payment:${id}`;
}

function FilePicker({
  file,
  onPick,
  error,
  accept = "video/mp4,.mp4",
  emptyTitle = "Upload your video",
  emptyHint = "MP4 · up to 50MB",
}: {
  file: File | null;
  onPick: (f: File | null) => void;
  error: string;
  accept?: string;
  emptyTitle?: string;
  emptyHint?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <div>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className={cn(
          "flex w-full items-center gap-3 rounded-[12px] border border-dashed px-4 py-4 text-left transition-colors",
          file
            ? "border-[var(--pro-accent)]/40 bg-[var(--pro-accent)]/[0.04]"
            : "border-white/[0.15] bg-white/[0.02] hover:border-white/30",
        )}
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-white/[0.06]">
          {file ? (
            <FileVideo className="h-5 w-5 text-[var(--pro-accent)]" />
          ) : (
            <Upload className="h-5 w-5 text-white/50" />
          )}
        </span>
        <span className="min-w-0 flex-1">
          {file ? (
            <>
              <span className="block truncate text-[13px] font-medium text-[#F5F5F3]">
                {file.name}
              </span>
              <span className="block text-[12px] text-white/45">
                {(file.size / (1024 * 1024)).toFixed(1)} MB · tap to change
              </span>
            </>
          ) : (
            <>
              <span className="block text-[13px] font-medium text-[#F5F5F3]">
                {emptyTitle}
              </span>
              <span className="block text-[12px] text-white/45">
                {emptyHint}
              </span>
            </>
          )}
        </span>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => onPick(e.target.files?.[0] ?? null)}
      />
      {error && (
        <p className="mt-2 text-[12px] text-red-300/80" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

function CharCount({ value, max }: { value: string; max: number }) {
  return (
    <p
      className={cn(
        "mt-1.5 text-right text-[11px]",
        value.length > max ? "text-red-300/80" : "text-white/35",
      )}
    >
      {value.length} / {max}
    </p>
  );
}

export default function VideoStudioPanel({
  chrome = true,
  initialTool,
}: {
  chrome?: boolean;
  /** Deep-link support, e.g. /video-studio?tool=caption. */
  initialTool?: VideoTool;
}) {
  const router = useRouter();
  const [tool, setTool] = useState<VideoTool>(initialTool ?? "tts");
  const [busy, setBusy] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [authNeeded, setAuthNeeded] = useState(false);
  const [pendingSubmit, setPendingSubmit] = useState(false);

  // ── edit-video flow (Oct 2026 rework) ──────────────────────────────
  // Step 1 (the landing): pick the source — upload an MP4 or choose one
  // of your AI-generated clips. Step 2: the 8 tools become secondary
  // choices, then straight into processing on submit.
  const [step, setStep] = useState<1 | 2>(1);
  const [sourceKind, setSourceKind] = useState<EditSourceKind>("upload");
  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [sourceFileError, setSourceFileError] = useState("");
  const [clips, setClips] = useState<Clip[]>([]);
  const [clipId, setClipId] = useState("");
  const [clipsLoading, setClipsLoading] = useState(false);

  // tts
  const [script, setScript] = useState("");
  const [voice, setVoice] = useState("warm");

  // caption
  const [capMode, setCapMode] = useState<"auto" | "script">("auto");
  const [capText, setCapText] = useState("");

  // trim
  const [trimStart, setTrimStart] = useState("");
  const [trimEnd, setTrimEnd] = useState("");
  const [trimText, setTrimText] = useState("");
  const [trimPos, setTrimPos] = useState("bottom");

  // compress
  const [compQuality, setCompQuality] = useState("balanced");

  // gif
  const [gifStart, setGifStart] = useState("");
  const [gifEnd, setGifEnd] = useState("");
  const [gifFps, setGifFps] = useState("12");
  const [gifWidth, setGifWidth] = useState("480");

  // add-audio (the source video is shared; the audio track is its own upload)
  const [aaAudio, setAaAudio] = useState<File | null>(null);
  const [aaAudioError, setAaAudioError] = useState("");
  const [aaMode, setAaMode] = useState("mix");

  // denoise
  const [dnStrength, setDnStrength] = useState("medium");

  useEffect(() => {
    // Generated-clip picker is shared across the flow — fetch once the
    // user opens the clip tab, regardless of the selected tool.
    if (sourceKind !== "clip" || clips.length > 0 || clipsLoading) return;
    let alive = true;
    setClipsLoading(true);
    fetch("/api/video-jobs/clips", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : { clips: [] }))
      .then((b) => {
        if (alive) setClips(Array.isArray(b?.clips) ? b.clips : []);
      })
      .catch(() => {})
      .finally(() => {
        if (alive) setClipsLoading(false);
      });
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sourceKind]);

  const pickFile =
    (setFile: (f: File | null) => void, setErr: (s: string) => void) =>
    (f: File | null) => {
      setErr("");
      if (!f) {
        setFile(null);
        return;
      }
      const isMp4 =
        f.type === "video/mp4" || /\.mp4$/i.test(f.name) || f.type === "";
      if (!isMp4) {
        setErr("Only .mp4 videos are accepted.");
        return;
      }
      if (f.size > MAX_FILE_BYTES) {
        setErr("That video is over 50MB — trim it down first.");
        return;
      }
      setFile(f);
    };

  const pickAudioFile =
    (setFile: (f: File | null) => void, setErr: (s: string) => void) =>
    (f: File | null) => {
      setErr("");
      if (!f) {
        setFile(null);
        return;
      }
      const isAudio =
        f.type.startsWith("audio/") ||
        /\.(mp3|wav|m4a)$/i.test(f.name) ||
        f.type === "";
      if (!isAudio) {
        setErr("Only .mp3, .wav or .m4a audio files are accepted.");
        return;
      }
      if (f.size > MAX_AUDIO_BYTES) {
        setErr("That audio file is over 20MB — pick a shorter one.");
        return;
      }
      setFile(f);
    };

  const activeMeta = TOOLS.find((t) => t.id === tool)!;

  /** Step-1 source tab switch — a generated clip only supports voice-over. */
  const selectSourceKind = (kind: EditSourceKind) => {
    setSourceKind(kind);
    setSubmitError("");
    if (kind === "clip" && !toolSupportsClipSource(tool)) {
      setTool(DEFAULT_TOOL_FOR_CLIP);
    }
  };

  /** The shared source video — one upload (or clip pick) serves every tool. */
  const onPickSourceFile = pickFile(setSourceFile, setSourceFileError);

  const buildPayload = (): {
    params: unknown;
    file: File | null;
    audioFile: File | null;
  } | null => {
    if (tool === "tts") {
      if (!script.trim() || script.trim().length > SCRIPT_MAX) {
        setSubmitError(`Script must be 1–${SCRIPT_MAX} characters.`);
        return null;
      }
      if (sourceKind === "upload") {
        if (!sourceFile) {
          setSubmitError("Add your video first.");
          return null;
        }
        return {
          params: { script: script.trim(), voice, sourceKind: "upload" },
          file: sourceFile,
          audioFile: null,
        };
      }
      if (!clipId) {
        setSubmitError("Pick one of your generated clips.");
        return null;
      }
      return {
        params: {
          script: script.trim(),
          voice,
          sourceKind: "clip",
          generationId: clipId,
        },
        file: null,
        audioFile: null,
      };
    }
    // Every other tool needs the shared uploaded video.
    if (!sourceFile) {
      setSubmitError("Add your video first.");
      return null;
    }
    if (tool === "caption") {
      if (capMode === "script" && (!capText.trim() || capText.trim().length > SCRIPT_MAX)) {
        setSubmitError(`Caption text must be 1–${SCRIPT_MAX} characters.`);
        return null;
      }
      return {
        params:
          capMode === "auto"
            ? { mode: "auto" }
            : { mode: "script", text: capText.trim() },
        file: sourceFile,
        audioFile: null,
      };
    }
    if (tool === "trim") {
      const start = Number(trimStart);
      const end = Number(trimEnd);
      if (!Number.isFinite(start) || start < 0 || !Number.isFinite(end) || end <= 0) {
        setSubmitError("Enter start and end in seconds (end after start).");
        return null;
      }
      if (end <= start) {
        setSubmitError("End must be after start.");
        return null;
      }
      return {
        params: {
          start,
          end,
          ...(trimText.trim()
            ? { text: trimText.trim(), position: trimPos }
            : {}),
        },
        file: sourceFile,
        audioFile: null,
      };
    }
    if (tool === "compress") {
      return { params: { quality: compQuality }, file: sourceFile, audioFile: null };
    }
    if (tool === "convert") {
      return { params: {}, file: sourceFile, audioFile: null };
    }
    if (tool === "gif") {
      const start = Number(gifStart);
      const end = Number(gifEnd);
      if (!Number.isFinite(start) || start < 0 || !Number.isFinite(end) || end <= 0) {
        setSubmitError("Enter start and end in seconds (end after start).");
        return null;
      }
      if (end <= start) {
        setSubmitError("End must be after start.");
        return null;
      }
      if (end - start > 10) {
        setSubmitError("GIF clips are capped at 10 seconds.");
        return null;
      }
      return {
        params: { start, end, fps: Number(gifFps), width: Number(gifWidth) },
        file: sourceFile,
        audioFile: null,
      };
    }
    if (tool === "add-audio") {
      if (!aaAudio) {
        setSubmitError("Upload the audio track to add.");
        return null;
      }
      return {
        params: { mode: aaMode },
        file: sourceFile,
        audioFile: aaAudio,
      };
    }
    // denoise
    return { params: { strength: dnStrength }, file: sourceFile, audioFile: null };
  };

  const submit = async () => {
    setSubmitError("");
    const payload = buildPayload();
    if (!payload) return;
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append("tool", tool);
      fd.append("params", JSON.stringify(payload.params));
      if (payload.file) fd.append("video", payload.file);
      if (payload.audioFile) fd.append("audio", payload.audioFile);
      const res = await fetch("/api/video-jobs", { method: "POST", body: fd });
      if (res.status === 401) {
        setPendingSubmit(true);
        setAuthNeeded(true);
        return;
      }
      const body = await res.json().catch(() => null);
      if (body?.adminBypass) {
        // Owner bypass: order auto-verified, no payment needed.
        router.push(body.watchUrl ?? `/video-studio/watch/${body.id}`);
        return;
      }
      if (!res.ok || !body?.id || !body?.payment) {
        setSubmitError(
          typeof body?.error === "string" && body.error
            ? body.error
            : "Could not start the job. Please try again."
        );
        return;
      }
      try {
        sessionStorage.setItem(
          videoJobPaymentStorageKey(body.id),
          JSON.stringify({ jobId: body.id, payment: body.payment })
        );
      } catch {
        /* storage is best-effort; the watch room can resume via API */
      }
      router.push(body.watchUrl ?? `/video-studio/watch/${body.id}`);
    } finally {
      setBusy(false);
    }
  };

  // Step-1 gate: Continue is enabled once the chosen source has a video.
  const ready = sourceReady(sourceKind, sourceFile, clipId);

  const content = (
    <>
      {chrome && <VilishNav />}
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 pb-20 pt-8 sm:pt-12">
        <Reveal>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--pro-accent)]">
            Etch · Video Studio · AI + real tools
          </p>
          <h1 className="font-display mt-2 text-[30px] font-semibold tracking-[-0.02em] sm:text-[40px]">
            Give your video a <span className="pro-accent-text">studio finish</span>
          </h1>
          <p className="mt-3 max-w-xl text-[14px] leading-6 text-white/60">
            {step === 1 ? (
              <>
                Add your video first — upload a raw MP4 or pick one of your
                AI-generated clips — then choose the edit.{" "}
                <span className="text-white/85">from {formatINR(priceOf("tool-basic"))} per job</span> —
                one UPI payment, no subscription.
              </>
            ) : (
              <>
                A watermarked preview plays while you wait; the clean file
                unlocks after payment.{" "}
                <span className="text-white/85">from {formatINR(priceOf("tool-basic"))} per job</span> —
                one UPI payment, no subscription.
              </>
            )}
          </p>
          {chrome && (
            <p className="mt-2.5 text-[13px] leading-6 text-white/45">
              Creating from scratch instead?{" "}
              <Link
                href="/create#how-it-works"
                className="font-medium text-white/70 underline underline-offset-4 transition-colors hover:text-white"
              >
                See how the creation flow works
              </Link>
              .
            </p>
          )}
        </Reveal>

        {step === 1 ? (
          /* ── step 1: the source (primary landing) ──────────────────── */
          <Reveal className="mt-8" delay={0.05}>
            <section
              aria-label="Add your video"
              className="rounded-[16px] border border-white/[0.08] bg-white/[0.02] p-5 sm:p-6"
            >
              <h2 className="font-display text-[18px] font-semibold">
                Add your video
              </h2>
              <p className="mt-1.5 text-[13px] leading-6 text-white/55">
                Upload a raw video, or pick one of your AI-generated clips —
                then choose what to do with it.
              </p>
              <div
                className="mt-5 grid grid-cols-2 gap-2"
                role="group"
                aria-label="Video source"
              >
                {(["upload", "clip"] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => selectSourceKind(s)}
                    aria-pressed={sourceKind === s}
                    className={cn(
                      "rounded-[10px] border px-3 py-3 text-[13px] font-semibold transition-colors",
                      sourceKind === s
                        ? "border-[var(--pro-accent)]/50 bg-[var(--pro-accent)]/[0.08] text-[#F5F5F3]"
                        : "border-white/[0.1] text-white/55 hover:border-white/25",
                    )}
                  >
                    {s === "upload" ? "Upload video" : "My generated clip"}
                  </button>
                ))}
              </div>
              <div className="mt-4">
                {sourceKind === "upload" ? (
                  <FilePicker
                    file={sourceFile}
                    onPick={onPickSourceFile}
                    error={sourceFileError}
                  />
                ) : clipsLoading ? (
                  <p className="flex items-center gap-2 text-[13px] text-white/45">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading your clips…
                  </p>
                ) : clips.length === 0 ? (
                  <p className="rounded-[10px] border border-white/[0.08] bg-white/[0.02] px-4 py-3 text-[13px] text-white/50">
                    No finished AI clips yet — generate one from the composer
                    first, or upload a video instead.
                  </p>
                ) : (
                  <div className="grid gap-2">
                    {clips.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setClipId(c.id)}
                        aria-pressed={clipId === c.id}
                        className={cn(
                          "flex items-center gap-3 rounded-[10px] border px-3.5 py-2.5 text-left transition-colors",
                          clipId === c.id
                            ? "border-[var(--pro-accent)]/50 bg-[var(--pro-accent)]/[0.08]"
                            : "border-white/[0.1] hover:border-white/25",
                        )}
                      >
                        <FileVideo className="h-4 w-4 shrink-0 text-[var(--pro-accent)]" />
                        <span className="min-w-0">
                          <span className="block truncate font-mono text-[12px] text-white/80">
                            {c.id.slice(0, 8)}…
                          </span>
                          <span className="block text-[11px] text-white/40">
                            AI-generated clip
                            {c.createdAt
                              ? ` · ${new Date(c.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}`
                              : ""}
                          </span>
                        </span>
                        {clipId === c.id && (
                          <Check className="ml-auto h-4 w-4 shrink-0 text-[var(--pro-accent)]" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {sourceKind === "clip" && (
                <p className="mt-3 text-[12px] text-white/40">
                  Generated clips work with voice-over — upload a video to
                  unlock all eight tools.
                </p>
              )}
              <button
                type="button"
                disabled={!ready}
                onClick={() => {
                  setStep(2);
                  setSubmitError("");
                }}
                className={cn(
                  "pro-cta mt-5 flex w-full items-center justify-center gap-2 rounded-[10px] px-5 py-3 text-[15px] font-semibold text-[var(--pro-btn-ink)]",
                  ready ? "hover:opacity-95" : "cursor-not-allowed opacity-40",
                )}
              >
                Continue — pick your edit
                <ChevronRight className="h-4 w-4" />
              </button>
            </section>
          </Reveal>
        ) : (
          /* ── step 2: the tools (secondary — the edit choices) ──────── */
          <>
            <Reveal className="mt-8" delay={0.03}>
              <div className="flex items-center gap-3 rounded-[12px] border border-white/[0.08] bg-white/[0.02] px-4 py-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-white/[0.06]">
                  <FileVideo className="h-4 w-4 text-[var(--pro-accent)]" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] font-medium text-[#F5F5F3]">
                    {sourceKind === "upload"
                      ? sourceFile?.name
                      : `AI-generated clip ${clipId.slice(0, 8)}…`}
                  </span>
                  <span className="block text-[11px] text-white/40">
                    {sourceKind === "upload"
                      ? `${((sourceFile?.size ?? 0) / (1024 * 1024)).toFixed(1)} MB`
                      : "Generated clip"}
                  </span>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setStep(1);
                    setSubmitError("");
                  }}
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-[8px] border border-white/[0.12] px-3 py-1.5 text-[12px] font-medium text-white/60 transition-colors hover:border-white/25 hover:text-white/90"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Change
                </button>
              </div>
            </Reveal>

            <p className="mt-8 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/45">
              What should we do with it?
            </p>
            <Stagger className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
              {TOOLS.map((t) => {
                const Icon = t.icon;
                const active = tool === t.id;
                const disabled =
                  sourceKind === "clip" && !toolSupportsClipSource(t.id);
                return (
                  <StaggerItem key={t.id}>
                    <button
                      type="button"
                      disabled={disabled}
                      title={
                        disabled
                          ? "Upload a video to use this tool"
                          : t.tagline
                      }
                      onClick={() => {
                        setTool(t.id);
                        setSubmitError("");
                      }}
                      aria-pressed={active}
                      className={cn(
                        "flex w-full items-center gap-2.5 rounded-[12px] border bg-white/[0.02] p-3 text-left transition-all",
                        disabled && "cursor-not-allowed opacity-35",
                        !disabled &&
                          (active
                            ? t.border
                            : "border-white/[0.08] hover:border-white/25"),
                      )}
                    >
                      <span
                        className={cn(
                          "flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-white/[0.06]",
                          t.accent,
                        )}
                      >
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className="min-w-0">
                        <span className="flex items-center gap-1 text-[13px] font-semibold">
                          {t.label}
                          {active && (
                            <Check className="h-3.5 w-3.5 text-[var(--pro-accent)]" />
                          )}
                        </span>
                        <span className="mt-0.5 block text-[11px] font-medium tabular-nums text-white/50">
                          {toolPrice(t.id)}/job
                        </span>
                      </span>
                    </button>
                  </StaggerItem>
                );
              })}
            </Stagger>
          </>
        )}

        {/* tool form */}
        {step === 2 && (
        <Reveal className="mt-6" delay={0.05}>
          <section
            aria-label={`${activeMeta.label} tool`}
            className="rounded-[16px] border border-white/[0.08] bg-white/[0.02] p-5 sm:p-6"
          >
            <div className="flex items-center gap-2.5">
              <activeMeta.icon className={cn("h-5 w-5", activeMeta.accent)} />
              <h2 className="font-display text-[18px] font-semibold">
                {activeMeta.label}
              </h2>
              <span className="ml-auto inline-flex items-center gap-1 rounded-full border border-white/[0.12] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-white/45">
                <Sparkles className="h-3 w-3" />
                {activeMeta.badge}
              </span>
            </div>
            <p className="mt-2 text-[13px] leading-6 text-white/55">
              {activeMeta.desc}
            </p>

            <div className="mt-5 space-y-5">
              {tool === "tts" && (
                <>
                  <div>
                    <label
                      htmlFor="tts-script"
                      className="mb-2 block text-[12px] font-semibold uppercase tracking-[0.1em] text-white/50"
                    >
                      Script
                    </label>
                    <textarea
                      id="tts-script"
                      value={script}
                      onChange={(e) => setScript(e.target.value)}
                      rows={5}
                      maxLength={SCRIPT_MAX + 50}
                      placeholder="Paste the narration script — it'll be spoken over your video with the music ducked underneath."
                      className="w-full resize-y rounded-[10px] border border-white/[0.12] bg-[#0c0c0e] px-3.5 py-3 text-[14px] leading-6 text-[#F5F5F3] placeholder:text-white/30 focus:border-[var(--pro-accent)]/60 focus:outline-none"
                    />
                    <CharCount value={script} max={SCRIPT_MAX} />
                  </div>

                  <div>
                    <p className="mb-2 text-[12px] font-semibold uppercase tracking-[0.1em] text-white/50">
                      Voice vibe
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {TTS_VOICES.map((v) => (
                        <button
                          key={v.id}
                          type="button"
                          onClick={() => setVoice(v.id)}
                          aria-pressed={voice === v.id}
                          className={cn(
                            "rounded-[10px] border px-3.5 py-2.5 text-left transition-colors",
                            voice === v.id
                              ? "border-[var(--pro-accent)]/50 bg-[var(--pro-accent)]/[0.08]"
                              : "border-white/[0.1] hover:border-white/25",
                          )}
                        >
                          <span className="block text-[13px] font-semibold text-[#F5F5F3]">
                            {v.label}
                          </span>
                          <span className="block text-[11px] text-white/45">
                            {v.hint}
                          </span>
                        </button>
                      ))}
                    </div>
                    <p className="mt-2 text-[11px] text-white/35">
                      Voices are AI-generated — pick the vibe closest to your video.
                    </p>
                  </div>
                </>
              )}

              {tool === "caption" && (
                <>
                  <div>
                    <p className="mb-2 text-[12px] font-semibold uppercase tracking-[0.1em] text-white/50">
                      Caption source
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {(["auto", "script"] as const).map((m) => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => setCapMode(m)}
                          aria-pressed={capMode === m}
                          className={cn(
                            "rounded-[10px] border px-3 py-2.5 text-[13px] font-medium transition-colors",
                            capMode === m
                              ? "border-[var(--pro-accent)]/50 bg-[var(--pro-accent)]/[0.08] text-[#F5F5F3]"
                              : "border-white/[0.1] text-white/55 hover:border-white/25",
                          )}
                        >
                          {m === "auto" ? "Auto-transcribe" : "Paste my text"}
                        </button>
                      ))}
                    </div>
                  </div>
                  {capMode === "script" ? (
                    <div>
                      <label
                        htmlFor="cap-text"
                        className="mb-2 block text-[12px] font-semibold uppercase tracking-[0.1em] text-white/50"
                      >
                        Script / SRT text
                      </label>
                      <textarea
                        id="cap-text"
                        value={capText}
                        onChange={(e) => setCapText(e.target.value)}
                        rows={5}
                        maxLength={SCRIPT_MAX + 50}
                        placeholder="Paste the spoken words (or SRT). They'll be timed and styled as captions."
                        className="w-full resize-y rounded-[10px] border border-white/[0.12] bg-[#0c0c0e] px-3.5 py-3 text-[14px] leading-6 text-[#F5F5F3] placeholder:text-white/30 focus:border-[var(--pro-accent)]/60 focus:outline-none"
                      />
                      <CharCount value={capText} max={SCRIPT_MAX} />
                    </div>
                  ) : (
                    <p className="rounded-[10px] border border-[var(--pro-accent)]/20 bg-[var(--pro-accent)]/[0.04] px-4 py-3 text-[12px] leading-5 text-white/55">
                      AI transcription will listen to your video and burn in
                      styled cyberpunk captions. Transcription is AI-generated —
                      give it a watch before you post.
                    </p>
                  )}
                </>
              )}

              {tool === "trim" && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label
                        htmlFor="trim-start"
                        className="mb-2 block text-[12px] font-semibold uppercase tracking-[0.1em] text-white/50"
                      >
                        Start (sec)
                      </label>
                      <input
                        id="trim-start"
                        inputMode="decimal"
                        value={trimStart}
                        onChange={(e) => setTrimStart(e.target.value)}
                        placeholder="0"
                        className="w-full rounded-[10px] border border-white/[0.12] bg-[#0c0c0e] px-3.5 py-2.5 text-[14px] text-[#F5F5F3] placeholder:text-white/30 focus:border-[var(--pro-accent)]/60 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="trim-end"
                        className="mb-2 block text-[12px] font-semibold uppercase tracking-[0.1em] text-white/50"
                      >
                        End (sec)
                      </label>
                      <input
                        id="trim-end"
                        inputMode="decimal"
                        value={trimEnd}
                        onChange={(e) => setTrimEnd(e.target.value)}
                        placeholder="15"
                        className="w-full rounded-[10px] border border-white/[0.12] bg-[#0c0c0e] px-3.5 py-2.5 text-[14px] text-[#F5F5F3] placeholder:text-white/30 focus:border-[var(--pro-accent)]/60 focus:outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label
                      htmlFor="trim-text"
                      className="mb-2 block text-[12px] font-semibold uppercase tracking-[0.1em] text-white/50"
                    >
                      Title-card text <span className="normal-case tracking-normal text-white/35">(optional)</span>
                    </label>
                    <input
                      id="trim-text"
                      value={trimText}
                      onChange={(e) => setTrimText(e.target.value)}
                      maxLength={150}
                      placeholder="e.g. Midnight in the Hills"
                      className="w-full rounded-[10px] border border-white/[0.12] bg-[#0c0c0e] px-3.5 py-2.5 text-[14px] text-[#F5F5F3] placeholder:text-white/30 focus:border-[var(--pro-accent)]/60 focus:outline-none"
                    />
                    {trimText.trim() && (
                      <div className="mt-2 flex gap-2">
                        {TEXT_POSITIONS.map((p) => (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => setTrimPos(p.id)}
                            aria-pressed={trimPos === p.id}
                            className={cn(
                              "rounded-[8px] border px-3 py-1.5 text-[12px] font-medium transition-colors",
                              trimPos === p.id
                                ? "border-[var(--pro-accent)]/50 bg-[var(--pro-accent)]/[0.1] text-[#F5F5F3]"
                                : "border-white/[0.1] text-white/55 hover:border-white/25",
                            )}
                          >
                            {p.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}

              {tool === "compress" && (
                <>
                  <div>
                    <p className="mb-2 text-[12px] font-semibold uppercase tracking-[0.1em] text-white/50">
                      Compression strength
                    </p>
                    <div className="grid gap-2">
                      {COMPRESS_QUALITIES.map((q) => (
                        <button
                          key={q.id}
                          type="button"
                          onClick={() => setCompQuality(q.id)}
                          aria-pressed={compQuality === q.id}
                          className={cn(
                            "rounded-[10px] border px-3.5 py-2.5 text-left transition-colors",
                            compQuality === q.id
                              ? "border-[var(--pro-accent)]/50 bg-[var(--pro-accent)]/[0.08]"
                              : "border-white/[0.1] hover:border-white/25",
                          )}
                        >
                          <span className="block text-[13px] font-semibold text-[#F5F5F3]">
                            {q.label}
                          </span>
                          <span className="block text-[11px] text-white/45">
                            {q.desc}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {tool === "convert" && (
                <>
                  <p className="rounded-[10px] border border-[var(--pro-accent)]/20 bg-[var(--pro-accent)]/[0.04] px-4 py-3 text-[12px] leading-5 text-white/55">
                    Extracts the full audio track as a 128kbps MP3 — same
                    length as your video. The preview streams the audio;
                    the download unlocks after payment.
                  </p>
                </>
              )}

              {tool === "gif" && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label
                        htmlFor="gif-start"
                        className="mb-2 block text-[12px] font-semibold uppercase tracking-[0.1em] text-white/50"
                      >
                        Start (sec)
                      </label>
                      <input
                        id="gif-start"
                        inputMode="decimal"
                        value={gifStart}
                        onChange={(e) => setGifStart(e.target.value)}
                        placeholder="0"
                        className="w-full rounded-[10px] border border-white/[0.12] bg-[#0c0c0e] px-3.5 py-2.5 text-[14px] text-[#F5F5F3] placeholder:text-white/30 focus:border-[var(--pro-accent)]/60 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="gif-end"
                        className="mb-2 block text-[12px] font-semibold uppercase tracking-[0.1em] text-white/50"
                      >
                        End (sec)
                      </label>
                      <input
                        id="gif-end"
                        inputMode="decimal"
                        value={gifEnd}
                        onChange={(e) => setGifEnd(e.target.value)}
                        placeholder="5"
                        className="w-full rounded-[10px] border border-white/[0.12] bg-[#0c0c0e] px-3.5 py-2.5 text-[14px] text-[#F5F5F3] placeholder:text-white/30 focus:border-[var(--pro-accent)]/60 focus:outline-none"
                      />
                    </div>
                  </div>
                  <p className="-mt-3 text-[11px] text-white/35">
                    Max 10 seconds — longer clips make huge GIFs.
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="mb-2 text-[12px] font-semibold uppercase tracking-[0.1em] text-white/50">
                        Frame rate
                      </p>
                      <div className="flex gap-2">
                        {GIF_FPS.map((f) => (
                          <button
                            key={f.id}
                            type="button"
                            onClick={() => setGifFps(f.id)}
                            aria-pressed={gifFps === f.id}
                            className={cn(
                              "rounded-[8px] border px-3 py-1.5 text-[12px] font-medium transition-colors",
                              gifFps === f.id
                                ? "border-[var(--pro-accent)]/50 bg-[var(--pro-accent)]/[0.1] text-[#F5F5F3]"
                                : "border-white/[0.1] text-white/55 hover:border-white/25",
                            )}
                          >
                            {f.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="mb-2 text-[12px] font-semibold uppercase tracking-[0.1em] text-white/50">
                        Size
                      </p>
                      <div className="flex gap-2">
                        {GIF_WIDTHS.map((w) => (
                          <button
                            key={w.id}
                            type="button"
                            onClick={() => setGifWidth(w.id)}
                            aria-pressed={gifWidth === w.id}
                            className={cn(
                              "rounded-[8px] border px-3 py-1.5 text-[12px] font-medium transition-colors",
                              gifWidth === w.id
                                ? "border-[var(--pro-accent)]/50 bg-[var(--pro-accent)]/[0.1] text-[#F5F5F3]"
                                : "border-white/[0.1] text-white/55 hover:border-white/25",
                            )}
                          >
                            {w.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              )}

              {tool === "add-audio" && (
                <>
                  <div>
                    <p className="mb-2 text-[12px] font-semibold uppercase tracking-[0.1em] text-white/50">
                      Audio track
                    </p>
                    <FilePicker
                      file={aaAudio}
                      onPick={pickAudioFile(setAaAudio, setAaAudioError)}
                      error={aaAudioError}
                      accept="audio/mpeg,audio/wav,audio/mp4,.mp3,.wav,.m4a"
                      emptyTitle="Upload your audio"
                      emptyHint="MP3 · WAV · M4A · up to 20MB"
                    />
                  </div>
                  <div>
                    <p className="mb-2 text-[12px] font-semibold uppercase tracking-[0.1em] text-white/50">
                      How to combine
                    </p>
                    <div className="grid gap-2">
                      {ADD_AUDIO_MODES.map((m) => (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => setAaMode(m.id)}
                          aria-pressed={aaMode === m.id}
                          className={cn(
                            "rounded-[10px] border px-3.5 py-2.5 text-left transition-colors",
                            aaMode === m.id
                              ? "border-[var(--pro-accent)]/50 bg-[var(--pro-accent)]/[0.08]"
                              : "border-white/[0.1] hover:border-white/25",
                          )}
                        >
                          <span className="block text-[13px] font-semibold text-[#F5F5F3]">
                            {m.label}
                          </span>
                          <span className="block text-[11px] text-white/45">
                            {m.desc}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {tool === "denoise" && (
                <>
                  <div>
                    <p className="mb-2 text-[12px] font-semibold uppercase tracking-[0.1em] text-white/50">
                      Cleanup strength
                    </p>
                    <div className="grid gap-2">
                      {DENOISE_STRENGTHS.map((s) => (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => setDnStrength(s.id)}
                          aria-pressed={dnStrength === s.id}
                          className={cn(
                            "rounded-[10px] border px-3.5 py-2.5 text-left transition-colors",
                            dnStrength === s.id
                              ? "border-[var(--pro-accent)]/50 bg-[var(--pro-accent)]/[0.08]"
                              : "border-white/[0.1] hover:border-white/25",
                          )}
                        >
                          <span className="block text-[13px] font-semibold text-[#F5F5F3]">
                            {s.label}
                          </span>
                          <span className="block text-[11px] text-white/45">
                            {s.desc}
                          </span>
                        </button>
                      ))}
                    </div>
                    <p className="mt-2 text-[11px] text-white/35">
                      Reduces steady background noise — it won&apos;t fix
                      clipping, wind gusts or very loud rooms.
                    </p>
                  </div>
                </>
              )}
            </div>

            {/* price + submit */}
            <div className="mt-6 rounded-[12px] border border-white/[0.08] bg-[#0c0c0e] p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[13px] text-white/60">
                  <ShieldCheck className="h-4 w-4 text-[var(--pro-accent)]" />
                  {toolPrice(tool)} flat · one UPI payment · no subscription
                </div>
              </div>
              <p className="mt-1.5 text-[12px] leading-5 text-white/40">
                The job starts right away — a watermarked preview plays while
                you wait. The clean file unlocks after your payment is
                confirmed. Nothing is charged if the job fails.
              </p>
              <button
                type="button"
                onClick={submit}
                disabled={busy}
                className={cn(
                  "pro-cta mt-4 flex w-full items-center justify-center gap-2 rounded-[10px] px-5 py-3 text-[15px] font-semibold text-[var(--pro-btn-ink)]",
                  busy ? "cursor-wait opacity-70" : "hover:opacity-95",
                )}
              >
                {busy ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Starting your job…
                  </>
                ) : (
                  <>
                    Start {activeMeta.label} — {toolPrice(tool)}
                    <ChevronRight className="h-4 w-4" />
                  </>
                )}
              </button>
              {submitError && (
                <p className="mt-3 text-[13px] text-red-300/80" role="alert">
                  {submitError}
                </p>
              )}
            </div>
          </section>
        </Reveal>
        )}

        <Reveal delay={0.08} className="mt-6">
          <Link
            href="/create"
            className="inline-flex items-center gap-1.5 text-[13px] text-white/50 hover:text-white/85"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to image & clip studio
          </Link>
        </Reveal>
      </main>
      {chrome && <VilishFooter />}

      <AuthModal
        open={authNeeded}
        onClose={() => {
          setAuthNeeded(false);
          setPendingSubmit(false);
        }}
        onAuthenticated={() => {
          setAuthNeeded(false);
          if (pendingSubmit) {
            setPendingSubmit(false);
            void submit();
          }
        }}
      />
    </>
  );
  if (!chrome) return content;
  return (
    <div className="flex min-h-screen flex-col bg-[#080808] font-sans text-[#F5F5F3] antialiased">
      {content}
    </div>
  );
}
