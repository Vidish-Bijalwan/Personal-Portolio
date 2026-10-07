import Link from "next/link";
import { ArrowUpRight, Github, Linkedin, Mail } from "lucide-react";
import Wordmark from "./wordmark";
import CursorSettingsControl from "@/components/motion/CursorSettingsControl";

const COLUMNS = [
  {
    title: "Product",
    links: [
      { href: "/create", label: "Start creating" },
      { href: "/tools", label: "All tools" },
      { href: "/examples", label: "Examples" },
      { href: "/pricing", label: "Pricing" },
      { href: "/for-sellers", label: "For sellers" },
      { href: "/for-creators", label: "For creators" },
      { href: "/for-marketers", label: "For marketers" },
    ],
  },
  {
    title: "Studio",
    links: [
      { href: "/about", label: "About" },
      { href: "/trends", label: "Trends — ready-made templates" },
      { href: "/blog", label: "Blog — guides & pricing explained" },
      { href: "/create", label: "Free trial — 3 images a day" },
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
    <footer className="relative overflow-hidden border-t border-white/[0.08] bg-[#070708]">
      {/* brand wash along the top edge */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#D7FF3F]/60 via-[#00F0FF]/30 to-transparent"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 left-1/2 h-64 w-[720px] -translate-x-1/2 rounded-full bg-[#D7FF3F]/[0.04] blur-3xl"
      />
      <div className="relative mx-auto max-w-6xl px-4 pb-10 pt-14 sm:px-6 sm:pt-20">
        {/* brand row */}
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Wordmark size={30} />
            <p className="mt-4 max-w-[38ch] text-[14px] leading-6 text-white/55">
              A pay-per-creation AI studio. One creation. One price. No
              subscription.
            </p>
          </div>
          <p className="text-[12.5px] leading-6 text-white/40 sm:text-right">
            UPI payments · Human QC · Exact price first
            <br />
            <span className="text-white/55">by Vidish Bijalwan</span>
          </p>
        </div>

        <div
          aria-hidden
          className="my-10 h-px bg-gradient-to-r from-transparent via-white/[0.1] to-transparent"
        />

        {/* link grid */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-4 lg:grid-cols-4">
          {COLUMNS.map((col) => (
            <nav key={col.title} aria-label={`Footer — ${col.title}`}>
              <h3 className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/40">
                {col.title}
              </h3>
              <ul className="mt-5 space-y-3">
                {col.links.map((l) =>
                  l.href.startsWith("mailto:") ? (
                    <li key={l.label}>
                      <a
                        href={l.href}
                        className="group inline-flex min-h-[32px] items-center gap-1 text-[13.5px] text-white/60 transition-colors hover:text-[#D7FF3F]"
                      >
                        {l.label}
                        <ArrowUpRight
                          className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100"
                          strokeWidth={2}
                          aria-hidden
                        />
                      </a>
                    </li>
                  ) : (
                    <li key={l.label}>
                      <Link
                        href={l.href}
                        className="inline-flex min-h-[32px] items-center text-[13.5px] text-white/60 transition-colors hover:text-[#D7FF3F]"
                      >
                        {l.label}
                      </Link>
                    </li>
                  ),
                )}
              </ul>
            </nav>
          ))}

          {/* contact column */}
          <div>
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/40">
              Contact
            </h3>
            <ul className="mt-5 space-y-3">
              {CHANNELS.map((c) => (
                <li key={c.label}>
                  <a
                    href={c.href}
                    target={c.href.startsWith("mailto:") ? undefined : "_blank"}
                    rel="noopener noreferrer"
                    className="group inline-flex min-h-[32px] items-center gap-2.5 text-[13.5px] text-white/60 transition-colors hover:text-white/95"
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-white/[0.1] bg-white/[0.03] transition-colors group-hover:border-[#D7FF3F]/40">
                      <c.icon className="h-3.5 w-3.5" strokeWidth={1.8} aria-hidden />
                    </span>
                    <span className="truncate">{c.display}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* bottom bar */}
        <div className="mt-12 flex flex-col gap-4 border-t border-white/[0.06] pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[12px] leading-5 text-white/35">
            Prices include GST. All images shown are examples.
          </p>
          <div className="flex items-center gap-4">
            <CursorSettingsControl />
            <p className="text-[12px] text-white/30">© 2026 Etch</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
