import Link from "next/link";
import { ArrowRight } from "lucide-react";
import VilishNav from "@/components/vilish/nav";
import VilishFooter from "@/components/vilish/footer";
import Reveal from "@/components/motion/Reveal";

export const metadata = {
  title: "Refund policy | Etch",
  description:
    "Etch's refund policy: failed renders are refunded automatically with no ticket needed, unfulfillable orders are cancelled and not charged, and there are no subscriptions to cancel.",
  alternates: { canonical: "/refunds" },
};

const SECTIONS = [
  {
    h: "Failed renders",
    body: [
      "If a render fails, you're refunded automatically — no support ticket, no wait.",
      "You are never charged for a creation you don't receive.",
    ],
  },
  {
    h: "Orders we can't fulfill",
    body: [
      "Every paid order passes a human quality check before delivery. If your brief can't be fulfilled — or we can't deliver at the promised quality — the order is cancelled and you are not charged.",
    ],
  },
  {
    h: "No subscriptions to cancel",
    body: [
      "Etch is pay-per-creation over UPI — there are no subscriptions, renewals, or plans to cancel. You only ever pay for the orders you place.",
      "Remakes have their own fixed price, shown before you pay — so you can iterate cheaply until it's right.",
    ],
  },
  {
    h: "Something looks wrong",
    body: [
      "If you were charged for a creation that never arrived, or something looks off on an order, email vidishbijalwan@gmail.com and we'll sort it out.",
      "Refunds go back to the UPI account the payment came from.",
    ],
  },
];

export default function RefundsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#080808] font-sans text-[#F5F5F3] antialiased">
      <VilishNav />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 pb-20 pt-10 sm:pt-16">
        <Reveal>
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-white/45">
            Refunds
          </p>
          <h1 className="font-display mt-3 text-[34px] font-semibold leading-[1.05] tracking-[-0.02em] sm:text-[52px]">
            If it fails, <span className="pro-accent-text">you don't pay.</span>
          </h1>
          <p className="mt-4 max-w-xl text-[15px] leading-7 text-white/[0.58]">
            Etch is a pay-per-creation studio run by one person. This policy
            says plainly what happens when something goes wrong. Last updated
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
              Something looks wrong?
            </h2>
            <p className="mx-auto mt-2 max-w-md text-[14px] leading-6 text-white/[0.55]">
              No ticket queue — email us and a human sorts it out.
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
