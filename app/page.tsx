"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  BadgeCheck,
  Image as ImageIcon,
  Play,
  RefreshCcw,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Tag,
  type LucideIcon,
} from "lucide-react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
} from "framer-motion";
import VilishNav from "@/components/vilish/nav";
import VilishFooter from "@/components/vilish/footer";
import Composer from "@/components/vilish/composer";
import Lightbox, { type LightboxItem } from "@/components/vilish/lightbox";
import { exampleHref, type ExampleServiceId } from "@/components/vilish/examples";
import { PRICE_CATALOG, priceOf } from "@/src/lib/pricing/catalog";
import { formatINR } from "@/src/lib/vilish/types";
import GenerativeField from "@/components/motion/GenerativeField";
import HeroVideo from "@/components/motion/HeroVideo";
import FlyingElements from "@/components/motion/FlyingElements";
import Reveal from "@/components/motion/Reveal";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import Counter from "@/components/motion/Counter";
import Marquee from "@/components/motion/Marquee";
import MagneticButton from "@/components/motion/MagneticButton";
import Carousel from "@/components/motion/Carousel";
import { EASE_OUT, MOTION, usePrefersReducedMotion } from "@/src/lib/motion/theme";

const TRUST = [
  { icon: Tag, label: "No subscription" },
  { icon: BadgeCheck, label: "Exact price first" },
  { icon: RefreshCcw, label: "Cheap remakes" },
  { icon: ShieldCheck, label: "Failed renders refunded" },
];

const FLOW = [
  { step: "Describe", desc: "Describe the image you want in plain words." },
  { step: "See price", desc: "The exact price is shown before you commit." },
  { step: "Pay once", desc: "One UPI payment. No subscription." },
  { step: "Download", desc: "Download your creation once it passes QC." },
];

/* Rendered from the canonical price catalog — never hardcode prices here. */
const TEASER = PRICE_CATALOG.filter((p) =>
  ["single-image", "pack-4", "product-photo", "clip-5s", "video-studio"].includes(p.id),
).map((p) => ({
  label: p.id === "video-studio" ? "Video Studio job" : p.label,
  price: formatINR(p.paise),
}));

/** Homepage example — service pins the catalog product the price/CTA derive from. */
interface HomeExample {
  src: string;
  caption: string;
  prompt?: string;
  price: string;
  service: ExampleServiceId;
  width?: number;
  height?: number;
  alt?: string;
  frame?: string;
}

/** Showreel: six unique examples, zero overlap with the Showcase section (9, 10, 1, 2).
 *  Frames vary in height so the strip reads as a living reel, not a tile grid. */
const SHOWREEL: HomeExample[] = [
  {
    src: "/examples/5-watch-ad.webp",
    width: 1920,
    height: 1280,
    alt: "Steel chronograph watch floating in a dark studio with dramatic rim light — AI-generated example",
    caption: "Floating chronograph, dramatic rim light",
    prompt:
      "Studio product shot of a steel chronograph floating in a dark studio, dramatic rim light tracing the case, deep shadows, luxury watch advertising.",
    price: formatINR(priceOf("product-photo")),
    service: "product-photo",
    frame: "h-36 sm:h-48",
  },
  {
    src: "/examples/6-movie-poster.webp",
    width: 1344,
    height: 1792,
    alt: "Lone astronaut before a colossal alien monolith, 1980s poster style — AI-generated example",
    caption: "Astronaut before the monolith",
    prompt:
      "Painterly 1980s movie poster of a lone astronaut standing before a colossal alien monolith, dramatic scale, retro sci-fi illustration style.",
    price: formatINR(priceOf("single-image")),
    service: "single-image",
    frame: "h-52 sm:h-72",
  },
  {
    src: "/examples/7-pet-portrait.webp",
    width: 1600,
    height: 1600,
    alt: "Golden retriever in a dark studio with Rembrandt lighting — AI-generated example",
    caption: "Golden retriever, Rembrandt light",
    prompt:
      "Fine-art studio portrait of a golden retriever in a dark room, Rembrandt lighting sculpting the fur, soulful eyes, museum-grade pet photography.",
    price: formatINR(priceOf("single-image")),
    service: "single-image",
    frame: "h-44 sm:h-60",
  },
  {
    src: "/examples/8-sportscar.webp",
    width: 1920,
    height: 1280,
    alt: "Sports car on a rain-wet street at night with neon reflections — AI-generated example",
    caption: "Neon night, wet asphalt",
    prompt:
      "Sports car parked on a rain-wet street at night, neon signs reflected in the wet asphalt, cinematic night photography, moody atmosphere.",
    price: formatINR(priceOf("single-image")),
    service: "single-image",
    frame: "h-32 sm:h-44",
  },
  {
    src: "/examples/3-travel-poster.webp",
    width: 1344,
    height: 1792,
    alt: "Himalayan peaks at dawn with a tiny trekker silhouette, vintage poster style — AI-generated example",
    caption: "Himalayan dawn, tiny trekker",
    prompt:
      "Epic travel poster of Himalayan peaks at dawn, dramatic clouds, tiny trekker silhouette, vintage adventure poster aesthetic.",
    price: formatINR(priceOf("single-image")),
    service: "single-image",
    frame: "h-48 sm:h-64",
  },
  {
    src: "/examples/4-food-photo.webp",
    width: 1600,
    height: 1600,
    alt: "Gourmet burger with melting cheese on dark slate, dramatic side lighting — AI-generated example",
    caption: "Burger, dramatic side light",
    prompt:
      "Overhead food photography of a gourmet burger with melting cheese on dark slate, dramatic side lighting, restaurant advertising style.",
    price: formatINR(priceOf("product-photo")),
    service: "product-photo",
    frame: "h-44 sm:h-60",
  },
];

/** Accent rotation across the reel: lime → cyan → magenta. */
const REEL_ACCENTS = ["#D7FF3F", "#00F0FF", "#FF2D78"];

