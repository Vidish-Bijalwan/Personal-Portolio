"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/create", label: "Create" },
  { href: "/examples", label: "Examples" },
  { href: "/pricing", label: "Pricing" },
  { href: "/about", label: "About" },
];

export default function VilishNav() {
  const pathname = usePathname();
  return (
    <header className="sticky top-0 z-40 border-b border-white/[0.08] bg-[#080808]/95 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="text-[15px] font-bold tracking-[0.22em] text-[#F5F5F3]">
          VILISH
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
          className="v-iris-bg rounded-[10px] px-4 py-2 text-[13px] font-semibold text-white transition-opacity hover:opacity-95"
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
