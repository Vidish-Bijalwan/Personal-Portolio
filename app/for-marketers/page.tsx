import type { Metadata } from "next";
import UseCasePage from "@/components/vilish/usecase-page";
import { useCaseBySlug } from "@/src/lib/usecases/usecases";

const usecase = useCaseBySlug("for-marketers")!;

export const metadata: Metadata = {
  title: "AI Ad Creatives for Marketers — Pay Per Piece | Etch",
  description: usecase.metaDescription,
  alternates: { canonical: "/for-marketers" },
};

export default function ForMarketersPage() {
  return <UseCasePage usecase={usecase} />;
}
