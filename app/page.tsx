"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  BadgeCheck,
  Ban,
  ChevronLeft,
  ChevronRight,
  Clapperboard,
  Download,
  FileDown,
  Image as ImageIcon,
  MessageSquareText,
  Play,
  RefreshCcw,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Tag,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import {
  AnimatePresence,
  motion,
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
import HeroAurora, { HeroCollage } from "@/components/motion/HeroAurora";
import FlyingElements from "@/components/motion/FlyingElements";
import Reveal from "@/components/motion/Reveal";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import MagneticButton from "@/components/motion/MagneticButton";
import { EASE_OUT, MOTION, usePrefersReducedMotion } from "@/src/lib/motion/theme";
import SectionHeader from "@/components/vilish/section-header";
import { toolsByGroup } from "@/src/lib/tools/directory";

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

interface Capability {
  icon: LucideIcon;
  title: string;
  desc: string;
  price: string;
  href: string;
  img: string;
  imgAlt: string;
}

const CAPABILITIES: Capability[] = [
  {
    icon: ImageIcon,
    title: "Image",
    desc: "Anything you can describe — portraits, posters, concepts, scenes. Studio-grade renders, priced per piece.",
    price: `from ${formatINR(priceOf("single-image"))}`,
    href: "/create",
    img: "/examples/2-neon-portrait.webp",
    imgAlt: "AI-generated example: stylized neon portrait",
  },
  {
    icon: SlidersHorizontal,
    title: "Edit",
    desc: "Retouch, restyle, recolor, remove backgrounds. Your photo, transformed exactly as you brief it.",
    price: `from ${formatINR(priceOf("single-image"))}`,
    href: "/create",
    img: "/examples/9-fashion-editorial.webp",
    imgAlt: "AI-generated example: high-fashion editorial portrait",
  },
  {
    icon: Sparkles,
    title: "Ad",
    desc: "Product shots and campaign creatives that look shot in a studio — without booking a studio.",
    price: `from ${formatINR(priceOf("product-photo"))}`,
    href: "/create",
    img: "/examples/10-perfume-ad.webp",
    imgAlt: "AI-generated example: luxury perfume product shot",
  },
];

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

/** Film-perforation strip: sprocket holes along the top/bottom of the
 *  screening-room frame. Pure CSS, decorative. */
function Perforation({ position }: { position: "top" | "bottom" }) {
  return (
    <div
      aria-hidden
      className={`h-[26px] shrink-0 bg-black ${
        position === "top" ? "border-b border-white/[0.08]" : "border-t border-white/[0.08]"
      }`}
      style={{
        backgroundImage:
          "radial-gradient(circle, rgba(255,255,255,0.22) 3px, transparent 3.5px)",
        backgroundSize: "22px 26px",
        backgroundPosition: "center",
        backgroundRepeat: "repeat-x",
      }}
    />
  );
}

/**
 * Screening room: the video examples play inside a cinema frame with
 * perforation strips, a "NOW SCREENING" header, and numbered reel select —
 * distinctive art direction instead of a plain tab panel. Same honest data
 * (5s loops at the catalog clip price), same hover-preview + lightbox.
 */
function VideoShowcase() {
  const reduced = usePrefersReducedMotion();
  const [activeId, setActiveId] = useState(VIDEO_CATS[0].id);
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const activeIdx = VIDEO_CATS.findIndex((c) => c.id === activeId);
  const active = VIDEO_CATS[activeIdx] ?? VIDEO_CATS[0];

  const panel = (
    <div key={active.id} className="grid grid-cols-1 items-center gap-10 lg:grid-cols-[300px_1fr] lg:gap-14">
      {/* the screen */}
      <div className="relative mx-auto w-full max-w-[300px]">
        <div
          aria-hidden
          className="absolute -inset-6 rounded-[28px] blur-3xl transition-colors duration-500 motion-reduce:transition-none"
          style={{ background: `${active.accent}26` }}
        />
        <div className="relative">
          <VideoCard
            clip={active.clip}
            accent={active.accent}
            onOpen={() => setOpenIdx(activeIdx)}
          />
          {/* screen reflection */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-8 -bottom-10 h-16 rounded-[50%] bg-black/60 blur-2xl"
          />
        </div>
      </div>
      {/* reel info */}
      <div>
        <p className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.3em]">
          <span
            className="inline-block h-2 w-2 animate-pulse rounded-full motion-reduce:animate-none"
            style={{ background: active.accent, boxShadow: `0 0 10px ${active.accent}` }}
            aria-hidden
          />
          <span style={{ color: active.accent }}>Reel {String(activeIdx + 1).padStart(2, "0")}</span>
          <span className="text-white/35">— {active.label}</span>
        </p>
        <h3 className="font-display mt-3 text-[24px] font-semibold tracking-[-0.01em] text-[#F5F5F3] sm:text-[30px]">
          {active.clip.caption}
        </h3>
        <p className="mt-2 max-w-md text-[14px] leading-6 text-white/55">
          {active.blurb}
        </p>
        <ul className="mt-5 flex flex-wrap gap-2">
          {active.bullets.map((b) => (
            <li
              key={b}
              className="rounded-full border border-white/[0.1] bg-white/[0.03] px-3.5 py-1.5 text-[12.5px] text-white/65"
            >
              {b}
            </li>
          ))}
        </ul>
        <div className="mt-7">
          <Link
            href="/create?media=video"
            className="inline-flex min-h-[48px] items-center gap-2 rounded-[12px] px-7 py-3 text-[14px] font-semibold text-[#080808] transition-transform duration-200 hover:scale-[1.03] motion-reduce:transition-none"
            style={{ background: active.accent, boxShadow: `0 14px 44px -14px ${active.accent}99` }}
          >
            Make yours — {formatINR(priceOf("clip-5s"))} <ArrowRight className="h-4 w-4" strokeWidth={2} />
          </Link>
        </div>
      </div>
    </div>
  );

  return (
    <div className="overflow-hidden rounded-3xl border border-white/[0.1] bg-[#0A0A0B] shadow-[0_40px_100px_-40px_rgba(0,0,0,0.9)]">
      <Perforation position="top" />
      <div className="px-5 pb-10 pt-7 sm:px-10 sm:pt-9">
        {/* marquee header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="font-display flex items-center gap-2.5 text-[13px] font-bold uppercase tracking-[0.28em] text-white/80">
            <Clapperboard className="h-4 w-4 text-[#D7FF3F]" strokeWidth={2} aria-hidden />
            Now screening
          </p>
          <span className="rounded-full border border-white/[0.12] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/50">
            5s loop · {formatINR(priceOf("clip-5s"))} each
          </span>
        </div>
        {/* reel selector */}
        <div
          role="tablist"
          aria-label="Video reels"
          className="mt-6 flex gap-2 overflow-x-auto pb-1"
        >
          {VIDEO_CATS.map((c, ci) => {
            const selected = c.id === activeId;
            return (
              <button
                key={c.id}
                role="tab"
                aria-selected={selected}
                onClick={() => setActiveId(c.id)}
                className={`relative min-h-[44px] shrink-0 rounded-xl px-5 py-2.5 text-[13px] font-semibold outline-none transition-all duration-200 focus-visible:ring-2 focus-visible:ring-[#D7FF3F] motion-reduce:transition-none ${
                  selected
                    ? "text-[#080808]"
                    : "border border-white/[0.12] bg-white/[0.03] text-white/60 hover:border-white/[0.25] hover:text-white/90"
                }`}
                style={selected ? { background: c.accent } : undefined}
              >
                Reel {String(ci + 1).padStart(2, "0")}
                <span className={`ml-2 font-normal ${selected ? "text-black/60" : "text-white/35"}`}>
                  {c.label}
                </span>
              </button>
            );
          })}
        </div>
        {/* stage */}
        <div className="mt-8 sm:mt-10">
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
      </div>
      <Perforation position="bottom" />

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
 * One showreel card: fixed uniform frame (no more ragged heights), index
 * badge + price chip on top, persistent caption bar below the image so the
 * card reads on touch devices too. Hover reveals the original prompt.
 * Click opens the full-screen lightbox.
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
    <figure className="w-[240px] shrink-0 snap-start sm:w-[280px]">
      <button
        type="button"
        onClick={onOpen}
        aria-label={`Open example: ${ex.caption}`}
        className="group relative block h-[340px] w-full cursor-pointer overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.03] text-left outline-none transition-colors duration-300 focus-visible:ring-2 focus-visible:ring-[#D7FF3F] focus-visible:ring-offset-2 focus-visible:ring-offset-[#080808] group-hover:border-white/[0.22] sm:h-[380px] motion-reduce:transition-none"
      >
        <Image
          src={ex.src}
          alt={ex.alt ?? ex.caption}
          width={ex.width}
          height={ex.height}
          sizes="(max-width: 640px) 240px, 280px"
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.06] motion-reduce:transition-none"
        />
        {/* top badges */}
        <span className="absolute left-3 top-3 flex items-center gap-2">
          <span
            className="rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[#080808]"
            style={{ background: accent }}
          >
            {String(index + 1).padStart(2, "0")}
          </span>
          <span className="rounded-full border border-white/[0.14] bg-black/70 px-2.5 py-1 text-[11px] font-semibold tabular-nums text-white backdrop-blur-sm">
            {ex.price}
          </span>
        </span>
        {/* hover: the prompt that made it */}
        <span
          aria-hidden
          className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/95 via-black/50 to-transparent p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100 motion-reduce:transition-none"
        >
          <span
            className="text-[10px] font-semibold uppercase tracking-[0.18em]"
            style={{ color: accent }}
          >
            The brief
          </span>
          <span className="mt-1.5 line-clamp-4 text-[12px] leading-5 text-white/85">
            {ex.prompt}
          </span>
          <span className="mt-2 text-[11px] font-medium text-white/70">⤢ View full-screen</span>
        </span>
        {/* persistent caption bar */}
        <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/55 to-transparent p-4 pt-10 transition-opacity duration-300 group-hover:opacity-0">
          <span className="block truncate text-[13px] font-medium text-white/90">
            {ex.caption}
          </span>
        </span>
      </button>
      <figcaption className="mt-3 px-0.5">
        <Link
          href={exampleHref(ex)}
          aria-label={`Make one like this: ${ex.caption}`}
          className="inline-flex min-h-[40px] items-center gap-1.5 text-[12.5px] font-semibold text-[#D7FF3F] transition-opacity hover:opacity-80"
        >
          Make one like this <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.2} />
        </Link>
      </figcaption>
    </figure>
  );

  if (reduced) return card;

  return (
    <motion.div
      whileHover={{ y: -8 }}
      transition={MOTION.springs.ui}
      className="shrink-0 snap-start"
    >
      {card}
    </motion.div>
  );
}

