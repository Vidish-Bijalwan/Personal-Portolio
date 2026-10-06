import Link from "next/link";
import { Github, Linkedin, Mail } from "lucide-react";
import Wordmark from "./wordmark";
import CursorSettingsControl from "@/components/motion/CursorSettingsControl";

const COLUMNS = [
  {
    title: "Product",
    links: [
      { href: "/create", label: "Start creating" },
      { href: "/examples", label: "Examples" },
      { href: "/pricing", label: "Pricing" },
    ],
  },
  {
    title: "Studio",
    links: [
      { href: "/about", label: "About" },
      { href: "/blog", label: "Blog — guides & pricing explained" },
      { href: "/trends", label: "Trends — ready-made templates" },
      { href: "/create", label: "Free trial — 3 images a day" },
      { href: "/#faq", label: "FAQ" },
    ],
  },
  {
    title: "Help",
    links: [
      { href: "/#faq", label: "Questions, answered" },
      { href: "/pricing", label: "How pricing works" },
      { href: "mailto:vidishbijalwan@gmail.com", label: "Contact us" },
    ],
  },
];

/** Studio contact channels, copied from the site's own contact section. */
const CHANNELS = [
  {
    label: "Email",
    href: "mailto:vidishbijalwan@gmail.com",
    display: "vidishbijalwan@gmail.com",
    icon: Mail,
  },
  {
    label: "GitHub",
    href: "https://github.com/Vidish-Bijalwan",
    display: "Vidish-Bijalwan",
    icon: Github,
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/vidish-bijalwan",
    display: "vidish-bijalwan",
    icon: Linkedin,
  },
];

export default function VilishFooter() {
  return (
    <footer className="relative overflow-hidden border-t border-white/[0.08] bg-[#080808]">
      {/* faint brand wash along the top edge */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#D7FF3F]/50 to-transparent"
      />
      <div className="relative mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          {/* brand + contact */}
          <div>
            <Wordmark size={22} />
            <p className="mt-3 max-w-[32ch] text-[13.5px] leading-6 text-white/50">
              Pixaura is a pay-per-creation AI studio. One creation. One price.
              No subscription.
            </p>
            <p className="mt-3 text-[12px] text-white/40">
              UPI payments · Human QC · Exact price first
            </p>
            <div className="mt-6 space-y-2.5">
              {CHANNELS.map((c) => (
                <a
                  key={c.label}
                  href={c.href}
                  target={c.href.startsWith("mailto:") ? undefined : "_blank"}
                  rel="noopener noreferrer"
                  className="group flex items-center gap-3 text-[13px] text-white/55 transition-colors hover:text-white/90"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.1] bg-white/[0.03] transition-colors group-hover:border-[#D7FF3F]/40">
                    <c.icon className="h-4 w-4" strokeWidth={1.8} aria-hidden />
                  </span>
                  <span className="truncate">{c.display}</span>
                </a>
              ))}
            </div>
          </div>

          {/* link columns */}
          {COLUMNS.map((col) => (
            <nav key={col.title} aria-label={`Footer — ${col.title}`}>
              <h3 className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/40">
                {col.title}
              </h3>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((l) =>
                  l.href.startsWith("mailto:") ? (
                    <li key={l.label}>
                      <a
                        href={l.href}
                        className="text-[13.5px] text-white/60 transition-colors hover:text-[#D7FF3F]"
                      >
                        {l.label}
                      </a>
                    </li>
                  ) : (
                    <li key={l.label}>
                      <Link
                        href={l.href}
                        className="text-[13.5px] text-white/60 transition-colors hover:text-[#D7FF3F]"
                      >
                        {l.label}
                      </Link>
                    </li>
                  ),
                )}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-white/[0.06] pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[12px] leading-5 text-white/35">
            Prices include GST. All images shown are examples.
          </p>
          <div className="flex items-center gap-3">
            <CursorSettingsControl />
            <p className="text-[12px] text-white/30">© 2026 Pixaura</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
