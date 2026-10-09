import Link from "next/link";
import { ArrowUpRight, Github, Linkedin, Mail } from "lucide-react";
import { EtchMark } from "./nav";

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
      { href: "/privacy", label: "Privacy policy" },
      { href: "/terms", label: "Terms of service" },
      { href: "/refunds", label: "Refund policy" },
      { href: "/contact", label: "Contact us" },
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
    <footer
      className="pro-body relative overflow-hidden border-t"
      style={{
        borderColor: "var(--pro-border-soft)",
        background: "var(--pro-bg-sunken)",
        color: "var(--pro-fg)",
      }}
    >
      <div className="relative mx-auto max-w-6xl px-4 pb-10 pt-14 sm:px-6 sm:pt-16">
        {/* brand row */}
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-2.5">
              <EtchMark size={32} />
              <span
                className="pro-display text-[22px] font-bold"
                style={{ color: "var(--pro-fg)" }}
              >
                Etch
              </span>
            </div>
            <p
              className="mt-4 max-w-[38ch] text-[14px] leading-6"
              style={{ color: "var(--pro-muted)" }}
            >
              A pay-per-creation AI studio. One creation. One price. No
              subscription.
            </p>
          </div>
          <p
            className="text-[12.5px] leading-6 sm:text-right"
            style={{ color: "var(--pro-faint)" }}
          >
            UPI payments · Human QC · Exact price first
            <br />
            <span style={{ color: "var(--pro-muted)" }}>by Vidish Bijalwan</span>
          </p>
        </div>

        <hr
          className="pro-hr my-10"
          aria-hidden
        />

        {/* link grid */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-4 lg:grid-cols-4">
          {COLUMNS.map((col) => (
            <nav key={col.title} aria-label={`Footer — ${col.title}`}>
              <h3
                className="text-[11px] font-semibold uppercase"
                style={{
                  letterSpacing: "0.22em",
                  color: "var(--pro-faint)",
                }}
              >
                {col.title}
              </h3>
              <ul className="mt-5 space-y-3">
                {col.links.map((l) =>
                  l.href.startsWith("mailto:") ? (
                    <li key={l.label}>
                      <a
                        href={l.href}
                        className="group inline-flex min-h-[32px] items-center gap-1 text-[13.5px] transition-colors"
                        style={{ color: "var(--pro-muted)" }}
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
                        className="inline-flex min-h-[32px] items-center text-[13.5px] transition-colors"
                        style={{ color: "var(--pro-muted)" }}
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
            <h3
              className="text-[11px] font-semibold uppercase"
              style={{
                letterSpacing: "0.22em",
                color: "var(--pro-faint)",
              }}
            >
              Contact
            </h3>
            <ul className="mt-5 space-y-3">
              {CHANNELS.map((c) => (
                <li key={c.label}>
                  <a
                    href={c.href}
                    target={c.href.startsWith("mailto:") ? undefined : "_blank"}
                    rel="noopener noreferrer"
                    className="group inline-flex min-h-[32px] items-center gap-2.5 text-[13.5px] transition-colors"
                    style={{ color: "var(--pro-muted)" }}
                  >
                    <span
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border transition-colors"
                      style={{
                        borderColor: "var(--pro-border)",
                        background: "var(--pro-bg-elev)",
                      }}
                    >
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
        <div
          className="mt-12 flex flex-col gap-4 border-t pt-6 sm:flex-row sm:items-center sm:justify-between"
          style={{ borderColor: "var(--pro-border-soft)" }}
        >
          <p className="text-[12px] leading-5" style={{ color: "var(--pro-faint)" }}>
            Prices include GST. All images shown are examples.
          </p>
          <div className="flex items-center gap-4">
            <p className="text-[12px]" style={{ color: "var(--pro-faint)" }}>© 2026 Etch</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
