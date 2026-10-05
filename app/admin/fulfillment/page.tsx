"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { formatINR } from "@/src/lib/vilish/types";
import { BUCKETS, bucketOf, type QueueBucket } from "./actions";
import { StateBadge } from "./state-badge";
import TokenGate from "./token-gate";
import { adminFetch, clearAdminToken, getAdminToken } from "./admin-token";

const th = "px-3 py-2 text-left text-[12px] font-medium text-white/45 whitespace-nowrap";
const td = "px-3 py-2 text-[13px] text-white/75 whitespace-nowrap tabular-nums";
const tdId = "px-3 py-2 text-[12px] text-white/50 whitespace-nowrap";

interface QueueJob {
  id: string;
  orderCode?: string;
  userEmail?: string;
  amountPaise?: number;
  task?: string;
  prompt?: string;
  aspectRatio?: string;
  quality?: string;
  state: string;
  paymentState?: string;
  jobKind?: string;
  remakeOf?: string;
  createdAt?: string;
  updatedAt?: string;
  refCount?: number;
}

interface QueueData {
  counts: Record<QueueBucket, number>;
  jobs: QueueJob[];
}

function age(createdAt?: string) {
  if (!createdAt) return "—";
  const ms = Date.now() - new Date(createdAt).getTime();
  if (ms < 0) return "just now";
  const mins = Math.floor(ms / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  return `${Math.floor(hrs / 24)}d`;
}

function QueueInner({ token }: { token: string }) {
  const [data, setData] = useState<QueueData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [bucket, setBucket] = useState<QueueBucket | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await adminFetch(token, "/api/admin/fulfillment/queue", {
        cache: "no-store",
      });
      if (res.status === 401 || res.status === 403) {
        clearAdminToken();
        window.location.reload();
        return;
      }
      if (!res.ok) {
        setError("Could not load the fulfillment queue.");
        return;
      }
      setData((await res.json()) as QueueData);
    } catch {
      setError("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  const jobs = data?.jobs ?? [];
  const visible = bucket ? jobs.filter((j) => bucketOf(j.state) === bucket) : jobs;
  const total = (data?.counts ? Object.values(data.counts) : []).reduce(
    (a, b) => a + (typeof b === "number" ? b : 0),
    0,
  );

  return (
    <div className="space-y-8">
      {/* bucket counts */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
        {BUCKETS.map((b) => {
          const count = data?.counts?.[b.id] ?? 0;
          const active = bucket === b.id;
          return (
            <button
              key={b.id}
              type="button"
              onClick={() => setBucket(active ? null : b.id)}
              aria-pressed={active}
              className={`rounded-[12px] border p-3 text-left transition-colors ${
                active
                  ? "border-violet-300/40 bg-violet-300/[0.08]"
                  : "border-white/[0.08] bg-[#121214] hover:border-white/20"
              }`}
            >
              <p className="text-[22px] font-semibold tabular-nums">{loading ? "—" : count}</p>
              <p className="mt-0.5 text-[11px] font-medium text-white/50">{b.label}</p>
            </button>
          );
        })}
      </div>

      {/* queue */}
      <section>
        <div className="flex items-center justify-between">
          <h2 className="text-[15px] font-semibold">
            {bucket ? BUCKETS.find((b) => b.id === bucket)?.label : "All jobs"}
            <span className="ml-2 text-[13px] font-normal text-white/40 tabular-nums">
              {visible.length} of {total}
            </span>
          </h2>
          <button
            type="button"
            onClick={load}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-[8px] border border-white/[0.12] bg-[#18181B] px-3 py-1.5 text-[12px] font-medium hover:border-white/25 disabled:opacity-40"
          >
            {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            Refresh
          </button>
        </div>
        {error && <p className="mt-2 text-[13px] text-red-300/80">{error}</p>}

        {loading && !data ? (
          <p className="mt-6 flex items-center gap-2 text-[13px] text-white/50">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading queue…
          </p>
        ) : visible.length === 0 ? (
          <p className="mt-4 rounded-[12px] border border-white/[0.08] bg-[#121214] px-4 py-8 text-center text-[13px] text-white/40">
            No jobs in this bucket.
          </p>
        ) : (
          <>
            {/* desktop table */}
            <div className="mt-3 hidden overflow-x-auto rounded-[12px] border border-white/[0.08] md:block">
              <table className="w-full border-collapse bg-[#121214]">
                <thead>
                  <tr className="border-b border-white/[0.08]">
                    <th className={th}>Order</th>
                    <th className={th}>Prompt</th>
                    <th className={th}>Customer</th>
                    <th className={th}>Task</th>
                    <th className={th}>Spec</th>
                    <th className={th}>Amount</th>
                    <th className={th}>Kind</th>
                    <th className={th}>Refs</th>
                    <th className={th}>State</th>
                    <th className={th}>Age</th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map((j) => (
                    <tr key={j.id} className="border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02]">
                      <td className={tdId}>
                        <Link
                          href={`/admin/fulfillment/${j.id}`}
                          className="font-semibold text-violet-200 hover:text-violet-100 hover:underline tabular-nums"
                        >
                          {j.orderCode ?? j.id.slice(0, 8)}
                        </Link>
                      </td>
                      <td className="max-w-[260px] truncate px-3 py-2 text-[13px] text-white/75">
                        <Link href={`/admin/fulfillment/${j.id}`} className="hover:underline">
                          {j.prompt ?? "—"}
                        </Link>
                      </td>
                      <td className="max-w-[160px] truncate px-3 py-2 text-[12px] text-white/50">
                        {j.userEmail ?? "—"}
                      </td>
                      <td className={td}>{j.task?.replace(/_/g, " ") ?? "—"}</td>
                      <td className={td}>
                        {[j.aspectRatio, j.quality].filter(Boolean).join(" · ") || "—"}
                      </td>
                      <td className={td}>
                        {j.amountPaise != null ? formatINR(j.amountPaise) : "—"}
                      </td>
                      <td className={td}>{j.jobKind ?? "generation"}</td>
                      <td className={td}>{j.refCount ?? 0}</td>
                      <td className={td}>
                        <StateBadge state={j.state} />
                      </td>
                      <td className={td}>{age(j.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* mobile cards */}
            <div className="mt-3 space-y-2 md:hidden">
              {visible.map((j) => (
                <Link
                  key={j.id}
                  href={`/admin/fulfillment/${j.id}`}
                  className="block rounded-[12px] border border-white/[0.08] bg-[#121214] p-4"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[13px] font-semibold text-violet-200 tabular-nums">
                      {j.orderCode ?? j.id.slice(0, 8)}
                    </span>
                    <StateBadge state={j.state} />
                  </div>
                  <p className="mt-2 line-clamp-2 text-[13px] leading-5 text-white/75">
                    {j.prompt ?? "—"}
                  </p>
                  <p className="mt-2 text-[12px] text-white/45 tabular-nums">
                    {j.userEmail ?? "—"} · {j.amountPaise != null ? formatINR(j.amountPaise) : "—"} ·{" "}
                    {j.refCount ?? 0} refs · {age(j.createdAt)}
                  </p>
                </Link>
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  );
}

export default function FulfillmentQueuePage() {
  const [saved, setSaved] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const tokenRef = useRef(false);

  useEffect(() => {
    if (tokenRef.current) return;
    tokenRef.current = true;
    setSaved(getAdminToken());
    setReady(true);
  }, []);

  const verify = useCallback(async (tok: string) => {
    const res = await adminFetch(tok, "/api/admin/fulfillment/queue", {
      cache: "no-store",
    });
    return res.ok;
  }, []);

  return (
    <div className="min-h-screen bg-[#080808] font-sans text-[#F5F5F3] antialiased">
      <div className="mx-auto w-full max-w-6xl px-4 pb-20 pt-10 sm:pt-14">
        <Link
          href="/admin"
          className="inline-flex items-center gap-1.5 text-[13px] text-white/55 hover:text-white/90"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={1.8} /> Back to admin
        </Link>
        <h1 className="mt-3 text-[22px] font-semibold tracking-[-0.01em]">
          Fulfillment queue
        </h1>
        <p className="mt-1 text-[13px] text-white/45">
          Operator fulfillment — oldest approved jobs first.
        </p>

        <div className="mt-8">
          {!ready ? (
            <p className="flex items-center gap-2 text-[13px] text-white/50">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading…
            </p>
          ) : saved ? (
            <QueueInner token={saved} />
          ) : (
            <TokenGate
              title="Fulfillment queue"
              description="Enter the admin token to view and work the operator queue."
              verify={verify}
            >
              {(token) => <QueueInner token={token} />}
            </TokenGate>
          )}
        </div>
      </div>
    </div>
  );
}
