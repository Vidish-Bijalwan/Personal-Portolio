"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import Wordmark from "./wordmark";
import {
  TOOL_DIRECTORY,
  toolsByGroup,
  type ToolEntry,
} from "@/src/lib/tools/directory";

/**
 * Tools mega-dropdown (TalkPix/VEED-inspired) — ONLY working tools.
 * Desktop: left intro panel + grouped columns (Create / Video Studio),
 * each row an icon + name + one-liner + catalog-derived price.
 * Mobile: tap-to-expand grouped list, 44px targets.
 */
const GROUP_META = [
  { id: "create" as const, label: "Create" },
  { id: "video-studio" as const, label: "Video Studio" },
];

/** Flat links that stay outside the dropdown. */
const FLAT_LINKS = [
  { href: "/trends", label: "Trends" },
  { href: "/examples", label: "Examples" },
  { href: "/pricing", label: "Pricing" },
  { href: "/blog", label: "Blog" },
  { href: "/about", label: "About" },
];

function ToolRow({ tool, onNavigate }: { tool: ToolEntry; onNavigate: () => void }) {
  const Icon = tool.icon;
  return (
    <Link
      href={tool.href}
      role="menuitem"
      onClick={onNavigate}
      className="flex min-h-[44px] items-center gap-3 rounded-[10px] px-3 py-2 transition-colors hover:bg-white/[0.05] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D7FF3F]"
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] border border-white/[0.08] bg-white/[0.03] text-[#D7FF3F]">
        <Icon className="h-4 w-4" strokeWidth={1.8} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[13.5px] font-semibold text-[#F5F5F3]">
          {tool.name}
        </span>
        <span className="block truncate text-[12px] text-white/45">{tool.tagline}</span>
      </span>
      <span className="shrink-0 rounded-full border border-white/[0.12] px-2 py-0.5 text-[11px] font-semibold tabular-nums text-[#D7FF3F]">
        {tool.price}
      </span>
    </Link>
  );
}

function ToolsMegaDropdown() {
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
  }, [open]);

  const active =
    pathname === "/create" ||
    pathname === "/video-studio" ||
    pathname === "/tools";

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
        <div className="absolute left-1/2 top-full z-50 w-[720px] -translate-x-1/2 pt-2">
          <div
            role="menu"
            aria-label="Tools"
            className="grid grid-cols-[220px_1fr] overflow-hidden rounded-[16px] border border-white/[0.1] bg-[#101012] shadow-[0_32px_80px_-12px_rgba(0,0,0,0.9)]"
          >
            {/* intro panel */}
            <div className="flex flex-col justify-between border-r border-white/[0.07] bg-white/[0.015] p-5">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/40">
                  {TOOL_DIRECTORY.length} tools
                </p>
                <p className="font-display mt-3 text-[18px] font-semibold leading-snug">
                  Everything in the studio, <span className="text-[#D7FF3F]">nothing dead.</span>
                </p>
                <p className="mt-2 text-[12.5px] leading-5 text-white/50">
                  Every tool on this menu is live right now — pick one and start.
                </p>
              </div>
              <Link
                href="/tools"
                onClick={() => setOpen(false)}
                className="mt-6 inline-flex min-h-[44px] items-center gap-1.5 text-[13px] font-semibold text-[#D7FF3F] transition-opacity hover:opacity-80"
              >
                Browse all tools <ArrowRight className="h-4 w-4" strokeWidth={2} />
              </Link>
            </div>
            {/* grouped columns */}
            <div className="grid grid-cols-2 gap-x-2 p-4">
              {GROUP_META.map((group) => (
                <div key={group.id}>
                  <p className="px-3 pb-1.5 pt-1 text-[10.5px] font-bold uppercase tracking-[0.18em] text-white/35">
                    {group.label}
                  </p>
                  <div className="space-y-0.5">
                    {toolsByGroup(group.id).map((tool) => (
                      <ToolRow key={tool.id} tool={tool} onNavigate={() => setOpen(false)} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
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
      {/* brand hairline */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[#D7FF3F]/40 via-[#00F0FF]/25 to-transparent"
      />
      <div className="mx-auto flex h-16 min-h-[64px] max-w-6xl items-center justify-between px-4 sm:h-[72px] sm:px-6">
        <Link
          href="/"
          aria-label="Etch — home"
          className="group relative shrink-0 outline-none"
        >
          <span
            aria-hidden
            className="absolute -inset-1.5 rounded-2xl bg-gradient-to-r from-[#D7FF3F]/0 via-[#D7FF3F]/[0.12] to-[#00F0FF]/[0.12] opacity-0 blur-lg transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100 motion-reduce:transition-none"
          />
          <span className="relative flex items-center rounded-2xl border border-white/[0.12] bg-gradient-to-b from-white/[0.06] to-white/[0.015] px-3.5 py-2 shadow-[0_0_24px_-8px_rgba(215,255,63,0.35)] transition-colors duration-300 group-hover:border-[#D7FF3F]/40 motion-reduce:transition-none">
            <Wordmark size={26} />
          </span>
        </Link>
        <nav aria-label="Primary" className="hidden items-center gap-5 sm:flex lg:gap-6">
          <ToolsMegaDropdown />
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
          className="v-iris-bg inline-flex min-h-[44px] items-center rounded-[12px] px-5 py-2.5 text-[14px] font-semibold text-[#080808] shadow-[0_10px_32px_-12px_rgba(215,255,63,0.6)] transition-all hover:shadow-[0_10px_40px_-8px_rgba(215,255,63,0.75)]"
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
          <nav aria-label="Tools mobile" className="border-t border-white/[0.06] px-4 pb-4 pt-2">
            {GROUP_META.map((group) => (
              <div key={group.id} className="mt-1">
                <p className="px-1 pb-1 pt-2 text-[10.5px] font-bold uppercase tracking-[0.18em] text-white/35">
                  {group.label}
                </p>
                {toolsByGroup(group.id).map((tool) => {
                  const Icon = tool.icon;
                  return (
                    <Link
                      key={tool.id}
                      href={tool.href}
                      onClick={() => setMobileTools(false)}
                      className="flex min-h-[44px] items-center gap-3 border-b border-white/[0.04] py-2 last:border-0"
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] border border-white/[0.08] bg-white/[0.03] text-[#D7FF3F]">
                        <Icon className="h-4 w-4" strokeWidth={1.8} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-[14px] font-semibold text-[#F5F5F3]">
                          {tool.name}
                        </span>
                        <span className="block truncate text-[12px] text-white/45">
                          {tool.tagline}
                        </span>
                      </span>
                      <span className="shrink-0 rounded-full border border-white/[0.12] px-2 py-0.5 text-[11px] font-semibold tabular-nums text-[#D7FF3F]">
                        {tool.price}
                      </span>
                    </Link>
                  );
                })}
              </div>
            ))}
            <Link
              href="/tools"
              onClick={() => setMobileTools(false)}
              className="mt-2 inline-flex min-h-[44px] items-center gap-1.5 px-1 text-[13px] font-semibold text-[#D7FF3F]"
            >
              Browse all tools <ArrowRight className="h-4 w-4" strokeWidth={2} />
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}
