import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import Reveal from "@/components/motion/Reveal";

interface SectionHeaderProps {
  /** Small uppercase kicker above the title. */
  kicker: string;
  /** Title — may include accent spans. */
  title: ReactNode;
  /** Optional supporting line. */
  subtitle?: ReactNode;
  /** Left (default) or centered. */
  align?: "left" | "center";
  /** md = section titles (26/34px), lg = hero-scale closers (36/56px). */
  size?: "md" | "lg";
  /** Extra classes on the title (e.g. max-w for line-break control). */
  titleClassName?: string;
  className?: string;
}

/**
 * The one section-header rhythm for the whole site: kicker → title →
 * subtitle. Every page section uses this so the site reads as one product,
 * not a stack of separate components.
 */
export default function SectionHeader({
  kicker,
  title,
  subtitle,
  align = "left",
  size = "md",
  titleClassName,
  className,
}: SectionHeaderProps) {
  const centered = align === "center";
  return (
    <div className={cn(centered && "text-center", className)}>
      <Reveal>
        <p
          className={cn(
            "text-[11px] font-semibold uppercase tracking-[0.3em] text-white/45",
            centered && "tracking-[0.22em]",
          )}
        >
          {kicker}
        </p>
        <h2
          className={cn(
            "font-display mt-3 font-semibold tracking-[-0.01em]",
            size === "md" ? "text-[26px] sm:text-[34px]" : "mt-5 text-[36px] leading-[1.06] tracking-[-0.02em] sm:text-[56px]",
            centered && size === "md" && "mx-auto max-w-[24ch]",
            titleClassName,
          )}
        >
          {title}
        </h2>
      </Reveal>
      {subtitle ? (
        <Reveal delay={0.06}>
          <p
            className={cn(
              "mt-3 text-[14px] leading-6 text-white/50",
              centered ? "mx-auto max-w-xl" : "max-w-lg",
              size === "lg" && "text-[15px] leading-7 text-white/[0.60]",
            )}
          >
            {subtitle}
          </p>
        </Reveal>
      ) : null}
    </div>
  );
}
