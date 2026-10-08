"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Reveal } from "./reveal";
import { PromptDialog } from "./prompt-dialog";

export interface CarouselSlide {
  src: string;
  alt: string;
  /** Exact generation prompt — shown verbatim in the dialog. */
  prompt: string;
  price: string;
  href: string;
}

const AUTOPLAY_MS = 5000;
/** Slide takes 70% of the viewport width; 15% margin centers the active one. */
const SLIDE_W = 70;
const CENTER_OFFSET = (100 - SLIDE_W) / 2;

function snippet(prompt: string): string {
  return prompt.length > 110 ? prompt.slice(0, 110).trimEnd() + "…" : prompt;
}

/**
 * Infinite hero carousel: center slide large, neighbours peeking at the
 * edges, auto-rotate every 5s, arrows + drag + dots, pause on hover/focus.
 * Clicking the center slide opens the exact-prompt dialog.
 */
export function HeroCarousel({ slides }: { slides: CarouselSlide[] }) {
  const n = slides.length;
  // Extended array: [last, ...slides, first] for the infinite illusion.
  const ext: CarouselSlide[] = n > 1 ? [slides[n - 1], ...slides, slides[0]] : slides;
  const [pos, setPos] = useState(1);
  const [anim, setAnim] = useState(true);
  const [paused, setPaused] = useState(false);
  // Touch interactions pause autoplay separately from hover so a swipe
  // doesn't restart the timer mid-gesture on mobile.
  const [touchPaused, setTouchPaused] = useState(false);
  const [dialog, setDialog] = useState<CarouselSlide | null>(null);
  const [dragX, setDragX] = useState(0);
  const dragging = useRef(false);
  const dragStartX = useRef(0);
  const reduceMotion = useRef(false);

  useEffect(() => {
    reduceMotion.current =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  const go = useCallback((p: number) => {
    setAnim(true);
    setPos(p);
  }, []);
  const next = useCallback(() => {
    setAnim(true);
    setPos((p) => p + 1);
  }, []);
  const prev = useCallback(() => {
    setAnim(true);
    setPos((p) => p - 1);
  }, []);

  // Seamless wrap: after sliding onto a clone, jump to the real twin.
  const onTransitionEnd = useCallback(() => {
    if (pos === 0) {
      setAnim(false);
      setPos(n);
    } else if (pos === n + 1) {
      setAnim(false);
      setPos(1);
    }
  }, [pos, n]);

  useEffect(() => {
    if (!anim) {
      const raf = requestAnimationFrame(() => setAnim(true));
      return () => cancelAnimationFrame(raf);
    }
  }, [anim]);

  // Autoplay — paused on hover/focus, while touching, while the dialog
  // is open, or with reduced motion.
  useEffect(() => {
    if (paused || touchPaused || dialog || reduceMotion.current || n < 2) return;
    const id = window.setInterval(() => {
      setPos((p) => p + 1);
    }, AUTOPLAY_MS);
    return () => window.clearInterval(id);
  }, [paused, touchPaused, dialog, n]);

  const activeIdx = ((pos - 1) % n + n) % n;
  const active = slides[activeIdx];

  // Drag / swipe.
  const onPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    if ((e.target as HTMLElement).closest("button, a")) return;
    if (e.pointerType === "touch") setTouchPaused(true);
    dragging.current = true;
    dragStartX.current = e.clientX;
    setAnim(false);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging.current) return;
    setDragX(e.clientX - dragStartX.current);
  };
  const onPointerUp = (e: React.PointerEvent) => {
    if (e.pointerType === "touch") setTouchPaused(false);
    if (!dragging.current) return;
    dragging.current = false;
    const dx = e.clientX - dragStartX.current;
    setDragX(0);
    setAnim(true);
    if (dx <= -60) next();
    else if (dx >= 60) prev();
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") next();
    else if (e.key === "ArrowLeft") prev();
  };

  return (
    <Reveal delay={140} className="mx-auto mt-14 max-w-6xl sm:mt-16">
      <div
        role="region"
        aria-roledescription="carousel"
        aria-label="Featured creations"
        tabIndex={0}
        onKeyDown={onKeyDown}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => {
          setPaused(false);
          if (dragging.current) {
            dragging.current = false;
            setDragX(0);
            setAnim(true);
          }
        }}
        onFocus={() => setPaused(true)}
        onBlur={() => setPaused(false)}
        className="outline-none"
      >
        <div
          className="relative overflow-hidden"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          style={{ touchAction: "pan-y" }}
        >
          <div
            className="flex items-center"
            onTransitionEnd={onTransitionEnd}
            style={{
              transform: `translate3d(calc(${-pos * SLIDE_W}% + ${CENTER_OFFSET}% + ${dragX}px), 0, 0)`,
              transition: anim
                ? "transform 620ms cubic-bezier(0.16, 1, 0.3, 1)"
                : "none",
            }}
          >
            {ext.map((s, i) => {
              const isActive = i === pos;
              return (
                <div
                  key={`${s.src}-${i}`}
                  className="shrink-0 px-2 sm:px-3"
                  style={{ flex: `0 0 ${SLIDE_W}%` }}
                  aria-hidden={!isActive}
                >
                  <button
                    type="button"
                    tabIndex={isActive ? 0 : -1}
                    onClick={() => {
                      if (i === pos) setDialog(slides[activeIdx]);
                      else go(i);
                    }}
                    aria-label={
                      isActive
                        ? `View prompt for: ${s.alt}`
                        : `Show slide: ${s.alt}`
                    }
                    className="group block w-full overflow-hidden rounded-[20px] border text-left"
                    style={{
                      borderColor: "var(--pro-border-soft)",
                      background: "var(--pro-bg-elev)",
                      boxShadow: "var(--pro-card-shadow)",
                      transform: isActive ? "scale(1)" : "scale(0.9)",
                      opacity: isActive ? 1 : 0.55,
                      transition:
                        "transform 620ms cubic-bezier(0.16, 1, 0.3, 1), opacity 620ms ease, box-shadow 200ms ease",
                      cursor: isActive ? "zoom-in" : "pointer",
                    }}
                  >
                    <span className="relative block aspect-[16/10] w-full">
                      <Image
                        src={s.src}
                        alt={s.alt}
                        fill
                        sizes="(max-width: 768px) 70vw, 840px"
                        className="object-cover"
                        priority={isActive}
                        draggable={false}
                      />
                    </span>
                  </button>
                </div>
              );
            })}
          </div>

          {/* Arrows */}
          <button
            type="button"
            onClick={prev}
            aria-label="Previous slide"
            className="absolute left-3 top-1/2 z-10 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border backdrop-blur transition-transform hover:scale-105 sm:left-6"
            style={{
              borderColor: "var(--pro-border)",
              background: "var(--pro-bg-elev)",
              color: "var(--pro-fg)",
              boxShadow: "var(--pro-card-shadow)",
            }}
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={next}
            aria-label="Next slide"
            className="absolute right-3 top-1/2 z-10 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border backdrop-blur transition-transform hover:scale-105 sm:right-6"
            style={{
              borderColor: "var(--pro-border)",
              background: "var(--pro-bg-elev)",
              color: "var(--pro-fg)",
              boxShadow: "var(--pro-card-shadow)",
            }}
          >
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>

        {/* Caption for the active slide — prompt snippet + price + CTA */}
        <figure
          className="mx-auto mt-5 max-w-4xl overflow-hidden rounded-[16px] border"
          style={{
            borderColor: "var(--pro-border-soft)",
            background: "var(--pro-bg-elev)",
            boxShadow: "var(--pro-card-shadow)",
          }}
        >
          <figcaption className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <button
              type="button"
              onClick={() => setDialog(active)}
              className="pro-body truncate text-left text-[13.5px] underline-offset-4 hover:underline"
              style={{ color: "var(--pro-muted)" }}
              aria-label={`View the exact prompt for: ${active.alt}`}
            >
              &ldquo;{snippet(active.prompt)}&rdquo;
            </button>
            <div className="flex shrink-0 items-center gap-3">
              <span
                className="pro-body rounded-full px-3 py-1.5 text-[13px] font-bold tabular-nums"
                style={{
                  background: "var(--pro-bg-sunken)",
                  color: "var(--pro-fg)",
                  border: "1px solid var(--pro-border-soft)",
                }}
              >
                {active.price} · one image
              </span>
              <Link
                href={active.href}
                className="pro-body inline-flex min-h-[40px] items-center gap-1.5 text-[13.5px] font-semibold"
                style={{ color: "var(--pro-accent)" }}
              >
                Make one like this
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </figcaption>
        </figure>

        {/* Dots */}
        <div className="mt-5 flex items-center justify-center gap-2" role="tablist" aria-label="Slides">
          {slides.map((s, i) => (
            <button
              key={s.src}
              type="button"
              role="tab"
              aria-selected={i === activeIdx}
              aria-label={`Go to slide ${i + 1}: ${s.alt}`}
              onClick={() => go(i + 1)}
              className="h-2 rounded-full transition-all"
              style={{
                width: i === activeIdx ? 26 : 8,
                background:
                  i === activeIdx ? "var(--pro-accent)" : "var(--pro-border)",
              }}
            />
          ))}
        </div>
      </div>

      <PromptDialog
        item={
          dialog
            ? {
                src: dialog.src,
                alt: dialog.alt,
                prompt: dialog.prompt,
                price: dialog.price,
                badge: "Featured",
                href: dialog.href,
              }
            : null
        }
        onClose={() => setDialog(null)}
      />
    </Reveal>
  );
}
