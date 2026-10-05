"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Check,
  Copy,
  Download,
  Loader2,
  Package,
  Send,
  Upload,
} from "lucide-react";
import { formatINR } from "@/src/lib/vilish/types";
import {
  ACTION_ENDPOINTS,
  ACTION_LABELS,
  availableActions,
  type FulfillmentAction,
} from "../actions";
import { StateBadge } from "../state-badge";
import TokenGate from "../token-gate";
import { adminFetch, clearAdminToken, getAdminToken } from "../admin-token";

/* ---------------- types (defensive: backend may add fields) ---------------- */

interface RefAsset {
  id: string;
  filename?: string;
  url: string;
  mimeType?: string;
}

interface Take {
  id: string;
  takeLabel: string;
  resultType: string;
  url?: string;
  assetUrl?: string;
  notes?: string;
  toolUsed?: string;
  durationSeconds?: number;
  width?: number;
  height?: number;
  createdAt?: string;
}

interface NoteEntry {
  body: string;
  createdAt: string;
}

interface AuditEntry {
  action: string;
  createdAt?: string;
  actorUserId?: string | null;
}

interface JobDetail {
  id: string;
  orderCode?: string;
  state: string;
  prompt?: string;
  task?: string;
  aspectRatio?: string;
  quality?: string;
  style?: string;
  genre?: string;
  constraints?: string;
  negativePrompt?: string;
  seed?: number | null;
  jobKind?: string;
  parentJobId?: string;
  parentPrompt?: string;
  revision?: string;
  clarificationRequest?: string;
  clarificationResponse?: string;
  errorMessage?: string;
  durationSeconds?: number;
  createdAt?: string;
  updatedAt?: string;
  deliveredAt?: string;
}

interface Detail {
  job: JobDetail;
  user?: { email?: string; name?: string } | null;
  order?: {
    code?: string;
    amountPaise?: number;
    utr?: string;
    verification?: string;
    status?: string;
  } | null;
  references: RefAsset[];
  settings?: Record<string, unknown>;
  notes: (NoteEntry | string)[];
  results: Take[];
  history: AuditEntry[];
}

/* ---------------- small pieces ---------------- */

function humanizeTask(task?: string, jobKind?: string) {
  const t =
    task === "image_to_image"
      ? "Image to image"
      : task === "text_to_image"
        ? "Text to image"
        : (task ?? "—");
  return jobKind === "edit" ? `EDIT — ${t}` : jobKind === "remake" ? `Remake — ${t}` : t;
}

function isVideoUrl(url?: string) {
  return !!url && /\.(mp4|mov|webm)(\?|$)/i.test(url);
}

