import type { Metadata } from "next";

/**
 * /about/portfolio — Vidish Bijalwan's personal developer portfolio
 * (preserved from the original Personal-Portolio site). It is a client
 * component, so its metadata lives here in the layout.
 */
export const metadata: Metadata = {
  title: "Vidish Bijalwan — Developer Portfolio | Etch",
  description:
    "Vidish Bijalwan's personal portfolio — projects, experience, and engineering work.",
  alternates: { canonical: "/about/portfolio" },
};

export default function AboutPortfolioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
