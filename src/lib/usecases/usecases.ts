/**
 * Pixaura — use-case landing pages (/for-sellers, /for-creators, /for-marketers).
 *
 * Each use case bundles real tools (by TOOL_DIRECTORY id), real example
 * images (by /public/examples path + catalog service for price/CTA), and
 * real template deep links. Everything resolves to something that exists —
 * validated by test.
 *
 * HARD RULES:
 * - No fake stats, no fake reviews, no invented numbers, no "trusted by".
 * - All copy must be true of actual fulfillment: operator-fulfilled,
 *   human QC, one UPI payment, no subscription.
 * - Zero hardcoded ₹ literals — prices derive from the catalog at render.
 */

import type { ExampleServiceId } from "@/components/vilish/examples";

export interface UseCaseExample {
  src: string;
  caption: string;
  service: ExampleServiceId;
}

export interface UseCaseTemplate {
  id: string;
  label: string;
}

export interface UseCaseFaq {
  q: string;
  a: string;
}

export interface UseCase {
  slug: "for-sellers" | "for-creators" | "for-marketers";
  navLabel: string;
  kicker: string;
  title: string;
  /** Accent word inside the title. */
  titleAccent: string;
  subtitle: string;
  heroImage: string;
  heroImageAlt: string;
  /** TOOL_DIRECTORY ids featured on this page. */
  toolIds: string[];
  examples: [UseCaseExample, UseCaseExample, UseCaseExample];
  templates: UseCaseTemplate[];
  faqs: UseCaseFaq[];
  accent: string;
  metaDescription: string;
}

