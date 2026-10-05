"use client";

import { formatINR } from "@/src/lib/vilish/types";

export interface ExampleItem {
  src: string;
  prompt: string;
  price: number;
}

export default function ExamplesGrid({ items }: { items: ExampleItem[] }) {
  if (items.length === 0) {
    return (
      <div className="rounded-[16px] border border-white/[0.08] bg-[#121214] px-6 py-16 text-center">
        <p className="text-[16px] font-medium text-[#F5F5F3]">No examples yet</p>
        <p className="mx-auto mt-2 max-w-sm text-[14px] leading-6 text-white/[0.58]">
          Fresh generations will appear here. Only real creations made with
          VILISH are shown — nothing staged, nothing stock.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item, i) => (
        <figure
          key={`${item.src}-${i}`}
          className="overflow-hidden rounded-[16px] border border-white/[0.08] bg-[#121214]"
        >
          <img
            src={item.src}
            alt={item.prompt}
            loading="lazy"
            className="aspect-square w-full object-cover"
          />
          <figcaption className="p-4">
            <p className="line-clamp-2 text-[13px] leading-5 text-white/[0.72]">
              {item.prompt}
            </p>
            <p className="mt-2 text-[13px] font-semibold text-[#F5F5F3] tabular-nums">
              {formatINR(item.price)}
            </p>
          </figcaption>
        </figure>
      ))}
    </div>
  );
}
