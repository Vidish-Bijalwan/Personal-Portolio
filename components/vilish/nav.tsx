"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
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
  { href: "/#tools", label: "Tools" },
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
          {LINKS.map((l) => {
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
            {LINKS.map((l) => (
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
