import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import VilishNav from "@/components/vilish/nav";
import VilishFooter from "@/components/vilish/footer";
import {
  TEMPLATES,
  TRENDS_UPDATED,
  TREND_THEMES,
  templateHref,
  templateInputsLabel,
  templatePricePaise,
  type TrendTheme,
} from "@/src/lib/trends/templates";
import { formatINR } from "@/src/lib/vilish/types";
import { cn } from "@/lib/utils";

const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://vidish.me";

export const metadata: Metadata = {
  title: "Trend Templates — Ready-Made AI Creations | Pixaura",
  description:
    "Curated AI trend templates with exact Indian pricing: pick a scene, add your photo, pay per creation. No subscription, no credits.",
  alternates: { canonical: `${base}/trends` },
  openGraph: {
    title: "Trend Templates — Ready-Made AI Creations | Pixaura",
    description:
      "Pick a scene, add your photo, pay the exact price. Curated templates over Pixaura's real services.",
    url: `${base}/trends`,
    siteName: "Pixaura",
    type: "website",
  },
};

function formatUpdated(iso: string): string {
  return new Date(iso + "T00:00:00").toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

const BADGE_STYLES: Record<string, string> = {
  New: "border-[#00F0FF]/40 bg-[#00F0FF]/[0.08] text-[#00F0FF]",
  Popular: "border-[#D7FF3F]/40 bg-[#D7FF3F]/[0.08] text-[#D7FF3F]",
  "Staff pick": "border-[#FF2D78]/40 bg-[#FF2D78]/[0.08] text-[#FF2D78]",
};

export default async function TrendsPage({
  searchParams,
}: {
  searchParams: Promise<{ theme?: string }>;
}) {
  const sp = await searchParams;
  const active: TrendTheme | "All" = (TREND_THEMES as readonly string[]).includes(
    sp?.theme ?? ""
  )
    ? (sp.theme as TrendTheme)
    : "All";

  const list = [...TEMPLATES]
    .sort((a, b) => b.addedOn.localeCompare(a.addedOn))
    .filter((t) => active === "All" || t.theme === active);

  return (
    <>
      <VilishNav />
      <main className="relative mx-auto max-w-6xl px-4 pb-24 pt-28 sm:px-6 sm:pt-32">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#00F0FF]">
          Pixaura Trends
        </p>
        <h1 className="font-display mt-3 max-w-[22ch] text-[32px] font-semibold leading-tight tracking-[-0.02em] text-[#F5F5F3] sm:text-[44px]">
          Trend templates,{" "}
          <span className="text-[#D7FF3F]">priced exactly</span>
        </h1>
        <p className="mt-4 max-w-[62ch] text-[15.5px] leading-7 text-white/60">
          Each template is a curated starting brief for Pixaura&apos;s real
          image and video services — not a separate AI model. Pick a scene,
          add your photo, and the composer opens with everything filled in.
          The price shown is the exact catalog price you&apos;ll pay: no
          credits, no surprises.
        </p>
        <p className="mt-3 text-[12.5px] text-white/40">
          Updated {formatUpdated(TRENDS_UPDATED)} · {TEMPLATES.length} templates
        </p>

        {/* theme filter — server-rendered links, horizontal scroll on mobile */}
        <div
          className="-mx-4 mt-7 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0"
          aria-label="Filter by theme"
        >
          {(["All", ...TREND_THEMES] as const).map((theme) => {
            const isActive = active === theme;
            return (
              <Link
                key={theme}
                href={theme === "All" ? "/trends" : `/trends?theme=${theme}`}
                aria-current={isActive ? "true" : undefined}
                className={cn(
                  "min-h-[44px] shrink-0 whitespace-nowrap rounded-full border px-4 py-2 text-[13px] font-medium transition-colors",
                  isActive
                    ? "border-[#D7FF3F]/60 bg-[#D7FF3F]/[0.1] text-[#F5F5F3]"
                    : "border-white/[0.1] bg-white/[0.03] text-white/60 hover:border-white/25 hover:text-white/90"
                )}
              >
                {theme}
              </Link>
            );
          })}
        </div>

        {/* template cards */}
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((t) => (
            <article
              key={t.id}
              className="flex flex-col rounded-[16px] border border-white/[0.08] bg-white/[0.02] p-5 transition-colors hover:border-white/[0.16]"
            >
              <div className="flex items-center gap-2">
                <span className="rounded-full border border-white/[0.1] bg-white/[0.04] px-2.5 py-1 text-[11px] font-medium text-white/55">
                  {t.theme}
                </span>
                {t.badge && (
                  <span
                    className={cn(
                      "rounded-full border px-2.5 py-1 text-[11px] font-semibold",
                      BADGE_STYLES[t.badge]
                    )}
                  >
                    {t.badge}
                  </span>
                )}
              </div>
              <h2 className="font-display mt-3 text-[19px] font-semibold tracking-[-0.01em] text-[#F5F5F3]">
                {t.name}
              </h2>
              <p className="mt-1.5 text-[13.5px] leading-6 text-white/55">
                {t.description}
              </p>
              <div className="mt-4 flex items-center justify-between gap-3 border-t border-white/[0.06] pt-4">
                <div>
                  <p className="text-[12px] text-white/40">
                    {templateInputsLabel(t)}
                  </p>
                  <p className="mt-0.5 text-[16px] font-semibold text-[#F5F5F3] tabular-nums">
                    {formatINR(templatePricePaise(t))}
                  </p>
                </div>
                <Link
                  href={templateHref(t)}
                  className="flex min-h-[44px] shrink-0 items-center gap-1.5 rounded-[10px] bg-[#D7FF3F] px-4 py-2.5 text-[13.5px] font-semibold text-[#080808] transition-opacity hover:opacity-90"
                >
                  Use this template
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </article>
          ))}
        </div>

        {list.length === 0 && (
          <p className="mt-12 text-center text-[14px] text-white/50">
            No templates in this theme yet — new ones land as trends appear.
          </p>
        )}

        <p className="mx-auto mt-12 max-w-[62ch] text-center text-[13.5px] leading-6 text-white/40">
          Templates are starting briefs, not finished work: every order is
          reviewed by a human and made to order.{" "}
          <Link href="/pricing" className="text-[#00F0FF] hover:text-[#D7FF3F]">
            See all prices
          </Link>{" "}
          or{" "}
          <Link href="/create" className="text-[#00F0FF] hover:text-[#D7FF3F]">
            start from scratch
          </Link>
          .
        </p>
      </main>
      <VilishFooter />
    </>
  );
}
