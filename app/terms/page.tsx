import Link from "next/link";
import { ArrowRight } from "lucide-react";
import VilishNav from "@/components/vilish/nav";
import VilishFooter from "@/components/vilish/footer";
import Reveal from "@/components/motion/Reveal";

export const metadata = {
  title: "Terms of service | Etch",
  description:
    "Etch's terms: pay-per-creation AI images and video, UPI payments, exact price before payment, human review of every order, and acceptable use.",
  alternates: { canonical: "/terms" },
};

const SECTIONS = [
  {
    h: "What Etch is",
    body: [
      "Etch is a pay-per-creation AI studio run by one person (Vidish Bijalwan). You pay for individual images and video clips — there is no subscription and no account minimum.",
      "You describe what you want in plain words, see the exact price before anything is charged, pay per order over UPI, and receive your finished files to download.",
    ],
  },
  {
    h: "How orders work",
    body: [
      "Every paid generation is reviewed by a human before delivery. You see a watermarked preview first; the clean file is unlocked once your payment is verified.",
      "The price shown on the order screen is the price you pay — one creation, one price, quoted up front.",
      "You own the files we deliver to you. You can use them in your business, your ads, and your posts.",
    ],
  },
  {
    h: "Payments",
    body: [
      "Payments are per order, made over UPI. There are no subscriptions, renewals, or saved billing cycles to cancel.",
      "We never see or store your UPI PIN or bank credentials — payment records are order amounts and UPI transaction references used to verify your order.",
    ],
  },
  {
    h: "Acceptable use",
    body: [
      "Don't use Etch for anything illegal, harmful, or deceptive — no fraud, no impersonation, no content that harms others.",
      "We can decline an order we can't fulfill or that breaks these terms. If we've already taken payment and can't deliver, the order is cancelled and you are not charged.",
      "Prompts and reference uploads are used only to fulfill your order; your dashboard stays private to your account.",
    ],
  },
  {
    h: "Fair use of the service",
    body: [
      "The free trial (3 images a day) is for genuine personal use — one person, one account.",
      "We may change prices, tools, or features over time. The price shown on your order screen always applies to that order.",
    ],
  },
  {
    h: "Contact",
    body: [
      "Questions about these terms? Email vidishbijalwan@gmail.com — a human (Vidish) reads every message.",
    ],
  },
];

export default function TermsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#080808] font-sans text-[#F5F5F3] antialiased">
      <VilishNav />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 pb-20 pt-10 sm:pt-16">
        <Reveal>
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-white/45">
            Terms
          </p>
          <h1 className="font-display mt-3 text-[34px] font-semibold leading-[1.05] tracking-[-0.02em] sm:text-[52px]">
            Plain rules, <span className="pro-accent-text">no fine print.</span>
          </h1>
          <p className="mt-4 max-w-xl text-[15px] leading-7 text-white/[0.58]">
            Etch is a pay-per-creation studio run by one person. These terms
            say plainly what the service is and what's expected of you. Last
            updated October 2026.
          </p>
        </Reveal>
        <div className="mt-12 space-y-10">
          {SECTIONS.map((s) => (
            <Reveal key={s.h}>
              <section>
                <h2 className="font-display text-[20px] font-semibold tracking-[-0.01em]">
                  {s.h}
                </h2>
                <ul className="mt-4 space-y-3">
                  {s.body.map((b, i) => (
                    <li
                      key={i}
                      className="text-[14px] leading-7 text-white/[0.62]"
                    >
                      {b}
                    </li>
                  ))}
                </ul>
              </section>
            </Reveal>
          ))}
        </div>
        <Reveal className="mt-14">
          <div className="rounded-[20px] border border-white/[0.08] bg-[#101012] px-6 py-10 text-center">
            <h2 className="font-display text-[22px] font-semibold">
              Disagree with something?
            </h2>
            <p className="mx-auto mt-2 max-w-md text-[14px] leading-6 text-white/[0.55]">
              No legal maze — email us and a human replies.
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
