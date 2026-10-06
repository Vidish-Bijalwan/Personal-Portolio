import fs from "node:fs";
import path from "node:path";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import VilishNav from "@/components/vilish/nav";
import VilishFooter from "@/components/vilish/footer";
import ExamplesGrid, {
  type ExampleItem,
} from "@/components/vilish/examples-grid";
import { isExampleItem } from "@/components/vilish/examples";
import Reveal from "@/components/motion/Reveal";

function loadManifest(): ExampleItem[] {
  try {
    const p = path.join(process.cwd(), "public", "examples", "manifest.json");
    const raw = fs.readFileSync(p, "utf-8");
    const data = JSON.parse(raw);
    if (!Array.isArray(data)) return [];
    // isExampleItem drops anything whose service doesn't resolve to a real
    // catalog product — no guessed prices, ever.
    return data.filter(isExampleItem);
  } catch {
    return [];
  }
}

export default function ExamplesPage() {
  const items = loadManifest();
  return (
    <div className="flex min-h-screen flex-col bg-[#080808] font-sans text-[#F5F5F3] antialiased">
      <VilishNav />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 pb-20 pt-10 sm:pt-16">
        <Reveal>
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-white/45">
            Examples
          </p>
          <h1 className="font-display mt-3 text-[34px] font-semibold leading-[1.05] tracking-[-0.02em] sm:text-[52px]">
            Made with Pixaura,{" "}
            <span className="v-iris-text">priced per piece.</span>
          </h1>
          <p className="mt-4 max-w-xl text-[15px] leading-7 text-white/[0.58]">
            Example creations made with Pixaura — the prompt and price shown for
            each.
          </p>
        </Reveal>
        <Reveal delay={0.1} className="mt-10">
          <ExamplesGrid items={items} />
        </Reveal>

        <Reveal className="mt-16">
          <div className="rounded-[20px] border border-white/[0.08] bg-[#121214] p-8 text-center sm:p-10">
            <h2 className="font-display text-[22px] font-semibold tracking-[-0.01em]">
              Like what you see?
            </h2>
            <p className="mx-auto mt-2 max-w-md text-[14px] leading-6 text-white/[0.58]">
              Describe your idea, pick a style, pay per creation. Your finished
              piece, delivered.
            </p>
            <Link
              href="/create"
              className="v-iris-bg mt-6 inline-flex items-center gap-2 rounded-[12px] px-7 py-3.5 text-[15px] font-semibold text-[#080808]"
            >
              Make yours <ArrowRight className="h-4 w-4" strokeWidth={2} />
            </Link>
          </div>
        </Reveal>
      </main>
      <VilishFooter />
    </div>
  );
}