const SHOWCASE: HomeExample[] = [
  {
    src: "/examples/9-fashion-editorial.webp",
    width: 1280,
    height: 1920,
    alt: "High-fashion model with sculptural black spiked hair in a charcoal studio — AI-generated example",
    caption: "Fashion editorial, sculptural hair",
    price: formatINR(priceOf("single-image")),
    service: "single-image",
  },
  {
    src: "/examples/10-perfume-ad.webp",
    width: 1600,
    height: 1600,
    alt: "Faceted glass perfume bottle with golden liquid — AI-generated example",
    caption: "Golden perfume, faceted glass",
    price: formatINR(priceOf("product-photo")),
    service: "product-photo",
  },
  {
    src: "/examples/1-sneaker-ad.webp",
    width: 1920,
    height: 1280,
    alt: "Sneaker floating in a dark studio with dramatic rim lighting — AI-generated example",
    caption: "Floating sneaker, studio shot",
    price: formatINR(priceOf("single-image")),
    service: "single-image",
  },
  {
    src: "/examples/2-neon-portrait.webp",
    width: 1280,
    height: 1920,
    alt: "Stylized portrait with neon city lights reflected in her eyes — AI-generated example",
    caption: "Neon portrait, city lights",
    price: formatINR(priceOf("single-image")),
    service: "single-image",
  },
];

/** Lightbox item shapes for the homepage sets (arrows navigate within each set). */
const REEL_ITEMS: LightboxItem[] = SHOWREEL.map((ex) => ({
  src: ex.src,
  caption: ex.caption,
  price: ex.price,
  alt: ex.alt,
}));
const CASE_ITEMS: LightboxItem[] = SHOWCASE.map((ex) => ({
  src: ex.src,
  caption: ex.caption,
  price: ex.price,
  alt: ex.alt,
}));

const STATS = [
  { to: 2400, suffix: "+", prefix: "", decimals: 0, label: "creations delivered" },
  { to: 3, suffix: " min", prefix: "≈", decimals: 0, label: "median turnaround" },
  { to: 99, suffix: "%", prefix: "", decimals: 0, label: "QC pass rate" },
];

interface Capability {
  icon: LucideIcon;
  title: string;
  desc: string;
  price: string;
  href: string;
}

const CAPABILITIES: Capability[] = [
  {
    icon: ImageIcon,
    title: "Image",
    desc: "Anything you can describe — portraits, posters, concepts, scenes. Studio-grade renders, priced per piece.",
    price: `from ${formatINR(priceOf("single-image"))}`,
    href: "/create",
  },
  {
    icon: SlidersHorizontal,
    title: "Edit",
    desc: "Retouch, restyle, recolor, remove backgrounds. Your photo, transformed exactly as you brief it.",
    price: `from ${formatINR(priceOf("single-image"))}`,
    href: "/create",
  },
  {
    icon: Sparkles,
    title: "Ad",
    desc: "Product shots and campaign creatives that look shot in a studio — without booking a studio.",
    price: `from ${formatINR(priceOf("product-photo"))}`,
    href: "/create",
  },
];

const FORMATS = [
  { ratio: "1:1", w: 1, h: 1, tag: "Feed & profile", dims: "1080 × 1080", accent: "#D7FF3F" },
  { ratio: "4:5", w: 4, h: 5, tag: "Portraits", dims: "1080 × 1350", accent: "#00F0FF" },
  { ratio: "9:16", w: 9, h: 16, tag: "Reels & stories", dims: "1080 × 1920", accent: "#FF2D78" },
  { ratio: "16:9", w: 16, h: 9, tag: "Banners & covers", dims: "1920 × 1080", accent: "#D7FF3F" },
];

/**
 * Interactive ratio picker: each card stages an animated frame that morphs
 * (spring-animated width/height) to the format's true ratio on hover or
 * select, lit in the format's accent color. The readout below stays live so
 * the choice always has context. Reduced motion → static frames, same info.
 */
function FormatLab() {
  const reduced = usePrefersReducedMotion();
  const [activeIdx, setActiveIdx] = useState(2);
  const active = FORMATS[activeIdx];

  return (
    <div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4" role="group" aria-label="Choose an aspect ratio">
        {FORMATS.map((f, i) => {
          const selected = i === activeIdx;
          // Fit the true ratio inside a fixed stage budget.
          const s = Math.min(118 / f.w, 92 / f.h);
          const bw = Math.max(18, Math.round(f.w * s));
          const bh = Math.max(18, Math.round(f.h * s));
          const frame = reduced ? (
            <span
              className="relative rounded-[5px] border-2"
              style={{
                width: bw,
                height: bh,
                borderColor: selected ? f.accent : "rgba(255,255,255,0.20)",
                background: `${f.accent}14`,
                boxShadow: selected ? `0 0 26px -6px ${f.accent}99` : "none",
              }}
            />
          ) : (
            <motion.span
              className="relative rounded-[5px] border-2"
              initial={false}
              animate={{
                width: bw,
                height: bh,
                borderColor: selected ? f.accent : "rgba(255,255,255,0.20)",
                backgroundColor: selected ? `${f.accent}22` : `${f.accent}0d`,
                boxShadow: selected
                  ? `0 0 26px -6px ${f.accent}99, inset 0 0 20px -12px ${f.accent}`
                  : "0 0 0px 0px rgba(0,0,0,0), inset 0 0 0px 0px rgba(0,0,0,0)",
              }}
              transition={MOTION.springs.ui}
              style={{ display: "block" }}
            />
          );
          return (
            <button
              key={f.ratio}
              type="button"
              onClick={() => setActiveIdx(i)}
              onMouseEnter={() => setActiveIdx(i)}
              onFocus={() => setActiveIdx(i)}
              aria-pressed={selected}
              aria-label={`Aspect ratio ${f.ratio}, ${f.tag}`}
              className={`group flex flex-col items-center rounded-2xl border bg-white/[0.02] px-3 pb-4 pt-5 outline-none transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-[#D7FF3F] motion-reduce:transition-none ${
                selected ? "border-white/[0.22] bg-white/[0.045]" : "border-white/[0.08] hover:border-white/[0.18]"
              }`}
            >
              <span className="flex h-[104px] items-center justify-center" aria-hidden>
                {frame}
              </span>
              <span className="mt-3 text-[15px] font-semibold tabular-nums text-[#F5F5F3]">
                {f.ratio}
              </span>
              <span className="mt-0.5 text-[12px] text-white/50">{f.tag}</span>
            </button>
          );
        })}
      </div>
      <div aria-live="polite" className="mt-7 text-center">
        <p className="flex flex-wrap items-baseline justify-center gap-x-3 gap-y-1">
          <span
            className="font-display text-[17px] font-semibold tabular-nums"
            style={{ color: active.accent }}
          >
            {active.ratio}
          </span>
          <span className="text-[13.5px] text-white/60">
            {active.tag} · {active.dims} px
          </span>
        </p>
        <p className="mt-2 text-[12px] text-white/35">
          Pick the ratio when you order — no resizes, no surprises.
        </p>
      </div>
    </div>
  );
}

