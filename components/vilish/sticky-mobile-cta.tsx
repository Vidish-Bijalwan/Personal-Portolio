"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { priceOf } from "@/src/lib/pricing/catalog";
import { formatINR } from "@/src/lib/vilish/types";

/**
 * Sticky mobile CTA — fixed bottom bar on small screens only.
 * Hidden on /create (already converting), auth flows, and admin pages.
 */
const HIDE_ON = ["/create", "/admin", "/api"];

export default function StickyMobileCTA() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 480);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;
  if (HIDE_ON.some((p) => pathname === p || pathname.startsWith(p + "/"))) {
    return null;
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 px-4 pb-[max(0.9rem,env(safe-area-inset-bottom))] sm:hidden">
      <Link
        href="/create"
        aria-label={`Start creating — from ${formatINR(priceOf("single-image"))} per image`}
        className="flex min-h-[52px] items-center justify-between rounded-[16px] border border-white/[0.1] bg-[#121214]/95 px-5 py-3 shadow-[0_12px_40px_-12px_rgba(0,0,0,0.9)] backdrop-blur"
      >
        <span className="text-left">
          <span className="block text-[14px] font-semibold text-[#F5F5F3]">
            Start creating
          </span>
          <span className="block text-[12px] text-white/50">
            From {formatINR(priceOf("single-image"))} · no subscription
          </span>
        </span>
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[var(--pro-btn)] text-[var(--pro-btn-ink)]">
          <ArrowRight className="h-4 w-4" strokeWidth={2.4} />
        </span>
      </Link>
    </div>
  );
}
