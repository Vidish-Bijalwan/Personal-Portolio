"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { usePrefersReducedMotion } from "@/src/lib/motion/theme";
import {
  handleLightboxKey,
  nextLightboxIndex,
  type LightboxItem,
} from "./lightbox-logic";

// Re-exported so consumers can import everything from the component module.
export type { LightboxItem };
export { handleLightboxKey, nextLightboxIndex };

/**
 * Shared image lightbox. Extracted from the /examples gallery so the
 * homepage showreel and showcase can open the same viewer with identical
 * UX. Images are always honestly labeled "Example" — these are sample
 * creations, never customer orders.
 *
 * Motion: this component deliberately uses no entrance/exit animation, so
 * open/close is instant under prefers-reduced-motion and everywhere else.
 */

export interface LightboxProps {
  items: LightboxItem[];
  index: number;
  onClose: () => void;
  onIndex: (next: number) => void;
}

function ExampleBadge() {
  // pro-dark-zone: the light-theme remap must not touch these pills — they
  // sit over the media stage, so they keep light text on a dark scrim in
  // both themes.
  return (
    <span className="pro-dark-zone rounded-full border border-white/[0.14] bg-black/70 px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.08em] text-[#F5F5F3] backdrop-blur-sm">
      Example
    </span>
  );
}

function BadgeChip({ label }: { label: string }) {
  return (
    <span className="pro-dark-zone rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.08em] text-white/[0.75] backdrop-blur-sm">
      {label}
    </span>
  );
}

export default function Lightbox({ items, index, onClose, onIndex }: LightboxProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const item = items[index];
  const reducedMotion = usePrefersReducedMotion();
  // Return focus to the thumbnail that opened the lightbox when it closes.
  const triggerRef = useRef<Element | null>(null);

  useEffect(() => {
    triggerRef.current = document.activeElement;
    dialogRef.current?.focus();
    return () => {
      const el = triggerRef.current;
      if (el instanceof HTMLElement) el.focus();
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      handleLightboxKey(e.key, index, items.length, onClose, onIndex);
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [index, items.length, onClose, onIndex]);

  if (!item) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md"
      onClick={onClose}
      role="presentation"
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={`Example: ${item.caption}`}
        tabIndex={-1}
        className="flex max-h-full w-full max-w-4xl flex-col overflow-hidden outline-none sm:mx-6 sm:rounded-[20px] sm:border sm:border-white/[0.10]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* pro-dark-zone: the media stage stays dark in both themes — the
            light-theme remap must not turn it (or the pills/buttons over it)
            light, which made badges unreadable and letterbox bars white. */}
        <div className="pro-dark-zone relative bg-[#080808]">
          {item.kind === "video" ? (
            <video
              src={item.src}
              poster={item.poster}
              aria-label={`AI video example: ${item.caption}`}
              controls
              muted
              loop
              playsInline
              preload="metadata"
              autoPlay={!reducedMotion}
              className="max-h-[62vh] w-full object-contain"
            />
          ) : (
            <Image
              src={item.src}
              alt={item.alt ?? item.caption}
              width={1280}
              height={960}
              className="mx-auto max-h-[62vh] w-auto max-w-full object-contain"
              priority
            />
          )}
          <div className="absolute left-4 top-4 flex gap-2">
            <ExampleBadge />
            {item.badge && <BadgeChip label={item.badge} />}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-black/70 text-[18px] text-[#F5F5F3] backdrop-blur-sm transition hover:bg-black/90"
          >
            ✕
          </button>
          {items.length > 1 && (
            <>
              <button
                type="button"
                onClick={() => onIndex(nextLightboxIndex(index, items.length, -1))}
                aria-label="Previous example"
                className="absolute left-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/70 text-[20px] text-[#F5F5F3] backdrop-blur-sm transition hover:bg-black/90"
              >
                ←
              </button>
              <button
                type="button"
                onClick={() => onIndex(nextLightboxIndex(index, items.length, 1))}
                aria-label="Next example"
                className="absolute right-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/70 text-[20px] text-[#F5F5F3] backdrop-blur-sm transition hover:bg-black/90"
              >
                →
              </button>
            </>
          )}
        </div>
        <div className="border-t border-white/[0.08] bg-[#101012] px-6 py-5 sm:px-8">
          {item.scenario && (
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/[0.4]">
                The brief
              </p>
              <p className="mt-1.5 text-[15px] leading-7 text-white/[0.9]">
                {item.scenario}
              </p>
            </div>
          )}
          {item.deliverable && (
            <div className={item.scenario ? "mt-4" : ""}>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/[0.4]">
                Made on Etch
              </p>
              <p className="mt-1.5 text-[14px] font-medium leading-6 text-white/[0.75]">
                {item.deliverable}
              </p>
            </div>
          )}
          <p className="mt-4 text-[13.5px] leading-6 text-white/[0.55]">
            {item.caption}
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-white/[0.08] px-3 py-1 text-[13px] font-semibold tabular-nums text-[#F5F5F3]">
              {item.price}
            </span>
            {item.model && (
              <span className="text-[13px] text-white/[0.5]">{item.model}</span>
            )}
            <span className="ml-auto text-[12px] text-white/[0.45]">
              {items.length > 1 ? `${index + 1} / ${items.length}` : ""}
            </span>
          </div>
          <p className="mt-3 text-[12px] uppercase tracking-[0.08em] text-white/[0.4]">
            Example — not a customer order
          </p>
        </div>
      </div>
    </div>
  );
}
