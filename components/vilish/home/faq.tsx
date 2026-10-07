"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Reveal } from "./reveal";

export interface FaqItem {
  q: string;
  a: string;
}

/** Accessible accordion FAQ. One open at a time; keyboard friendly. */
export function Faq({ items }: { items: FaqItem[] }) {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div
      className="overflow-hidden rounded-[16px] border"
      style={{ borderColor: "var(--pro-border-soft)", background: "var(--pro-bg)" }}
    >
      {items.map((item, i) => {
        const isOpen = open === i;
        return (
          <div
            key={item.q}
            className={cn(i > 0 && "border-t")}
            style={i > 0 ? { borderColor: "var(--pro-border-soft)" } : undefined}
          >
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : i)}
              aria-expanded={isOpen}
              aria-controls={`faq-panel-${i}`}
              id={`faq-button-${i}`}
              className="pro-body flex min-h-[64px] w-full items-center justify-between gap-4 px-5 py-4 text-left sm:px-7"
            >
              <span
                className="text-[15.5px] font-semibold"
                style={{ color: "var(--pro-fg)" }}
              >
                {item.q}
              </span>
              <ChevronDown
                className={cn(
                  "h-5 w-5 shrink-0 transition-transform duration-200",
                  isOpen && "rotate-180",
                )}
                style={{ color: "var(--pro-faint)" }}
                aria-hidden
              />
            </button>
            <div
              id={`faq-panel-${i}`}
              role="region"
              aria-labelledby={`faq-button-${i}`}
              hidden={!isOpen}
            >
              <p
                className="pro-body px-5 pb-6 text-[15px] leading-[1.7] sm:px-7"
                style={{ color: "var(--pro-muted)" }}
              >
                {item.a}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function FaqSection({ items }: { items: FaqItem[] }) {
  return (
    <section id="faq" className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
      <Reveal>
        <p className="pro-eyebrow">FAQ</p>
        <h2
          className="pro-display mt-4 max-w-[22ch] text-[32px] font-bold leading-[1.12] sm:text-[44px]"
          style={{ color: "var(--pro-fg)" }}
        >
          Questions, answered
        </h2>
      </Reveal>
      <Reveal className="mt-12" delay={80}>
        <Faq items={items} />
      </Reveal>
    </section>
  );
}
