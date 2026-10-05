"use client";

import { useEffect, useState } from "react";

interface PublicConfig {
  turnaround: string;
  ordersAccepting: boolean;
  fulfillmentMode: string;
}

/**
 * Customer-facing fulfillment copy on /create: the human-review promise,
 * the turnaround line, and the paused notice when orders are not accepted.
 * Creation UI stays visible; the composer blocks checkout when paused.
 */
export default function FulfillmentNotices() {
  const [config, setConfig] = useState<PublicConfig | null>(null);

  useEffect(() => {
    fetch("/api/config/public", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((b) => {
        if (b && typeof b.turnaround === "string") setConfig(b as PublicConfig);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="mt-6 rounded-[14px] border border-white/[0.08] bg-[#121214] px-4 py-3.5">
      <p className="text-[13px] leading-6 text-white/60">
        AI generation with human quality review. Every paid generation is
        reviewed before delivery.
        {config ? ` ${config.turnaround}` : ""}
      </p>
      {config && !config.ordersAccepting && (
        <p className="mt-2 text-[13px] font-medium leading-6 text-amber-200/90" role="status">
          New generation orders are temporarily paused.
        </p>
      )}
    </div>
  );
}
