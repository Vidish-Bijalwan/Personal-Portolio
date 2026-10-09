import Link from "next/link";
import { ArrowRight, ArrowUpRight, Clock, Github, Linkedin, Mail } from "lucide-react";
import VilishNav from "@/components/vilish/nav";
import VilishFooter from "@/components/vilish/footer";
import Reveal from "@/components/motion/Reveal";

export const metadata = {
  title: "Contact us | Etch",
  description:
    "Talk to a human at Etch: email, GitHub, and LinkedIn. Replies in your timezone (IST).",
  alternates: { canonical: "/contact" },
};

const CHANNELS = [
  {
    h: "Email",
    icon: Mail,
    href: "mailto:vidishbijalwan@gmail.com",
    display: "vidishbijalwan@gmail.com",
    note: "Best for orders, payments, and refunds — a human (Vidish) reads every message.",
  },
  {
    h: "GitHub",
    icon: Github,
    href: "https://github.com/Vidish-Bijalwan",
    display: "Vidish-Bijalwan",
    note: "For anything technical — bugs, integrations, open source.",
  },
  {
    h: "LinkedIn",
    icon: Linkedin,
    href: "https://www.linkedin.com/in/vidish-bijalwan",
    display: "vidish-bijalwan",
    note: "For business enquiries and partnerships.",
  },
];

export default function ContactPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#080808] font-sans text-[#F5F5F3] antialiased">
      <VilishNav />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 pb-20 pt-10 sm:pt-16">
        <Reveal>
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-white/45">
            Contact
          </p>
          <h1 className="font-display mt-3 text-[34px] font-semibold leading-[1.05] tracking-[-0.02em] sm:text-[52px]">
            Talk to <span className="pro-accent-text">a human.</span>
          </h1>
          <p className="mt-4 max-w-xl text-[15px] leading-7 text-white/[0.58]">
            Etch is run by one person, not a support desk. No ticket queue, no
            form that disappears into the void — pick a channel and it reaches
            Vidish directly.
          </p>
        </Reveal>

        <div className="mt-12 space-y-4">
          {CHANNELS.map((c) => (
            <Reveal key={c.h}>
              <a
                href={c.href}
                target={c.href.startsWith("mailto:") ? undefined : "_blank"}
                rel="noopener noreferrer"
                className="group flex items-center gap-4 rounded-[16px] border border-white/[0.08] bg-[#101012] px-5 py-5 transition-colors hover:border-white/[0.16]"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[12px] border border-white/[0.1] bg-white/[0.03]">
                  <c.icon className="h-5 w-5" strokeWidth={1.8} aria-hidden />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[15px] font-semibold">
                    {c.h}
                  </span>
                  <span className="block truncate text-[14px] text-white/[0.62]">
                    {c.display}
                  </span>
                  <span className="mt-1 block text-[13px] leading-5 text-white/40">
                    {c.note}
                  </span>
                </span>
                <ArrowUpRight
                  className="h-5 w-5 shrink-0 text-white/40 transition-colors group-hover:text-white"
                  aria-hidden
                />
              </a>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-10">
          <div className="flex items-start gap-3 rounded-[16px] border border-white/[0.08] bg-[#101012] px-5 py-5">
            <Clock className="mt-0.5 h-5 w-5 shrink-0 text-white/50" aria-hidden />
            <p className="text-[14px] leading-7 text-white/[0.62]">
              Replies in your timezone (IST). If your email is about an order,
              mention the order details or the email on your Etch account — it
              gets you an answer faster.
            </p>
          </div>
        </Reveal>

        <Reveal className="mt-10">
          <div className="rounded-[20px] border border-white/[0.08] bg-[#101012] px-6 py-10 text-center">
            <h2 className="font-display text-[22px] font-semibold">
              Fastest way to reach us
            </h2>
            <p className="mx-auto mt-2 max-w-md text-[14px] leading-6 text-white/[0.55]">
              One tap opens your email app with our address ready.
            </p>
            <a
              href="mailto:vidishbijalwan@gmail.com"
              className="mt-6 inline-flex min-h-[44px] items-center gap-2 rounded-[12px] bg-[var(--pro-btn)] px-7 py-3 text-[15px] font-semibold text-[var(--pro-btn-ink)] hover:opacity-95"
            >
              vidishbijalwan@gmail.com <ArrowRight className="h-4 w-4" />
            </a>
            <p className="mt-6 text-[13px] text-white/40">
              <Link href="/" className="underline underline-offset-4 hover:text-white/70">
                Back to Etch
              </Link>
            </p>
          </div>
        </Reveal>
      </main>
      <VilishFooter />
    </div>
  );
}
