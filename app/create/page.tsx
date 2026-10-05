import VilishNav from "@/components/vilish/nav";
import VilishFooter from "@/components/vilish/footer";
import Composer from "@/components/vilish/composer";
import FulfillmentNotices from "@/components/vilish/fulfillment-notices";

export default function CreatePage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#080808] font-sans text-[#F5F5F3] antialiased">
      <VilishNav />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 pb-16 pt-10 sm:pt-16">
        <h1 className="text-[26px] font-semibold tracking-[-0.02em] sm:text-[32px]">
          Create an image
        </h1>
        <p className="mt-2 text-[14px] leading-6 text-white/[0.58]">
          Describe what you want. You&apos;ll see the exact price before anything
          is charged.
        </p>
        <FulfillmentNotices />
        <div className="mt-6">
          <Composer variant="page" />
        </div>
        <p className="mt-6 text-[13px] leading-6 text-white/40">
          Every generation is quoted live from real provider costs. If a render
          fails, you&apos;re refunded automatically — no support ticket, no wait.
        </p>
      </main>
      <VilishFooter />
    </div>
  );
}
