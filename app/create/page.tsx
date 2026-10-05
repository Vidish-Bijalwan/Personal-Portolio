import Link from "next/link";
import { ArrowRight, BadgeCheck, ShieldCheck, Wallet } from "lucide-react";
import VilishNav from "@/components/vilish/nav";
import VilishFooter from "@/components/vilish/footer";
import Composer from "@/components/vilish/composer";
import FulfillmentNotices from "@/components/vilish/fulfillment-notices";

const NEXT_STEPS = [
  {
    step: "01",
    title: "Pay",
    text: "One UPI payment for the exact quoted price. No account needed until checkout.",
  },
  {
    step: "02",
    title: "Human review + creation",
    text: "A human reviews your brief and creates your piece — checked before anything ships.",
  },
  {
    step: "03",
    title: "QC + delivery",
    text: "Your creation passes quality control, then lands in your hands to download.",
  },
];

const TRUST_BADGES = [
  { icon: Wallet, label: "UPI payments" },
  { icon: ShieldCheck, label: "Human QC on every order" },
  { icon: BadgeCheck, label: "Exact price first" },
];

export default async function CreatePage({
  searchParams,
}: {
  searchParams: Promise<{ media?: string }>;
}) {
  const sp = await searchParams;
  const initialMedia = sp?.media === "video" ? "video" : "image";
  return (
    <div className="flex min-h-screen flex-col bg-[#080808] font-sans text-[#F5F5F3] antialiased">
      <VilishNav />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 pb-16 pt-10 sm:pt-16">
        <h1 className="font-display text-[26px] font-semibold tracking-[-0.02em] sm:text-[32px]">
          {initialMedia === "video" ? "Create a 5s video clip" : "Create an image"}
        </h1>
        <p className="mt-2 text-[14px] leading-6 text-white/[0.58]">
          {initialMedia === "video"
            ? "Describe the 5-second clip. ₹99, made for you in minutes."
            : "Describe what you want. You\u2019ll see the exact price before anything is charged."}
        </p>
        <FulfillmentNotices />
        <div className="mt-6">
          <Composer variant="page" initialMedia={initialMedia} />
        </div>
        <p className="mt-6 text-[13px] leading-6 text-white/40">
          Every order is quoted at a fixed, human-reviewed price — the number
          you see is the number you pay. If a render fails, you&apos;re refunded
          automatically — no support ticket, no wait.
        </p>

        {/* ── what happens next ── */}
        <section aria-label="What happens next" className="mt-12">
          <h2 className="font-display text-[20px] font-semibold tracking-[-0.01em]">
            What happens next
          </h2>
          <ol className="mt-5 grid gap-4 sm:grid-cols-3">
            {NEXT_STEPS.map((s) => (
              <li
                key={s.step}
                className="rounded-[16px] border border-white/[0.08] bg-[#121214] p-5"
              >
                <span
                  aria-hidden
                  className="font-display text-[24px] font-bold leading-none text-white/25 tabular-nums"
                >
                  {s.step}
                </span>
                <h3 className="mt-3 text-[15px] font-semibold">{s.title}</h3>
                <p className="mt-1.5 text-[13px] leading-6 text-white/[0.55]">
                  {s.text}
                </p>
              </li>
            ))}
          </ol>
          <ul className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2.5">
            {TRUST_BADGES.map((b) => (
              <li
                key={b.label}
                className="flex items-center gap-2 text-[13px] text-white/60"
              >
                <b.icon className="h-4 w-4 text-white/75" strokeWidth={1.8} />
                {b.label}
              </li>
            ))}
          </ul>
          <p className="mt-6">
            <Link
              href="/examples"
              className="inline-flex items-center gap-1.5 text-[14px] font-medium text-[#F5F5F3] underline decoration-white/25 underline-offset-4 hover:decoration-white/60"
            >
              Not sure what to make? Browse examples <ArrowRight className="h-4 w-4" strokeWidth={1.8} />
            </Link>
          </p>
        </section>
      </main>
      <VilishFooter />
    </div>
  );
}
