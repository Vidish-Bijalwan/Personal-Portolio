/**
 * /posters — Etch Poster Studio gallery.
 *
 * Original, ready-to-customize flyer/poster templates. Each card shows a
 * real generated thumbnail; clicking a template opens its customizer.
 */
import VilishNav from "@/components/vilish/nav";
import VilishFooter from "@/components/vilish/footer";
import SeeItInAction from "@/components/tools/SeeItInAction";
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
      <div className="mx-auto w-full max-w-5xl px-4 pt-8">
        <SeeItInAction
          toolId="posters"
          custom={{
            name: "Poster Studio",
            video: "/tools/explainers/poster.mp4",
            poster: "/tools/explainers/poster-poster.jpg",
            label: "How Poster Studio works",
            steps: [
              {
                title: "Pick a template",
                copy: "Browse the real template gallery below — sale flyers, event posters, menu cards — and choose a starting design.",
              },
              {
                title: "Change the words & colors",
                copy: "Rewrite the headline, edit the text, and swap the palette in the customizer. You preview a sample before paying.",
              },
              {
                title: "Pay per poster, download HD",
                copy: "See the exact price before you pay. One UPI payment, no subscription — then download the high-resolution file.",
              },
            ],
            outcome:
              "A finished, print-ready poster from your words — exact price shown before you pay, one UPI payment, no subscription.",
          }}
        />
      </div>
      <PosterGallery />
      <VilishFooter />
    </div>
  );
}
