"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Settings2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  CURSOR_ACCENTS,
  CURSOR_STYLES,
  loadCursorSettings,
  saveCursorSettings,
  type CursorAccent,
  type CursorSettings,
  type CursorStyle,
} from "@/src/lib/motion/cursor-settings";

/**
 * Cursor settings — gear button in the footer opening a small popover.
 * Every control applies immediately (live broadcast to CyberCursor) and
 * persists to localStorage. Escape / click-outside closes.
 */
export default function CursorSettingsControl() {
  const [open, setOpen] = useState(false);
  const [settings, setSettings] = useState<CursorSettings>(() => loadCursorSettings());
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSettings(loadCursorSettings());
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onClick = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [open ]);

  const update = (patch: Partial<CursorSettings>) => {
    const next = { ...settings, ...patch };
    setSettings(next);
    saveCursorSettings(next);
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-label="Cursor settings"
        title="Cursor settings"
        className={cn(
          // 44px minimum tap target on touch.
          "inline-flex min-h-[44px] min-w-[44px] items-center justify-center gap-1.5 rounded-[8px] border px-3 py-2 text-[12px] text-white/50 transition-colors",
          "border-white/[0.1] hover:border-white/25 hover:text-white/90",
          open && "border-white/25 text-white/90",
        )}
      >
        <Settings2 className="h-3.5 w-3.5" strokeWidth={1.8} aria-hidden />
        <span className="hidden sm:inline">Cursor</span>
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Cursor settings"
          className="absolute bottom-full right-0 z-50 mb-2 w-[calc(100vw-3rem)] max-w-64 rounded-[14px] border border-white/[0.1] bg-[#121214] p-4 shadow-[0_24px_64px_-16px_rgba(0,0,0,0.9)]"
        >
          {/* on/off */}
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-medium text-white/80">Cursor effects</span>
            <button
              type="button"
              role="switch"
              aria-checked={settings.enabled}
              aria-label="Toggle cursor effects"
              onClick={() => update({ enabled: !settings.enabled })}
              className={cn(
                "relative h-6 w-11 rounded-full transition-colors",
                settings.enabled ? "bg-[#D7FF3F]" : "bg-white/[0.12]",
              )}
            >
              <span
                aria-hidden
                className={cn(
                  "absolute top-0.5 h-5 w-5 rounded-full bg-[#080808] transition-transform",
                  settings.enabled ? "translate-x-[22px]" : "translate-x-0.5",
                )}
              />
            </button>
          </div>

          {/* style */}
          <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/40">
            Style
          </p>
          <div className="mt-2 grid grid-cols-3 gap-1.5" role="group" aria-label="Cursor style">
            {(Object.keys(CURSOR_STYLES) as CursorStyle[]).map((id) => (
              <button
                key={id}
                type="button"
                aria-pressed={settings.style === id}
                title={CURSOR_STYLES[id].hint}
                onClick={() => update({ style: id })}
                className={cn(
                  "rounded-[8px] border px-2 py-2 text-[11.5px] font-medium transition-colors",
                  settings.style === id
                    ? "border-[#D7FF3F]/60 bg-[#D7FF3F]/[0.1] text-[#F5F5F3]"
                    : "border-white/[0.08] text-white/50 hover:border-white/20 hover:text-white/80",
                )}
              >
                {CURSOR_STYLES[id].label}
              </button>
            ))}
          </div>

          {/* accent */}
          <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/40">
            Accent
          </p>
          <div className="mt-2 flex gap-2" role="group" aria-label="Cursor accent color">
            {(Object.keys(CURSOR_ACCENTS) as CursorAccent[]).map((id) => (
              <button
                key={id}
                type="button"
                aria-pressed={settings.accent === id}
                aria-label={`${CURSOR_ACCENTS[id].label} accent`}
                title={CURSOR_ACCENTS[id].label}
                onClick={() => update({ accent: id })}
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-full border-2 transition-transform hover:scale-110",
                  settings.accent === id ? "border-white/80" : "border-transparent",
                )}
                style={{ background: CURSOR_ACCENTS[id].hex }}
              >
                {settings.accent === id && (
                  <Check className="h-4 w-4 text-[#080808]" strokeWidth={3} aria-hidden />
                )}
              </button>
            ))}
          </div>

          <p className="mt-4 text-[11.5px] leading-5 text-white/35">
            Applies instantly. Saved on this device.
          </p>
        </div>
      )}
    </div>
  );
}
