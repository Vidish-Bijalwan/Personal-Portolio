/**
 * /posters/[id] — customize a poster template.
 *
 * Edit the template's text fields, pick a color palette, optionally describe
 * changes in plain words — then generate through the standard /create flow
 * (same generation API, same watermarked preview, same unlock payment).
 */
import { notFound } from "next/navigation";
import VilishNav from "@/components/vilish/nav";
import VilishFooter from "@/components/vilish/footer";
import { templateById } from "@/data/poster-templates/templates";
import PosterCustomizer from "./poster-customizer";

export function generateMetadata({ params }: { params: { id: string } }) {
  const t = templateById(params.id);
  if (!t) return { title: "Template not found | Etch" };
  return {
    title: `${t.name} poster template — customize and generate | Etch`,
    description: `Customize the ${t.name} ${t.category.toLowerCase()} poster template with your own words and colors. ${t.tagline}.`,
    alternates: { canonical: `/posters/${t.id}` },
  };
}

export default function PosterTemplatePage({ params }: { params: { id: string } }) {
  const template = templateById(params.id);
  if (!template) notFound();
  return (
    <div className="pro-surface pro-body min-h-screen">
      <VilishNav />
      <PosterCustomizer template={template} />
      <VilishFooter />
    </div>
  );
}
