"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MessageCircle } from "lucide-react";

/**
 * Minimal floating contact button — a plain link to /contact.
 * Appears after scrolling past 400px, hides near the top.
 * No form, no fake sends.
 */
export default function ContactFab() {
  const [visible, setVisible] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReduceMotion(e.matches);
    mq.addEventListener("change", onChange);

    const onScroll = () => setVisible(window.scrollY > 400);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      mq.removeEventListener("change", onChange);
    };
  }, []);

  return (
    <Link
      href="/contact"
      aria-label="Contact us"
      tabIndex={visible ? 0 : -1}
      className={[
        "fixed bottom-24 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full border shadow-lg",
        visible
          ? "pointer-events-auto translate-y-0 opacity-100"
          : "pointer-events-none translate-y-2 opacity-0",
        reduceMotion ? "" : "transition-all duration-300",
      ].join(" ")}
      style={{
        background: "var(--pro-accent)",
        borderColor: "var(--pro-border)",
        color: "#141311",
      }}
    >
      <MessageCircle className="h-5 w-5" strokeWidth={2} aria-hidden />
    </Link>
  );
}