const FAQS = [
  {
    q: "How much does it cost to generate one AI image in India?",
    a: `At Pixaura, a single AI image costs a fixed ${formatINR(priceOf("single-image"))} — no subscription, no credits to manage. You see the exact price before you pay, and you pay once with UPI.`,
  },
  {
    q: "Is there an AI image generator without a subscription?",
    a: `Yes. Unlike monthly AI subscriptions, Pixaura is pay-per-creation: you pay only for the images you actually want, starting at ${formatINR(priceOf("single-image"))} each. Nothing renews, nothing auto-charges.`,
  },
  {
    q: "Can I pay with UPI for AI image generation?",
    a: "Yes — every order is paid with a simple UPI payment. After you approve the quoted price, you get a QR code, pay from any UPI app, and submit your transaction ID.",
  },
  {
    q: "How is Pixaura different from free AI image generators?",
    a: "Free tools make you do the prompting, editing, and fixing yourself — and often add watermarks or daily limits. At Pixaura you describe what you want, a human reviews the result for quality, and you download a clean, finished image.",
  },
  {
    q: "Do I own the images I generate? Can I use them commercially?",
    a: `Yes. Once delivered, the image is yours — use it for your shop, listings, social media, or client work. Seller tip: our ${formatINR(priceOf("product-photo"))} product-photo tier is built for Amazon, Flipkart, and Meesho listings.`,
  },
  {
    q: "How long does it take to get my image?",
    a: "Most orders are delivered within 24 hours. Every creation passes a human quality check before download, so you're never stuck with a bad render.",
  },
  {
    q: "Can I use my own photo as a reference?",
    a: "Yes — upload your photo (or any reference file: PDF, document, or image) with your order, and it will guide the creation. Portraits, product shots, and restorations all work best with a reference.",
  },
];

/** FAQPage structured data matching the visible FAQ section above. */
const FAQ_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQS.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

/** Video section: three themed categories, one clip each, each with its own
 *  accent color and motion treatment. Clips are honest AI video examples. */
const VIDEO_CATS = [
  {
    id: "portraits",
    label: "Portraits",
    accent: "#FF2D78",
    blurb: "Character loops and living portraits — stills that breathe.",
    bullets: ["5s loop · 9:16 vertical", "Animated from a single image", `${formatINR(priceOf("clip-5s"))} per clip`],
    clip: {
      src: "/examples/videos/clip-1-portrait.mp4",
      poster: "/examples/videos/poster-1-portrait.jpg",
      alt: "AI video example: stylized neon portrait animating in a 5s loop — made with Pixaura",
      caption: "Neon portrait, in motion",
      price: formatINR(priceOf("clip-5s")),
    },
  },
  {
    id: "product",
    label: "Product",
    accent: "#D7FF3F",
    blurb: "Product shots with slow cinematic motion — built for listings and ads.",
    bullets: ["5s loop · 9:16 vertical", "Studio-light drift and rotation", `${formatINR(priceOf("clip-5s"))} per clip`],
    clip: {
      src: "/examples/videos/clip-2-product.mp4",
      poster: "/examples/videos/poster-2-product.jpg",
      alt: "AI video example: premium product shot with slow cinematic motion — made with Pixaura",
      caption: "Product shot, in motion",
      price: formatINR(priceOf("clip-5s")),
    },
  },
  {
    id: "cinematic",
    label: "Cinematic",
    accent: "#00F0FF",
    blurb: "Atmospheric scenes with a drifting camera — mood you can feel.",
    bullets: ["5s loop · 9:16 vertical", "Aerial-style slow push", `${formatINR(priceOf("clip-5s"))} per clip`],
    clip: {
      src: "/examples/videos/clip-3-city.mp4",
      poster: "/examples/videos/poster-3-city.jpg",
      alt: "AI video example: cinematic night cityscape with slow aerial motion — made with Pixaura",
      caption: "Night city, in motion",
      price: formatINR(priceOf("clip-5s")),
    },
  },
];

/** Lightbox items for the three video examples (arrows move within the set). */
const VIDEO_ITEMS: LightboxItem[] = VIDEO_CATS.map((c) => ({
  src: c.clip.src,
  poster: c.clip.poster,
  caption: c.clip.caption,
  price: c.clip.price,
  alt: c.clip.alt,
  badge: "5s clip",
  kind: "video",
}));

/**
 * One themed video card: poster paints first (preload="metadata"), the clip
 * autoplays muted on hover (desktop) and pauses off-hover; tap/click opens
 * the full player in the shared lightbox. Reduced motion → poster only.
 */
function VideoCard({
  clip,
  accent,
  onOpen,
}: {
  clip: (typeof VIDEO_CATS)[number]["clip"];
  accent: string;
  onOpen: () => void;
}) {
  const reduced = usePrefersReducedMotion();
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (reduced) return;
    const onVisibility = () => {
      const v = videoRef.current;
      if (!v) return;
      if (document.hidden) v.pause();
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [reduced]);

  const play = () => {
    if (reduced) return;
    void videoRef.current?.play().catch(() => {});
  };
  const stop = () => {
    const v = videoRef.current;
    if (v) {
      v.pause();
      v.currentTime = 0;
    }
  };

  return (
    <button
      type="button"
      onClick={onOpen}
      onMouseEnter={play}
      onMouseLeave={stop}
      aria-label={`Watch full video: ${clip.caption}`}
      className="group relative block w-[64vw] max-w-[250px] shrink-0 cursor-pointer overflow-hidden rounded-2xl border text-left outline-none transition-transform duration-300 ease-out focus-visible:ring-2 focus-visible:ring-[#D7FF3F] focus-visible:ring-offset-2 focus-visible:ring-offset-[#080808] motion-reduce:transition-none sm:w-[250px]"
      style={{
        borderColor: `${accent}55`,
        boxShadow: `0 0 70px -22px ${accent}66, 0 18px 44px -22px rgba(0,0,0,0.9)`,
      }}
    >
      <span className="relative block aspect-[9/16] overflow-hidden bg-white/[0.03]">
        {reduced ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={clip.poster}
            alt={clip.alt}
            className="h-full w-full object-cover"
            loading="lazy"
            decoding="async"
          />
        ) : (
          <video
            ref={videoRef}
            className="h-full w-full object-cover"
            muted
            loop
            playsInline
            preload="metadata"
            poster={clip.poster}
            aria-label={clip.alt}
            disablePictureInPicture
          >
            <source src={clip.src} type="video/mp4" />
          </video>
        )}
        <span className="absolute left-3 top-3 rounded-full border border-white/[0.14] bg-black/70 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.08em] text-[#F5F5F3] backdrop-blur-sm">
          AI video example
        </span>
        <span className="absolute bottom-3 right-3 rounded-full bg-black/70 px-2.5 py-1 text-[12px] font-semibold tabular-nums text-[#F5F5F3] backdrop-blur-sm">
          {clip.price}
        </span>
        {/* hover affordance: preview on hover, full player on click */}
        <span
          aria-hidden
          className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-2 bg-gradient-to-t from-black/85 to-transparent pb-4 pt-10 text-[12px] font-medium text-white/85 opacity-0 transition-opacity duration-250 group-hover:opacity-100 group-focus-visible:opacity-100 motion-reduce:transition-none"
        >
          <Play className="h-3.5 w-3.5" strokeWidth={2} />
          Tap to watch full
        </span>
      </span>
    </button>
  );
}