/**
 * Showreel carousel: uniform cards on a snap-scrolling track with arrow
 * controls and a progress rail — a designed gallery, not a raw image strip.
 */
function ShowreelCarousel({
  onOpen,
}: {
  onOpen: (index: number) => void;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(true);

  const update = () => {
    const el = trackRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setProgress(max > 0 ? el.scrollLeft / max : 0);
    setCanLeft(el.scrollLeft > 8);
    setCanRight(el.scrollLeft < max - 8);
  };

  useEffect(() => {
    update();
    const onLoad = () => update();
    window.addEventListener("resize", update);
    window.addEventListener("load", onLoad);
    // next/image lazy-loads below-the-fold artwork AFTER window load, and each
    // load grows the track's scrollWidth without resizing its border box — so a
    // ResizeObserver on the track alone never fires. Poll until layout settles.
    const iv = window.setInterval(update, 400);
    const stop = window.setTimeout(() => window.clearInterval(iv), 12000);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("load", onLoad);
      window.clearInterval(iv);
      window.clearTimeout(stop);
    };
  }, []);

  const nudge = (dir: 1 | -1) => {
    trackRef.current?.scrollBy({ left: dir * 600, behavior: "smooth" });
  };

  const arrowCls =
    "flex h-11 w-11 items-center justify-center rounded-full border border-white/[0.12] bg-white/[0.03] text-white/70 transition-all hover:border-[#D7FF3F]/50 hover:text-[#D7FF3F] disabled:opacity-30 disabled:hover:border-white/[0.12] disabled:hover:text-white/70";

  return (
    <div className="mx-auto max-w-5xl px-4">
      <div className="mb-5 flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={() => nudge(-1)}
          disabled={!canLeft}
          aria-label="Scroll showreel left"
          className={arrowCls}
        >
          <ChevronLeft className="h-5 w-5" strokeWidth={2} />
        </button>
        <button
          type="button"
          onClick={() => nudge(1)}
          disabled={!canRight}
          aria-label="Scroll showreel right"
          className={arrowCls}
        >
          <ChevronRight className="h-5 w-5" strokeWidth={2} />
        </button>
      </div>
      <div
        ref={trackRef}
        onScroll={update}
        className="flex snap-x snap-mandatory gap-5 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {SHOWREEL.map((ex, i) => (
          <ReelCard key={ex.src} ex={ex} index={i} onOpen={() => onOpen(i)} />
        ))}
      </div>
      {/* progress rail */}
      <div
        aria-hidden
        className="mx-auto mt-6 h-[3px] w-full max-w-md overflow-hidden rounded-full bg-white/[0.08]"
      >
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#D7FF3F] via-[#00F0FF] to-[#FF2D78] transition-[width] duration-150"
          style={{ width: `${Math.max(8, progress * 100)}%`, marginLeft: `${progress * 88}%` }}
        />
      </div>
    </div>
  );
}

