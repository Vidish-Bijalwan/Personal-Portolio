import { describe, expect, it, beforeEach, afterEach } from "vitest";
import {
  accentHex,
  CURSOR_ACCENTS,
  CURSOR_SETTINGS_EVENT,
  CURSOR_SETTINGS_KEY,
  CURSOR_STYLES,
  DEFAULT_CURSOR_SETTINGS,
  loadCursorSettings,
  saveCursorSettings,
} from "@/lib/motion/cursor-settings";

/* Minimal window stub — vitest runs in node, so localStorage + events
   are faked per test. */

function installWindowStub() {
  const store = new Map<string, string>();
  const listeners = new Map<string, Set<(e: Event) => void>>();
  const listenersAny = listeners as Map<string, Set<EventListener>>;
  const stub = {
    localStorage: {
      getItem: (k: string) => (store.has(k) ? store.get(k)! : null),
      setItem: (k: string, v: string) => void store.set(k, String(v)),
      removeItem: (k: string) => void store.delete(k),
      clear: () => store.clear(),
    },
    addEventListener: (t: string, fn: EventListener) => {
      if (!listenersAny.has(t)) listenersAny.set(t, new Set());
      listenersAny.get(t)!.add(fn);
    },
    removeEventListener: (t: string, fn: EventListener) => {
      listenersAny.get(t)?.delete(fn);
    },
    dispatchEvent: (e: Event) => {
      listenersAny.get(e.type)?.forEach((fn) => fn(e));
      return true;
    },
  };
  Object.defineProperty(globalThis, "window", {
    value: stub,
    writable: true,
    configurable: true,
  });
  return stub;
}

describe("cursor settings", () => {
  let stub: ReturnType<typeof installWindowStub>;

  beforeEach(() => {
    stub = installWindowStub();
  });
  afterEach(() => {
    delete (globalThis as Record<string, unknown>).window;
  });

  it("returns defaults when nothing is stored", () => {
    expect(loadCursorSettings()).toEqual(DEFAULT_CURSOR_SETTINGS);
  });

  it("round-trips settings through localStorage", () => {
    saveCursorSettings({ enabled: false, style: "crosshair", accent: "magenta" });
    expect(loadCursorSettings()).toEqual({
      enabled: false,
      style: "crosshair",
      accent: "magenta",
    });
  });

  it("broadcasts an event on save so the cursor updates live", () => {
    const seen: unknown[] = [];
    stub.addEventListener(CURSOR_SETTINGS_EVENT, ((e: Event) =>
      seen.push((e as CustomEvent).detail)) as EventListener);
    saveCursorSettings({ enabled: true, style: "pulse", accent: "lime" });
    expect(seen).toEqual([{ enabled: true, style: "pulse", accent: "lime" }]);
  });

  it("sanitizes corrupt or partial stored values back to defaults", () => {
    stub.localStorage.setItem(
      CURSOR_SETTINGS_KEY,
      JSON.stringify({ style: "banana", accent: 42 }),
    );
    expect(loadCursorSettings()).toEqual(DEFAULT_CURSOR_SETTINGS);
    stub.localStorage.setItem(CURSOR_SETTINGS_KEY, "{not json");
    expect(loadCursorSettings()).toEqual(DEFAULT_CURSOR_SETTINGS);
  });

  it("exposes a complete accent + style catalog (no dead options)", () => {
    expect(Object.keys(CURSOR_ACCENTS).sort()).toEqual(["cyan", "lime", "magenta"]);
    expect(Object.keys(CURSOR_STYLES).sort()).toEqual(["aura", "crosshair", "pulse"]);
    for (const a of Object.keys(CURSOR_ACCENTS) as (keyof typeof CURSOR_ACCENTS)[]) {
      expect(accentHex(a)).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(CURSOR_ACCENTS[a].label.length).toBeGreaterThan(0);
    }
    for (const s of Object.keys(CURSOR_STYLES) as (keyof typeof CURSOR_STYLES)[]) {
      expect(CURSOR_STYLES[s].label.length).toBeGreaterThan(0);
    }
  });
});