/**
 * Tabbed video showcase: Portraits / Product / Cinematic, each themed with
 * its own accent color and glow. Tab switch cross-fades the panel; the
 * accent-tinted frame re-themes with it. Mobile: scrollable tab row.
 */
function VideoShowcase() {
  const reduced = usePrefersReducedMotion();
  const [activeId, setActiveId] = useState(VIDEO_CATS[0].id);
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const activeIdx = VIDEO_CATS.findIndex((c) => c.id === activeId);
  const active = VIDEO_CATS[activeIdx] ?? VIDEO_CATS[0];

  const panel = (
    <div key={active.id} className="grid grid-cols-1 items-center gap-8 sm:grid-cols-[250px_1fr] sm:gap-12">
      <div className="flex justify-center sm:justify-start">
        <VideoCard
          clip={active.clip}
          accent={active.accent}
          onOpen={() => setOpenIdx(activeIdx)}
        />
      </div>
      <div>
        <p
          className="text-[11px] font-semibold uppercase tracking-[0.3em]"
          style={{ color: active.accent }}
        >
          {active.label}
        </p>
        <h3 className="font-display mt-2 text-[22px] font-semibold tracking-[-0.01em] text-[#F5F5F3] sm:text-[26px]">
          {active.clip.caption}
        </h3>
        <p className="mt-2 max-w-md text-[14px] leading-6 text-white/55">
          {active.blurb}
        </p>
        <ul className="mt-4 space-y-2">
          {active.bullets.map((b) => (
            <li key={b} className="flex items-center gap-2.5 text-[13.5px] text-white/65">
              <span
                aria-hidden
                className="h-1.5 w-1.5 shrink-0 rounded-full"
                style={{ background: active.accent, boxShadow: `0 0 8px ${active.accent}` }}
              />
              {b}
            </li>
          ))}
        </ul>
        <div className="mt-6">
          <Link
            href="/create?media=video"
            className="inline-flex items-center gap-2 rounded-[12px] px-6 py-3 text-[14px] font-semibold text-[#080808] transition-transform duration-200 hover:scale-[1.03] motion-reduce:transition-none"
            style={{ background: active.accent }}
          >
            Make yours — {formatINR(priceOf("clip-5s"))} <ArrowRight className="h-4 w-4" strokeWidth={2} />
          </Link>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      {/* tab row */}
      <div
        role="tablist"
        aria-label="Video categories"
        className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:justify-center sm:px-0"
      >
        {VIDEO_CATS.map((c) => {
          const selected = c.id === activeId;
          return (
            <button
              key={c.id}
              role="tab"
              aria-selected={selected}
              onClick={() => setActiveId(c.id)}
              className={`relative shrink-0 rounded-full px-5 py-2.5 text-[13.5px] font-medium outline-none transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-[#D7FF3F] motion-reduce:transition-none ${
                selected ? "text-[#080808]" : "text-white/60 hover:text-white/90"
              }`}
            >
              {selected && !reduced && (
                <motion.span
                  layoutId="video-tab-pill"
                  className="absolute inset-0 rounded-full"
                  style={{ background: c.accent }}
                  transition={MOTION.springs.snap}
                />
              )}
              {selected && reduced && (
                <span
                  aria-hidden
                  className="absolute inset-0 rounded-full"
                  style={{ background: c.accent }}
                />
              )}
              {!selected && (
                <span
                  aria-hidden
                  className="absolute inset-0 rounded-full border border-white/[0.12] bg-white/[0.03]"
                />
              )}
              <span className="relative">{c.label}</span>
            </button>
          );
        })}
      </div>

      {/* panel */}
      <div className="mt-10 sm:mt-12">
        {reduced ? (
          panel
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={active.id}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: MOTION.durations.base, ease: EASE_OUT }}
            >
              {panel}
            </motion.div>
          </AnimatePresence>
        )}
      </div>

      {openIdx !== null && VIDEO_ITEMS[openIdx] && (
        <Lightbox
          items={VIDEO_ITEMS}
          index={openIdx}
          onClose={() => setOpenIdx(null)}
          onIndex={setOpenIdx}
        />
      )}
    </div>
  );
}

/** Standard eyebrow, used on every section header. */
function Eyebrow({ children }: { children: string }) {
  return (
    <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-white/45">
      {children}
    </p>
  );
}

/**
 * One showreel card: a clickable example frame with hover physics (springy
 * lift + accent glow) and a hover overlay that reveals the original prompt
 * plus the price. Reduced motion → static card, still clickable.
 */
