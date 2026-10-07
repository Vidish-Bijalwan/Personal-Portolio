import type { Metadata } from "next";
import UseCasePage from "@/components/vilish/usecase-page";
import { useCaseBySlug } from "@/src/lib/usecases/usecases";

const usecase = useCaseBySlug("for-creators")!;

export const metadata: Metadata = {
  title: "AI Content for Creators — Reels, Portraits, Motion | Etch",
  description: usecase.metaDescription,
  alternates: { canonical: "/for-creators" },
};

export default function ForCreatorsPage() {
  return <UseCasePage usecase={usecase} />;
}
