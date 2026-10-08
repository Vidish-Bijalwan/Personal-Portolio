import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check, ShieldCheck } from "lucide-react";
import VilishNav from "@/components/vilish/nav";
import VilishFooter from "@/components/vilish/footer";
import SectionHeader from "@/components/vilish/section-header";
import Reveal from "@/components/motion/Reveal";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import { cn } from "@/lib/utils";
import {
  TOOL_DIRECTORY,
  toolsByGroup,
  type ToolEntry,
  type ToolGroup,
} from "@/src/lib/tools/directory";
import { priceOf } from "@/lib/pricing/catalog";
import { formatINR } from "@/lib/vilish/types";

const SITE_BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://tryetch.online";

const TOOLS_DESCRIPTION =
  "The complete Etch tool directory: AI image generation, product photos, 5s video clips, and eight Video Studio utilities. Real tools, exact prices, no dead buttons.";

export const metadata: Metadata = {
  title: "Tools — every working tool | Etch",
  description: TOOLS_DESCRIPTION,
  alternates: { canonical: "/tools" },
  openGraph: {
    title: "Tools — every working tool | Etch",
    description: TOOLS_DESCRIPTION,
    url: `${SITE_BASE}/tools`,
    siteName: "Etch",
    type: "website",
    images: [
      {
        url: `${SITE_BASE}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "Etch — one creation, one price. AI images and video tools with no subscription.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Tools — every working tool | Etch",
    description: TOOLS_DESCRIPTION,
    images: [`${SITE_BASE}/og-image.png`],
  },
};

const GROUPS: { id: ToolGroup; kicker: string; title: string; subtitle: string }[] = [
  {
    id: "create",
    kicker: "Create",
    title: "Make something new.",
    subtitle:
      "AI generation, priced per creation. Describe it, see the exact price before you pay, download the finished file.",
  },
  {
    id: "video-studio",
    kicker: "Video Studio",
    title: "Finish your footage.",
    subtitle: `Upload a video and give it a studio finish — jobs from ${formatINR(priceOf("tool-basic"))}, one UPI payment.`,
  },
];

function ToolCard({ tool }: { tool: ToolEntry }) {
  const Icon = tool.icon;
  const isAI = tool.badge === "AI";
  return (
    <StaggerItem className="h-full">
      <Link
        href={tool.href}
        aria-label={`Open ${tool.name} — ${tool.price}`}
        className="group flex h-full min-h-[44px] flex-col rounded-[16px] border p-5 transition-colors hover:border-[var(--pro-accent)]"
        style={{
          background: "var(--pro-bg-elev)",
          borderColor: "var(--pro-border)",
        }}
      >
        <span className="flex items-start justify-between gap-3">
          <span
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[12px] border"
            style={{
              borderColor: "var(--pro-border)",
              background: "var(--pro-bg-sunken)",
              color: "var(--pro-accent)",
            }}
          >
            <Icon className="h-5 w-5" strokeWidth={1.8} />
          </span>
          <span className="flex flex-col items-end gap-1.5">
            <span
              className="shrink-0 rounded-full border px-2.5 py-0.5 text-[12px] font-semibold tabular-nums"
              style={{
                borderColor: "var(--pro-border)",
                color: "var(--pro-fg)",
              }}
            >
              {tool.price}
            </span>
            <span
              className={cn(
                "shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.08em]",
              )}
              style={{
                borderColor: isAI
                  ? "color-mix(in srgb, var(--pro-accent) 45%, transparent)"
                  : "var(--pro-border)",
                color: isAI ? "var(--pro-accent)" : "var(--pro-muted)",
              }}
            >
              {isAI ? "AI" : "Real processing"}
            </span>
          </span>
        </span>
        <span
          className="pro-display mt-4 text-[17px] font-semibold"
          style={{ color: "var(--pro-fg)" }}
        >
          {tool.name}
        </span>
        <span className="mt-1 text-[13px] leading-6" style={{ color: "var(--pro-muted)" }}>
          {tool.tagline}
        </span>
        <span
          className="mt-3 flex flex-1 items-start gap-2 border-t pt-3 text-[13px] leading-6"
          style={{ borderColor: "var(--pro-border-soft)", color: "var(--pro-fg)" }}
        >
          <Check
            className="mt-1 h-4 w-4 shrink-0"
            strokeWidth={2.5}
            style={{ color: "var(--pro-accent)" }}
          />
          <span>
            <span className="font-semibold">You get: </span>
            {tool.delivers}
          </span>
        </span>
        <span
          className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-semibold"
          style={{ color: "var(--pro-accent)" }}
        >
          Open tool{" "}
          <ArrowRight
            className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
            strokeWidth={2}
          />
        </span>
      </Link>
    </StaggerItem>
  );
}

export default function ToolsPage() {
  return (
    <div className="pro-body min-h-screen antialiased" style={{ background: "var(--pro-bg)" }}>
      <VilishNav />
      <main>
        <div className="mx-auto max-w-5xl px-4 pb-24 pt-10 sm:pt-16">
          <SectionHeader
            kicker="Tool directory"
            title={
              <>
                Every tool that <span style={{ color: "var(--pro-accent)" }}>actually works.</span>
              </>
            }
            subtitle="Twelve live tools. Real prices, no dead buttons, no coming-soon cards. Pick one and start — the price you see is the price you pay."
          />

          {GROUPS.map((group) => (
            <section key={group.id} aria-label={group.kicker} className="mt-16">
              <Reveal>
                <p
                  className="text-[11px] font-semibold uppercase tracking-[0.3em]"
                  style={{ color: "var(--pro-faint)" }}
                >
                  {group.kicker}
                </p>
                <h2
                  className="pro-display mt-3 text-[24px] font-semibold tracking-[-0.01em] sm:text-[30px]"
                  style={{ color: "var(--pro-fg)" }}
                >
                  {group.title}
                </h2>
                <p
                  className="mt-2 max-w-lg text-[14px] leading-6"
                  style={{ color: "var(--pro-muted)" }}
                >
                  {group.subtitle}
                </p>
              </Reveal>
              <Stagger className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {toolsByGroup(group.id).map((tool) => (
                  <ToolCard key={tool.id} tool={tool} />
                ))}
              </Stagger>
            </section>
          ))}

          <Reveal delay={0.1} className="mt-16">
            <p
              className="flex items-start gap-3 rounded-[16px] border border-dashed px-5 py-4 text-[13.5px] leading-6"
              style={{
                borderColor: "var(--pro-border)",
                background: "var(--pro-bg-elev)",
                color: "var(--pro-muted)",
              }}
            >
              <ShieldCheck
                className="mt-0.5 h-5 w-5 shrink-0"
                strokeWidth={1.8}
                style={{ color: "var(--pro-accent)" }}
              />
              <span>
                Everything on this page is live right now. If a tool ever breaks,
                it leaves this page until it&apos;s fixed — a tool you can&apos;t
                use is worse than a tool that doesn&apos;t exist.
              </span>
            </p>
          </Reveal>

          <Reveal delay={0.15} className="mt-12 text-center">
            <Link href="/create" className="pro-btn-primary inline-flex min-h-[44px] items-center gap-2 px-8 py-3.5 text-[15px] font-semibold">
              Start creating <ArrowRight className="h-4 w-4" strokeWidth={2.2} />
            </Link>
            <p className="mt-4">
              <Link
                href="/pricing"
                className="text-[13px] font-medium underline underline-offset-4"
                style={{ color: "var(--pro-muted)" }}
              >
                How pricing works
              </Link>
            </p>
          </Reveal>
        </div>
      </main>
      <VilishFooter />
    </div>
  );
}
