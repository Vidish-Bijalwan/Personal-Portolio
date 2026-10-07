"use client"

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { MOTION, usePrefersReducedMotion } from "@/src/lib/motion/theme"

interface CarouselProps {
  ariaLabel: string
  className?: string
  children: ReactNode
}

/**
 * Horizontal scroll-snap carousel with prev/next buttons.
 * Buttons disable at the track ends, arrows keys work when the track is
 * focused, and reduced motion removes smooth scrolling (instant jump).
 */
export default function Carousel({ ariaLabel, className, children }: CarouselProps) {
  const reduced = usePrefersReducedMotion()
  const trackRef = useRef<HTMLDivElement>(null)
  const [canPrev, setCanPrev] = useState(false)
  const [canNext, setCanNext] = useState(false)

  const updateEnds = useCallback(() => {
    const track = trackRef.current
    if (!track) return
    const { scrollLeft, scrollWidth, clientWidth } = track
    setCanPrev(scrollLeft > 4)
    setCanNext(scrollLeft < scrollWidth - clientWidth - 4)
  }, [])

  useEffect(() => {
    updateEnds()
    const track = trackRef.current
    if (!track) return
    track.addEventListener("scroll", updateEnds, { passive: true })
    window.addEventListener("resize", updateEnds)
    return () => {
      track.removeEventListener("scroll", updateEnds)
      window.removeEventListener("resize", updateEnds)
    }
  }, [updateEnds])

  const scrollPage = useCallback(
    (dir: 1 | -1) => {
      const track = trackRef.current
      if (!track) return
      track.scrollBy({
        left: dir * track.clientWidth * 0.9,
        behavior: reduced ? "auto" : "smooth",
      })
    },
    [reduced]
  )

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault()
      scrollPage(-1)
    } else if (e.key === "ArrowRight") {
      e.preventDefault()
      scrollPage(1)
    }
  }

  const btnBase =
    "flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/5 text-[#F5F5F3] backdrop-blur-sm transition-opacity disabled:cursor-not-allowed disabled:opacity-30 hover:bg-white/10"

  return (
    <section aria-roledescription="carousel" aria-label={ariaLabel} className={className}>
      <div className="flex items-center justify-end gap-2 pb-3">
        <button
          type="button"
          className={btnBase}
          aria-label="Previous slide"
          disabled={!canPrev}
          onClick={() => scrollPage(-1)}
        >
          <ChevronLeft className="h-5 w-5" aria-hidden="true" />
        </button>
        <button
          type="button"
          className={btnBase}
          aria-label="Next slide"
          disabled={!canNext}
          onClick={() => scrollPage(1)}
        >
          <ChevronRight className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>
      <div
        ref={trackRef}
        role="group"
        tabIndex={0}
        aria-label={`${ariaLabel} — use left and right arrow keys to move`}
        onKeyDown={onKeyDown}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-1 outline-none focus-visible:ring-2 focus-visible:ring-[var(--pro-accent)]/60"
        style={{ scrollbarWidth: "none", scrollBehavior: reduced ? "auto" : undefined }}
      >
        {children}
      </div>
    </section>
  )
}
