import fs from "node:fs";
import path from "node:path";
import VilishNav from "@/components/vilish/nav";
import VilishFooter from "@/components/vilish/footer";
import ExamplesGrid, { type ExampleItem } from "@/components/vilish/examples-grid";

function loadManifest(): ExampleItem[] {
  try {
    const p = path.join(process.cwd(), "public", "examples", "manifest.json");
    const raw = fs.readFileSync(p, "utf-8");
    const data = JSON.parse(raw);
    if (!Array.isArray(data)) return [];
    return data.filter(
      (d): d is ExampleItem =>
        d && typeof d.src === "string" && typeof d.prompt === "string" && typeof d.price === "number",
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
          Made with VILISH
        </h1>
        <p className="mt-3 max-w-xl text-[15px] leading-7 text-white/[0.58]">
          Real generations, with the exact prompt and the exact price each one
          cost.
        </p>
        <div className="mt-10">
          <ExamplesGrid items={items} />
        </div>
      </main>
      <VilishFooter />
    </div>
  );
}
