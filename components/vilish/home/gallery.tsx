"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { RefreshCw } from "lucide-react";
import { Reveal } from "./reveal";
import { PromptDialog } from "./prompt-dialog";

export interface GalleryItem {
  src: string;
  thumb: string;
  prompt: string;
  alt: string;
  price: string;
  href: string;
  badge: string;
  /** Story-first: the client scenario — who needed it and why. */
  scenario?: string;
  /** Story-first: what was created on Etch for that scenario. */
  deliverable?: string;
}

/**
 * Real-output gallery. Grid of actual generated examples with honest
 * catalog-derived prices; click opens a quiet detail dialog.
 */
export function Gallery({ items }: { items: GalleryItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const active = openIndex !== null ? items[openIndex] : null;

  return (
    <>
      {/* Mobile: a vertical swipeable feed (snap) instead of the 2-col grid —
          one full-width card per snap stop, Recreate always visible. */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4 max-sm:max-h-[78vh] max-sm:grid-cols-1 max-sm:gap-4 max-sm:overflow-y-auto max-sm:overscroll-contain max-sm:snap-y max-sm:snap-proximity max-sm:pb-2">
        {items.map((item, i) => (
          <Reveal key={item.src} delay={(i % 4) * 60} className="max-sm:snap-start">
            <div className="relative">
              <button
                type="button"
                onClick={() => setOpenIndex(i)}
                aria-label={`View: ${item.alt}. Price ${item.price}.`}
                className="group relative block aspect-[4/3] w-full overflow-hidden rounded-[14px] border text-left transition-transform duration-200 hover:-translate-y-0.5 sm:aspect-[4/5]"
                style={{
                  borderColor: "var(--pro-border-soft)",
                  background: "var(--pro-bg-elev)",
                }}
              >
                <Image
                  src={item.thumb}
                  alt={item.alt}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 33vw, 25vw"
                  className="object-cover"
                  loading="lazy"
                />
                <span
                  className="absolute inset-x-0 bottom-0 flex flex-col gap-1.5 px-3.5 pb-3 pt-8"
                  style={{
                    background:
                      "linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.78) 100%)",
                  }}
                >
                  {item.scenario && (
                    <span className="pro-body line-clamp-2 text-[11.5px] leading-4 text-white/[0.75]">
                      {item.scenario}
                    </span>
                  )}
                  <span className="flex items-center justify-between gap-2">
                    <span className="pro-body truncate text-[12.5px] font-semibold text-white">
                      {item.badge}
                    </span>
                    <span
                      className="pro-body shrink-0 rounded-full px-2.5 py-1 text-[12px] font-bold tabular-nums"
                      style={{ background: "rgba(255,255,255,0.94)", color: "#0e1526" }}
                    >
                      {item.price}
                    </span>
                  </span>
                </span>
              </button>
              {/* One-tap Recreate: opens /create with this exact prompt
                  pre-filled (item.href is the recreate deep link). Sibling
                  of the dialog button — never nested inside it. */}
              <Link
                href={item.href}
                aria-label={`Recreate: ${item.alt}`}
                className="pro-dark-zone absolute right-3 top-3 inline-flex min-h-[40px] items-center gap-1.5 rounded-full border border-white/[0.14] bg-black/70 px-3.5 text-[12.5px] font-bold text-[#F5F5F3] backdrop-blur-sm transition-transform hover:scale-[1.04] active:scale-[0.97]"
              >
                <RefreshCw className="h-3.5 w-3.5" strokeWidth={2.4} aria-hidden />
                Recreate
              </Link>
            </div>
          </Reveal>
        ))}
      </div>

      <PromptDialog item={active} onClose={() => setOpenIndex(null)} />
    </>
  );
}
