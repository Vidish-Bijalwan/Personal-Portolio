import Link from "next/link";
import { ArrowRight } from "lucide-react";
import VilishNav from "@/components/vilish/nav";
import VilishFooter from "@/components/vilish/footer";
import Reveal from "@/components/motion/Reveal";

export const metadata = {
  title: "Privacy policy | Etch",
  description:
    "How Etch handles your data: what we collect (account, orders, payments), what we never do, and how to reach us.",
  alternates: { canonical: "/privacy" },
};

const SECTIONS = [
  {
    h: "What we collect",
    body: [
      "Account details you give us when you sign up — your name and email address.",
      "Order details — your prompts, reference files you upload, and the creations we deliver to you.",
      "Payment records — order amounts and UPI transaction references, so we can verify your payment and deliver your order. We never see or store your UPI PIN or bank credentials.",
    ],
  },
  {
    h: "What we use it for",
    body: [
      "Creating and delivering your orders, and showing your order history in your dashboard.",
      "Verifying UPI payments against your orders.",
      "Improving the service — for example, understanding which tools people actually use.",
    ],
  },
  {
    h: "What we never do",
    body: [
      "We never sell your personal data to anyone.",
      "We never share your prompts, reference photos, or creations publicly — your dashboard is private to your account.",
      "We never run ads against your data or use your creations to advertise without your permission.",
    ],
  },
  {
    h: "Cookies and analytics",
    body: [
      "We use a small number of cookies to keep you signed in and remember basic preferences.",
      "We use privacy-respecting analytics to understand overall usage. No cross-site tracking, no ad profiling.",
    ],
  },
  {
    h: "Your control",
    body: [
      "You can ask for a copy of your data or ask us to delete your account and its data — email vidishbijalwan@gmail.com and we'll handle it.",
      "Deleting your account removes your profile, orders, and uploaded files from our systems.",
    ],
  },
  {
    h: "Contact",
    body: [
      "Questions about privacy? Email vidishbijalwan@gmail.com — a human (Vidish) reads every message.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#080808] font-sans text-[#F5F5F3] antialiased">
      <VilishNav />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 pb-20 pt-10 sm:pt-16">
        <Reveal>
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-white/45">
            Privacy
          </p>
          <h1 className="font-display mt-3 text-[34px] font-semibold leading-[1.05] tracking-[-0.02em] sm:text-[52px]">
            Your data, <span className="pro-accent-text">your business.</span>
          </h1>
          <p className="mt-4 max-w-xl text-[15px] leading-7 text-white/[0.58]">
            Etch is a pay-per-creation studio run by one person. This policy
            says plainly what we collect and what we never do. Last updated
            October 2026.
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
              Questions? Just ask.
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
