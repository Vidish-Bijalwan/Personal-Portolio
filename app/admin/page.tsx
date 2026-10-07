"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { formatINR } from "@/src/lib/vilish/types";

interface ProviderRow {
  id: string;
  status: string;
  priority: number;
}

interface ModelRow {
  model: string;
  task: string;
  cost: number;
}

interface JobRow {
  id: string;
  state: string;
  provider?: string;
  estimatedCost?: number;
  actualCost?: number;
  price?: number;
  margin?: number;
}

interface Overview {
  providers?: ProviderRow[];
  models?: ModelRow[];
  jobs?: JobRow[];
  config?: Record<string, unknown>;
}

interface PendingPaymentRow {
  code: string;
  user?: string;
  product?: string;
  prompt?: string;
  amountPaise: number;
  utr?: string;
  submittedAt?: string;
  duplicate?: boolean;
  screenshotUrl?: string;
}

const th = "px-3 py-2 text-left text-[12px] font-medium text-white/45 whitespace-nowrap";
const td = "px-3 py-2 text-[13px] text-white/75 whitespace-nowrap tabular-nums";
const tdId = "px-3 py-2 text-[12px] text-white/50 whitespace-nowrap";

export default function AdminPage() {
  const [token, setToken] = useState("");
  const [data, setData] = useState<Overview | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [authed, setAuthed] = useState(false);

  // pending manual payments
  const [pending, setPending] = useState<PendingPaymentRow[]>([]);
  const [pendingLoading, setPendingLoading] = useState(false);
  const [pendingError, setPendingError] = useState("");
  const [actionTarget, setActionTarget] = useState<{ mode: "verify" | "reject"; code: string } | null>(null);
  const [verifiedAmount, setVerifiedAmount] = useState("");
  const [ackDuplicate, setAckDuplicate] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [actionBusy, setActionBusy] = useState(false);
  const [actionError, setActionError] = useState("");

  const fetchPending = async (tok: string) => {
    setPendingLoading(true);
    setPendingError("");
    try {
      const res = await fetch("/api/admin/payments/pending", {
        headers: { "x-admin-token": tok },
      });
      if (!res.ok) {
        setPendingError("Could not load pending payments.");
        return;
      }
      const body = await res.json();
      setPending(Array.isArray(body) ? body : body?.payments ?? []);
    } catch {
      setPendingError("Network error loading pending payments.");
    } finally {
      setPendingLoading(false);
    }
  };

  const runAction = async () => {
    if (!actionTarget) return;
    setActionBusy(true);
    setActionError("");
    try {
      const { mode, code } = actionTarget;
      const url = `/api/admin/payments/${encodeURIComponent(code)}/${mode}`;
      const body =
        mode === "verify"
          ? {
              ...(verifiedAmount.trim() ? { verifiedAmountPaise: Math.round(parseFloat(verifiedAmount) * 100) } : {}),
              ...(ackDuplicate ? { acknowledgeDuplicate: true } : {}),
            }
          : { ...(rejectReason.trim() ? { reason: rejectReason.trim() } : {}) };
      const res = await fetch(url, {
        method: "POST",
        headers: { "content-type": "application/json", "x-admin-token": token },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        setActionError("Action failed. Try again.");
        return;
      }
      setActionTarget(null);
      setVerifiedAmount("");
      setAckDuplicate(false);
      setRejectReason("");
      fetchPending(token);
    } finally {
      setActionBusy(false);
    }
  };

  const load = async () => {
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/overview", {
        headers: { "x-admin-token": token },
      });
      if (res.status === 401 || res.status === 403) {
        setError("Invalid token.");
        setAuthed(false);
        setData(null);
        return;
      }
      if (!res.ok) {
        setError("Could not load admin overview.");
        return;
      }
      setData(await res.json());
      setAuthed(true);
      fetchPending(token);
    } catch {
      setError("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080808] font-sans text-[#F5F5F3] antialiased">
      <div className="mx-auto w-full max-w-5xl px-4 pb-20 pt-10 sm:pt-14">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-[22px] font-semibold tracking-[-0.01em]">Etch Admin</h1>
          <a
            href="/admin/fulfillment"
            className="rounded-[8px] border border-violet-300/30 bg-violet-300/[0.08] px-3 py-1.5 text-[12px] font-medium text-violet-100 hover:bg-violet-300/[0.14]"
          >
            Fulfillment queue
          </a>
        </div>

        {!authed && (
          <div className="mt-8 max-w-sm rounded-[16px] border border-white/[0.08] bg-[#121214] p-6">
            <label htmlFor="admin-token" className="text-[13px] font-medium text-white/70">
              Admin token
            </label>
            <input
              id="admin-token"
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && load()}
              placeholder="Paste admin token"
              autoComplete="off"
              className="mt-2 w-full rounded-[10px] border border-white/[0.1] bg-[#0D0D0F] px-3.5 py-2.5 text-[14px] text-[#F5F5F3] placeholder:text-white/30 outline-none focus:border-white/30"
            />
            <button
              type="button"
              onClick={load}
              disabled={loading || !token}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-[10px] border border-white/[0.12] bg-[#18181B] px-4 py-2.5 text-[14px] font-medium hover:border-white/25 disabled:opacity-40"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Load overview
            </button>
            {error && <p className="mt-3 text-[13px] text-red-300/80">{error}</p>}
            <p className="mt-3 text-[12px] text-white/35">
              The token stays in this tab&apos;s memory only — it is never saved.
            </p>
          </div>
        )}

        {authed && data && (
          <div className="mt-8 space-y-10">
            {/* providers */}
            <section>
              <h2 className="text-[15px] font-semibold">Providers</h2>
              <div className="mt-3 overflow-x-auto rounded-[12px] border border-white/[0.08]">
                <table className="w-full border-collapse bg-[#121214]">
                  <thead>
                    <tr className="border-b border-white/[0.08]">
                      <th className={th}>ID</th>
                      <th className={th}>Status</th>
                      <th className={th}>Priority</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(data.providers ?? []).map((p) => (
                      <tr key={p.id} className="border-b border-white/[0.04] last:border-0">
                        <td className={tdId}>{p.id}</td>
                        <td className={td}>{p.status}</td>
                        <td className={td}>{p.priority}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* models */}
            <section>
              <h2 className="text-[15px] font-semibold">Models</h2>
              <div className="mt-3 overflow-x-auto rounded-[12px] border border-white/[0.08]">
                <table className="w-full border-collapse bg-[#121214]">
                  <thead>
                    <tr className="border-b border-white/[0.08]">
                      <th className={th}>Model</th>
                      <th className={th}>Task</th>
                      <th className={th}>Cost</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(data.models ?? []).map((m, i) => (
                      <tr key={`${m.model}-${i}`} className="border-b border-white/[0.04] last:border-0">
                        <td className={tdId}>{m.model}</td>
                        <td className={td}>{m.task}</td>
                        <td className={td}>{formatINR(m.cost)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* jobs */}
            <section>
              <h2 className="text-[15px] font-semibold">Jobs</h2>
              <div className="mt-3 overflow-x-auto rounded-[12px] border border-white/[0.08]">
                <table className="w-full border-collapse bg-[#121214]">
                  <thead>
                    <tr className="border-b border-white/[0.08]">
                      <th className={th}>ID</th>
                      <th className={th}>State</th>
                      <th className={th}>Provider</th>
                      <th className={th}>Est.</th>
                      <th className={th}>Actual</th>
                      <th className={th}>Price</th>
                      <th className={th}>Margin</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(data.jobs ?? []).map((j) => (
                      <tr key={j.id} className="border-b border-white/[0.04] last:border-0">
                        <td className={tdId}>{j.id}</td>
                        <td className={td}>{j.state}</td>
                        <td className={td}>{j.provider ?? "—"}</td>
                        <td className={td}>{j.estimatedCost != null ? formatINR(j.estimatedCost) : "—"}</td>
                        <td className={td}>{j.actualCost != null ? formatINR(j.actualCost) : "—"}</td>
                        <td className={td}>{j.price != null ? formatINR(j.price) : "—"}</td>
                        <td className={td}>{j.margin != null ? formatINR(j.margin) : "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* pending payments */}
            <section>
              <div className="flex items-center justify-between">
                <h2 className="text-[15px] font-semibold">Pending payments</h2>
                <button
                  type="button"
                  onClick={() => fetchPending(token)}
                  disabled={pendingLoading}
                  className="rounded-[8px] border border-white/[0.12] bg-[#18181B] px-3 py-1.5 text-[12px] font-medium hover:border-white/25 disabled:opacity-40"
                >
                  {pendingLoading ? "Loading…" : "Refresh"}
                </button>
              </div>
              {pendingError && <p className="mt-2 text-[13px] text-red-300/80">{pendingError}</p>}
              <div className="mt-3 overflow-x-auto rounded-[12px] border border-white/[0.08]">
                <table className="w-full border-collapse bg-[#121214]">
                  <thead>
                    <tr className="border-b border-white/[0.08]">
                      <th className={th}>Order</th>
                      <th className={th}>User</th>
                      <th className={th}>Product / prompt</th>
                      <th className={th}>Amount</th>
                      <th className={th}>UTR</th>
                      <th className={th}>Submitted</th>
                      <th className={th}>Duplicate</th>
                      <th className={th}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pending.length === 0 && (
                      <tr>
                        <td colSpan={8} className="px-3 py-6 text-center text-[13px] text-white/40">
                          No pending payments.
                        </td>
                      </tr>
                    )}
                    {pending.map((p) => (
                      <tr key={p.code} className="border-b border-white/[0.04] last:border-0">
                        <td className={tdId}>{p.code}</td>
                        <td className={td}>{p.user ?? "—"}</td>
                        <td className="max-w-[220px] truncate px-3 py-2 text-[13px] text-white/75">
                          {p.product ?? p.prompt ?? "—"}
                        </td>
                        <td className={td}>{formatINR(p.amountPaise)}</td>
                        <td className="px-3 py-2 text-[12px] text-white/60 tabular-nums">{p.utr ?? "—"}</td>
                        <td className={td}>
                          {p.submittedAt ? new Date(p.submittedAt).toLocaleString() : "—"}
                        </td>
                        <td className={td}>
                          {p.duplicate ? (
                            <span className="rounded-full border border-amber-300/30 bg-amber-300/10 px-2 py-0.5 text-[11px] font-semibold text-amber-200">
                              DUPLICATE
                            </span>
                          ) : (
                            <span className="text-white/35">—</span>
                          )}
                        </td>
                        <td className={td}>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => setActionTarget({ mode: "verify", code: p.code })}
                              className="rounded-[8px] bg-emerald-400/15 px-3 py-1.5 text-[12px] font-medium text-emerald-200 hover:bg-emerald-400/25"
                            >
                              Verify
                            </button>
                            <button
                              type="button"
                              onClick={() => setActionTarget({ mode: "reject", code: p.code })}
                              className="rounded-[8px] bg-red-400/15 px-3 py-1.5 text-[12px] font-medium text-red-200 hover:bg-red-400/25"
                            >
                              Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* config */}
            <section>
              <h2 className="text-[15px] font-semibold">Config</h2>
              <pre className="mt-3 overflow-x-auto rounded-[12px] border border-white/[0.08] bg-[#0D0D0F] p-4 text-[12px] leading-5 text-white/60">
                {JSON.stringify(data.config ?? {}, null, 2)}
              </pre>
            </section>
          </div>
        )}

        {/* verify / reject confirmation dialog */}
        {actionTarget && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
            role="dialog"
            aria-modal="true"
            onClick={() => setActionTarget(null)}
          >
            <div
              className="w-full max-w-sm rounded-[16px] border border-white/[0.1] bg-[#121214] p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-[15px] font-semibold">
                {actionTarget.mode === "verify" ? "Verify payment" : "Reject payment"}
              </h3>
              <p className="mt-1 text-[12px] text-white/45 tabular-nums">Order {actionTarget.code}</p>

              {actionTarget.mode === "verify" ? (
                <>
                  <label htmlFor="verified-amount" className="mt-4 block text-[13px] font-medium text-white/70">
                    Verified amount (₹) <span className="text-white/35">(optional)</span>
                  </label>
                  <input
                    id="verified-amount"
                    type="number"
                    min="0"
                    step="0.01"
                    value={verifiedAmount}
                    onChange={(e) => setVerifiedAmount(e.target.value)}
                    placeholder="Leave blank to use order amount"
                    className="mt-2 w-full rounded-[10px] border border-white/[0.1] bg-[#0D0D0F] px-3.5 py-2.5 text-[14px] tabular-nums text-[#F5F5F3] placeholder:text-white/30 outline-none focus:border-white/30"
                  />
                  <label className="mt-3 flex cursor-pointer items-center gap-2.5 text-[13px] text-white/70">
                    <input
                      type="checkbox"
                      checked={ackDuplicate}
                      onChange={(e) => setAckDuplicate(e.target.checked)}
                      className="h-4 w-4 accent-emerald-300"
                    />
                    Acknowledge duplicate — I have checked this is not a double submission
                  </label>
                </>
              ) : (
                <>
                  <label htmlFor="reject-reason" className="mt-4 block text-[13px] font-medium text-white/70">
                    Reason <span className="text-white/35">(optional)</span>
                  </label>
                  <input
                    id="reject-reason"
                    type="text"
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="e.g. payment not received"
                    className="mt-2 w-full rounded-[10px] border border-white/[0.1] bg-[#0D0D0F] px-3.5 py-2.5 text-[14px] text-[#F5F5F3] placeholder:text-white/30 outline-none focus:border-white/30"
                  />
                </>
              )}

              {actionError && <p className="mt-3 text-[13px] text-red-300/80">{actionError}</p>}

              <div className="mt-5 flex gap-2">
                <button
                  type="button"
                  onClick={() => setActionTarget(null)}
                  disabled={actionBusy}
                  className="flex-1 rounded-[10px] border border-white/[0.12] bg-[#18181B] px-4 py-2.5 text-[13px] font-medium hover:border-white/25 disabled:opacity-40"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={runAction}
                  disabled={actionBusy}
                  className={
                    "flex-1 rounded-[10px] px-4 py-2.5 text-[13px] font-semibold disabled:opacity-40 " +
                    (actionTarget.mode === "verify"
                      ? "bg-emerald-400/20 text-emerald-100 hover:bg-emerald-400/30"
                      : "bg-red-400/20 text-red-100 hover:bg-red-400/30")
                  }
                >
                  {actionBusy ? "Working…" : actionTarget.mode === "verify" ? "Confirm verify" : "Confirm reject"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
