"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { priceOf } from "@/lib/pricing/catalog";
import { formatINR } from "@/lib/vilish/types";
import Wordmark from "./wordmark";

/**
 * Tools dropdown — ONLY working destinations. No dead items, no "coming soon".
 * Every price is derived from the catalog (never hardcoded).
 */
const TOOLS: {
  href: string;
  label: string;
  blurb: string;
  price?: string;
}[] = [
  {
    href: "/create",
    label: "AI Image",
    blurb: "Text to image, your aspect, your quality",
    price: formatINR(priceOf("single-image")),
  },
  {
    href: "/create?media=video",
    label: "5s Video Clip",
    blurb: "Prompt to video, made for reels",
    price: formatINR(priceOf("clip-5s")),
  },
  {
    href: "/create?service=product-photo",
    label: "Product Photo",
    blurb: "Studio-grade shots for sellers",
    price: formatINR(priceOf("product-photo")),
  },
  {
    href: "/video-studio",
    label: "Video Studio",
    blurb: "Voice-over, captions, trim + text",
    price: `${formatINR(priceOf("video-studio"))}/job`,
  },
  {
    href: "/trends",
    label: "Trends",
    blurb: "Ready-made templates, exact prices",
  },
  {
    href: "/pricing",
    label: "Pricing",
    blurb: "Pay per creation, no subscription",
  },
  {
    href: "/blog",
    label: "Blog",
    blurb: "Guides & honest cost breakdowns",
  },
];

/** Flat links that stay outside the dropdown. */
const FLAT_LINKS = [
  { href: "/examples", label: "Examples" },
  { href: "/about", label: "About" },
];

function ToolsDropdown() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close on route change + Escape.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open ]);

  const active = TOOLS.some((t) => pathname === t.href.split("?")[0]);

  return (
    <div
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        aria-haspopup="true"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "inline-flex min-h-[44px] items-center gap-1 text-[13px] font-medium transition-colors",
          open || active ? "text-[#F5F5F3]" : "text-white/55 hover:text-white/90",
        )}
      >
        Tools
        <ChevronDown
          className={cn("h-3.5 w-3.5 transition-transform", open && "rotate-180")}
          strokeWidth={2.2}
        />
      </button>
      {open && (
        <div className="absolute left-1/2 top-full z-50 w-[300px] -translate-x-1/2 pt-2">
          <div
            role="menu"
            aria-label="Tools"
            className="overflow-hidden rounded-[14px] border border-white/[0.1] bg-[#101012] shadow-[0_24px_60px_-12px_rgba(0,0,0,0.85)]"
          >
            {TOOLS.map((t) => (
              <Link
                key={t.href}
                href={t.href}
                role="menuitem"
                onClick={() => setOpen(false)}
                className="flex min-h-[44px] items-center justify-between gap-3 px-4 py-2.5 transition-colors hover:bg-white/[0.05]"
              >
                <span>
                  <span className="block text-[13.5px] font-semibold text-[#F5F5F3]">
                    {t.label}
                  </span>
                  <span className="block text-[12px] text-white/45">{t.blurb}</span>
                </span>
                {t.price && (
                  <span className="shrink-0 rounded-full border border-white/[0.12] px-2 py-0.5 text-[11px] font-semibold tabular-nums text-[#D7FF3F]">
                    {t.price}
                  </span>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function VilishNav() {
  const pathname = usePathname();
  const [mobileTools, setMobileTools] = useState(false);
  // Mobile: solid background — sticky + backdrop-blur forces a full-page
  // re-composite on every scroll frame on phone GPUs. Desktop keeps glass.
  return (
    <header className="sticky top-0 z-40 border-b border-white/[0.08] bg-[#080808] sm:bg-[#080808]/95 sm:backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" aria-label="Pixaura — home">
          <Wordmark size={22} />
        </Link>
        <nav aria-label="Primary" className="hidden items-center gap-6 sm:flex">
          <ToolsDropdown />
          {FLAT_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "inline-flex min-h-[44px] items-center text-[13px] font-medium transition-colors",
                pathname === l.href ? "text-[#F5F5F3]" : "text-white/55 hover:text-white/90",
              )}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <Link
          href="/create"
          className="v-iris-bg inline-flex min-h-[40px] items-center rounded-[10px] px-4 py-2 text-[13px] font-semibold text-[#080808] transition-opacity hover:opacity-95"
        >
          Create
        </Link>
      </div>
      {/* mobile links */}
      <div className="sm:hidden">
        <nav
          aria-label="Primary mobile"
          className="flex items-center gap-5 overflow-x-auto px-4 pb-2.5"
        >
          <button
            type="button"
            aria-expanded={mobileTools}
            aria-haspopup="true"
            onClick={() => setMobileTools((o) => !o)}
            className={cn(
              "inline-flex min-h-[44px] shrink-0 items-center gap-1 text-[13px] font-medium transition-colors",
              mobileTools ? "text-[#F5F5F3]" : "text-white/55",
            )}
          >
            Tools
            <ChevronDown
              className={cn("h-3.5 w-3.5 transition-transform", mobileTools && "rotate-180")}
              strokeWidth={2.2}
            />
          </button>
          {FLAT_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "inline-flex min-h-[44px] shrink-0 items-center text-[13px] font-medium transition-colors",
                pathname === l.href ? "text-[#F5F5F3]" : "text-white/55 hover:text-white/90",
              )}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        {mobileTools && (
          <nav aria-label="Tools mobile" className="border-t border-white/[0.06] px-4 pb-3 pt-1">
            {TOOLS.map((t) => (
              <Link
                key={t.href}
                href={t.href}
                onClick={() => setMobileTools(false)}
                className="flex min-h-[44px] items-center justify-between gap-3 border-b border-white/[0.04] py-2 last:border-0"
              >
                <span>
                  <span className="block text-[14px] font-semibold text-[#F5F5F3]">
                    {t.label}
                  </span>
                  <span className="block text-[12px] text-white/45">{t.blurb}</span>
                </span>
                {t.price && (
                  <span className="shrink-0 rounded-full border border-white/[0.12] px-2 py-0.5 text-[11px] font-semibold tabular-nums text-[#D7FF3F]">
                    {t.price}
                  </span>
                )}
              </Link>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
}
