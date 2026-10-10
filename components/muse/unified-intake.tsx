"use client";

/**
 * Madam Muse — unified intake composer (CONTRACTS.md §4).
 *
 * Default view on /create: primary asset (drag-drop / click / paste /
 * mobile gallery-camera) + reference strip with auto role chips + natural
 * language instruction. Mode is DERIVED (never a tab the user must pick) and
 * shown as a non-editable badge. Submit POSTs to /api/create/brief
 * (compiler workstream owns the route); "Looks right" continues into the
 * EXISTING order flow (components/vilish/composer.tsx) with the compiled
 * prompt pre-filled and the files attached — pricing/payment untouched.
 *
 * Pro design language only: var(--pro-*) tokens, no gimmicks, no fake badges.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  Check,
  Clapperboard,
  Film,
  ImagePlus,
  Images,
  Link2,
  Loader2,
  PencilLine,
  Sparkles,
  UploadCloud,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  AssetMeta,
  CreativeBrief,
  RefMeta,
  RefRole,
  TaskType,
} from "@/src/lib/muse/brief";
import {
  REF_ROLES,
  classifyOrientation,
  detectRoles,
  kindOfMime,
  suggestRole,
  type DetectedRef,
} from "@/src/lib/muse/role-detect";
import { deriveTaskType } from "@/src/lib/muse/intake-prompt";
import {
  compilePrompt,
  type CompiledPrompt,
} from "@/src/lib/muse/prompt-compiler";
import { composeSharedInstruction } from "@/src/lib/pwa/share-text";
import Composer from "@/components/vilish/composer";

const ACCEPT = "image/*,video/*";
const MAX_FILE_BYTES = 8 * 1024 * 1024; // 8 MB per image (matches attachments)
const MAX_VIDEO_BYTES = 100 * 1024 * 1024; // 100 MB per video — travels the chunked pipeline
const MAX_REFS = 5;

const INSTRUCTION_EXAMPLES = [
  "keep my watch the same, use ref 1's layout, darker",
  "turn my product photo into a festive Diwali ad, keep the logo",
  "make a 15-second clip from my footage with captions",
];

function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDims(w: number, h: number): string {
  if (w > 0 && h > 0) return `${w}×${h}`;
  return "dims unknown";
}

/** Contract-shaped compiled prompt — see src/lib/muse/prompt-compiler.ts. */

const TASK_LABEL: Record<TaskType, string> = {
  "image-generate": "New image",
  "image-edit": "Image edit",
  "video-generate": "New video clip",
  "video-edit": "Video edit",
};

interface PrimaryAsset {
  file: File;
  meta: AssetMeta;
  url: string;
  probing: boolean;
}

interface RefAsset {
  file: File;
  meta: DetectedRef;
  url: string;
}

type Phase = "intake" | "brief" | "order";

function assetMetaOf(det: DetectedRef): AssetMeta {
  return {
    kind: det.kind,
    name: det.name,
    mime: det.mime,
    width: det.width,
    height: det.height,
    sizeBytes: det.sizeBytes,
    ...(det.durationSec !== undefined ? { durationSec: det.durationSec } : {}),
  };
}

/** Exact RefMeta shape for the brief API body (strips UI-only extras). */
function refMetaForApi(det: DetectedRef): RefMeta {
  const { orientation: _o, textHint: _t, ...rest } = det;
  void _o;
  void _t;
  return rest;
}

