import Link from "next/link";

export default function VilishFooter() {
  return (
    <footer className="border-t border-white/[0.08] bg-[#080808]">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <p className="text-[15px] font-bold tracking-[0.22em] text-[#F5F5F3]">VILISH</p>
          <p className="mt-2 text-[13px] text-white/45">
            One creation. One price. No subscription.
          </p>
        </div>
        <nav aria-label="Footer" className="flex flex-wrap gap-x-6 gap-y-2">
          <Link href="/create" className="text-[13px] text-white/55 hover:text-white/90">Create</Link>
          <Link href="/examples" className="text-[13px] text-white/55 hover:text-white/90">Examples</Link>
          <Link href="/pricing" className="text-[13px] text-white/55 hover:text-white/90">Pricing</Link>
          <Link href="/about" className="text-[13px] text-white/55 hover:text-white/90">About</Link>
        </nav>
      </div>
    </footer>
  );
}
