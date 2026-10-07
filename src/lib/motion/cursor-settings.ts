"use client";

/**
 * Etch — cursor settings.
 *
 * Persisted to localStorage, broadcast on window so the CyberCursor
 * updates live the moment a control changes. Pure load/save/defaults
 * are unit-testable; the DOM bits are guarded for SSR.
 */

export type CursorStyle = "aura" | "pulse" | "crosshair";
export type CursorAccent = "lime" | "cyan" | "magenta";

export interface CursorSettings {
  /** Master switch — when false the augmented cursor renders nothing. */
  enabled: boolean;
  style: CursorStyle;
  accent: CursorAccent;
}

export const CURSOR_ACCENTS: Record<CursorAccent, { hex: string; label: string }> = {
  lime: { hex: "#D7FF3F", label: "Lime" },
  cyan: { hex: "#00F0FF", label: "Cyan" },
  magenta: { hex: "#FF2D78", label: "Magenta" },
};

export const CURSOR_STYLES: Record<CursorStyle, { label: string; hint: string }> = {
  aura: { label: "Aura Ring", hint: "Neon ring + particle trail" },
  pulse: { label: "Pulse Dot", hint: "Single pulsing dot" },
  crosshair: { label: "Crosshair", hint: "Precision crosshair" },
};

export const DEFAULT_CURSOR_SETTINGS: CursorSettings = {
  enabled: true,
  style: "aura",
  accent: "cyan",
};

export const CURSOR_SETTINGS_KEY = "etch:cursor-settings";
export const CURSOR_SETTINGS_EVENT = "etch:cursor-settings";

function sanitize(raw: unknown): CursorSettings {
  const o = (raw ?? {}) as Partial<CursorSettings>;
  return {
    enabled: typeof o.enabled === "boolean" ? o.enabled : DEFAULT_CURSOR_SETTINGS.enabled,
    style:
      o.style === "aura" || o.style === "pulse" || o.style === "crosshair"
        ? o.style
        : DEFAULT_CURSOR_SETTINGS.style,
    accent:
      o.accent === "lime" || o.accent === "cyan" || o.accent === "magenta"
        ? o.accent
        : DEFAULT_CURSOR_SETTINGS.accent,
  };
}

export function loadCursorSettings(): CursorSettings {
  if (typeof window === "undefined" || typeof window.localStorage === "undefined") {
    return { ...DEFAULT_CURSOR_SETTINGS };
  }
  try {
    const raw = window.localStorage.getItem(CURSOR_SETTINGS_KEY);
    if (!raw) return { ...DEFAULT_CURSOR_SETTINGS };
    return sanitize(JSON.parse(raw));
  } catch {
    return { ...DEFAULT_CURSOR_SETTINGS };
  }
}

export function saveCursorSettings(s: CursorSettings): void {
  const clean = sanitize(s);
  if (typeof window !== "undefined" && typeof window.localStorage !== "undefined") {
    try {
      window.localStorage.setItem(CURSOR_SETTINGS_KEY, JSON.stringify(clean));
    } catch {
      /* storage unavailable — settings still apply for this session */
    }
    window.dispatchEvent(new CustomEvent(CURSOR_SETTINGS_EVENT, { detail: clean }));
  }
}

export function accentHex(accent: CursorAccent): string {
  return CURSOR_ACCENTS[accent].hex;
}
