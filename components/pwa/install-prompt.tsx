"use client";

/**
 * Tasteful PWA install prompt.
 *
 * Shows ONLY when the browser fires `beforeinstallprompt` — i.e. the app
 * is genuinely installable (manifest + service worker present) — at most
 * once per session (sessionStorage), dismissible, never blocking. A quiet
 * bottom banner in the pro design language, not a modal, not a gimmick.
 */
import { useCallback, useEffect, useState } from "react";
import { Download, X } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const SEEN_KEY = "etch-install-prompt-seen";

function alreadySeen(): boolean {
  try {
    return sessionStorage.getItem(SEEN_KEY) === "1";
  } catch {
    return false;
  }
}

function markSeen(): void {
  try {
    sessionStorage.setItem(SEEN_KEY, "1");
  } catch {
    /* storage unavailable — banner just shows again next visit */
  }
}

export default function InstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    // Already running installed — nothing to offer.
    if (window.matchMedia?.("(display-mode: standalone)").matches) return;
    if (alreadySeen()) return;
    const onBeforeInstall = (e: Event) => {
      e.preventDefault(); // hold the native prompt; we show our own banner
      setDeferred(e as BeforeInstallPromptEvent);
      setVisible(true);
    };
    const onInstalled = () => {
      setVisible(false);
      setDeferred(null);
      markSeen();
    };
    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const dismiss = useCallback(() => {
    setVisible(false);
    markSeen();
  }, []);

  const install = useCallback(async () => {
    if (!deferred) return;
    dismiss();
    try {
      await deferred.prompt();
    } catch {
      /* gesture/context issues — stay quiet, nothing to report */
    }
  }, [deferred, dismiss]);

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Install Etch"
      className="fixed bottom-4 left-1/2 z-[70] w-[calc(100%-2rem)] max-w-md -translate-x-1/2"
    >
      <div
        className="pro-body flex items-center gap-3 rounded-[14px] border border-[var(--pro-border)] px-4 py-3"
        style={{
          background: "var(--pro-bg-elev)",
          color: "var(--pro-fg)",
          boxShadow:
            "0 0 0 1px rgba(0,0,0,0.4), 0 24px 64px -24px rgba(0,0,0,0.8)",
        }}
      >
        <span
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px]"
          style={{ background: "var(--pro-bg)" }}
          aria-hidden
        >
          <Download className="h-4 w-4" style={{ color: "var(--pro-accent)" }} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[13.5px] font-semibold leading-5">Install Etch</p>
          <p
            className="truncate text-[12.5px] leading-5"
            style={{ color: "var(--pro-muted)" }}
          >
            Add Etch to your home screen — share photos straight into the intake.
          </p>
        </div>
        <button
          type="button"
          onClick={install}
          className="pro-body shrink-0 rounded-[10px] px-3.5 py-2 text-[13px] font-semibold"
          style={{ background: "var(--pro-accent)", color: "#080808" }}
        >
          Install
        </button>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss install prompt"
          className="shrink-0 rounded-[8px] p-1.5"
          style={{ color: "var(--pro-muted)" }}
        >
          <X className="h-4 w-4" aria-hidden />
        </button>
      </div>
    </div>
  );
}