/** Why pay-per-creation: four honest differentiators. Every claim is a
 *  verifiable property of the product — no invented numbers, no fake
 *  social proof. */
const WHY_PILLARS = [
  {
    icon: Tag,
    accent: "#D7FF3F",
    title: "Exact price first",
    copy: "You see the precise cost before you pay. The number at checkout is the number you approved — GST included.",
  },
  {
    icon: Ban,
    accent: "#00F0FF",
    title: "No subscriptions",
    copy: "No monthly plans, no credit packs, no auto-renewals. Pay for one creation at a time, whenever you want one.",
  },
  {
    icon: ShieldCheck,
    accent: "#FF2D78",
    title: "Human QC",
    copy: "Every creation is reviewed by a real person before it's delivered. If it fails, it's remade or refunded.",
  },
  {
    icon: FileDown,
    accent: "#D7FF3F",
    title: "Yours to keep",
    copy: "You get the full-resolution file with no watermark. Use it anywhere, forever.",
  },
];

/** Per-card accent: Image → lime, Edit → cyan, Ad → magenta. */
const CAP_ACCENTS = ["#D7FF3F", "#00F0FF", "#FF2D78"];

/**
 * "Made for" band: three use-case cards (Sellers / Creators / Marketers)
 * linking to the use-case landing pages, each with real example imagery.
 * Imagery is real example output, never stock, never fake customer work.
 */
