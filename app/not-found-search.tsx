"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, FileText, LayoutGrid, Search, Wrench, X } from "lucide-react";
import {
  filterSearchIndex,
  type SearchItem,
} from "@/src/lib/not-found-search";

const KIND_LABEL: Record<SearchItem["kind"], string> = {
  page: "Page",
  tool: "Tool",
  post: "Guide",
};

const KIND_ICON: Record<SearchItem["kind"], typeof Search> = {
  page: LayoutGrid,
  tool: Wrench,
  post: FileText,
};

export default function NotFoundSearch({ index }: { index: SearchItem[] }) {
  const [query, setQuery] = useState("");

  const results = useMemo(
    () => filterSearchIndex(index, query),
    [index, query]
  );
  const searched = query.trim().length >= 2;

  return (
    <div className="mt-10 w-full text-left">
      <label
        htmlFor="notfound-search"
        className="text-[13px] font-medium text-white/[0.55]"
      >
        Looking for something specific? Search the studio.
      </label>
      <div className="relative mt-2">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
        <input
          id="notfound-search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Try “video”, “pricing”, “captions”…"
          autoComplete="off"
          className="min-h-[48px] w-full rounded-[14px] border border-white/[0.1] bg-[#121214] pl-11 pr-11 text-[15px] text-[#F5F5F3] placeholder:text-white/30 outline-none transition-colors focus:border-white/30"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            aria-label="Clear search"
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-white/40 transition-colors hover:bg-white/10 hover:text-white/80"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {searched && (
        <div className="mt-3 overflow-hidden rounded-[14px] border border-white/[0.08] bg-[#121214]">
          {results.length === 0 ? (
            <p className="px-5 py-6 text-center text-[14px] text-white/[0.5]">
              Nothing matched — try “video”, “pricing”, or “captions”. Or pick a
              shortcut below.
            </p>
          ) : (
            <ul className="divide-y divide-white/[0.06]">
              {results.map((r) => {
                const Icon = KIND_ICON[r.kind];
                return (
                  <li key={r.href + r.label}>
                    <Link
                      href={r.href}
                      className="group flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-white/[0.04]"
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] bg-white/[0.06] text-white/60">
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-2 text-[14px] font-semibold">
                          <span className="truncate">{r.label}</span>
                          <span className="shrink-0 rounded-full border border-white/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-white/40">
                            {KIND_LABEL[r.kind]}
                          </span>
                        </span>
                        <span className="mt-0.5 block truncate text-[12px] text-white/[0.45]">
                          {r.desc}
                        </span>
                      </span>
                      <ArrowUpRight className="h-4 w-4 shrink-0 text-white/30 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-white/70" />
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
