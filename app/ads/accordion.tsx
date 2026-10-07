"use client";

/**
 * Etch Ad Studio — single-open accordion shell.
 *
 * One section open at a time: opening a section closes the others, and
 * clicking the open section's trigger collapses it. The accordion is
 * controlled (`openId` / `onToggle`) and keeps NO selection state itself —
 * selections live with the caller and are echoed in each collapsed trigger's
 * summary line, so collapse/expand can never lose a pick.
 */

import type { ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "../../lib/utils";
import { nextAccordionOpen } from "./accordion-state";

/** Re-exported so callers can import the toggle rule from "./accordion". */
export { nextAccordionOpen };

export interface AccordionSection {
  /** Stable id, also used for aria wiring. */
  id: string;
  /** Step number chip shown on the trigger. */
  index: string;
  title: string;
  /** Short line under the title — the current selection. Survives collapse. */
  summary: string;
  body: ReactNode;
}

export function Accordion({
  sections,
  openId,
  onToggle,
}: {
  sections: AccordionSection[];
  openId: string | null;
  onToggle: (id: string) => void;
}) {
  return (
    <div className="space-y-3">
      {sections.map((s) => {
        const open = openId === s.id;
        const panelId = `ads-acc-panel-${s.id}`;
        const triggerId = `ads-acc-trigger-${s.id}`;
        return (
          <div
            key={s.id}
            className="pro-card overflow-hidden"
            style={{
              boxShadow: "var(--pro-card-shadow)",
              outline: open ? "2px solid var(--pro-accent)" : "none",
              outlineOffset: 2,
              transition: "outline-color 160ms ease",
            }}
          >
            <button
              id={triggerId}
              type="button"
              aria-expanded={open}
              aria-controls={panelId}
              onClick={() => onToggle(s.id)}
              className="flex w-full items-center gap-3.5 px-5 py-4 text-left"
            >
              <span
                aria-hidden
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[13px] font-bold"
                style={{
                  background: open ? "var(--pro-accent)" : "var(--pro-bg-sunken)",
                  color: open ? "var(--pro-bg)" : "var(--pro-muted)",
                  transition: "background 160ms ease, color 160ms ease",
                }}
              >
                {s.index}
              </span>
              <span className="min-w-0 flex-1">
                <span
                  className="pro-display block text-[16.5px] font-bold leading-snug"
                  style={{ color: "var(--pro-fg)" }}
                >
                  {s.title}
                </span>
                <span
                  className="mt-0.5 block truncate text-[13px]"
                  style={{ color: open ? "var(--pro-accent)" : "var(--pro-muted)" }}
                >
                  {s.summary}
                </span>
              </span>
              <ChevronDown
                aria-hidden
                className={cn(
                  "h-5 w-5 shrink-0 transition-transform duration-200",
                  open && "rotate-180"
                )}
                style={{ color: open ? "var(--pro-accent)" : "var(--pro-faint)" }}
              />
            </button>
            {open && (
              <div
                id={panelId}
                role="region"
                aria-labelledby={triggerId}
                className="border-t px-5 pb-5 pt-4"
                style={{ borderColor: "var(--pro-border-soft)" }}
              >
                {s.body}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