export const USE_CASES: readonly UseCase[] = [
  {
    slug: "for-sellers",
    navLabel: "For sellers",
    kicker: "For sellers",
    title: "Product shots",
    titleAccent: "that sell.",
    subtitle:
      "Studio-grade product photography and ad creatives without booking a studio. Show your product, see the exact price, pay once — list it the same day.",
    heroImage: "/examples/10-perfume-ad.webp",
    heroImageAlt: "Luxury perfume product shot — AI-generated example",
    toolIds: ["product-photo", "pack-4", "clip-5s"],
    examples: [
      {
        src: "/examples/10-perfume-ad.webp",
        caption: "Luxury perfume, faceted glass",
        service: "product-photo",
      },
      {
        src: "/examples/4-food-photo.webp",
        caption: "Burger, dramatic side light",
        service: "product-photo",
      },
      {
        src: "/examples/5-watch-ad.webp",
        caption: "Floating chronograph, dramatic rim light",
        service: "product-photo",
      },
    ],
    templates: [
      { id: "billboard-launch", label: "Billboard Launch" },
      { id: "unboxing-spotlight", label: "Unboxing Spotlight" },
      { id: "product-splash", label: "Product Splash" },
    ],
    faqs: [
      {
        q: "Do I need professional photos of my product first?",
        a: "No. A clear phone photo works as a reference — attach it in the composer and describe the shot you want. The clearer the reference, the closer the match.",
      },
      {
        q: "Will shoppers trust an AI product photo?",
        a: "Every product shot passes human QC against your reference before delivery. If it doesn't look like your product, the cheap remake option covers you.",
      },
      {
        q: "What does it cost per listing?",
        a: "One product photo is a single fixed price, shown before you pay. A 4-pack of variations costs less than four singles. No subscription, ever.",
      },
      {
        q: "Can I get a plain white-background shot for my catalog?",
        a: "Yes — ask for a clean studio backdrop in your brief. It's the most popular seller request.",
      },
      {
        q: "Who owns the images?",
        a: "You do. Use them in listings, ads, menus and packaging however you like.",
      },
    ],
    accent: "#D7FF3F",
    metaDescription:
      "AI product photography for sellers: studio-grade product shots, ad creatives and 5s product clips. Fixed price per creation, no subscription. Pixaura.",
  },
  {
    slug: "for-creators",
    navLabel: "For creators",
    kicker: "For creators",
    title: "Content that looks",
    titleAccent: "expensive.",
    subtitle:
      "Portraits, reels and motion clips with a studio finish — without the studio. Describe the vibe, see the exact price, pay once per piece.",
    heroImage: "/examples/2-neon-portrait.webp",
    heroImageAlt: "Stylized neon portrait — AI-generated example",
    toolIds: ["clip-5s", "single-image", "caption", "gif", "tts"],
    examples: [
      {
        src: "/examples/2-neon-portrait.webp",
        caption: "Neon portrait, city lights",
        service: "single-image",
      },
      {
        src: "/examples/9-fashion-editorial.webp",
        caption: "Fashion editorial, sculptural hair",
        service: "single-image",
      },
      {
        src: "/examples/8-sportscar.webp",
        caption: "Neon night, wet asphalt",
        service: "single-image",
      },
    ],
    templates: [
      { id: "neon-noir-portrait", label: "Neon Noir Portrait" },
      { id: "slow-dance-rain-clip", label: "Slow Dance Rain Clip" },
      { id: "royal-pet-portrait", label: "Royal Pet Portrait" },
    ],
    faqs: [
      {
        q: "Can I animate my own photo into a reel?",
        a: "Yes. Attach your photo as the start image on a 5s video clip order and describe the motion — portraits that breathe, product shots that move.",
      },
      {
        q: "Do the videos come captioned?",
        a: "Captions are a separate Video Studio tool: upload your clip, paste your script (or try auto), and get styled captions burned in.",
      },
      {
        q: "What does one reel cost me?",
        a: "Every tool has one fixed price, shown before you pay. A 5s clip, a captioned cut, a GIF — each priced per piece, no subscription.",
      },
      {
        q: "Can I use this for client work?",
        a: "Yes. You own what you order — use it in your content, your clients' content, anywhere.",
      },
      {
        q: "How fast is turnaround?",
        a: "Orders are fulfilled by an operator after payment confirmation — you pay, we make it, a human reviews it before delivery. You'll see live progress stages while you wait.",
      },
    ],
    accent: "#00F0FF",
    metaDescription:
      "AI content for creators: 5s video clips, portraits, auto captions, GIFs and voice-overs. Fixed price per creation, no subscription. Pixaura.",
  },
  {
    slug: "for-marketers",
    navLabel: "For marketers",
    kicker: "For marketers",
    title: "Campaign creatives",
    titleAccent: "on demand.",
    subtitle:
      "Ad variants, product shots and motion teasers without the agency timeline. Brief it like you'd brief a designer — pay per piece, not per month.",
    heroImage: "/examples/1-sneaker-ad.webp",
    heroImageAlt: "Cinematic sneaker product photograph — AI-generated example",
    toolIds: ["pack-4", "product-photo", "add-audio", "clip-5s"],
    examples: [
      {
        src: "/examples/1-sneaker-ad.webp",
        caption: "Floating sneaker, studio shot",
        service: "single-image",
      },
      {
        src: "/examples/10-perfume-ad.webp",
        caption: "Golden perfume, faceted glass",
        service: "product-photo",
      },
      {
        src: "/examples/4-food-photo.webp",
        caption: "Burger, dramatic side light",
        service: "product-photo",
      },
    ],
    templates: [
      { id: "ad-remix-pack", label: "Ad Remix Pack" },
      { id: "billboard-launch", label: "Billboard Launch" },
      { id: "product-hero-clip", label: "Product Hero Clip" },
    ],
    faqs: [
      {
        q: "Can I get multiple ad variants for testing?",
        a: "That's what the 4-pack is for — four takes on one concept for less than four singles. Perfect for A/B testing hooks and angles.",
      },
      {
        q: "Do you do the ad copy too?",
        a: "You bring the brief — the words, the offer, the angle. We make the visual. For video, the voice-over tool can narrate your script.",
      },
      {
        q: "How do revisions work?",
        a: "Every order has a cheap remake option, and nothing ships until it passes human QC. Describe what to change and we re-run it.",
      },
      {
        q: "Is there a retainer or minimum spend?",
        a: "No. No subscription, no credit packs, no minimums. One creation, one price, whenever you need it.",
      },
      {
        q: "Who owns the creatives?",
        a: "You do — full usage rights for ads, socials and campaigns.",
      },
    ],
    accent: "#FF2D78",
    metaDescription:
      "AI ad creatives for marketers: product shots, ad variant packs, motion teasers. Fixed price per piece, no retainer, no subscription. Pixaura.",
  },
];

export function useCaseBySlug(slug: string): UseCase | undefined {
  return USE_CASES.find((u) => u.slug === slug);
}