const MADE_FOR = [
  {
    href: "/for-sellers",
    title: "Sellers",
    copy: "Product shots and ad creatives that look shot in a studio — without booking one.",
    img: "/examples/10-perfume-ad.webp",
    imgAlt: "Luxury perfume product shot — AI-generated example",
    accent: "#D7FF3F",
  },
  {
    href: "/for-creators",
    title: "Creators",
    copy: "Portraits, reels and motion clips with a studio finish, priced per piece.",
    img: "/examples/2-neon-portrait.webp",
    imgAlt: "Stylized neon portrait — AI-generated example",
    accent: "#00F0FF",
  },
  {
    href: "/for-marketers",
    title: "Marketers",
    copy: "Campaign creatives and ad variants on demand — no retainer, no timeline.",
    img: "/examples/1-sneaker-ad.webp",
    imgAlt: "Cinematic sneaker product photograph — AI-generated example",
    accent: "#FF2D78",
  },
];

/**
 * Made-for card: real imagery, cinematic gradient, honest link to a
 * use-case landing page. Same tactile treatment as the capability cards.
 */
function MadeForCard({ item }: { item: (typeof MADE_FOR)[number] }) {
  return (
    <Link
      href={item.href}
      aria-label={`Made for ${item.title}`}
      className="group relative block h-[380px] overflow-hidden rounded-2xl border border-white/[0.08] outline-none transition-colors duration-300 focus-visible:ring-2 focus-visible:ring-[#D7FF3F] focus-visible:ring-offset-2 focus-visible:ring-offset-[#080808] hover:border-white/[0.22] motion-reduce:transition-none sm:h-[420px]"
    >
      <Image
        src={item.img}
        alt={item.imgAlt}
        fill
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        loading="lazy"
        className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.08] motion-reduce:transition-none"
      />
      <span
        aria-hidden
        className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/35 to-black/10"
      />
      <span className="absolute inset-x-0 bottom-0 p-6">
        <span
          className="text-[11px] font-bold uppercase tracking-[0.2em]"
          style={{ color: item.accent }}
        >
          Made for
        </span>
        <span className="mt-2 block text-[22px] font-semibold text-white">{item.title}</span>
        <span className="mt-1.5 block max-w-[30ch] text-[13.5px] leading-6 text-white/60">
          {item.copy}
        </span>
        <span
          className="mt-4 inline-flex min-h-[36px] items-center gap-1.5 text-[13.5px] font-semibold"
          style={{ color: item.accent }}
        >
          Explore
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" strokeWidth={2.2} />
        </span>
      </span>
    </Link>
  );
}

/**
 * Capability card with real example imagery: the photograph fills the card,
 * the copy floats over a cinematic gradient, and hover pushes the image
 * deeper (scale) while the CTA slides forward. Rich, tactile, alive.
 * Reduced motion → static card, still a real link.
 */
