import Link from "next/link";
import { ArrowRight, Home } from "lucide-react";
import VilishNav from "@/components/vilish/nav";
import VilishFooter from "@/components/vilish/footer";
import NotFoundSearch from "./not-found-search";
import { buildSearchIndex } from "@/src/lib/not-found-search";

const LINKS = [
  { href: "/create", label: "Start creating", desc: "Describe it, see the price, pay per piece." },
  { href: "/pricing", label: "Pricing", desc: "One creation, one price — no subscription." },
  { href: "/blog", label: "Blog", desc: "Guides on AI creation and pay-per-creation." },
  { href: "/tools", label: "All tools", desc: "Every working tool in one place." },
];

export const metadata = {
  title: "Page not found | Etch",
  description: "This page doesn't exist — but your next creation does. Head back to Etch.",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  const searchIndex = buildSearchIndex();
  return (
    <div className="flex min-h-screen flex-col bg-[#080808] font-sans text-[#F5F5F3] antialiased">
      <VilishNav />
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center px-4 py-20 text-center">
        <p className="font-display pro-accent-text text-[72px] font-bold leading-none sm:text-[96px]">
          404
        </p>
        <h1 className="font-display mt-4 text-[26px] font-semibold tracking-[-0.01em] sm:text-[32px]">
          This page got lost in the studio
        </h1>
        <p className="mt-3 max-w-md text-[15px] leading-7 text-white/[0.58]">
          The link you followed doesn&apos;t exist. Your next creation is one
          click away, though.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex min-h-[44px] items-center gap-2 rounded-[12px] bg-[var(--pro-btn)] px-7 py-3 text-[15px] font-semibold text-[var(--pro-btn-ink)] hover:opacity-95"
        >
          <Home className="h-4 w-4" strokeWidth={2.2} /> Back home
        </Link>
        <NotFoundSearch index={searchIndex} />
        <div className="mt-8 grid w-full gap-3 text-left sm:grid-cols-2">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="group rounded-[16px] border border-white/[0.08] bg-[#121214] p-5 transition-colors hover:border-white/25"
            >
              <span className="flex items-center justify-between text-[15px] font-semibold">
                {l.label}
                <ArrowRight className="h-4 w-4 text-white/40 transition-transform group-hover:translate-x-1 group-hover:text-white/80" />
              </span>
              <span className="mt-1 block text-[13px] text-white/[0.5]">{l.desc}</span>
            </Link>
          ))}
        </div>
      </main>
      <VilishFooter />
    </div>
  );
}