function ReelCard({
  ex,
  index,
  onOpen,
}: {
  ex: (typeof SHOWREEL)[number];
  index: number;
  onOpen: () => void;
}) {
  const reduced = usePrefersReducedMotion();
  const accent = REEL_ACCENTS[index % REEL_ACCENTS.length];

  const card = (
    <figure className="w-[200px] shrink-0 sm:w-[260px]">
      <button
        type="button"
        onClick={onOpen}
        aria-label={`Open example: ${ex.caption}`}
        className="group block w-full cursor-pointer rounded-xl text-left outline-none focus-visible:ring-2 focus-visible:ring-[#D7FF3F] focus-visible:ring-offset-2 focus-visible:ring-offset-[#080808]"
      >
        <span
          className={`relative block ${ex.frame} overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.03] transition-colors duration-300 group-hover:border-white/[0.22] motion-reduce:transition-none`}
        >
          <Image
            src={ex.src}
            alt={ex.alt ?? ex.caption}
            width={ex.width}
            height={ex.height}
            sizes="(max-width: 640px) 200px, 260px"
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.07] motion-reduce:transition-none"
          />
          {/* hover caption: the prompt that made it + its price */}
          <span
            aria-hidden
            className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/92 via-black/40 to-transparent p-3 opacity-0 transition-opacity duration-250 group-hover:opacity-100 group-focus-visible:opacity-100 motion-reduce:transition-none"
          >
            <span
              className="text-[10px] font-semibold uppercase tracking-[0.16em]"
              style={{ color: accent }}
            >
              Prompt
            </span>
            <span className="mt-1 line-clamp-3 text-[11.5px] leading-5 text-white/85">
              {ex.prompt}
            </span>
            <span className="mt-2 flex items-center justify-between">
              <span className="rounded-full bg-white/10 px-2 py-0.5 text-[11px] font-semibold tabular-nums text-white backdrop-blur-sm">
                {ex.price}
              </span>
              <span className="text-[11px] font-medium text-white/70">⤢ View</span>
            </span>
          </span>
        </span>
      </button>
      <figcaption className="mt-2.5 px-0.5">
        <span className="flex items-center justify-between gap-2">
          <span className="truncate text-[12px] text-white/50">{ex.caption}</span>
          <span className="shrink-0 rounded-full border border-white/[0.12] px-2 py-px text-[11px] font-semibold tabular-nums text-[#F5F5F3]">
            {ex.price}
          </span>
        </span>
        <Link
          href={exampleHref(ex)}
          aria-label={`Make one like this: ${ex.caption}`}
          className="mt-0.5 inline-flex min-h-[32px] items-center gap-1 text-[11px] font-semibold text-[#D7FF3F] transition-opacity hover:opacity-80"
        >
          Make one like this <ArrowRight className="h-3 w-3" strokeWidth={2.2} />
        </Link>
      </figcaption>
    </figure>
  );

  if (reduced) return card;

  return (
    <motion.div
      whileHover={{
        y: -8,
        scale: 1.025,
        boxShadow: `0 22px 60px -20px ${accent}73`,
      }}
      transition={MOTION.springs.ui}
      style={{ boxShadow: "0 0px 0px 0px rgba(0,0,0,0)", borderRadius: 14 }}
      className="shrink-0"
    >
      {card}
    </motion.div>
  );
}

/** Per-card accent: Image → lime, Edit → cyan, Ad → magenta. */
const CAP_ACCENTS = ["#D7FF3F", "#00F0FF", "#FF2D78"];

/**
 * Capability portal card: gradient border, oversized glowing icon, and an
 * accent-wash "portal" glow that floods the card on hover. Stepping in takes
 * you to /create. Reduced motion → static card, still a real link.
 */
function BentoCard({ cap, accent }: { cap: Capability; accent: string }) {
  const reduced = usePrefersReducedMotion();

  const card = (
    <Link
      href={cap.href}
      aria-label={`Create: ${cap.title}`}
      className="group relative block h-full rounded-2xl p-px outline-none focus-visible:ring-2 focus-visible:ring-[#D7FF3F] focus-visible:ring-offset-2 focus-visible:ring-offset-[#080808]"
      style={{
        background: `linear-gradient(140deg, ${accent}66 0%, rgba(255,255,255,0.09) 36%, rgba(255,255,255,0.04) 64%, ${accent}40 100%)`,
      }}
    >
      <span className="relative flex h-full flex-col justify-between overflow-hidden rounded-[15px] bg-[#0B0B0C] p-6 sm:p-7">
        {/* portal glow: accent wash blooming from the corner on hover */}
        <span
          aria-hidden
          className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100 motion-reduce:transition-none"
          style={{ background: `${accent}38` }}
        />
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-8 bottom-0 h-px opacity-0 transition-opacity duration-500 group-hover:opacity-100 motion-reduce:transition-none"
          style={{ background: `linear-gradient(90deg, transparent, ${accent}88, transparent)` }}
        />
        <span className="relative flex items-start justify-between">
          <span
            className="flex h-14 w-14 items-center justify-center rounded-2xl border bg-white/[0.03] transition-transform duration-300 ease-out group-hover:-translate-y-1.5 group-hover:scale-[1.06] motion-reduce:transition-none"
            style={{
              borderColor: `${accent}59`,
              boxShadow: `0 0 28px -8px ${accent}73`,
            }}
          >
            <cap.icon
              className="h-7 w-7"
              style={{ color: accent }}
              strokeWidth={1.6}
              aria-hidden
            />
          </span>
          <span className="rounded-full border border-white/[0.12] bg-white/[0.03] px-3 py-1 text-[13px] font-semibold tabular-nums text-[#F5F5F3]">
            {cap.price}
          </span>
        </span>
        <span className="relative mt-10 block">
          <h3 className="font-display text-[21px] font-semibold tracking-[-0.01em] text-[#F5F5F3]">
            {cap.title}
          </h3>
          <p className="mt-2 text-[14px] leading-6 text-white/55">{cap.desc}</p>
        </span>
        <span
          className="relative mt-10 inline-flex items-center gap-2 text-[14px] font-semibold"
          style={{ color: accent }}
        >
          Step in
          <ArrowRight
            className="h-4 w-4 transition-transform duration-300 ease-out group-hover:translate-x-1.5 motion-reduce:transition-none"
            strokeWidth={2}
            aria-hidden
          />
        </span>
      </span>
    </Link>
  );

  if (reduced) return card;

  return (
    <motion.div
      className="h-full"
      whileHover={{ y: -8, scale: 1.015 }}
      transition={MOTION.springs.ui}
    >
      {card}
    </motion.div>
  );
}

function HowItWorksProgress() {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.85", "end 0.55"],
  });
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 30, mass: 0.4 });

  return (
    <div ref={ref} className="relative">
      {/* progress line (desktop) */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-[26px] hidden h-px bg-white/[0.08] sm:block"
      >
        {reduced ? (
          <div className="h-full w-full bg-[#D7FF3F]" />
        ) : (
          <motion.div className="h-full w-full origin-left bg-[#D7FF3F]" style={{ scaleX }} />
        )}
      </div>
      <Stagger className="grid grid-cols-1 gap-10 sm:grid-cols-4 sm:gap-6">
        {FLOW.map((f, i) => (
          <StaggerItem key={f.step} className="relative">
            <span
              aria-hidden
              className="relative z-10 inline-block bg-[#080808] pr-4 text-[44px] font-semibold leading-none tracking-[-0.02em] text-white/[0.92] tabular-nums sm:text-[52px]"
            >
              {String(i + 1).padStart(2, "0")}
            </span>
            <h3 className="mt-4 text-[17px] font-semibold text-[#F5F5F3]">{f.step}</h3>
            <p className="mt-1.5 max-w-[26ch] text-[14px] leading-6 text-white/55">{f.desc}</p>
          </StaggerItem>
        ))}
      </Stagger>
    </div>
  );
}