function BentoCard({ cap, accent }: { cap: Capability; accent: string }) {
  const reduced = usePrefersReducedMotion();

  const card = (
    <Link
      href={cap.href}
      aria-label={`Create: ${cap.title}`}
      className="group relative block h-[440px] overflow-hidden rounded-2xl border border-white/[0.08] outline-none transition-colors duration-300 focus-visible:ring-2 focus-visible:ring-[#D7FF3F] focus-visible:ring-offset-2 focus-visible:ring-offset-[#080808] hover:border-white/[0.22] motion-reduce:transition-none sm:h-[480px]"
    >
      <Image
        src={cap.img}
        alt={cap.imgAlt}
        fill
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        loading="lazy"
        className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.08] motion-reduce:transition-none"
      />
      {/* cinematic gradient: readable copy, visible image */}
      <span
        aria-hidden
        className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/35 to-black/10"
      />
      <span
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-1 opacity-0 transition-opacity duration-500 group-hover:opacity-100 motion-reduce:transition-none"
        style={{ background: `linear-gradient(90deg, ${accent}, transparent)` }}
      />
      {/* top row: price */}
      <span className="absolute left-5 right-5 top-5 flex items-start justify-between">
        <span
          className="flex h-12 w-12 items-center justify-center rounded-2xl border bg-black/55 backdrop-blur-sm transition-transform duration-300 group-hover:-translate-y-1 motion-reduce:transition-none"
          style={{ borderColor: `${accent}66`, boxShadow: `0 0 24px -6px ${accent}88` }}
        >
          <cap.icon className="h-6 w-6" style={{ color: accent }} strokeWidth={1.8} aria-hidden />
        </span>
        <span className="rounded-full border border-white/[0.16] bg-black/60 px-3.5 py-1.5 text-[13px] font-semibold tabular-nums text-white backdrop-blur-sm">
          {cap.price}
        </span>
      </span>
      {/* bottom copy */}
      <span className="absolute inset-x-0 bottom-0 p-6 sm:p-7">
        <span
          aria-hidden
          className="mb-3 block text-[10.5px] font-bold uppercase tracking-[0.22em]"
          style={{ color: accent }}
        >
          {cap.title === "Image" ? "Generate" : cap.title === "Edit" ? "Transform" : "Sell"}
        </span>
        <h3 className="font-display text-[26px] font-semibold tracking-[-0.01em] text-white">
          {cap.title}
        </h3>
        <p className="mt-2 max-w-[30ch] text-[13.5px] leading-6 text-white/65">{cap.desc}</p>
        <span
          className="mt-5 inline-flex min-h-[44px] items-center gap-2 text-[14px] font-semibold"
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
      whileHover={{ y: -8 }}
      transition={MOTION.springs.ui}
    >
      {card}
    </motion.div>
  );
}

const PIPELINE_META = [
  { icon: MessageSquareText, accent: "#D7FF3F" },
  { icon: Tag, accent: "#00F0FF" },
  { icon: Wallet, accent: "#FF2D78" },
  { icon: Download, accent: "#D7FF3F" },
];

/**
 * "From words to file" — the four-step pipeline as a connected assembly
 * line. Desktop: horizontal cards joined by a glowing spine with node dots.
 * Mobile: a vertical timeline with the same spine on the left. Each stage is
 * a real card (icon, ghost number, copy), not a bare numbered column.
 */
