"use client"

import { useEffect, useRef } from "react"
import { usePrefersReducedMotion } from "@/src/lib/motion/theme"

interface HeroVideoProps {
  className?: string
  src?: string
  poster?: string
}

/**
 * Ambient hero video background — pure brand atmosphere, never presented as
 * a customer creation (aria-hidden on the whole block).
 *
 * - `preload="metadata"` + poster-first: the poster paints instantly, the
 *   video fades in when decoded (LCP-conscious, video is decorative).
 * - Pauses via IntersectionObserver when the hero scrolls off-screen, and
 *   when the tab is hidden.
 * - prefers-reduced-motion → renders only the poster image, no autoplay.
 * - Dark legibility veils (radial + bottom gradient) keep headline text
 *   readable over the loop.
 */
export default function HeroVideo({
  className,
  src = "/hero-loop.mp4",
  poster = "/hero-loop-poster.jpg",
}: HeroVideoProps) {
  const reduced = usePrefersReducedMotion()
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (reduced) return
    const video = videoRef.current
    if (!video) return

    // React's `muted` prop doesn't always serialize to the attribute; set the
    // property directly so autoplay is allowed everywhere.
    video.muted = true

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            void video.play().catch(() => {
              /* autoplay blocked — poster stays visible */
            })
          } else {
            video.pause()
          }
        }
      },
      { threshold: 0.05 }
    )
    io.observe(video)

    const onVisibility = () => {
      if (document.hidden) video.pause()
      else void video.play().catch(() => {})
    }
    document.addEventListener("visibilitychange", onVisibility)

    return () => {
      io.disconnect()
      document.removeEventListener("visibilitychange", onVisibility)
    }
  }, [reduced])

  // Reduced motion: calm static poster, no video element at all.
  if (reduced) {
    return (
      <div className={className} aria-hidden="true">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={poster}
          alt=""
          className="h-full w-full object-cover"
          loading="eager"
          decoding="async"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_42%,transparent_0%,rgba(8,8,8,0.55)_100%)]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-b from-transparent to-[#080808]"
        />
      </div>
    )
  }

  return (
    <div className={className} aria-hidden="true">
      <video
        ref={videoRef}
        className="h-full w-full object-cover"
        muted
        autoPlay
        loop
        playsInline
        preload="metadata"
        poster={poster}
        disablePictureInPicture
        tabIndex={-1}
      >
        <source src={src} type="video/mp4" />
      </video>
      {/* legibility veils + blend into the next section */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_42%,transparent_0%,rgba(8,8,8,0.55)_100%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-b from-transparent to-[#080808]"
      />
    </div>
  )
}
