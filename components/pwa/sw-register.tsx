"use client";

import { useEffect } from "react";

/**
 * Registers /sw.js once per page load. No-op where service workers are
 * unsupported. Failures stay silent — a missing SW must never break the
 * page (install prompt and share target simply stay unavailable).
 */
export default function SwRegister() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch(() => {
      /* silent: PWA features degrade gracefully */
    });
  }, []);
  return null;
}