function PipelineSteps() {
  return (
    <div className="relative">
      {/* spine (desktop horizontal) */}
      <div
        aria-hidden
        className="absolute left-0 right-0 top-[52px] hidden h-px bg-gradient-to-r from-[#D7FF3F]/60 via-[#00F0FF]/60 to-[#FF2D78]/60 sm:block"
      />
      {/* spine (mobile vertical) */}
      <div
        aria-hidden
        className="absolute bottom-4 left-[27px] top-4 w-px bg-gradient-to-b from-[#D7FF3F]/60 via-[#00F0FF]/60 to-[#FF2D78]/60 sm:hidden"
      />
      <Stagger className="relative grid grid-cols-1 gap-8 sm:grid-cols-4 sm:gap-5">
        {FLOW.map((f, i) => {
          const meta = PIPELINE_META[i % PIPELINE_META.length];
          const Icon = meta.icon;
          return (
            <StaggerItem key={f.step} className="relative">
              <div className="group relative flex gap-5 sm:block">
                {/* node */}
                <span
                  aria-hidden
                  className="relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border bg-[#0B0B0C] transition-transform duration-300 group-hover:-translate-y-1 motion-reduce:transition-none sm:mb-6"
                  style={{
                    borderColor: `${meta.accent}55`,
                    boxShadow: `0 0 30px -10px ${meta.accent}88`,
                  }}
                >
                  <Icon className="h-6 w-6" style={{ color: meta.accent }} strokeWidth={1.8} />
                  <span
                    aria-hidden
                    className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-[#080808]"
                    style={{ background: meta.accent }}
                  >
                    {i + 1}
                  </span>
                </span>
                <span className="min-w-0 sm:block">
                  <span
                    aria-hidden
                    className="font-display pointer-events-none absolute -top-3 right-2 hidden select-none text-[64px] font-bold leading-none text-white/[0.05] lg:block"
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="text-[17px] font-semibold text-[#F5F5F3]">{f.step}</h3>
                  <p className="mt-1.5 max-w-[28ch] text-[14px] leading-6 text-white/55">
                    {f.desc}
                  </p>
                </span>
              </div>
            </StaggerItem>
          );
        })}
      </Stagger>
      <Reveal delay={0.12}>
        <p className="mt-10 text-center text-[13px] text-white/40">
          No account needed to look around —{" "}
          <Link href="/create" className="font-medium text-[#D7FF3F] hover:opacity-80">
            describe your first creation
          </Link>
          .
        </p>
      </Reveal>
    </div>
  );
}

/** Honest one-line briefs for the four showcase pieces — what was asked
 *  for, not who ordered it. Keeps the editorial framing without inventing
 *  clients or jobs. */
const SHOWCASE_BRIEFS = [
  "High-fashion editorial — sculptural spiked hair, charcoal studio, hard rim light.",
  "Luxury product shot — faceted glass, golden liquid, macro detail.",
  "E-commerce hero — floating sneaker, dark studio, dramatic rim light.",
  "Stylized portrait — neon city reflections, cinematic grade.",
];

/** Editorial spans for the four showcase pieces: one tall feature, two
 *  stacked, one wide banner. Reads like a magazine spread, not a slider. */
const SHOWCASE_SPANS = [
  "sm:col-span-5 sm:row-span-2",
  "sm:col-span-7",
  "sm:col-span-7",
  "sm:col-span-12",
];
const SHOWCASE_ASPECTS = [
  "aspect-[4/5] sm:aspect-auto sm:h-full sm:min-h-[560px]",
  "aspect-[16/10]",
  "aspect-[16/10]",
  "aspect-[16/10] sm:aspect-[21/8]",
];

/**
 * Showcase as an editorial grid: a tall feature, two stacked frames, and a
 * wide banner — dense, crafted, magazine-like. Each frame carries its brief
 * ("what was asked for"), its exact price, and a direct CTA. Click opens the
 * lightbox.
 */
function ShowcaseGrid({ onOpen }: { onOpen: (index: number) => void }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-12 sm:gap-5">
      {SHOWCASE.map((ex, i) => (
        <Reveal key={ex.src} delay={Math.min(i * 0.06, 0.18)} className={SHOWCASE_SPANS[i]}>
          <figure className="h-full">
            <div
              className={`group relative w-full overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.03] transition-colors duration-300 hover:border-white/[0.22] motion-reduce:transition-none ${SHOWCASE_ASPECTS[i]}`}
            >
              <Image
                src={ex.src}
                alt={ex.alt ?? ex.caption}
                width={ex.width}
                height={ex.height}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 40vw"
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.05] motion-reduce:transition-none"
              />
              {/* click layer: opens the lightbox */}
              <button
                type="button"
                onClick={() => onOpen(i)}
                aria-label={`Open example: ${ex.caption}`}
                className="absolute inset-0 z-10 cursor-pointer rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#D7FF3F]"
              />
              {/* top row: index + price */}
              <span className="pointer-events-none absolute left-4 top-4 z-20 flex items-center gap-2">
                <span className="rounded-full bg-black/70 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-white/85 backdrop-blur-sm">
                  No. {String(i + 1).padStart(2, "0")}
                </span>
                <span className="rounded-full border border-white/[0.14] bg-black/70 px-2.5 py-1 text-[11px] font-semibold tabular-nums text-white backdrop-blur-sm">
                  {ex.price}
                </span>
              </span>
              {/* bottom: editorial caption block */}
              <span className="absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black/95 via-black/60 to-transparent p-5 pt-14">
                <span className="pointer-events-none block text-[15px] font-semibold text-white sm:text-[16px]">
                  {ex.caption}
                </span>
                <span className="pointer-events-none mt-1 block text-[12.5px] leading-5 text-white/60">
                  {SHOWCASE_BRIEFS[i]}
                </span>
                <Link
                  href={exampleHref(ex)}
                  aria-label={`Make one like this: ${ex.caption}`}
                  className="mt-3 inline-flex min-h-[36px] items-center gap-1.5 text-[12.5px] font-semibold text-[#D7FF3F] transition-opacity hover:opacity-80"
                >
                  Make one like this
                  <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.2} />
                </Link>
              </span>
            </div>
          </figure>
        </Reveal>
      ))}
    </div>
  );
}

/**
 * VEED-style pill directory: every working tool as a pill with its exact
 * catalog price. All data comes from the canonical tool directory — 12 live
 * tools only, zero invented entries, zero hardcoded prices.
 */
