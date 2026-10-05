import fs from "node:fs";
import path from "node:path";
import Link from "next/link";
import VilishNav from "@/components/vilish/nav";
import VilishFooter from "@/components/vilish/footer";
import ExamplesGrid, {
  type ExampleCategory,
  type ExampleItem,
} from "@/components/vilish/examples-grid";

const VALID_CATEGORIES: ExampleCategory[] = ["image", "video", "edit", "ad"];

function loadManifest(): ExampleItem[] {
  try {
    const p = path.join(process.cwd(), "public", "examples", "manifest.json");
    const raw = fs.readFileSync(p, "utf-8");
    const data = JSON.parse(raw);
    if (!Array.isArray(data)) return [];
    return data.filter(
      (d): d is ExampleItem =>
        d &&
        typeof d.src === "string" &&
        typeof d.prompt === "string" &&
        typeof d.price === "string" &&
        VALID_CATEGORIES.includes(d.category),
    );
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
        <h1 className="text-[28px] font-semibold tracking-[-0.02em] sm:text-[36px]">
          Made with Vidish
        </h1>
        <p className="mt-3 max-w-xl text-[15px] leading-7 text-white/[0.58]">
          Example creations made with Vidish — the prompt and price shown for
          each.
        </p>
        <div className="mt-10">
          <ExamplesGrid items={items} />
        </div>

        <div className="mt-16 rounded-[20px] border border-white/[0.08] bg-[#121214] p-8 text-center sm:p-10">
          <h2 className="text-[22px] font-semibold tracking-[-0.01em]">
            Like what you see?
          </h2>
          <p className="mx-auto mt-2 max-w-md text-[14px] leading-6 text-white/[0.58]">
            Describe your idea, pick a style, pay per creation. Your finished
            piece, delivered.
          </p>
          <Link
            href="/create"
            className="v-iris-bg mt-6 inline-flex items-center gap-2 rounded-full border border-white/[0.14] px-6 py-3 text-[14px] font-semibold text-[#F5F5F3] transition hover:brightness-110"
          >
            Make yours <span aria-hidden="true">→</span>
          </Link>
        </div>
      </main>
      <VilishFooter />
    </div>
  );
}
