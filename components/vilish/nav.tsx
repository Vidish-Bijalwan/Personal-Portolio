"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { TOOL_DIRECTORY, type ToolGroup } from "@/src/lib/tools/directory";
import AuthButton from "./auth-button";
import ProThemeToggle from "./pro-theme-toggle";

/**
 * Etch pro nav — classic professional grammar.
 * Thin sticky bar, hairline border, plain links, theme toggle,
 * auth control, one primary CTA. No mega-dropdowns, no neon.
 */

const LINKS = [
  { href: "/create", label: "Create" },
  { href: "/ads", label: "Ad Studio" },
  { href: "/posters", label: "Posters" },
  // Tools renders as a dropdown (see ToolsDropdown) — not a plain link.
  { href: "/examples", label: "Examples" },
  { href: "/pricing", label: "Pricing" },
  { href: "/about", label: "About" },
];

/** Restrained geometric Etch mark — an etched square. */
export function EtchMark({ size = 30 }: { size?: number }) {
  return (
    <span
      role="img"
      aria-label="Etch"
      className="inline-flex shrink-0 items-center justify-center rounded-[8px]"
      style={{
        width: size,
        height: size,
        background: "var(--pro-fg)",
      }}
    >
      <svg
        width={size * 0.56}
        height={size * 0.56}
        viewBox="0 0 16 16"
        fill="none"
        aria-hidden
      >
        <path
          d="M2 4.5h12M2 8h12M2 11.5h7"
          stroke="var(--pro-bg)"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
      </svg>
    </span>
  );
}

function Wordmark() {
  return (
    <Link
      href="/"
      className="flex items-center gap-2.5 rounded-[8px] focus-visible:outline-2 focus-visible:outline-offset-4"
      style={{ outlineColor: "var(--pro-accent)" }}
      aria-label="Etch — home"
    >
      <EtchMark />
      <span
        className="pro-display text-[21px] font-bold"
        style={{ color: "var(--pro-fg)" }}
      >
        Etch
      </span>
    </Link>
  );
}

/**
 * Tools dropdown — every working tool, grouped, with direct links.
 * Desktop: hover/click opens the panel. Mobile: rendered as an expandable
 * section in the mobile menu.
 */