function age(iso?: string) {
  if (!iso) return "—";
  const ms = Date.now() - new Date(iso).getTime();
  if (ms < 0) return "just now";
  const mins = Math.floor(ms / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function Section({
  title,
  children,
  action,
}: {
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <section className="rounded-[16px] border border-white/[0.08] bg-[#121214] p-5 sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-[15px] font-semibold">{title}</h2>
        {action}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Kv({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-1.5">
      <dt className="text-[12px] text-white/40">{k}</dt>
      <dd className="text-right text-[13px] text-white/80 tabular-nums">{v}</dd>
    </div>
  );
}

const inputCls =
  "w-full rounded-[10px] border border-white/[0.1] bg-[#0D0D0F] px-3.5 py-2.5 text-[14px] text-[#F5F5F3] placeholder:text-white/30 outline-none focus:border-white/30";
const labelCls = "block text-[13px] font-medium text-white/70";

/* ---------------- workspace ---------------- */

function Workspace({ token, id }: { token: string; id: string }) {
  const base = `/api/admin/fulfillment/${id}`;
  const [detail, setDetail] = useState<Detail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // action state
  const [busy, setBusy] = useState<FulfillmentAction | "package" | "bundle" | null>(null);
  const [actionError, setActionError] = useState("");
  const [expanded, setExpanded] = useState<FulfillmentAction | null>(null);
  const [copied, setCopied] = useState(false);

  // clarify / reject inputs
  const [clarifyMsg, setClarifyMsg] = useState("");
  const [rejectReason, setRejectReason] = useState("");

  // deliver inputs
  const [deliverTake, setDeliverTake] = useState<string>("");
  const [qcNotes, setQcNotes] = useState("");

  // upload form
  const [files, setFiles] = useState<File[]>([]);
  const [takeLabel, setTakeLabel] = useState("");
  const [resultType, setResultType] = useState("image");
  const [upNotes, setUpNotes] = useState("");
  const [toolUsed, setToolUsed] = useState("");
  const [dur, setDur] = useState("");
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  const [estCost, setEstCost] = useState("");
  const [genTime, setGenTime] = useState("");

  // note form
  const [noteBody, setNoteBody] = useState("");
  const [noteBusy, setNoteBusy] = useState(false);

  const fileRef = useRef<HTMLInputElement>(null);

  const refresh = useCallback(async () => {
    setError("");
    try {
      const res = await adminFetch(token, base, { cache: "no-store" });
      if (res.status === 401 || res.status === 403) {
        clearAdminToken();
        window.location.reload();
        return;
      }
      if (res.status === 404) {
        setError("Job not found.");
        return;
      }
      if (!res.ok) {
        setError("Could not load job detail.");
        return;
      }
      const body = (await res.json()) as Detail;
      setDetail(body);
      if (body.results?.length && !deliverTake) {
        setDeliverTake(body.results[body.results.length - 1].id);
      }
    } catch {
      setError("Network error loading job detail.");
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, base]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const postAction = async (
    action: FulfillmentAction,
    body?: Record<string, unknown>,
  ) => {
    setBusy(action);
    setActionError("");
    try {
      const res = await adminFetch(token, `${base}/${ACTION_ENDPOINTS[action]}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body ?? {}),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => null);
        setActionError(j?.error || j?.message || "Action failed. Try again.");
        return;
      }
      setExpanded(null);
      setClarifyMsg("");
      setRejectReason("");
      setQcNotes("");
      await refresh();
    } catch {
      setActionError("Network error. Try again.");
    } finally {
      setBusy(null);
    }
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      setActionError("Choose at least one file to upload.");
      return;
    }
    setBusy("upload");
    setActionError("");
    try {
      const fd = new FormData();
      files.forEach((f) => fd.append("files[]", f));
      if (takeLabel.trim()) fd.append("takeLabel", takeLabel.trim());
      fd.append("resultType", resultType);
      if (upNotes.trim()) fd.append("notes", upNotes.trim());
      if (toolUsed.trim()) fd.append("toolUsed", toolUsed.trim());
      if (dur.trim()) fd.append("durationSeconds", dur.trim());
      if (width.trim()) fd.append("width", width.trim());
      if (height.trim()) fd.append("height", height.trim());
      if (estCost.trim()) fd.append("estCostPaise", estCost.trim());
      if (genTime.trim()) fd.append("generationTimeSeconds", genTime.trim());
      const res = await adminFetch(token, `${base}/upload`, {
        method: "POST",
        body: fd,
      });
      if (!res.ok) {
        const j = await res.json().catch(() => null);
        setActionError(j?.error || j?.message || "Upload failed. Try again.");
        return;
      }
      setExpanded(null);
      setFiles([]);
      setTakeLabel("");
      setUpNotes("");
      setToolUsed("");
      setDur("");
      setWidth("");
      setHeight("");
      setEstCost("");
      setGenTime("");
      await refresh();
    } catch {
      setActionError("Network error during upload.");
    } finally {
      setBusy(null);
    }
  };

  const copyPackage = async () => {
    setBusy("package");
    setActionError("");
    try {
      const res = await adminFetch(token, `${base}/package`, { cache: "no-store" });
      if (!res.ok) {
        setActionError("Could not fetch the AI package.");
        return;
      }
      const { text } = (await res.json()) as { text?: string };
      if (!text) {
        setActionError("Empty package received.");
        return;
      }
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setActionError("Clipboard copy failed — check browser permissions.");
    } finally {
      setBusy(null);
    }
  };

  const downloadBundle = async () => {
    setBusy("bundle");
    setActionError("");
    try {
      const res = await adminFetch(token, `${base}/bundle`);
      if (!res.ok) {
        setActionError("Could not build the reference bundle.");
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${detail?.job.orderCode ?? "VLSH-order"}.zip`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 5000);
    } catch {
      setActionError("Bundle download failed.");
    } finally {
      setBusy(null);
    }
  };

  const addNote = async () => {
    const body = noteBody.trim();
    if (!body || noteBusy) return;
    setNoteBusy(true);
    setActionError("");
    try {
      const res = await adminFetch(token, `${base}/notes`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ body }),
      });
      if (!res.ok) {
        setActionError("Could not save the note.");
        return;
      }
      setNoteBody("");
      await refresh();
    } catch {
      setActionError("Network error saving note.");
    } finally {
      setNoteBusy(false);
    }
  };

  if (loading) {
    return (
      <p className="flex items-center gap-2 text-[13px] text-white/50">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading job…
      </p>
    );
  }

  if (error || !detail) {
    return <p className="text-[14px] text-red-300/80">{error || "Job not found."}</p>;
  }

  const { job, user, order, references, settings, notes, results, history } = detail;
  const actions = availableActions(job.state);

  const renderAction = (action: FulfillmentAction) => {
    const isOpen = expanded === action;
    const label = ACTION_LABELS[action];
    const danger = action === "reject";
    const primary = action === "approve" || action === "deliver" || action === "start";

    const btnCls = `inline-flex items-center justify-center gap-2 rounded-[10px] px-4 py-2.5 text-[13px] font-semibold disabled:opacity-40 ${
      danger
        ? "bg-red-400/15 text-red-100 hover:bg-red-400/25"
        : primary
          ? "bg-emerald-400/15 text-emerald-100 hover:bg-emerald-400/25"
          : "border border-white/[0.12] bg-[#18181B] text-[#F5F5F3] hover:border-white/25"
    }`;

    // actions with inline forms
    if (action === "clarify") {
      return (
        <div key={action} className="rounded-[12px] border border-white/[0.08] bg-[#0D0D0F] p-4">
          <p className="text-[13px] font-medium text-white/80">Request clarification</p>
          <textarea
            value={clarifyMsg}
            onChange={(e) => setClarifyMsg(e.target.value)}
            rows={3}
            placeholder="What do you need from the customer?"
            className={`${inputCls} mt-2 resize-y`}
          />
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={() => postAction("clarify", { message: clarifyMsg.trim() })}
              disabled={busy === "clarify" || !clarifyMsg.trim()}
              className={btnCls}
            >
              {busy === "clarify" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Send request
            </button>
          </div>
        </div>
      );
    }

    if (action === "reject") {
      return (
        <div key={action} className="rounded-[12px] border border-red-400/20 bg-[#0D0D0F] p-4">
          <p className="text-[13px] font-medium text-red-200/90">Reject order</p>
          <input
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Reason (shown in audit log)"
            className={`${inputCls} mt-2`}
          />
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={() => postAction("reject", { reason: rejectReason.trim() })}
              disabled={busy === "reject" || !rejectReason.trim()}
              className={btnCls}
            >
              {busy === "reject" ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Confirm reject
            </button>
          </div>
        </div>
      );
    }

    if (action === "upload") {
      return (
        <div key={action} className="rounded-[12px] border border-white/[0.08] bg-[#0D0D0F] p-4">
          <div className="flex items-center justify-between">
            <p className="text-[13px] font-medium text-white/80">Upload result</p>
            <button
              type="button"
              onClick={() => setExpanded(isOpen ? null : "upload")}
              className="text-[12px] text-white/50 hover:text-white/85"
            >
              {isOpen ? "Hide" : "Show form"}
            </button>
          </div>
          {isOpen && (
            <div className="mt-3 space-y-3">
              <div>
                <span className={labelCls}>Files</span>
                <label
                  htmlFor="result-files"
                  className="mt-2 flex cursor-pointer items-center gap-2.5 rounded-[10px] border border-dashed border-white/[0.14] bg-[#121214] px-4 py-3 text-[13px] text-white/60 hover:border-white/30"
                >
                  <Upload className="h-4 w-4 shrink-0" />
                  {files.length > 0
                    ? `${files.length} file${files.length > 1 ? "s" : ""} selected`
                    : "Choose MP4 / MOV / WebM / PNG / JPG / WebP (max 200MB each)"}
                </label>
                <input
                  id="result-files"
                  ref={fileRef}
                  type="file"
                  multiple
                  accept="video/mp4,video/quicktime,video/webm,image/png,image/jpeg,image/webp"
                  className="sr-only"
                  onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
                />
                {files.length > 0 && (
                  <ul className="mt-2 space-y-1">
                    {files.map((f, i) => (
                      <li key={i} className="text-[12px] text-white/55 tabular-nums">
                        {f.name} · {(f.size / 1048576).toFixed(1)} MB
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="take-label" className={labelCls}>Take label</label>
                  <input id="take-label" value={takeLabel} onChange={(e) => setTakeLabel(e.target.value)} placeholder="Take 01" className={`${inputCls} mt-1.5`} />
                </div>
                <div>
                  <label htmlFor="result-type" className={labelCls}>Result type</label>
                  <select id="result-type" value={resultType} onChange={(e) => setResultType(e.target.value)} className={`${inputCls} mt-1.5`}>
                    <option value="image">Image</option>
                    <option value="video">Video</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="tool-used" className={labelCls}>Tool used</label>
                  <input id="tool-used" value={toolUsed} onChange={(e) => setToolUsed(e.target.value)} placeholder="e.g. Midjourney v7" className={`${inputCls} mt-1.5`} />
                </div>
                <div>
                  <label htmlFor="up-notes" className={labelCls}>Notes</label>
                  <input id="up-notes" value={upNotes} onChange={(e) => setUpNotes(e.target.value)} placeholder="Optional" className={`${inputCls} mt-1.5`} />
                </div>
                <div>
                  <label htmlFor="dur" className={labelCls}>Duration (s)</label>
                  <input id="dur" type="number" min="0" value={dur} onChange={(e) => setDur(e.target.value)} className={`${inputCls} mt-1.5 tabular-nums`} />
                </div>
                <div>
                  <label htmlFor="gen-time" className={labelCls}>Generation time (s)</label>
                  <input id="gen-time" type="number" min="0" value={genTime} onChange={(e) => setGenTime(e.target.value)} className={`${inputCls} mt-1.5 tabular-nums`} />
                </div>
                <div>
                  <label htmlFor="width" className={labelCls}>Width (px)</label>
                  <input id="width" type="number" min="0" value={width} onChange={(e) => setWidth(e.target.value)} className={`${inputCls} mt-1.5 tabular-nums`} />
                </div>
                <div>
                  <label htmlFor="height" className={labelCls}>Height (px)</label>
                  <input id="height" type="number" min="0" value={height} onChange={(e) => setHeight(e.target.value)} className={`${inputCls} mt-1.5 tabular-nums`} />
                </div>
                <div className="col-span-2">
                  <label htmlFor="est-cost" className={labelCls}>Est. cost (₹)</label>
                  <input id="est-cost" type="number" min="0" step="0.01" value={estCost} onChange={(e) => setEstCost(e.target.value)} placeholder="Internal" className={`${inputCls} mt-1.5 tabular-nums`} />
                </div>
              </div>
              <button
                type="button"
                onClick={handleUpload}
                disabled={busy === "upload" || files.length === 0}
                className={`${btnCls} w-full`}
              >
                {busy === "upload" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                Upload {files.length > 0 ? `${files.length} file${files.length > 1 ? "s" : ""}` : ""}
              </button>
            </div>
          )}
        </div>
      );
    }

    if (action === "deliver") {
      return (
        <div key={action} className="rounded-[12px] border border-emerald-300/20 bg-[#0D0D0F] p-4">
          <p className="text-[13px] font-medium text-emerald-100/90">Approve & deliver</p>
          {results.length > 1 && (
            <div className="mt-2 space-y-1.5">
              {results.map((t) => (
                <label key={t.id} className="flex cursor-pointer items-center gap-2.5 text-[13px] text-white/75">
                  <input
                    type="radio"
                    name="deliver-take"
                    checked={deliverTake === t.id}
                    onChange={() => setDeliverTake(t.id)}
                    className="h-4 w-4 accent-emerald-300"
                  />
                  {t.takeLabel} · {t.resultType}
                </label>
              ))}
            </div>
          )}
          <label htmlFor="qc-notes" className={`${labelCls} mt-3`}>QC notes <span className="text-white/35">(optional)</span></label>
          <textarea
            id="qc-notes"
            value={qcNotes}
            onChange={(e) => setQcNotes(e.target.value)}
            rows={2}
            placeholder="Internal QC summary"
            className={`${inputCls} mt-1.5 resize-y`}
          />
          <button
            type="button"
            onClick={() =>
              postAction("deliver", {
                ...(deliverTake ? { takeId: deliverTake } : {}),
                ...(qcNotes.trim() ? { qcNotes: qcNotes.trim() } : {}),
              })
            }
            disabled={busy === "deliver" || results.length === 0}
            className={`${btnCls} mt-3 w-full`}
          >
            {busy === "deliver" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            {results.length === 0 ? "No takes uploaded yet" : "Approve & deliver"}
          </button>
        </div>
      );
    }

    // simple one-click actions: approve, start, to-qc, rework
    return (
      <button
        key={action}
        type="button"
        onClick={() => postAction(action)}
        disabled={busy === action}
        className={`${btnCls} w-full`}
      >
        {busy === action && <Loader2 className="h-4 w-4 animate-spin" />}
        {label}
      </button>
    );
  };

  return (
    <div className="space-y-6">
      {/* header */}
      <div>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-[20px] font-semibold tabular-nums">
            {job.orderCode ?? job.id.slice(0, 8)}
          </h1>
          <StateBadge state={job.state} />
          {job.jobKind && job.jobKind !== "generation" && (
            <span className="rounded-full border border-white/[0.14] bg-white/[0.04] px-2 py-0.5 text-[11px] font-semibold text-white/60">
              {job.jobKind}
            </span>
          )}
        </div>
        <p className="mt-1.5 text-[13px] text-white/45 tabular-nums">
          {user?.email ?? "Unknown customer"}
          {user?.name ? ` · ${user.name}` : ""} · created {age(job.createdAt)}
          {job.deliveredAt ? ` · delivered ${new Date(job.deliveredAt).toLocaleString()}` : ""}
        </p>
      </div>

      {actionError && (
        <p className="rounded-[12px] border border-red-400/20 bg-red-400/[0.06] px-4 py-3 text-[13px] text-red-200/90" role="alert">
          {actionError}
        </p>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        {/* main column */}
        <div className="space-y-6">
          <Section title="Customer request">
            <p className="whitespace-pre-wrap text-[14px] leading-7 text-[#F5F5F3]">
              &ldquo;{job.prompt ?? "—"}&rdquo;
            </p>
            <dl className="mt-4 border-t border-white/[0.06]">
              <Kv k="Type" v={humanizeTask(job.task, job.jobKind)} />
              <Kv k="Output" v={job.task === "text_to_image" || job.task === "image_to_image" ? "Image" : (job.task ?? "—")} />
              <Kv k="Duration" v={job.durationSeconds != null ? `${job.durationSeconds}s` : "n/a"} />
              <Kv k="Aspect" v={job.aspectRatio ?? "—"} />
              <Kv k="Quality" v={job.quality ?? "—"} />
              <Kv k="Style" v={job.style ?? job.genre ?? "—"} />
              <Kv k="Constraints" v={job.constraints ?? "—"} />
              {job.negativePrompt && <Kv k="Negative prompt" v={job.negativePrompt} />}
            </dl>
            {job.jobKind && job.jobKind !== "generation" && (
              <div className="mt-4 rounded-[12px] border border-white/[0.08] bg-[#0D0D0F] p-4">
                <p className="text-[12px] font-medium text-white/45">PREVIOUS CONTEXT</p>
                {job.parentPrompt && (
                  <p className="mt-2 text-[13px] leading-6 text-white/70">
                    Original prompt: &ldquo;{job.parentPrompt}&rdquo;
                  </p>
                )}
                {job.revision && (
                  <p className="mt-2 text-[13px] leading-6 text-white/70">
                    Customer revision: &ldquo;{job.revision}&rdquo;
                  </p>
                )}
                {job.parentJobId && (
                  <p className="mt-2 text-[12px] text-white/40 tabular-nums">
                    Parent job: {job.parentJobId}
                  </p>
                )}
              </div>
            )}
          </Section>

          <Section
            title={`References (${references.length})`}
            action={
              <button
                type="button"
                onClick={downloadBundle}
                disabled={busy === "bundle"}
                className="inline-flex items-center gap-1.5 rounded-[8px] border border-white/[0.12] bg-[#18181B] px-3 py-1.5 text-[12px] font-medium hover:border-white/25 disabled:opacity-40"
              >
                {busy === "bundle" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
                Download bundle
              </button>
            }
          >
            {references.length === 0 ? (
              <p className="text-[13px] text-white/40">No reference assets.</p>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {references.map((r) => (
                  <div key={r.id} className="overflow-hidden rounded-[12px] border border-white/[0.08] bg-[#0D0D0F]">
                    <a href={r.url} target="_blank" rel="noreferrer" title="View full size">
                      {isVideoUrl(r.url) ? (
                        <video src={r.url} preload="metadata" className="aspect-square w-full object-cover" />
                      ) : (
                        <img src={r.url} alt={r.filename ?? "Reference"} className="aspect-square w-full object-cover" loading="lazy" />
                      )}
                    </a>
                    <div className="flex items-center justify-between gap-2 px-2.5 py-2">
                      <span className="truncate text-[11px] text-white/50">{r.filename ?? r.id.slice(0, 8)}</span>
                      <a
                        href={r.url}
                        download={r.filename ?? true}
                        className="shrink-0 text-white/50 hover:text-white/90"
                        aria-label={`Download ${r.filename ?? "reference"}`}
                      >
                        <Download className="h-3.5 w-3.5" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Section>

          <Section title={`Results / takes (${results.length})`}>
            {results.length === 0 ? (
              <p className="text-[13px] text-white/40">No takes uploaded yet.</p>
            ) : (
              <div className="space-y-3">
                {results.map((t) => {
                  const url = t.url ?? t.assetUrl;
                  return (
                    <div key={t.id} className="flex gap-3 rounded-[12px] border border-white/[0.08] bg-[#0D0D0F] p-3">
                      <div className="h-20 w-20 shrink-0 overflow-hidden rounded-[8px] bg-black">
                        {url && isVideoUrl(url) ? (
                          <video src={url} preload="metadata" className="h-full w-full object-cover" />
                        ) : url ? (
                          <img src={url} alt={t.takeLabel} className="h-full w-full object-cover" loading="lazy" />
                        ) : null}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[13px] font-medium text-white/85">
                          {t.takeLabel} · {t.resultType}
                        </p>
                        <p className="mt-1 text-[12px] text-white/45 tabular-nums">
                          {[t.toolUsed, t.width && t.height ? `${t.width}×${t.height}` : null, t.durationSeconds != null ? `${t.durationSeconds}s` : null]
                            .filter(Boolean)
                            .join(" · ") || "—"}
                        </p>
                        {t.notes && <p className="mt-1 text-[12px] text-white/55">{t.notes}</p>}
                        {url && (
                          <a href={url} target="_blank" rel="noreferrer" className="mt-1 inline-block text-[12px] text-violet-200 hover:underline">
                            View full
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Section>

          {(job.clarificationRequest || job.clarificationResponse) && (
            <Section title="Clarification thread">
              <div className="space-y-3">
                {job.clarificationRequest && (
                  <div className="rounded-[12px] border border-amber-300/20 bg-amber-300/[0.05] p-4">
                    <p className="text-[12px] font-medium text-amber-200/80">Operator asked</p>
                    <p className="mt-1.5 whitespace-pre-wrap text-[13px] leading-6 text-white/80">
                      {job.clarificationRequest}
                    </p>
                  </div>
                )}
                {job.clarificationResponse && (
                  <div className="rounded-[12px] border border-white/[0.08] bg-[#0D0D0F] p-4">
                    <p className="text-[12px] font-medium text-white/45">Customer replied</p>
                    <p className="mt-1.5 whitespace-pre-wrap text-[13px] leading-6 text-white/80">
                      {job.clarificationResponse}
                    </p>
                  </div>
                )}
              </div>
            </Section>
          )}

          <Section title={`Internal notes (${notes.length})`}>
            <div className="space-y-3">
              {notes.length === 0 && (
                <p className="text-[13px] text-white/40">No notes yet.</p>
              )}
              {notes.map((n, i) => {
                const body = typeof n === "string" ? n : n.body;
                const at = typeof n === "string" ? null : n.createdAt;
                return (
                  <div key={i} className="rounded-[12px] border border-white/[0.06] bg-[#0D0D0F] p-3.5">
                    <p className="whitespace-pre-wrap text-[13px] leading-6 text-white/80">{body}</p>
                    {at && (
                      <p className="mt-1.5 text-[11px] text-white/35 tabular-nums">
                        {new Date(at).toLocaleString()}
                      </p>
                    )}
                  </div>
                );
              })}
              <div className="flex gap-2">
                <input
                  value={noteBody}
                  onChange={(e) => setNoteBody(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addNote()}
                  placeholder="Add an internal note…"
                  className={inputCls}
                />
                <button
                  type="button"
                  onClick={addNote}
                  disabled={noteBusy || !noteBody.trim()}
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-[10px] border border-white/[0.12] bg-[#18181B] px-4 py-2.5 text-[13px] font-medium hover:border-white/25 disabled:opacity-40"
                >
                  {noteBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  Add
                </button>
              </div>
            </div>
          </Section>

          {history.length > 0 && (
            <Section title="History">
              <ol className="space-y-2">
                {history.map((h, i) => (
                  <li key={i} className="flex items-start justify-between gap-3 text-[12px]">
                    <span className="text-white/65">{h.action.replace(/_/g, " ")}</span>
                    <span className="shrink-0 text-white/35 tabular-nums">
                      {h.createdAt ? new Date(h.createdAt).toLocaleString() : "—"}
                    </span>
                  </li>
                ))}
              </ol>
            </Section>
          )}
        </div>

        {/* sidebar */}
        <div className="space-y-6">
          <Section title="Settings">
            <dl className="border-t border-white/[0.06]">
              <Kv k="Aspect ratio" v={job.aspectRatio ?? "—"} />
              <Kv k="Quality" v={job.quality ?? "—"} />
              {job.seed != null && <Kv k="Seed" v={String(job.seed)} />}
              {settings &&
                Object.entries(settings).map(([k, v]) => (
                  <Kv key={k} k={k} v={typeof v === "object" ? JSON.stringify(v) : String(v)} />
                ))}
            </dl>
          </Section>

          <Section title="Payment">
            <dl className="border-t border-white/[0.06]">
              <Kv k="Amount" v={order?.amountPaise != null ? formatINR(order.amountPaise) : "—"} />
              <Kv k="UTR" v={order?.utr ?? "—"} />
              <Kv k="Verification" v={order?.verification ?? order?.status ?? "—"} />
            </dl>
          </Section>

          <Section title="Actions">
            <div className="space-y-2.5">
              <button
                type="button"
                onClick={copyPackage}
                disabled={busy === "package"}
                className="inline-flex w-full items-center justify-center gap-2 rounded-[10px] border border-violet-300/30 bg-violet-300/[0.08] px-4 py-2.5 text-[13px] font-semibold text-violet-100 hover:bg-violet-300/[0.14] disabled:opacity-40"
              >
                {busy === "package" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : copied ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
                {copied ? "Copied" : "Copy AI package"}
              </button>
              <button
                type="button"
                onClick={downloadBundle}
                disabled={busy === "bundle"}
                className="inline-flex w-full items-center justify-center gap-2 rounded-[10px] border border-white/[0.12] bg-[#18181B] px-4 py-2.5 text-[13px] font-medium hover:border-white/25 disabled:opacity-40"
              >
                {busy === "bundle" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Package className="h-4 w-4" />}
                Download reference bundle
              </button>

              {actions.length > 0 && (
                <>
                  <div className="flex items-center gap-2 pt-2">
                    <div className="h-px flex-1 bg-white/[0.08]" />
                    <span className="text-[11px] font-medium text-white/35">STATE ACTIONS</span>
                    <div className="h-px flex-1 bg-white/[0.08]" />
                  </div>
                  {actions.map(renderAction)}
                </>
              )}

              {job.errorMessage && (
                <p className="rounded-[10px] border border-red-400/20 bg-red-400/[0.06] px-3 py-2 text-[12px] text-red-200/80">
                  {job.errorMessage}
                </p>
              )}
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
}

export default function FulfillmentJobPage() {
  const params = useParams();
  const id = params.id as string;
  const [saved, setSaved] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const once = useRef(false);

  useEffect(() => {
    if (once.current) return;
    once.current = true;
    setSaved(getAdminToken());
    setReady(true);
  }, []);

  const verify = useCallback(
    async (tok: string) => {
      const res = await adminFetch(tok, `/api/admin/fulfillment/${id}`, {
        cache: "no-store",
      });
      return res.ok;
    },
    [id],
  );

  return (
    <div className="min-h-screen bg-[#080808] font-sans text-[#F5F5F3] antialiased">
      <div className="mx-auto w-full max-w-6xl px-4 pb-20 pt-10 sm:pt-14">
        <Link
          href="/admin/fulfillment"
          className="inline-flex items-center gap-1.5 text-[13px] text-white/55 hover:text-white/90"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={1.8} /> Back to queue
        </Link>

        <div className="mt-6">
          {!ready ? (
            <p className="flex items-center gap-2 text-[13px] text-white/50">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading…
            </p>
          ) : saved ? (
            <Workspace token={saved} id={id} />
          ) : (
            <TokenGate
              title="Fulfillment job"
              description="Enter the admin token to work this job."
              verify={verify}
            >
              {(token) => <Workspace token={token} id={id} />}
            </TokenGate>
          )}
        </div>
      </div>
    </div>
  );
}
