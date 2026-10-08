"use client";

import { useEffect, useRef, useState } from "react";

interface ExplainerVideoProps {
  /** e.g. "/tools/explainers/trim.mp4" */
  src: string;
  /** e.g. "/tools/explainers/trim-poster.jpg" — also the reduced-motion fallback */
  poster: string;
  /** Accessible label, e.g. "How the Trim and text tool works" */
  label: string;
}

/**
 * Lazy auto-playing muted looping explainer.
 *
 * - The <video> element only mounts once the frame scrolls near the viewport
 *   (IntersectionObserver), so pages stay light until the explainer is seen.
 * - When the user prefers reduced motion, we render the static poster frame
 *   instead of the video — no autoplay, no animation.
 */
export default function ExplainerVideo({ src, poster, label }: ExplainerVideoProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = (e: MediaQueryList | MediaQueryListEvent) => setReducedMotion(e.matches);
    sync(mq);
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el || reducedMotion || visible) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { rootMargin: "240px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reducedMotion, visible]);

  return (
    <div
      ref={wrapRef}
      className="overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.02]"
    >
      {reducedMotion || !visible ? (
        <img
          src={poster}
          alt={label}
          loading="lazy"
          className="aspect-video w-full object-cover"
        />
      ) : (
        <video
          className="aspect-video w-full object-cover"
          src={src}
          poster={poster}
          autoPlay
          muted
          loop
          playsInline
          preload="none"
          aria-label={label}
        />
      )}
    </div>
  );
}