export default function VilishLanding() {
  // Lightbox open indexes — one per image set so arrows navigate within the set.
  const [reelOpen, setReelOpen] = useState<number | null>(null);
  const [caseOpen, setCaseOpen] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-[#080808] font-sans text-[#F5F5F3] antialiased">
      <VilishNav />

      <main>
        {/* ── hero ─────────────────────────────────────────── */}
        <section className="relative flex min-h-[100svh] flex-col overflow-hidden">
          {/* Video owns the hero — GenerativeField moved to the closing CTA. */}
          <HeroVideo className="absolute inset-0" />
          <FlyingElements className="absolute inset-0 z-[1]" density={0.7} />

          <div className="relative z-10 mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center px-4 pb-16 pt-28 text-center sm:pt-32">
            <Stagger className="flex flex-col items-center">
              <StaggerItem>
                <Eyebrow>Pay-per-creation AI studio</Eyebrow>
              </StaggerItem>
              <StaggerItem>
                <h1 className="font-display mt-5 text-[40px] font-semibold leading-[1.04] tracking-[-0.02em] sm:text-[64px] lg:text-[76px]">
                  One creation. <span className="v-iris-text">One price.</span>
                </h1>
              </StaggerItem>
              <StaggerItem>
                <p className="mx-auto mt-5 max-w-xl text-[15px] leading-7 text-white/[0.62] sm:text-[17px]">
                  Generate AI images without another monthly subscription. See the exact
                  price before you pay — from {formatINR(priceOf("single-image"))}.
                </p>
              </StaggerItem>
              <StaggerItem>
                <ul className="mt-7 flex flex-wrap items-center justify-center gap-x-6 gap-y-2.5">
                  {TRUST.map((t) => (
                    <li
                      key={t.label}
                      className="flex items-center gap-2 text-[13px] text-white/60"
                    >
                      <t.icon className="h-4 w-4 text-white/75" strokeWidth={1.8} />
                      {t.label}
                    </li>
                  ))}
                </ul>
              </StaggerItem>
            </Stagger>

            <Reveal delay={0.35} className="mt-9 w-full max-w-2xl">
              <Composer variant="hero" />
            </Reveal>
          </div>
        </section>

        {/* ── showreel strip ───────────────────────────────── */}
        <section aria-label="Example showreel" className="cv-auto border-b border-white/[0.08] py-10 sm:py-14">
          <div className="mx-auto max-w-5xl px-4">
            <Reveal>
              <Eyebrow>Showreel</Eyebrow>
              <h2 className="font-display mt-3 text-[26px] font-semibold tracking-[-0.01em] sm:text-[34px]">
                Fresh out of the <span className="text-[#D7FF3F]">render queue.</span>
              </h2>
            </Reveal>
          </div>
          <Reveal delay={0.1} className="mt-8">
            <Marquee speed={44} gap={16}>
              {SHOWREEL.map((ex, i) => (
                <ReelCard key={ex.src} ex={ex} index={i} onOpen={() => setReelOpen(i)} />
              ))}
            </Marquee>
          </Reveal>
          <p className="mt-6 text-center text-[12px] text-white/35">
            Example creations from Pixaura. Hover any frame for its prompt — tap to inspect it full-screen.
          </p>
        </section>

        {/* ── how it works (editorial band) ────────────────── */}
        <section
          aria-label="How it works"
          className="cv-auto border-b border-white/[0.08] bg-[#0B0B0C]"
        >
          <div className="mx-auto max-w-5xl px-4 py-20 sm:py-28">
            <Reveal>
              <div className="flex items-baseline gap-4">
                <span aria-hidden className="font-display text-[13px] font-semibold tracking-[0.2em] text-white/30">
                  01
                </span>
                <span aria-hidden className="h-px flex-1 bg-white/[0.08]" />
                <Eyebrow>How it works</Eyebrow>
              </div>
              <h2 className="font-display mt-6 max-w-[20ch] text-[30px] font-semibold leading-[1.12] tracking-[-0.01em] sm:text-[40px]">
                Four steps. <span className="text-[#00F0FF]">Zero commitment.</span>
              </h2>
            </Reveal>
            <div className="mt-12">
              <HowItWorksProgress />
            </div>
          </div>
        </section>

        {/* ── showcase ─────────────────────────────────────── */}
        <section aria-label="Example creations" className="cv-auto border-b border-white/[0.08] py-20 sm:py-28">
          <div className="mx-auto max-w-5xl px-4">
            <Reveal>
              <Eyebrow>Showcase</Eyebrow>
              <h2 className="font-display mt-3 text-[26px] font-semibold tracking-[-0.01em] sm:text-[34px]">
                Made here, <span className="text-[#FF2D78]">priced per piece.</span>
              </h2>
              <p className="mt-3 max-w-lg text-[14px] leading-6 text-white/50">
                Every piece below was ordered, reviewed by a human, and delivered.
                Yours can look like yours.
              </p>
            </Reveal>
          </div>
          <Reveal delay={0.1} className="mt-10">
            <Carousel ariaLabel="Example creations">
              {SHOWCASE.map((ex, i) => (
                <figure key={ex.src} className="w-[78vw] max-w-[420px] shrink-0 sm:w-[380px]">
                  <button
                    type="button"
                    onClick={() => setCaseOpen(i)}
                    aria-label={`Open example: ${ex.caption}`}
                    className="group block w-full cursor-pointer rounded-2xl text-left outline-none focus-visible:ring-2 focus-visible:ring-[#D7FF3F] focus-visible:ring-offset-2 focus-visible:ring-offset-[#080808]"
                  >
                    <span className="relative block aspect-[4/3] overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.03] transition-colors group-hover:border-white/[0.2]">
                      <Image
                        src={ex.src}
                        alt={ex.alt ?? ex.caption}
                        width={ex.width}
                        height={ex.height}
                        sizes="(max-width: 640px) 78vw, 380px"
                        priority={i === 0}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.04] motion-reduce:transition-none"
                      />
                      <span
                        aria-hidden
                        className="absolute inset-0 flex items-end justify-end p-3 opacity-0 transition-opacity duration-200 group-focus-visible:opacity-100 group-hover:opacity-100 motion-reduce:transition-none"
                      >
                        <span className="rounded-full bg-black/70 px-2.5 py-1 text-[11px] font-medium text-white/90 backdrop-blur-sm">
                          ⤢ Inspect
                        </span>
                      </span>
                    </span>
                  </button>
                  <figcaption className="mt-3 px-1">
                    <span className="flex items-baseline justify-between gap-3">
                      <span className="truncate text-[13px] text-white/55">{ex.caption}</span>
                      <span className="shrink-0 rounded-full border border-white/[0.12] px-2.5 py-0.5 text-[12px] font-semibold tabular-nums text-[#F5F5F3]">
                        {ex.price}
                      </span>
                    </span>
                    <Link
                      href={exampleHref(ex)}
                      aria-label={`Make one like this: ${ex.caption}`}
                      className="mt-1 inline-flex min-h-[36px] items-center gap-1 text-[12px] font-semibold text-[#D7FF3F] transition-opacity hover:opacity-80"
                    >
                      Make one like this <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.2} />
                    </Link>
                  </figcaption>
                </figure>
              ))}
            </Carousel>
          </Reveal>
          <Reveal delay={0.15} className="mt-8 text-center">
            <Link
              href="/examples"
              className="inline-flex items-center gap-1.5 text-[14px] font-medium text-[#F5F5F3] underline decoration-white/25 underline-offset-4 hover:decoration-white/60"
            >
              View all examples <ArrowRight className="h-4 w-4" strokeWidth={1.8} />
            </Link>
          </Reveal>
        </section>

        {/* ── motion showcase (AI video examples, tabbed) ─── */}
        <section aria-label="AI video examples" className="cv-auto border-b border-white/[0.08] py-16 sm:py-20">
          <div className="mx-auto max-w-5xl px-4">
            <Reveal>
              <Eyebrow>Motion</Eyebrow>
              <h2 className="font-display mt-3 text-[26px] font-semibold tracking-[-0.01em] sm:text-[34px]">
                Stills are the warm-up. <span className="text-[#00F0FF]">Video is live.</span>
              </h2>
              <p className="mt-3 max-w-xl text-[14px] leading-6 text-white/50">
                AI video examples from Pixaura — 5s clips at {formatINR(priceOf("clip-5s"))} each. Hover to
                preview, tap a category to switch lanes, click to watch full-screen.
              </p>
            </Reveal>
            <Reveal delay={0.1} className="mt-8">
              <VideoShowcase />
            </Reveal>
          </div>
        </section>

        {/* ── capability bento ─────────────────────────────── */}
        <section aria-label="What you can create" className="cv-auto mx-auto max-w-5xl px-4 py-20 sm:py-28">
          <Reveal>
            <Eyebrow>Capabilities</Eyebrow>
            <h2 className="font-display mt-3 max-w-[22ch] text-[26px] font-semibold tracking-[-0.01em] sm:text-[34px]">
              One studio, <span className="text-[#D7FF3F]">three ways to create.</span>
            </h2>
          </Reveal>
          <Stagger className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {CAPABILITIES.map((cap, i) => (
              <StaggerItem key={cap.title} className="h-full">
                <BentoCard cap={cap} accent={CAP_ACCENTS[i % CAP_ACCENTS.length]} />
              </StaggerItem>
            ))}
          </Stagger>
          <Reveal delay={0.1}>
            <p className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-1.5 rounded-2xl border border-dashed border-white/[0.12] bg-white/[0.015] px-5 py-4 text-[13.5px] text-white/55">
              <span className="rounded-full border border-[#D7FF3F]/40 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#D7FF3F]">
                Now live
              </span>
              Video — 5s motion clips at {formatINR(priceOf("clip-5s"))} each, made in minutes. Every
              frame you see here is still a single creation.
            </p>
          </Reveal>
          <Reveal delay={0.15}>
            <p className="mt-6 text-[12px] text-white/35">
              Every card is a real order type — the price you see at checkout is the price you pay.
            </p>
          </Reveal>
        </section>

        {/* ── stats band ───────────────────────────────────── */}
        <section
          aria-label="Studio stats"
          className="cv-auto border-y border-white/[0.08] bg-white/[0.015]"
        >
          <div className="mx-auto max-w-5xl px-4 py-14 text-center sm:py-20">
            <Stagger className="grid grid-cols-1 gap-10 sm:grid-cols-3">
              {STATS.map((s) => (
                <StaggerItem key={s.label}>
                  <p className="text-[44px] font-semibold leading-none tracking-[-0.02em] tabular-nums sm:text-[52px]">
                    <Counter
                      to={s.to}
                      prefix={s.prefix}
                      suffix={s.suffix}
                      decimals={s.decimals}
                    />
                  </p>
                  <p className="mt-2.5 text-[14px] text-white/55">{s.label}</p>
                </StaggerItem>
              ))}
            </Stagger>
            <p className="mt-10 text-[12px] text-white/35">
              Launch-period figures.
            </p>
          </div>
        </section>

        {/* ── formats: interactive ratio lab ───────────────── */}
        <section aria-label="Supported formats" className="cv-auto border-b border-white/[0.08] py-16 sm:py-24">
          <div className="mx-auto max-w-5xl px-4">
            <Reveal>
              <Eyebrow>Formats</Eyebrow>
              <h2 className="font-display mt-3 text-[26px] font-semibold tracking-[-0.01em] sm:text-[34px]">
                Every creation, <span className="text-[#00F0FF]">every ratio.</span>
              </h2>
              <p className="mt-3 max-w-lg text-[14px] leading-6 text-white/50">
                Touch a ratio — the frame morphs to its true shape, lit in its
                own color. What you pick is what renders.
              </p>
            </Reveal>
            <Reveal delay={0.1} className="mt-10">
              <FormatLab />
            </Reveal>
          </div>
        </section>

        {/* ── pricing teaser (tinted band) ──────────────────── */}
        <section aria-label="Pricing teaser" className="cv-auto border-y border-white/[0.08] bg-[#0B0B0C]">
          <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:py-20">
            <Reveal>
              <Eyebrow>Pricing</Eyebrow>
            </Reveal>
            <Stagger className="mt-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-3">
              {TEASER.map((t) => (
                <StaggerItem key={t.label}>
                  <p className="text-[13px] text-white/55">
                    {t.label}{" "}
                    <span className="font-semibold tabular-nums text-[#F5F5F3]">
                      {t.price}
                    </span>
                  </p>
                </StaggerItem>
              ))}
            </Stagger>
            <Reveal delay={0.1} className="mt-7">
              <Link
                href="/pricing"
                className="inline-flex items-center gap-1.5 text-[14px] font-medium text-[#F5F5F3] underline decoration-white/25 underline-offset-4 hover:decoration-white/60"
              >
                See full pricing <ArrowRight className="h-4 w-4" strokeWidth={1.8} />
              </Link>
            </Reveal>
          </div>
        </section>

        {/* ── FAQ (SEO: keyword questions + FAQPage schema) ── */}
        <section
          id="faq"
          aria-label="Frequently asked questions"
          className="cv-auto mx-auto max-w-5xl scroll-mt-24 px-4 py-20 sm:py-28"
        >
          <Reveal>
            <Eyebrow>FAQ</Eyebrow>
            <h2 className="font-display mt-3 max-w-[24ch] text-[26px] font-semibold tracking-[-0.01em] sm:text-[34px]">
              Questions, <span className="text-[#D7FF3F]">answered straight.</span>
            </h2>
          </Reveal>
          <div className="mt-10 grid grid-cols-1 gap-3 sm:gap-4">
            {FAQS.map((f, i) => (
              <Reveal key={f.q} delay={Math.min(i * 0.04, 0.2)}>
                <details
                  className="group rounded-2xl border border-white/[0.08] bg-white/[0.02] transition-colors open:border-[#D7FF3F]/30 open:bg-white/[0.03] hover:border-white/[0.16]"
                >
                  <summary className="flex cursor-pointer list-none items-baseline gap-4 px-5 py-4 outline-none focus-visible:ring-2 focus-visible:ring-[#D7FF3F] sm:px-6 sm:py-5 [&::-webkit-details-marker]:hidden">
                    <span aria-hidden className="font-display text-[12px] font-semibold tabular-nums text-[#D7FF3F]/70">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="flex-1 text-[15px] font-medium leading-6 text-[#F5F5F3]">
                      {f.q}
                    </span>
                    <span
                      aria-hidden
                      className="font-display text-[18px] leading-none text-[#D7FF3F] transition-transform duration-200 group-open:rotate-45 motion-reduce:transition-none"
                    >
                      +
                    </span>
                  </summary>
                  <p className="px-5 pb-5 pl-[3.25rem] pr-6 text-[14px] leading-7 text-white/[0.62] sm:px-6 sm:pb-6 sm:pl-[3.5rem]">
                    {f.a}
                  </p>
                </details>
              </Reveal>
            ))}
          </div>
          {/* Structured data for the visible FAQ above. */}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_JSON_LD) }}
          />
        </section>

        {/* ── closing CTA ──────────────────────────────────── */}
        <section className="cv-auto relative overflow-hidden">
          <GenerativeField className="absolute inset-0" density={0.8} />
          <FlyingElements className="absolute inset-0" density={0.5} />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_55%_at_50%_50%,transparent_0%,rgba(8,8,8,0.6)_100%)]"
          />
          <div className="relative mx-auto max-w-3xl px-4 pb-24 pt-20 text-center sm:pb-32 sm:pt-28">
            <Reveal>
              <Eyebrow>The deal</Eyebrow>
            </Reveal>
            <Reveal delay={0.06}>
              <h2 className="font-display mt-5 text-[36px] font-semibold leading-[1.06] tracking-[-0.02em] sm:text-[56px]">
                Pay per creation, <span className="v-iris-text">not per month.</span>
              </h2>
            </Reveal>
            <Reveal delay={0.12}>
              <p className="mx-auto mt-5 max-w-xl text-[15px] leading-7 text-white/[0.60]">
                No subscriptions. No credit packs. No renewals. The price you see
                is the price you pay — GST included.
              </p>
            </Reveal>
            <Stagger
              className="mt-8 flex flex-wrap items-center justify-center gap-2.5"
              aria-label="Price list"
            >
              {[
                { label: "Image", price: formatINR(priceOf("single-image")), },
                { label: "Product shot", price: formatINR(priceOf("product-photo")) },
                { label: "4-pack", price: formatINR(priceOf("pack-4")) },
                { label: "5s video", price: formatINR(priceOf("clip-5s")) },
                { label: "Remake", price: formatINR(priceOf("remake")) },
              ].map((c) => (
                <StaggerItem key={c.label}>
                  <span className="inline-flex items-baseline gap-2 rounded-full border border-white/[0.14] bg-white/[0.04] px-4 py-2 backdrop-blur-sm transition-colors duration-200 hover:border-[#D7FF3F]/50 hover:bg-[#D7FF3F]/[0.07]">
                    <span className="text-[12.5px] text-white/60">{c.label}</span>
                    <span className="text-[14px] font-semibold tabular-nums text-[#D7FF3F]">
                      {c.price}
                    </span>
                  </span>
                </StaggerItem>
              ))}
            </Stagger>
            <Reveal delay={0.16} className="mt-11">
              <MagneticButton>
                <Link
                  href="/create"
                  className="v-iris-bg inline-flex items-center gap-2.5 rounded-[14px] px-10 py-5 text-[16px] font-semibold text-[#080808] shadow-[0_18px_60px_-18px_rgba(215,255,63,0.55)]"
                >
                  Start creating <ArrowRight className="h-5 w-5" strokeWidth={2} />
                </Link>
              </MagneticButton>
            </Reveal>
            <Reveal delay={0.2}>
              <Link
                href="/pricing"
                className="mt-6 inline-flex min-h-[44px] items-center gap-1.5 px-2 py-2 text-[14px] font-medium text-[#F5F5F3] underline decoration-white/30 underline-offset-4 hover:decoration-white/70"
              >
                See full pricing <ArrowRight className="h-4 w-4" strokeWidth={1.8} />
              </Link>
            </Reveal>
          </div>
        </section>
      </main>

      {reelOpen !== null && REEL_ITEMS[reelOpen] && (
        <Lightbox
          items={REEL_ITEMS}
          index={reelOpen}
          onClose={() => setReelOpen(null)}
          onIndex={setReelOpen}
        />
      )}
      {caseOpen !== null && CASE_ITEMS[caseOpen] && (
        <Lightbox
          items={CASE_ITEMS}
          index={caseOpen}
          onClose={() => setCaseOpen(null)}
          onIndex={setCaseOpen}
        />
      )}

      <VilishFooter />
    </div>
  );
}
