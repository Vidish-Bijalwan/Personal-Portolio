import type { Metadata } from "next";
import UseCasePage from "@/components/vilish/usecase-page";
import { useCaseBySlug } from "@/src/lib/usecases/usecases";

const usecase = useCaseBySlug("for-sellers")!;

export const metadata: Metadata = {
  title: "AI Product Photography for Sellers — Pay Per Creation | Etch",
  description: usecase.metaDescription,
  alternates: { canonical: "/for-sellers" },
};

export default function ForSellersPage() {
  return <UseCasePage usecase={usecase} />;
}