function ToolsDropdown({ onNavigate }: { onNavigate?: () => void }) {
  const [open, setOpen] = useState(false);
  const groups: { label: string; group: ToolGroup }[] = [
    { label: "Create", group: "create" },
    { label: "Video Studio", group: "video-studio" },
  ];
  return (
    <div
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1 rounded-[8px] px-3.5 py-2 text-[14.5px] font-medium transition-colors"
        style={{ color: open ? "var(--pro-fg)" : "var(--pro-muted)" }}
      >
        Tools
        <ChevronDown
          className={cn("h-3.5 w-3.5 transition-transform", open && "rotate-180")}
        />
      </button>
      {open && (
        <div
          className="absolute left-1/2 top-full z-50 w-[560px] -translate-x-1/2 pt-2"
          role="menu"
          aria-label="All tools"
        >
          <div
            className="grid grid-cols-2 gap-x-2 overflow-hidden rounded-[16px] border p-3 shadow-xl"
            style={{
              background: "var(--pro-bg-elev)",
              borderColor: "var(--pro-border)",
              boxShadow: "var(--pro-card-shadow)",
            }}
          >
            {groups.map(({ label, group }) => (
              <div key={group}>
                <p
                  className="px-3 pb-1.5 pt-2 text-[11px] font-semibold uppercase tracking-[0.1em]"
                  style={{ color: "var(--pro-faint)" }}
                >
                  {label}
                </p>
                {TOOL_DIRECTORY.filter((t) => t.group === group).map((t) => (
                  <Link
                    key={t.id}
                    href={t.href}
                    role="menuitem"
                    onClick={() => {
                      setOpen(false);
                      onNavigate?.();
                    }}
                    className="flex items-center gap-3 rounded-[10px] px-3 py-2.5 transition-colors hover:bg-[var(--pro-bg-sunken)]"
                  >
                    <t.icon
                      className="h-[18px] w-[18px] shrink-0"
                      style={{ color: "var(--pro-accent)" }}
                    />
                    <span className="min-w-0 flex-1">
                      <span
                        className="block truncate text-[13.5px] font-medium"
                        style={{ color: "var(--pro-fg)" }}
                      >
                        {t.name}
                      </span>
                      <span
                        className="block truncate text-[12px]"
                        style={{ color: "var(--pro-muted)" }}
                      >
                        {t.tagline}
                      </span>
                    </span>
                    <span
                      className="shrink-0 text-[12px] font-semibold tabular-nums"
                      style={{ color: "var(--pro-fg)" }}
                    >
                      {t.price}
                    </span>
                  </Link>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Mobile tools list — every tool with a direct link, grouped.
 */
function MobileToolsSection({ onNavigate }: { onNavigate: () => void }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div>
      <button
        type="button"
        aria-expanded={expanded}
        onClick={() => setExpanded((e) => !e)}
        className="flex min-h-[48px] w-full items-center justify-between rounded-[8px] px-2 text-[16px] font-medium"
        style={{ color: "var(--pro-fg)" }}
      >
        Tools
        <ChevronDown
          className={cn("h-4 w-4 transition-transform", expanded && "rotate-180")}
          style={{ color: "var(--pro-muted)" }}
        />
      </button>
      {expanded && (
        <div className="pb-2 pl-2">
          {TOOL_DIRECTORY.map((t) => (
            <Link
              key={t.id}
              href={t.href}
              onClick={onNavigate}
              className="flex min-h-[44px] items-center gap-3 rounded-[8px] px-2"
            >
              <t.icon
                className="h-[16px] w-[16px] shrink-0"
                style={{ color: "var(--pro-accent)" }}
              />
              <span
                className="flex-1 text-[14.5px]"
                style={{ color: "var(--pro-fg)" }}
              >
                {t.name}
              </span>
              <span
                className="text-[13px] font-medium tabular-nums"
                style={{ color: "var(--pro-muted)" }}
              >
                {t.price}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default function VilishNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

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

  return (
    <header
      className="pro-body sticky top-0 z-[100]"
      style={{
        background: "color-mix(in srgb, var(--pro-bg) 82%, transparent)",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        borderBottom: "1px solid var(--pro-border-soft)",
      }}
    >
      <div className="mx-auto flex h-[68px] max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Wordmark />

        {/* desktop links */}
        <nav aria-label="Primary" className="hidden items-center gap-1 md:flex">
          {LINKS.slice(0, 2).map((l) => {
            const active =
              pathname === l.href || pathname.startsWith(l.href + "/");
            return (
              <Link
                key={l.href}
                href={l.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "rounded-[8px] px-3.5 py-2 text-[14.5px] font-medium transition-colors",
                )}
                style={{
                  color: active ? "var(--pro-fg)" : "var(--pro-muted)",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.color = "var(--pro-fg)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = active
                    ? "var(--pro-fg)"
                    : "var(--pro-muted)")
                }
              >
                {l.label}
              </Link>
            );
          })}
          <ToolsDropdown />
          {LINKS.slice(2).map((l) => {
            const active =
              pathname === l.href || pathname.startsWith(l.href + "/");
            return (
              <Link
                key={l.href}
                href={l.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "rounded-[8px] px-3.5 py-2 text-[14.5px] font-medium transition-colors",
                )}
                style={{
                  color: active ? "var(--pro-fg)" : "var(--pro-muted)",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.color = "var(--pro-fg)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = active
                    ? "var(--pro-fg)"
                    : "var(--pro-muted)")
                }
              >
                {l.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-2.5 md:flex">
          <ProThemeToggle />
          <AuthButton />
          <Link
            href="/create"
            className="pro-btn-primary"
            style={{ minHeight: 42, padding: "0 1.25rem", fontSize: 14 }}
          >
            Start creating
          </Link>
        </div>

        {/* mobile */}
        <div className="flex items-center gap-1.5 md:hidden">
          <ProThemeToggle />
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label={open ? "Close menu" : "Open menu"}
            className="inline-flex h-11 w-11 items-center justify-center rounded-[10px]"
            style={{ color: "var(--pro-fg)" }}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* mobile panel */}
      {open && (
        <div
          className="border-t md:hidden"
          style={{
            borderColor: "var(--pro-border-soft)",
            background: "var(--pro-bg)",
          }}
        >
          <nav aria-label="Mobile" className="mx-auto max-w-6xl px-4 py-3">
            {LINKS.slice(0, 2).map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="flex min-h-[48px] items-center rounded-[8px] px-2 text-[16px] font-medium"
                style={{ color: "var(--pro-fg)" }}
              >
                {l.label}
              </Link>
            ))}
            <MobileToolsSection onNavigate={() => setOpen(false)} />
            {LINKS.slice(2).map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="flex min-h-[48px] items-center rounded-[8px] px-2 text-[16px] font-medium"
                style={{ color: "var(--pro-fg)" }}
              >
                {l.label}
              </Link>
            ))}
            <div className="flex items-center gap-3 py-3">
              <AuthButton />
              <Link
                href="/create"
                onClick={() => setOpen(false)}
                className="pro-btn-primary flex-1"
                style={{ minHeight: 48 }}
              >
                Start creating
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