export default function UnifiedIntake({
  className,
  initialPrompt,
  sharedToken,
  shareError,
  shareMsg,
}: {
  className?: string;
  /**
   * Recreate deep link (?prompt=): pre-fills the instruction box so a
   * tap on "Recreate" lands on a ready-to-edit brief, never a blank box.
   */
  initialPrompt?: string;
  /** PWA share-target handoff: bundle token stored by /share-target (?shared=). */
  sharedToken?: string;
  /** Share receipt rejection code (?shareError=) + human message (?shareMsg=). */
  shareError?: string;
  shareMsg?: string;
}) {
  const [phase, setPhase] = useState<Phase>("intake");
  const [primary, setPrimary] = useState<PrimaryAsset | null>(null);
  const [refs, setRefs] = useState<RefAsset[]>([]);
  const [instruction, setInstruction] = useState(initialPrompt ?? "");
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState("");
  const [briefLoading, setBriefLoading] = useState(false);
  const [brief, setBrief] = useState<CreativeBrief | null>(null);
  const [compiled, setCompiled] = useState<CompiledPrompt | null>(null);
  const [handoverKey, setHandoverKey] = useState(0);
  const [sharedNotice, setSharedNotice] = useState("");
  const primaryInputRef = useRef<HTMLInputElement>(null);
  const refInputRef = useRef<HTMLInputElement>(null);
  const orderRef = useRef<HTMLDivElement>(null);
  const briefRef = useRef<HTMLDivElement>(null);

  const derivedMode = useMemo(
    () => deriveTaskType(primary?.meta ?? null, instruction),
    [primary, instruction],
  );

  useEffect(() => {
    return () => {
      if (primary) URL.revokeObjectURL(primary.url);
      for (const r of refs) URL.revokeObjectURL(r.url);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const validateFile = useCallback((f: File): string | null => {
    if (f.type && !f.type.startsWith("image/") && !f.type.startsWith("video/")) {
      return `"${f.name}" isn't an image or video — only images and videos are accepted here.`;
    }
    if (!f.type && !/\.(png|jpe?g|webp|gif|avif|mp4|mov|webm|m4v)$/i.test(f.name)) {
      return `"${f.name}" doesn't look like an image or video file.`;
    }
    // Videos may be large — they travel the chunked, resumable pipeline.
    const isVideo =
      f.type.startsWith("video/") || /\.(mp4|mov|webm|m4v|mkv)$/i.test(f.name);
    const cap = isVideo ? MAX_VIDEO_BYTES : MAX_FILE_BYTES;
    if (f.size > cap) {
      return `"${f.name}" is ${formatBytes(f.size)} — keep ${isVideo ? "videos" : "images"} under ${formatBytes(cap)}.`;
    }
    if (f.size <= 0) return `"${f.name}" is empty.`;
    return null;
  }, []);

  const setPrimaryFile = useCallback(
    async (f: File) => {
      const problem = validateFile(f);
      if (problem) {
        setError(problem);
        return;
      }
      setError("");
      if (primary) URL.revokeObjectURL(primary.url);
      const url = URL.createObjectURL(f);
      const kind = kindOfMime(f.type);
      const fallback: AssetMeta = {
        kind,
        name: f.name,
        mime: f.type || (kind === "video" ? "video/mp4" : "image/png"),
        width: 0,
        height: 0,
        sizeBytes: f.size,
      };
      setPrimary({ file: f, meta: fallback, url, probing: true });
      try {
        const [det] = await detectRoles([f]);
        if (det) {
          setPrimary((prev) =>
            prev && prev.file === f ? { ...prev, meta: assetMetaOf(det), probing: false } : prev,
          );
        } else {
          setPrimary((prev) => (prev && prev.file === f ? { ...prev, probing: false } : prev));
        }
      } catch {
        setPrimary((prev) => (prev && prev.file === f ? { ...prev, probing: false } : prev));
      }
    },
    [primary, validateFile],
  );

  const addRefFiles = useCallback(
    async (picked: File[]) => {
      if (picked.length === 0) return;
      const fresh = picked.filter(
        (f) => !refs.some((r) => r.file.name === f.name && r.file.size === f.size),
      );
      if (refs.length + fresh.length > MAX_REFS) {
        setError(`At most ${MAX_REFS} reference images — remove one to add another.`);
        return;
      }
      for (const f of fresh) {
        const problem = validateFile(f);
        if (problem) {
          setError(problem);
          return;
        }
      }
      setError("");
      const offset = refs.length;
      const staged: RefAsset[] = fresh.map((file, i) => {
        // provisional role until detectRoles resolves; replaced below
        const suggestion = suggestRole({ name: file.name, type: file.type }, offset + i);
        const meta: DetectedRef = {
          id: `ref_${String(offset + i + 1).padStart(2, "0")}`,
          kind: kindOfMime(file.type),
          name: file.name,
          mime: file.type || "image/png",
          width: 0,
          height: 0,
          sizeBytes: file.size,
          role: suggestion.role,
          roleConfidence: suggestion.roleConfidence,
          roleUserOverride: false,
          orientation: "square",
          textHint: false,
        };
        return { file, meta, url: URL.createObjectURL(file) };
      });
      setRefs((prev) => [...prev, ...staged]);
      try {
        const detected = await detectRoles(fresh);
        setRefs((prev) =>
          prev.map((r) => {
            const idx = staged.findIndex((s) => s.file === r.file);
            if (idx === -1 || !detected[idx]) return r;
            const det = detected[idx];
            // Re-id to the strip position so ref_01.. always match display order.
            const pos = prev.findIndex((p) => p.file === r.file);
            return {
              ...r,
              meta: { ...det, id: `ref_${String(pos + 1).padStart(2, "0")}` },
            };
          }),
        );
      } catch {
        /* provisional metas stand */
      }
    },
    [refs, validateFile],
  );

  const removePrimary = useCallback(() => {
    if (primary) URL.revokeObjectURL(primary.url);
    setPrimary(null);
  }, [primary]);

  /* ── import reference from a public link ───────────────────────────── */
  const [linkOpen, setLinkOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkBusy, setLinkBusy] = useState(false);

  const importFromLink = useCallback(async () => {
    const url = linkUrl.trim();
    if (!url || linkBusy) return;
    setLinkBusy(true);
    setError("");
    try {
      const res = await fetch("/api/import/social", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ url }),
      });
      if (!res.ok) {
        // Honest server message (login walls, bad links, size caps…).
        const data = await res.json().catch(() => null);
        setError(
          (data && typeof data.message === "string" && data.message) ||
            "Couldn't import that link. Try downloading the file and uploading it directly.",
        );
        return;
      }
      const blob = await res.blob();
      const name =
        decodeURIComponent(res.headers.get("x-muse-import-name") ?? "") ||
        "imported-media";
      const file = new File([blob], name, {
        type: res.headers.get("x-muse-import-mime") || blob.type,
      });
      // Same path as a manual upload: validation, role detection, strip.
      await addRefFiles([file]);
      setLinkUrl("");
      setLinkOpen(false);
    } catch {
      setError(
        "Couldn't import that link — check your connection, or download the file and upload it directly.",
      );
    } finally {
      setLinkBusy(false);
    }
  }, [linkUrl, linkBusy, addRefFiles]);

  const removeRef = useCallback(
    (url: string) => {
      setRefs((prev) => {
        const next = prev.filter((r) => r.url !== url);
        const gone = prev.find((r) => r.url === url);
        if (gone) URL.revokeObjectURL(gone.url);
        // keep ref ids sequential with display order
        return next.map((r, i) => ({
          ...r,
          meta: { ...r.meta, id: `ref_${String(i + 1).padStart(2, "0")}` },
        }));
      });
    },
    [],
  );

  const setRefRole = useCallback((url: string, role: RefRole) => {
    setRefs((prev) =>
      prev.map((r) =>
        r.url === url
          ? {
              ...r,
              meta: { ...r.meta, role, roleConfidence: 1, roleUserOverride: true },
            }
          : r,
      ),
    );
  }, []);

  /** Shared file-intake for drop + paste + file inputs. */
  const ingestFiles = useCallback(
    (files: File[]) => {
      if (files.length === 0 || phase !== "intake") return;
      const [first, ...rest] = files;
      if (!primary && first) {
        void setPrimaryFile(first);
        if (rest.length > 0) void addRefFiles(rest);
      } else {
        void addRefFiles(files);
      }
    },
    [phase, primary, setPrimaryFile, addRefFiles],
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      ingestFiles(Array.from(e.dataTransfer?.files ?? []));
    },
    [ingestFiles],
  );

  const onPaste = useCallback(
    (e: React.ClipboardEvent | ClipboardEvent) => {
      const files = Array.from(e.clipboardData?.files ?? []).filter((f) =>
        f.type.startsWith("image/") || f.type.startsWith("video/"),
      );
      if (files.length > 0) {
        e.preventDefault();
        ingestFiles(files);
      }
    },
    [ingestFiles],
  );

  // Paste-from-clipboard anywhere on the page while the intake is active.
  useEffect(() => {
    const handler = (e: ClipboardEvent) => onPaste(e);
    window.addEventListener("paste", handler);
    return () => window.removeEventListener("paste", handler);
  }, [onPaste]);

  // ── PWA share-target handoff ──────────────────────────────────
  // /share-target validates a share, stores it, and redirects here with
  // ?shared=<token> (or ?shareError=<code>&shareMsg=<msg> when the share
  // was rejected — the share sheet gives the OS no error surface, so the
  // notice below is the feedback channel).
  // Bundle files go through the EXISTING ingestFiles path — same client
  // validation, same role detection as drop/paste — and shared text
  // prefills the instruction box. Runs once per mount.
  const ingestFilesRef = useRef(ingestFiles);
  ingestFilesRef.current = ingestFiles;
  const shareHandledRef = useRef(false);
  useEffect(() => {
    if (shareHandledRef.current) return;
    if (!sharedToken && !shareError) return;
    shareHandledRef.current = true;
    if (shareError) {
      setError(
        shareMsg ||
          "Shared files couldn't be attached — please try sharing again.",
      );
      return;
    }
    (async () => {
      try {
        const res = await fetch(
          `/api/share-bundle?token=${encodeURIComponent(sharedToken ?? "")}`,
        );
        if (!res.ok) throw new Error(`bundle ${res.status}`);
        const bundle = (await res.json()) as {
          title: string;
          text: string;
          url: string;
          files: { name: string; mime: string; size: number; url: string }[];
        };
        const files: File[] = [];
        for (const f of bundle.files ?? []) {
          try {
            const r = await fetch(f.url);
            if (!r.ok) continue;
            const blob = await r.blob();
            files.push(
              new File([blob], f.name || "shared-file", {
                type: f.mime || blob.type || "application/octet-stream",
              }),
            );
          } catch {
            /* skip the unreadable file, keep the rest */
          }
        }
        if (files.length > 0) {
          ingestFilesRef.current(files);
          setSharedNotice(
            files.length === 1
              ? "1 shared file attached — review it below, then describe what you want."
              : `${files.length} shared files attached — review them below, then describe what you want.`,
          );
        }
        const prefill = composeSharedInstruction({
          title: bundle.title ?? "",
          text: bundle.text ?? "",
          url: bundle.url ?? "",
        });
        if (prefill) setInstruction(prefill);
        if (files.length === 0 && !prefill) {
          setError(
            "The shared content couldn't be loaded — it may have expired. Please share again.",
          );
        }
      } catch {
        setError(
          "The shared content couldn't be loaded — please try sharing again.",
        );
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sharedToken, shareError]);

  const instructionOk = instruction.trim().length >= 3;

  const handleSubmit = useCallback(async () => {
    if (!instructionOk || briefLoading) return;
    setBriefLoading(true);
    setError("");
    try {
      const res = await fetch("/api/create/brief", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          instruction: instruction.trim(),
          primary: primary ? primary.meta : null,
          references: refs.map((r) => refMetaForApi(r.meta)),
        }),
      });
      const body = await res.json().catch(() => null);
      if (!res.ok || !body?.brief) {
        setError(
          typeof body?.error === "string" && body.error
            ? body.error
            : "The brief service didn't respond — your files and text are kept, try again in a moment.",
        );
        return;
      }
      setBrief(body.brief as CreativeBrief);
      setPhase("brief");
      requestAnimationFrame(() =>
        briefRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }),
      );
    } catch {
      setError("Network error reaching the brief service — your files and text are kept.");
    } finally {
      setBriefLoading(false);
    }
  }, [instructionOk, briefLoading, instruction, primary, refs]);

  const handleContinue = useCallback(() => {
    if (!brief) return;
    setCompiled(compilePrompt(brief));
    setHandoverKey((k) => k + 1);
    setPhase("order");
    requestAnimationFrame(() =>
      orderRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }),
    );
  }, [brief]);

  const backToIntake = useCallback(() => {
    setPhase("intake");
    setBrief(null);
  }, []);

  const orderFiles = useMemo(() => {
    const list: File[] = [];
    if (primary) list.push(primary.file);
    for (const r of refs) list.push(r.file);
    return list;
  }, [primary, refs]);

  const orderMedia = useMemo<"image" | "video" | "edit">(() => {
    if (!brief) return "image";
    if (brief.taskType === "video-edit") return "edit";
    if (brief.taskType === "video-generate") return "video";
    return "image";
  }, [brief]);

  return (
    <section
      aria-label="Unified creation intake"
      onPaste={onPaste}
      className={cn(
        "w-full rounded-[20px] border border-[var(--pro-border)] bg-[var(--pro-bg-elev)] p-5 sm:p-7",
        "shadow-[0_0_0_1px_rgba(0,0,0,0.4),0_24px_64px_-24px_rgba(0,0,0,0.8)]",
        className,
      )}
    >
      {phase === "intake" && (
        <div>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="pro-eyebrow">Madam Muse intake</p>
              <h2
                className="pro-display mt-2 text-[22px] font-bold leading-tight sm:text-[26px]"
                style={{ color: "var(--pro-fg)" }}
              >
                Show it. Describe it. <span style={{ color: "var(--pro-accent)" }}>Done.</span>
              </h2>
              <p
                className="pro-body mt-2 max-w-xl text-[13.5px] leading-6"
                style={{ color: "var(--pro-muted)" }}
              >
                Drop in your product or footage, add references, say what you
                want in plain words — we work out the format, study the
                references, and build the brief.
              </p>
            </div>
          {sharedNotice && (
            <div
              role="status"
              className="pro-body mt-4 flex w-full items-center gap-2.5 rounded-[12px] border border-[var(--pro-border)] px-4 py-2.5 text-[13px]"
              style={{ color: "var(--pro-fg)", background: "var(--pro-bg)" }}
            >
              <Check className="h-4 w-4 shrink-0" style={{ color: "var(--pro-accent)" }} aria-hidden />
              {sharedNotice}
            </div>
          )}
            <div
              className="inline-flex items-center gap-2 rounded-[10px] border border-[var(--pro-border)] px-3 py-2"
              title="Derived automatically from your assets and instruction — not a setting you need to pick."
              aria-live="polite"
            >
              <Sparkles className="h-3.5 w-3.5" style={{ color: "var(--pro-accent)" }} aria-hidden />
              <span className="text-[12px] font-medium" style={{ color: "var(--pro-muted)" }}>
                Detected:&nbsp;
              </span>
              <span
                className="rounded-[6px] bg-[var(--pro-accent)]/[0.12] px-2 py-0.5 text-[12px] font-semibold"
                style={{ color: "var(--pro-accent)" }}
              >
                {TASK_LABEL[derivedMode]}
              </span>
            </div>
          </div>

          {/* ── primary asset zone ─────────────────────────── */}
          <div className="mt-6">
            <p className="text-[12px] font-semibold uppercase tracking-[0.08em]" style={{ color: "var(--pro-muted)" }}>
              Your asset
            </p>
            {!primary ? (
              <button
                type="button"
                onClick={() => primaryInputRef.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={onDrop}
                aria-label="Upload your asset: drag and drop, or click to choose an image or video"
                className={cn(
                  "mt-2 flex min-h-[168px] w-full flex-col items-center justify-center gap-2 rounded-[14px] border-2 border-dashed px-6 py-8 text-center transition-colors",
                  dragging
                    ? "border-[var(--pro-accent)] bg-[var(--pro-accent)]/[0.06]"
                    : "border-[var(--pro-border)] hover:border-[var(--pro-muted)]",
                )}
              >
                <UploadCloud className="h-7 w-7" style={{ color: "var(--pro-muted)" }} aria-hidden />
                <span className="text-[14px] font-semibold" style={{ color: "var(--pro-fg)" }}>
                  Drop your image or video here, or click to upload
                </span>
                <span className="text-[12px]" style={{ color: "var(--pro-faint)" }}>
                  You can also paste from your clipboard · images up to {formatBytes(MAX_FILE_BYTES)}, videos up to {formatBytes(MAX_VIDEO_BYTES)} · optional — leave empty to generate from text alone
                </span>
              </button>
            ) : (
              <div className="mt-2 flex items-center gap-4 rounded-[14px] border border-[var(--pro-border)] p-3">
                {primary.meta.kind === "image" ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={primary.url}
                    alt={primary.file.name}
                    className="h-20 w-20 shrink-0 rounded-[10px] object-cover"
                  />
                ) : (
                  <span className="flex h-20 w-20 shrink-0 items-center justify-center rounded-[10px] bg-[var(--pro-bg-sunken)]">
                    <Film className="h-7 w-7" style={{ color: "var(--pro-muted)" }} aria-hidden />
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13.5px] font-semibold" style={{ color: "var(--pro-fg)" }}>
                    {primary.file.name}
                  </p>
                  <p className="mt-0.5 text-[12px] tabular-nums" style={{ color: "var(--pro-faint)" }}>
                    {primary.meta.kind === "video" ? "Video" : "Image"} ·{" "}
                    {primary.probing ? "reading…" : formatDims(primary.meta.width, primary.meta.height)} ·{" "}
                    {formatBytes(primary.file.size)}
                    {primary.meta.durationSec !== undefined && ` · ${primary.meta.durationSec}s`}
                  </p>
                  {primary.meta.kind === "video" && (
                    <p className="mt-1 text-[12px]" style={{ color: "var(--pro-faint)" }}>
                      Auto transcript &amp; shot detection aren&apos;t available yet — describe
                      key moments in your instruction instead.
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={removePrimary}
                  aria-label={`Remove ${primary.file.name}`}
                  className="rounded-[8px] p-2 transition-colors hover:bg-[var(--pro-bg-sunken)]"
                  style={{ color: "var(--pro-muted)" }}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
            <input
              ref={primaryInputRef}
              type="file"
              accept={ACCEPT}
              className="sr-only"
              aria-label="Choose your asset"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void setPrimaryFile(f);
                e.target.value = "";
              }}
            />
          </div>

          {/* ── reference strip ────────────────────────────── */}
          <div className="mt-6">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[12px] font-semibold uppercase tracking-[0.08em]" style={{ color: "var(--pro-muted)" }}>
                Reference assets{" "}
                <span className="font-medium normal-case tracking-normal" style={{ color: "var(--pro-faint)" }}>
                  ({refs.length}/{MAX_REFS}) — roles are auto-detected, override freely
                </span>
              </p>
              <div className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  onClick={() => setLinkOpen((v) => !v)}
                  disabled={refs.length >= MAX_REFS}
                  aria-expanded={linkOpen}
                  className="inline-flex min-h-[40px] items-center gap-1.5 rounded-[8px] px-2.5 text-[12.5px] font-medium transition-colors hover:text-[var(--pro-fg)] disabled:cursor-not-allowed disabled:opacity-40"
                  style={{ color: "var(--pro-muted)" }}
                >
                  <Link2 className="h-4 w-4" aria-hidden />
                  From link
                </button>
                <button
                  type="button"
                  onClick={() => refInputRef.current?.click()}
                  disabled={refs.length >= MAX_REFS}
                  className="inline-flex min-h-[40px] items-center gap-1.5 rounded-[8px] border border-[var(--pro-border)] px-3 text-[12.5px] font-medium transition-colors hover:text-[var(--pro-fg)] disabled:cursor-not-allowed disabled:opacity-40"
                  style={{ color: "var(--pro-muted)" }}
                >
                  <Images className="h-4 w-4" aria-hidden />
                  Add reference
                </button>
              </div>
            </div>
            {linkOpen && (
              <div className="mt-3 rounded-[12px] border border-[var(--pro-border)] p-3">
                <label
                  htmlFor="muse-import-link"
                  className="text-[12.5px] font-medium"
                  style={{ color: "var(--pro-fg)" }}
                >
                  Paste a link to an image or video
                </label>
                <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                  <input
                    id="muse-import-link"
                    type="url"
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        void importFromLink();
                      }
                    }}
                    placeholder="https://…"
                    inputMode="url"
                    autoComplete="off"
                    disabled={linkBusy}
                    className="min-h-[40px] flex-1 rounded-[8px] border border-[var(--pro-border)] bg-transparent px-3 text-[13px] outline-none placeholder:text-[var(--pro-faint)] focus:border-[var(--pro-accent)] disabled:opacity-50"
                    style={{ color: "var(--pro-fg)" }}
                  />
                  <button
                    type="button"
                    onClick={() => void importFromLink()}
                    disabled={linkBusy || !linkUrl.trim() || refs.length >= MAX_REFS}
                    className="inline-flex min-h-[40px] items-center justify-center gap-1.5 rounded-[8px] border border-[var(--pro-border)] px-4 text-[12.5px] font-medium transition-colors hover:text-[var(--pro-fg)] disabled:cursor-not-allowed disabled:opacity-40"
                    style={{ color: "var(--pro-muted)" }}
                  >
                    {linkBusy ? (
                      <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                    ) : (
                      <Link2 className="h-4 w-4" aria-hidden />
                    )}
                    {linkBusy ? "Importing…" : "Import"}
                  </button>
                </div>
                <p
                  className="mt-2 text-[12px] leading-relaxed"
                  style={{ color: "var(--pro-faint)" }}
                >
                  We download it once to our server and attach it like a normal
                  upload. If the site blocks us (many social sites need a login),
                  we&apos;ll say so — just save the file and upload it directly.
                </p>
              </div>
            )}
            <input
              ref={refInputRef}
              type="file"
              accept={ACCEPT}
              multiple
              className="sr-only"
              aria-label="Add reference assets"
              onChange={(e) => {
                void addRefFiles(Array.from(e.target.files ?? []));
                e.target.value = "";
              }}
            />
            {refs.length > 0 ? (
              <ul className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-2" aria-label="Reference assets">
                {refs.map((r) => (
                  <li
                    key={r.url}
                    className="flex items-center gap-3 rounded-[12px] border border-[var(--pro-border)] p-2.5"
                  >
                    {r.meta.kind === "image" ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={r.url}
                        alt={r.file.name}
                        className="h-14 w-14 shrink-0 rounded-[8px] object-cover"
                      />
                    ) : (
                      <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[8px] bg-[var(--pro-bg-sunken)]">
                        <Film className="h-5 w-5" style={{ color: "var(--pro-muted)" }} aria-hidden />
                      </span>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[12.5px] font-semibold" style={{ color: "var(--pro-fg)" }}>
                        <span className="mr-1.5 tabular-nums" style={{ color: "var(--pro-faint)" }}>
                          {r.meta.id.replace("ref_", "ref ")}
                        </span>
                        {r.file.name}
                      </p>
                      <div className="mt-1 flex flex-wrap items-center gap-1.5">
                        <span
                          className="rounded-[6px] bg-[var(--pro-accent)]/[0.12] px-1.5 py-0.5 text-[11px] font-semibold capitalize"
                          style={{ color: "var(--pro-accent)" }}
                          title={`Auto-detected role (confidence ${Math.round(r.meta.roleConfidence * 100)}%)${r.meta.roleUserOverride ? ", overridden by you" : ""}`}
                        >
                          {r.meta.role}
                        </span>
                        {r.meta.palette && r.meta.palette.length > 0 && (
                          <span className="inline-flex items-center gap-0.5" aria-label={`Palette ${r.meta.palette.join(", ")}`}>
                            {r.meta.palette.slice(0, 5).map((hex) => (
                              <span
                                key={hex}
                                className="h-3.5 w-3.5 rounded-full border border-black/20"
                                style={{ backgroundColor: hex }}
                                title={hex}
                              />
                            ))}
                          </span>
                        )}
                        <label className="sr-only" htmlFor={`role-${r.meta.id}`}>
                          Override role for {r.file.name}
                        </label>
                        <select
                          id={`role-${r.meta.id}`}
                          value={r.meta.role}
                          onChange={(e) => setRefRole(r.url, e.target.value as RefRole)}
                          className="max-w-[128px] truncate rounded-[6px] border border-[var(--pro-border)] bg-transparent px-1 py-0.5 text-[11px] capitalize"
                          style={{ color: "var(--pro-muted)" }}
                        >
                          {REF_ROLES.map((role) => (
                            <option key={role} value={role}>
                              {role}
                            </option>
                          ))}
                        </select>
                      </div>
                      <p className="mt-0.5 text-[11px] tabular-nums" style={{ color: "var(--pro-faint)" }}>
                        {classifyOrientation(r.meta.width, r.meta.height)} · {formatDims(r.meta.width, r.meta.height)} · {formatBytes(r.file.size)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeRef(r.url)}
                      aria-label={`Remove reference ${r.file.name}`}
                      className="shrink-0 rounded-[8px] p-1.5 transition-colors hover:bg-[var(--pro-bg-sunken)]"
                      style={{ color: "var(--pro-muted)" }}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-[12.5px]" style={{ color: "var(--pro-faint)" }}>
                Optional — a style you like, a layout to borrow, a palette to match. Nothing to label; we guess the role.
              </p>
            )}
            {refs.some((r) => r.meta.kind === "video") && (
              <p className="mt-2 text-[12px]" style={{ color: "var(--pro-faint)" }}>
                Auto transcript &amp; shot detection aren&apos;t available yet — describe
                key moments in your instruction instead.
              </p>
            )}
          </div>

          {/* ── instruction ────────────────────────────────── */}
          <div className="mt-6">
            <label
              htmlFor="muse-instruction"
              className="text-[12px] font-semibold uppercase tracking-[0.08em]"
              style={{ color: "var(--pro-muted)" }}
            >
              What should change
            </label>
            <textarea
              id="muse-instruction"
              value={instruction}
              onChange={(e) => setInstruction(e.target.value.slice(0, 2000))}
              rows={3}
              placeholder={INSTRUCTION_EXAMPLES[0]}
              className="mt-2 w-full resize-none rounded-[12px] border border-[var(--pro-border)] bg-transparent p-3.5 text-[14.5px] leading-6 outline-none transition-colors placeholder:text-[var(--pro-faint)] focus:border-[var(--pro-accent)]/60"
              style={{ color: "var(--pro-fg)" }}
            />
            <p className="mt-1.5 text-[12px]" style={{ color: "var(--pro-faint)" }}>
              Plain words work — e.g. “{INSTRUCTION_EXAMPLES[1]}”.
            </p>
          </div>

          {error && (
            <p className="mt-4 text-[13px] font-medium text-red-300/90" role="alert">
              {error}
            </p>
          )}

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!instructionOk || briefLoading}
              className="inline-flex min-h-[48px] items-center gap-2 rounded-[12px] bg-[var(--pro-btn)] px-6 text-[14px] font-semibold text-[var(--pro-btn-ink)] transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
            >
              {briefLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              ) : (
                <Sparkles className="h-4 w-4" aria-hidden />
              )}
              {briefLoading ? "Reading your brief…" : "Build my brief"}
            </button>
            <p className="text-[12px]" style={{ color: "var(--pro-faint)" }}>
              Free to try — you approve the brief before anything is ordered.
            </p>
          </div>
        </div>
      )}

      {phase === "brief" && brief && (
        <div ref={briefRef}>
          <p className="pro-eyebrow">Your brief</p>
          <h2
            className="pro-display mt-2 text-[22px] font-bold leading-tight sm:text-[26px]"
            style={{ color: "var(--pro-fg)" }}
          >
            Here&apos;s what we understood.
          </h2>

          <dl className="mt-5 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            <div className="rounded-[12px] border border-[var(--pro-border)] p-3.5">
              <dt className="text-[11px] font-semibold uppercase tracking-[0.08em]" style={{ color: "var(--pro-faint)" }}>
                Task
              </dt>
              <dd className="mt-1 text-[14px] font-semibold" style={{ color: "var(--pro-fg)" }}>
                {TASK_LABEL[brief.taskType]}
                {brief.visualFamily && (
                  <span className="font-normal" style={{ color: "var(--pro-muted)" }}>
                    {" "}· {brief.visualFamily}
                  </span>
                )}
              </dd>
            </div>
            <div className="rounded-[12px] border border-[var(--pro-border)] p-3.5">
              <dt className="text-[11px] font-semibold uppercase tracking-[0.08em]" style={{ color: "var(--pro-faint)" }}>
                Source
              </dt>
              <dd className="mt-1 text-[14px] font-semibold" style={{ color: "var(--pro-fg)" }}>
                {brief.primary ? `${brief.primary.name} (${brief.primary.kind})` : "From text alone"}
                {brief.references.length > 0 && (
                  <span className="font-normal" style={{ color: "var(--pro-muted)" }}>
                    {" "}· {brief.references.length} reference{brief.references.length === 1 ? "" : "s"}
                  </span>
                )}
              </dd>
            </div>
          </dl>

          {brief.preserve.length > 0 && (
            <div className="mt-2.5 rounded-[12px] border border-[var(--pro-border)] p-3.5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.08em]" style={{ color: "var(--pro-faint)" }}>
                We&apos;ll preserve
              </p>
              <ul className="mt-2 flex flex-wrap gap-1.5">
                {brief.preserve.map((p) => (
                  <li
                    key={p}
                    className="inline-flex items-center gap-1 rounded-[8px] bg-[var(--pro-accent)]/[0.1] px-2 py-1 text-[12px] font-medium"
                    style={{ color: "var(--pro-fg)" }}
                  >
                    <Check className="h-3 w-3" style={{ color: "var(--pro-accent)" }} aria-hidden />
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {brief.references.length > 0 && (
            <div className="mt-2.5 rounded-[12px] border border-[var(--pro-border)] p-3.5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.08em]" style={{ color: "var(--pro-faint)" }}>
                Reference roles
              </p>
              <ul className="mt-2 space-y-1.5">
                {brief.references.map((r) => (
                  <li key={r.id} className="flex items-center gap-2 text-[13px]" style={{ color: "var(--pro-muted)" }}>
                    <span className="tabular-nums font-semibold" style={{ color: "var(--pro-fg)" }}>
                      {r.id.replace("ref_", "ref ")}
                    </span>
                    <span
                      className="rounded-[6px] bg-[var(--pro-accent)]/[0.12] px-1.5 py-0.5 text-[11px] font-semibold capitalize"
                      style={{ color: "var(--pro-accent)" }}
                    >
                      {r.role}
                    </span>
                    <span className="truncate">{r.name}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {(brief.modifiers.length > 0 || brief.exclusions.length > 0) && (
            <div className="mt-2.5 rounded-[12px] border border-[var(--pro-border)] p-3.5">
              {brief.modifiers.length > 0 && (
                <p className="text-[13px]" style={{ color: "var(--pro-muted)" }}>
                  <span className="font-semibold" style={{ color: "var(--pro-fg)" }}>Adjustments: </span>
                  {brief.modifiers.join(", ")}
                </p>
              )}
              {brief.exclusions.length > 0 && (
                <p className="mt-1 text-[13px]" style={{ color: "var(--pro-muted)" }}>
                  <span className="font-semibold" style={{ color: "var(--pro-fg)" }}>Avoid: </span>
                  {brief.exclusions.join(", ")}
                </p>
              )}
            </div>
          )}

          {error && (
            <p className="mt-4 text-[13px] font-medium text-red-300/90" role="alert">
              {error}
            </p>
          )}

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleContinue}
              className="inline-flex min-h-[48px] items-center gap-2 rounded-[12px] bg-[var(--pro-btn)] px-6 text-[14px] font-semibold text-[var(--pro-btn-ink)]"
            >
              <Check className="h-4 w-4" aria-hidden />
              Looks right — continue
            </button>
            <button
              type="button"
              onClick={backToIntake}
              className="inline-flex min-h-[48px] items-center gap-2 rounded-[12px] border border-[var(--pro-border)] px-5 text-[14px] font-medium transition-colors hover:text-[var(--pro-fg)]"
              style={{ color: "var(--pro-muted)" }}
            >
              <PencilLine className="h-4 w-4" aria-hidden />
              Edit instruction
            </button>
          </div>
        </div>
      )}

      {phase === "order" && brief && compiled && (
        <div ref={orderRef}>
          <button
            type="button"
            onClick={backToIntake}
            className="inline-flex items-center gap-1.5 text-[13px] font-medium transition-colors hover:text-[var(--pro-fg)]"
            style={{ color: "var(--pro-muted)" }}
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Back to intake
          </button>
          <div className="mt-3 rounded-[12px] border border-[var(--pro-accent)]/25 bg-[var(--pro-accent)]/[0.05] p-4">
            <p className="flex items-center gap-2 text-[13px] font-semibold" style={{ color: "var(--pro-fg)" }}>
              {orderMedia === "edit" ? (
                <Clapperboard className="h-4 w-4" style={{ color: "var(--pro-accent)" }} aria-hidden />
              ) : (
                <ImagePlus className="h-4 w-4" style={{ color: "var(--pro-accent)" }} aria-hidden />
              )}
              Brief approved — finish in the order flow below
            </p>
            <p className="mt-1 text-[12.5px] leading-5" style={{ color: "var(--pro-muted)" }}>
              Your {orderFiles.length} file{orderFiles.length === 1 ? " is" : "s are"} attached and the
              brief is folded into the prompt. Pricing, quote and payment work exactly as usual.
            </p>
          </div>
          <div className="mt-4">
            <Composer
              key={`muse-handover-${handoverKey}`}
              variant="page"
              initialMedia={orderMedia}
              initialPrompt={compiled.prompt}
              initialFiles={orderFiles}
            />
          </div>
        </div>
      )}
    </section>
  );
}
