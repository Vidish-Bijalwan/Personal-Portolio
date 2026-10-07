"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, X } from "lucide-react";
import { Reveal } from "./reveal";

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

  const close = useCallback(() => setOpenIndex(null), []);

  useEffect(() => {
    if (openIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [openIndex, close]);

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

      {active && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={active.alt}
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-8"
          style={{ background: "rgba(0,0,0,0.72)" }}
          onClick={close}
        >
          <div
            className="pro-body relative grid max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-[18px] md:grid-cols-[1.2fr_1fr]"
            style={{ background: "var(--pro-bg-elev)", border: "1px solid var(--pro-border)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={close}
              aria-label="Close"
              className="absolute right-3 top-3 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full"
              style={{ background: "rgba(0,0,0,0.55)", color: "#fff" }}
            >
              <X className="h-5 w-5" />
            </button>
            <div className="relative min-h-[280px] md:min-h-[480px]">
              <Image
                src={active.src}
                alt={active.alt}
                fill
                sizes="(max-width: 768px) 100vw, 55vw"
                className="object-cover"
              />
            </div>
            <div className="flex flex-col justify-center gap-5 p-6 sm:p-8">
              <div>
                <p className="pro-eyebrow">Made with Etch</p>
                <p
                  className="mt-3 text-[15px] leading-[1.7]"
                  style={{ color: "var(--pro-muted)" }}
                >
                  &ldquo;{active.prompt}&rdquo;
                </p>
              </div>
              <div
                className="flex items-center justify-between border-t pt-5"
                style={{ borderColor: "var(--pro-border-soft)" }}
              >
                <div>
                  <p className="text-[12px] uppercase" style={{ color: "var(--pro-faint)", letterSpacing: "0.14em" }}>
                    {active.badge}
                  </p>
                  <p
                    className="pro-display mt-1 text-[26px] font-bold tabular-nums"
                    style={{ color: "var(--pro-fg)" }}
                  >
                    {active.price}
                  </p>
                </div>
                <Link
                  href={active.href}
                  className="pro-btn-primary"
                  style={{ minHeight: 44, fontSize: 14 }}
                >
                  Make one like this
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
