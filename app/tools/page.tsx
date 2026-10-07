import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";
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

export const metadata: Metadata = {
  title: "Tools — every working tool | Etch",
  description:
    "The complete Etch tool directory: AI image generation, product photos, 5s video clips, and eight Video Studio utilities. Real tools, exact prices, no dead buttons.",
  alternates: { canonical: "/tools" },
};

const GROUPS: { id: ToolGroup; kicker: string; title: string; subtitle: string }[] = [
  {
    id: "create",
    kicker: "Create",
    title: "Make something new.",
    subtitle: "AI generation, priced per creation. Describe it, see the exact price, pay once.",
  },
  {
    id: "video-studio",
    kicker: "Video Studio",
    title: "Finish your footage.",
    subtitle: `Upload a video and give it a studio finish — every job is ${formatINR(priceOf("video-studio"))}, one UPI payment.`,
  },
];

function ToolCard({ tool }: { tool: ToolEntry }) {
  const Icon = tool.icon;
  return (
    <StaggerItem className="h-full">
      <Link
        href={tool.href}
        aria-label={`Open ${tool.name} — ${tool.price}`}
        className="group flex h-full min-h-[44px] flex-col rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5 transition-all hover:border-[var(--pro-accent)]/35 hover:bg-white/[0.035] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--pro-accent)]"
      >
        <span className="flex items-start justify-between gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/[0.1] bg-white/[0.04] text-[var(--pro-accent)] transition-colors group-hover:border-[var(--pro-accent)]/40">
            <Icon className="h-5 w-5" strokeWidth={1.8} />
          </span>
          <span
            className={cn(
              "shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.08em]",
              tool.badge === "AI"
                ? "border-[var(--pro-accent)]/30 text-[var(--pro-accent)]"
                : "border-[var(--pro-accent)]/30 text-[var(--pro-accent)]",
            )}
          >
            {tool.badge === "AI" ? "AI" : "Real processing"}
          </span>
        </span>
        <span className="mt-4 flex items-baseline justify-between gap-2">
          <span className="text-[16px] font-semibold text-[#F5F5F3]">{tool.name}</span>
          <span className="shrink-0 rounded-full border border-white/[0.12] px-2.5 py-0.5 text-[12px] font-semibold tabular-nums text-[#F5F5F3]">
            {tool.price}
          </span>
        </span>
        <span className="mt-1.5 flex-1 text-[13px] leading-6 text-white/50">{tool.tagline}</span>
        <span className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-semibold text-[var(--pro-accent)]">
          Open tool <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" strokeWidth={2} />
        </span>
      </Link>
    </StaggerItem>
  );
}

export default function ToolsPage() {
  return (
    <div className="min-h-screen bg-[#080808] font-sans text-[#F5F5F3] antialiased">
      <VilishNav />
      <main>
        <div className="mx-auto max-w-5xl px-4 pb-24 pt-10 sm:pt-16">
          <SectionHeader
            kicker="Tool directory"
            title={
              <>
                Every tool that <span className="text-[var(--pro-accent)]">actually works.</span>
              </>
            }
            subtitle="Twelve live tools. Real prices, no dead buttons, no coming-soon cards. Pick one and start — the price you see is the price you pay."
          />

          {GROUPS.map((group) => (
            <section key={group.id} aria-label={group.kicker} className="mt-16">
              <Reveal>
                <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-white/45">
                  {group.kicker}
                </p>
                <h2 className="font-display mt-3 text-[24px] font-semibold tracking-[-0.01em] sm:text-[30px]">
                  {group.title}
                </h2>
                <p className="mt-2 max-w-lg text-[14px] leading-6 text-white/50">{group.subtitle}</p>
              </Reveal>
              <Stagger className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {toolsByGroup(group.id).map((tool) => (
                  <ToolCard key={tool.id} tool={tool} />
                ))}
              </Stagger>
            </section>
          ))}

          <Reveal delay={0.1} className="mt-16">
            <p className="flex items-start gap-3 rounded-2xl border border-dashed border-white/[0.12] bg-white/[0.015] px-5 py-4 text-[13.5px] leading-6 text-white/55">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[var(--pro-accent)]" strokeWidth={1.8} />
              <span>
                Everything on this page is live right now. If a tool ever breaks,
                it leaves this page until it&apos;s fixed — a tool you can&apos;t
                use is worse than a tool that doesn&apos;t exist.
              </span>
            </p>
          </Reveal>

          <Reveal delay={0.15} className="mt-12 text-center">
            <Link
              href="/create"
              className="pro-cta inline-flex min-h-[44px] items-center gap-2 rounded-[12px] px-8 py-3.5 text-[15px] font-semibold text-[var(--pro-btn-ink)] transition-opacity hover:opacity-95"
            >
              Start creating <ArrowRight className="h-4 w-4" strokeWidth={2.2} />
            </Link>
            <p className="mt-4">
              <Link
                href="/pricing"
                className="text-[13px] font-medium text-white/55 underline decoration-white/25 underline-offset-4 hover:text-white/85 hover:decoration-white/60"
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

// Keep the module's tool count honest in one place for future editors.
export const TOOL_COUNT = TOOL_DIRECTORY.length;
