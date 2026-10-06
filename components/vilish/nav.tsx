"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import Wordmark from "./wordmark";

const LINKS = [
  { href: "/create", label: "Create" },
  { href: "/video-studio", label: "Video Studio" },
  { href: "/examples", label: "Examples" },
  { href: "/pricing", label: "Pricing" },
  { href: "/blog", label: "Blog" },
  { href: "/trends", label: "Trends" },
  { href: "/about", label: "About" },
];

export default function VilishNav() {
  const pathname = usePathname();
  // Mobile: solid background — sticky + backdrop-blur forces a full-page
  // re-composite on every scroll frame on phone GPUs. Desktop keeps glass.
  return (
    <header className="sticky top-0 z-40 border-b border-white/[0.08] bg-[#080808] sm:bg-[#080808]/95 sm:backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" aria-label="Pixaura — home">
          <Wordmark size={22} />
        </Link>
        <nav aria-label="Primary" className="hidden items-center gap-6 sm:flex">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "text-[13px] font-medium transition-colors",
                pathname === l.href ? "text-[#F5F5F3]" : "text-white/55 hover:text-white/90",
              )}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <Link
          href="/create"
          className="v-iris-bg rounded-[10px] px-4 py-2 text-[13px] font-semibold text-[#080808] transition-opacity hover:opacity-95"
        >
          Create
        </Link>
      </div>
      {/* mobile links */}
      <nav aria-label="Primary mobile" className="flex items-center gap-5 overflow-x-auto px-4 pb-2.5 sm:hidden">
        {LINKS.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={cn(
              "shrink-0 text-[13px] font-medium transition-colors",
              pathname === l.href ? "text-[#F5F5F3]" : "text-white/55 hover:text-white/90",
            )}
          >
            {l.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
