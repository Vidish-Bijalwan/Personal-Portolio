"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import Lightbox from "@/components/vilish/lightbox";
import {
  CATEGORY_LABEL,
  toLightboxItem,
  type ExampleCategory,
  type ExampleItem,
} from "./examples";

// Re-exported for existing importers (e.g. app/examples/page.tsx).
export type { ExampleCategory, ExampleItem };

const CATEGORY_TABS: { id: "all" | ExampleCategory; label: string }[] = [
  { id: "all", label: "All" },
  { id: "image", label: "Image" },
  { id: "video", label: "Video" },
  { id: "edit", label: "Edit" },
  { id: "ad", label: "Ad" },
];

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
          items={filtered.map(toLightboxItem)}
          index={openIndex}
          onClose={() => setOpenIndex(null)}
          onIndex={(next) => setOpenIndex(next)}
        />
      )}
    </div>
  );
}
