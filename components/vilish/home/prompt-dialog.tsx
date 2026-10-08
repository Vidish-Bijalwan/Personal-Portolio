"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check, Copy, X } from "lucide-react";

export interface PromptItem {
  src: string;
  alt: string;
  /** The EXACT prompt used to generate this piece — shown verbatim. */
  prompt: string;
  price: string;
  badge: string;
  href: string;
  /** Story-first: the client scenario — who needed it and why. */
  scenario?: string;
  /** Story-first: what was created on Etch for that scenario. */
  deliverable?: string;
}

/**
 * Closer view: the piece large, its exact generation prompt verbatim,
 * plus Copy prompt and Use this prompt (deep-links to /create?prompt=).
 * Shared by the hero carousel and the examples gallery.
 */
export function PromptDialog({
  item,
  onClose,
}: {
  item: PromptItem | null;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setCopied(false);
  }, [item?.src]);

  const close = useCallback(() => {
    setCopied(false);
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (!item) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [item, close]);

  const copyPrompt = useCallback(async () => {
    if (!item) return;
    try {
      await navigator.clipboard.writeText(item.prompt);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = item.prompt;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }, [item]);

  if (!item) return null;

  const useHref = `/create?prompt=${encodeURIComponent(item.prompt.slice(0, 2000))}`;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={item.alt}
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-8"
      style={{ background: "rgba(0,0,0,0.72)" }}
      onClick={close}
    >
      <div
        className="pro-body relative grid max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-[18px] md:grid-cols-[1.2fr_1fr]"
        style={{
          background: "var(--pro-bg-elev)",
          border: "1px solid var(--pro-border)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={close}
          aria-label="Close"
          className="absolute right-3 top-3 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full"
          style={{ background: "rgba(0,0,0,0.55)", color: "#fff" }}
        >
          <X className="h-5 w-5" />
        </button>
        <div className="relative min-h-[280px] md:min-h-[480px]">
          <Image
            src={item.src}
            alt={item.alt}
            fill
            sizes="(max-width: 768px) 100vw, 55vw"
            className="object-cover"
          />
        </div>
        <div className="flex max-h-[90vh] flex-col gap-5 overflow-y-auto p-6 sm:p-8">
          {item.scenario && (
            <div>
              <p className="pro-eyebrow">The brief</p>
              <p
                className="mt-2 text-[14.5px] leading-[1.7]"
                style={{ color: "var(--pro-fg)" }}
              >
                {item.scenario}
              </p>
            </div>
          )}
          {item.deliverable && (
            <div>
              <p className="pro-eyebrow">Made on Etch</p>
              <p
                className="mt-2 text-[14px] font-medium leading-[1.7]"
                style={{ color: "var(--pro-fg)" }}
              >
                {item.deliverable}
              </p>
            </div>
          )}
          <div>
            <p className="pro-eyebrow">The exact prompt</p>
            <div
              className="mt-3 max-h-[220px] overflow-y-auto rounded-[10px] border p-4"
              style={{
                borderColor: "var(--pro-border-soft)",
                background: "var(--pro-bg-sunken)",
              }}
            >
              <p
                className="text-[13.5px] leading-[1.75]"
                style={{ color: "var(--pro-fg)" }}
              >
                &ldquo;{item.prompt}&rdquo;
              </p>
            </div>
          </div>
          <div
            className="flex items-center justify-between border-t pt-5"
            style={{ borderColor: "var(--pro-border-soft)" }}
          >
            <div>
              <p
                className="text-[12px] uppercase"
                style={{ color: "var(--pro-faint)", letterSpacing: "0.14em" }}
              >
                {item.badge}
              </p>
              <p
                className="pro-display mt-1 text-[26px] font-bold tabular-nums"
                style={{ color: "var(--pro-fg)" }}
              >
                {item.price}
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-2.5">
            <Link
              href={useHref}
              className="pro-btn-primary w-full"
              style={{ minHeight: 46, fontSize: 14 }}
            >
              Use this prompt
              <ArrowRight className="h-4 w-4" />
            </Link>
            <button
              type="button"
              onClick={copyPrompt}
              className="pro-btn-secondary w-full"
              style={{ minHeight: 46, fontSize: 14 }}
              aria-live="polite"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  Copy prompt
                </>
              )}
            </button>
            <Link
              href={item.href}
              className="pro-body mx-auto mt-1 inline-flex min-h-[40px] items-center gap-1.5 text-[13.5px] font-semibold"
              style={{ color: "var(--pro-accent)" }}
            >
              Make one like this
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
