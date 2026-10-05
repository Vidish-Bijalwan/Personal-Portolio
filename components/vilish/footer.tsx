import Link from "next/link";
import Wordmark from "./wordmark";

const SITEMAP = [
  { href: "/", label: "Home" },
  { href: "/create", label: "Create" },
  { href: "/examples", label: "Examples" },
  { href: "/pricing", label: "Pricing" },
  { href: "/about", label: "About" },
];

export default function VilishFooter() {
  return (
    <footer className="border-t border-white/[0.08] bg-[#080808]">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <Wordmark size={20} />
            <p className="mt-2 text-[13px] text-white/45">
              One creation. One price. No subscription.
            </p>
            <p className="mt-3 text-[12px] text-white/40">
              UPI payments · Human QC · Exact price first
            </p>
          </div>
          <nav aria-label="Footer" className="grid grid-cols-2 gap-x-12 gap-y-2.5 sm:grid-cols-3">
            {SITEMAP.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-[13px] text-white/55 hover:text-white/90"
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
        <p className="mt-8 border-t border-white/[0.06] pt-5 text-[12px] leading-5 text-white/35">
          Prices include GST. All images shown are examples made with Vidish Studio.
        </p>
      </div>
    </footer>
  );
}