function ToolPillDirectory() {
  const groups = [
    { label: "Create", accent: "#D7FF3F", tools: toolsByGroup("create") },
    { label: "Video Studio", accent: "#00F0FF", tools: toolsByGroup("video-studio") },
  ];
  return (
    <div className="space-y-9">
      {groups.map((g) => (
        <div key={g.label}>
          <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/40">
            {g.label}
          </p>
          <div className="flex flex-wrap gap-2.5">
            {g.tools.map((t) => (
              <Link
                key={t.id}
                href={t.href}
                className="group inline-flex min-h-[44px] items-center gap-2 rounded-full border border-white/[0.10] bg-white/[0.03] px-5 py-2 text-[14px] font-medium text-white/80 transition-all duration-200 hover:-translate-y-0.5 hover:border-white/25 hover:bg-white/[0.06] hover:text-white motion-reduce:transition-none motion-reduce:hover:translate-y-0"
              >
                {t.name}
                <span
                  className="text-[13px] font-semibold tabular-nums"
                  style={{ color: g.accent }}
                >
                  {t.price}
                </span>
                <ArrowRight
                  className="h-4 w-4 text-white/30 transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-white/70 motion-reduce:transition-none"
                  strokeWidth={2}
                />
              </Link>
            ))}
          </div>
        </div>
      ))}
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
          {/* Desktop keeps the ambient video loop; mobile gets the aurora +
              example collage — the video never worked on phone GPUs. */}
          <HeroVideo className="absolute inset-0 hidden sm:block" />
          <HeroAurora className="absolute inset-0 sm:hidden" />
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
                  price before you pay.
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

            <HeroCollage />
          </div>
        </section>

        {/* ── showreel strip ───────────────────────────────── */}
        <section aria-label="Example showreel" className="cv-auto border-b border-white/[0.08] py-10 sm:py-14">
          <div className="mx-auto max-w-5xl px-4">
            <SectionHeader
              kicker="Showreel"
              title={
                <>
                  Fresh out of the <span className="text-[#D7FF3F]">render queue.</span>
                </>
              }
            />
          </div>
          <Reveal delay={0.1} className="mt-8">
            <ShowreelCarousel onOpen={(i) => setReelOpen(i)} />
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
              <h2 className="font-display mt-6 max-w-[22ch] text-[30px] font-semibold leading-[1.12] tracking-[-0.01em] sm:text-[40px]">
                From words to file, <span className="text-[#00F0FF]">in four moves.</span>
              </h2>
            </Reveal>
            <div className="mt-12">
              <PipelineSteps />
            </div>
          </div>
        </section>

        {/* ── showcase ─────────────────────────────────────── */}
        <section aria-label="Example creations" className="cv-auto border-b border-white/[0.08] py-20 sm:py-28">
          <div className="mx-auto max-w-5xl px-4">
            <SectionHeader
              kicker="Showcase"
              title={
                <>
                  Made here, <span className="text-[#FF2D78]">priced per piece.</span>
                </>
              }
              subtitle="Every piece below was ordered, reviewed by a human, and delivered — each with the brief that made it."
            />
          </div>
          <div className="mx-auto mt-10 max-w-5xl px-4">
            <ShowcaseGrid onOpen={(i) => setCaseOpen(i)} />
          </div>
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
            <SectionHeader
              kicker="Motion"
              title={
                <>
                  Stills are the warm-up. <span className="text-[#00F0FF]">Video is live.</span>
                </>
              }
              subtitle={
                <>
                  Real 5s clips at {formatINR(priceOf("clip-5s"))} each — hover to preview, pick a reel,
                  tap to watch full-screen.
                </>
              }
            />
            <Reveal delay={0.1} className="mt-8">
              <VideoShowcase />
            </Reveal>
          </div>
        </section>

        {/* ── capability bento ─────────────────────────────── */}
        <section aria-label="What you can create" className="cv-auto mx-auto max-w-5xl px-4 py-20 sm:py-28">
          <SectionHeader
            kicker="Capabilities"
            title={
              <>
                One studio, <span className="text-[#D7FF3F]">three ways to create.</span>
              </>
            }
            titleClassName="max-w-[22ch]"
          />
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

        {/* ── made for: use-case landing pages ─────────────── */}
        <section aria-label="Made for you" className="cv-auto mx-auto max-w-5xl px-4 py-20 sm:py-28">
          <SectionHeader
            kicker="Use cases"
            title={
              <>
                Made for <span className="text-[#D7FF3F]">what you do.</span>
              </>
            }
            subtitle="Pick your lane — each page bundles the right tools, real examples and honest answers."
            titleClassName="max-w-[22ch]"
          />
          <Stagger className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {MADE_FOR.map((item) => (
              <StaggerItem key={item.href} className="h-full">
                <MadeForCard item={item} />
              </StaggerItem>
            ))}
          </Stagger>
        </section>

        {/* ── why pay-per-creation: the honest differentiator ── */}
        <section aria-label="Why pay per creation" className="cv-auto relative overflow-hidden border-b border-white/[0.08]">
          <div
            aria-hidden
            className="pointer-events-none absolute -left-40 top-0 h-96 w-96 rounded-full bg-[#D7FF3F]/[0.05] blur-3xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -right-40 bottom-0 h-96 w-96 rounded-full bg-[#00F0FF]/[0.05] blur-3xl"
          />
          <div className="relative mx-auto max-w-5xl px-4 py-20 sm:py-28">
            <SectionHeader
              kicker="Why Pixaura"
              title={
                <>
                  Subscriptions sell you access.{" "}
                  <span className="text-[#D7FF3F]">We sell you the thing.</span>
                </>
              }
              titleClassName="max-w-[24ch]"
              subtitle="Four reasons creators pick pay-per-creation over another monthly plan."
            />
            <Stagger className="mt-12 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
              {WHY_PILLARS.map((w, i) => (
                <StaggerItem key={w.title}>
                  <div className="group relative h-full border-t-2 pt-6 transition-colors duration-300" style={{ borderColor: `${w.accent}55` }}>
                    <span
                      aria-hidden
                      className="font-display pointer-events-none absolute -top-2 right-0 select-none text-[56px] font-bold leading-none text-white/[0.05] transition-colors duration-300 group-hover:text-white/[0.09] motion-reduce:transition-none"
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span
                      className="flex h-12 w-12 items-center justify-center rounded-2xl border bg-white/[0.03] transition-transform duration-300 group-hover:-translate-y-1 motion-reduce:transition-none"
                      style={{ borderColor: `${w.accent}44`, boxShadow: `0 0 24px -8px ${w.accent}77` }}
                    >
                      <w.icon className="h-6 w-6" style={{ color: w.accent }} strokeWidth={1.8} aria-hidden />
                    </span>
                    <h3 className="font-display mt-5 text-[18px] font-semibold tracking-[-0.01em] text-[#F5F5F3]">
                      {w.title}
                    </h3>
                    <p className="mt-2 text-[13.5px] leading-6 text-white/55">{w.copy}</p>
                  </div>
                </StaggerItem>
              ))}
            </Stagger>
            <Reveal delay={0.12}>
              <div className="mt-12 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="max-w-[46ch] text-[14px] leading-6 text-white/50">
                  No free-credit maze, no expiring packs — one honest price per
                  creation, shown before you pay.
                </p>
                <Link
                  href="/pricing"
                  className="inline-flex min-h-[48px] shrink-0 items-center gap-2 rounded-[12px] border border-[#D7FF3F]/40 px-6 py-3 text-[14px] font-semibold text-[#D7FF3F] transition-colors hover:bg-[#D7FF3F]/[0.08]"
                >
                  See full pricing <ArrowRight className="h-4 w-4" strokeWidth={2} />
                </Link>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ── FAQ (SEO: keyword questions + FAQPage schema) ── */}
        <section
          id="faq"
          aria-label="Frequently asked questions"
          className="cv-auto mx-auto max-w-5xl scroll-mt-24 px-4 py-20 sm:py-28"
        >
          <SectionHeader
            kicker="FAQ"
            title={
              <>
                Questions, <span className="text-[#D7FF3F]">answered straight.</span>
              </>
            }
            titleClassName="max-w-[24ch]"
          />
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
            {/* The ONE pricing section on the homepage: the full pay-per-creation
                pitch. Prices appear once here (and on /pricing), not repeated
                in strips across the page. */}
            <SectionHeader
              align="center"
              size="lg"
              kicker="The deal"
              title={
                <>
                  Pay per creation, <span className="v-iris-text">not per month.</span>
                </>
              }
              subtitle="No subscriptions. No credit packs. No renewals. The price you see is the price you pay — GST included."
            />
            <Stagger
              className="mt-8 flex flex-wrap items-center justify-center gap-2.5"
              aria-label="Price list"
            >
              {[
                { label: "Image", price: formatINR(priceOf("single-image")), },
                { label: "Product shot", price: formatINR(priceOf("product-photo")) },
                { label: "4-pack", price: formatINR(priceOf("pack-4")) },
                { label: "5s video", price: formatINR(priceOf("clip-5s")) },
                { label: "Studio job", price: formatINR(priceOf("video-studio")) },
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

        {/* ── explore more tools ──────────────────────────── */}
        <section
          aria-label="Explore more tools"
          className="cv-auto border-b border-white/[0.08] py-20 sm:py-24"
        >
          <div className="mx-auto max-w-5xl px-4">
            <SectionHeader
              kicker="Discover"
              title={
                <>
                  Explore <span className="text-[#D7FF3F]">more tools.</span>
                </>
              }
              subtitle="Every tool below is live right now — each pill opens the real thing at its exact price."
            />
            <Reveal delay={0.1} className="mt-10">
              <ToolPillDirectory />
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
