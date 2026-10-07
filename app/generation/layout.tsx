export const metadata = {
  title: "Your order | Etch",
  description:
    "Your Etch order: payment, human quality review, and delivery — all tracked in one place.",
  robots: { index: false, follow: true },
};

export default function GenerationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
