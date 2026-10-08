/**
 * /posters — Etch Poster Studio gallery.
 *
 * Original, ready-to-customize flyer/poster templates. Each card shows a
 * real generated thumbnail; clicking a template opens its customizer.
 */
import type { Metadata } from "next";
import VilishNav from "@/components/vilish/nav";
import VilishFooter from "@/components/vilish/footer";
import PosterGallery from "./poster-gallery";

const SITE_BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://tryetch.online";

export const metadata: Metadata = {
  title: "Poster templates — customize and generate | Etch",
  description:
    "High-quality flyer and poster templates you can customize with your own words. Pick a template, edit the text and colors, generate — pay per poster, no subscription.",
  alternates: { canonical: "/posters" },
  openGraph: {
    title: "Poster templates — customize and generate | Etch",
    description:
      "High-quality flyer and poster templates you can customize with your own words. Pick a template, edit the text and colors, generate — pay per poster, no subscription.",
    url: `${SITE_BASE}/posters`,
    siteName: "Etch",
    type: "website",
    images: [
      {
        url: `${SITE_BASE}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "Etch — one creation, one price. AI images and video tools with no subscription.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Poster templates — customize and generate | Etch",
    description:
      "High-quality flyer and poster templates you can customize with your own words. Pick a template, edit the text and colors, generate — pay per poster, no subscription.",
    images: [`${SITE_BASE}/og-image.png`],
  },
};

export default function PostersPage() {
  return (
    <div className="pro-surface pro-body min-h-screen">
      <VilishNav />
      <PosterGallery />
      <VilishFooter />
    </div>
  );
}
