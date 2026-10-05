"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";

export type ExampleCategory = "image" | "video" | "edit" | "ad";

export interface ExampleItem {
  src: string;
  prompt: string;
  price: string;
  model: string;
  category: ExampleCategory;
}

const CATEGORY_TABS: { id: "all" | ExampleCategory; label: string }[] = [
  { id: "all", label: "All" },
  { id: "image", label: "Image" },
  { id: "video", label: "Video" },
  { id: "edit", label: "Edit" },
  { id: "ad", label: "Ad" },
];

const CATEGORY_LABEL: Record<ExampleCategory, string> = {
  image: "Image",
  video: "Video",
  edit: "Edit",
  ad: "Ad",
};

function ExampleBadge() {
  return (
    <span className="rounded-full border border-white/[0.14] bg-black/70 px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.08em] text-[#F5F5F3] backdrop-blur-sm">
      Example
    </span>
  );
}

function CategoryChip({ category }: { category: ExampleCategory }) {
  return (
    <span className="rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.08em] text-white/[0.75] backdrop-blur-sm">
      {CATEGORY_LABEL[category]}
    </span>
  );
}

interface LightboxProps {
  items: ExampleItem[];
  index: number;
  onClose: () => void;
  onIndex: (next: number) => void;
}

function Lightbox({ items, index, onClose, onIndex }: LightboxProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const item = items[index];
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
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight" && items.length > 1)
        onIndex((index + 1) % items.length);
      else if (e.key === "ArrowLeft" && items.length > 1)
        onIndex((index - 1 + items.length) % items.length);
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [index, items.length, onClose, onIndex]);

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
        aria-label={`Example: ${item.prompt}`}
        tabIndex={-1}
        className="flex max-h-full w-full max-w-4xl flex-col overflow-hidden outline-none sm:mx-6 sm:rounded-[20px] sm:border sm:border-white/[0.10]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative bg-[#080808]">
          <Image
            src={item.src}
            alt={item.prompt}
            width={1280}
            height={960}
            className="max-h-[62vh] w-full object-contain"
            priority
          />
          <div className="absolute left-4 top-4 flex gap-2">
            <ExampleBadge />
            <CategoryChip category={item.category} />
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
                onClick={() => onIndex((index - 1 + items.length) % items.length)}
                aria-label="Previous example"
                className="absolute left-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/70 text-[20px] text-[#F5F5F3] backdrop-blur-sm transition hover:bg-black/90"
              >
                ←
              </button>
              <button
                type="button"
                onClick={() => onIndex((index + 1) % items.length)}
                aria-label="Next example"
                className="absolute right-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/70 text-[20px] text-[#F5F5F3] backdrop-blur-sm transition hover:bg-black/90"
              >
                →
              </button>
            </>
          )}
        </div>
        <div className="border-t border-white/[0.08] bg-[#101012] px-6 py-5 sm:px-8">
          <p className="text-[15px] leading-7 text-white/[0.85]">{item.prompt}</p>
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

export default function ExamplesGrid({ items }: { items: ExampleItem[] }) {
  const [active, setActive] = useState<"all" | ExampleCategory>("all");
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const counts = useMemo(() => {
    const c: Record<"all" | ExampleCategory, number> = {
      all: items.length,
      image: 0,
      video: 0,
      edit: 0,
      ad: 0,
    };
    for (const it of items) c[it.category] += 1;
    return c;
  }, [items]);

  const filtered = useMemo(
    () => (active === "all" ? items : items.filter((it) => it.category === active)),
    [items, active],
  );

  const emptyLabel =
    active === "all"
      ? "No examples yet — check back soon."
      : `No ${CATEGORY_TABS.find((t) => t.id === active)?.label.toLowerCase()} examples yet — check back soon.`;

  return (
    <div>
      <div
        role="tablist"
        aria-label="Filter examples by category"
        className="flex flex-wrap gap-2"
      >
        {CATEGORY_TABS.map((tab) => {
          const selected = active === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => {
                setActive(tab.id);
                setOpenIndex(null);
              }}
              className={`relative rounded-full px-4 py-2 text-[13px] font-medium transition-colors ${
                selected ? "text-[#080808]" : "text-white/[0.55] hover:text-white/[0.85]"
              }`}
            >
              {selected && (
                <motion.span
                  layoutId="examples-category-pill"
                  className="absolute inset-0 rounded-full border border-[#D7FF3F]/40 bg-[#D7FF3F]"
                  transition={{ type: "spring", stiffness: 500, damping: 38 }}
                />
              )}
              <span className="relative z-10">
                {tab.label}
                <span className="ml-1.5 tabular-nums text-[11px] opacity-60">
                  {counts[tab.id]}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <div className="mt-8 rounded-[16px] border border-white/[0.08] bg-[#121214] px-6 py-16 text-center">
          <p className="text-[16px] font-medium text-[#F5F5F3]">{emptyLabel}</p>
          <p className="mx-auto mt-2 max-w-sm text-[14px] leading-6 text-white/[0.58]">
            Only finished example creations appear here — nothing staged,
            nothing borrowed.
          </p>
        </div>
      ) : (
        <Stagger key={active} className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2">
          {filtered.map((item, filteredIndex) => (
            <StaggerItem key={item.src}>
              <button
                type="button"
                onClick={() => setOpenIndex(filteredIndex)}
                aria-label={`Open example: ${item.prompt}`}
                  className="group block w-full overflow-hidden rounded-[16px] border border-white/[0.08] bg-[#121214] text-left transition-all duration-200 hover:-translate-y-1 hover:border-white/[0.16] hover:shadow-[0_20px_50px_-20px_rgba(0,0,0,0.8)] motion-reduce:transition-none motion-reduce:hover:translate-y-0"
                >
                  <span className="relative block aspect-[4/3] overflow-hidden">
                    <Image
                      src={item.src}
                      alt={item.prompt}
                      fill
                      sizes="(max-width: 640px) 100vw, 50vw"
                      className="object-cover transition-transform duration-300 group-hover:scale-[1.04] motion-reduce:transition-none"
                      loading="lazy"
                    />
                    <span className="absolute left-3 top-3">
                      <ExampleBadge />
                    </span>
                    <span className="absolute right-3 top-3">
                      <CategoryChip category={item.category} />
                    </span>
                    <span className="absolute bottom-3 right-3 rounded-full bg-black/70 px-3 py-1 text-[13px] font-semibold tabular-nums text-[#F5F5F3] backdrop-blur-sm">
                      {item.price}
                    </span>
                    <span className="pointer-events-none absolute inset-x-0 bottom-0 translate-y-3 bg-gradient-to-t from-black/90 via-black/55 to-transparent px-4 pb-4 pt-10 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 motion-reduce:transition-none">
                      <span className="line-clamp-2 text-[13px] leading-5 text-white/[0.92]">
                        {item.prompt}
                      </span>
                    </span>
                  </span>
                </button>
            </StaggerItem>
          ))}
        </Stagger>
      )}

      {openIndex !== null && filtered[openIndex] && (
        <Lightbox
          items={filtered}
          index={openIndex}
          onClose={() => setOpenIndex(null)}
          onIndex={(next) => setOpenIndex(next)}
        />
      )}
    </div>
  );
}
