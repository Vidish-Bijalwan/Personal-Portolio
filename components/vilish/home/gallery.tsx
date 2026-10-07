"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
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
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {items.map((item, i) => (
          <Reveal key={item.src} delay={(i % 4) * 60}>
            <button
              type="button"
              onClick={() => setOpenIndex(i)}
              aria-label={`View: ${item.alt}. Price ${item.price}.`}
              className="group relative block w-full overflow-hidden rounded-[14px] border text-left transition-transform duration-200 hover:-translate-y-0.5"
              style={{
                borderColor: "var(--pro-border-soft)",
                background: "var(--pro-bg-elev)",
                aspectRatio: "4 / 5",
              }}
            >
              <Image
                src={item.thumb}
                alt={item.alt}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className="object-cover"
                loading="lazy"
              />
              <span
                className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 px-3.5 py-3"
                style={{
                  background:
                    "linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.72) 100%)",
                }}
              >
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
            </button>
          </Reveal>
        ))}
      </div>

      <PromptDialog item={active} onClose={() => setOpenIndex(null)} />
    </>
  );
}
