/**
 * /posters — Etch Poster Studio gallery.
 *
 * Original, ready-to-customize flyer/poster templates. Each card shows a
 * real generated thumbnail; clicking a template opens its customizer.
 */
import VilishNav from "@/components/vilish/nav";
import VilishFooter from "@/components/vilish/footer";
import PosterGallery from "./poster-gallery";

export const metadata = {
  title: "Poster templates — customize and generate | Etch",
  description:
    "High-quality flyer and poster templates you can customize with your own words. Pick a template, edit the text and colors, generate — pay per poster, no subscription.",
  alternates: { canonical: "/posters" },
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
