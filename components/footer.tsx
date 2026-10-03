"use client"

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer
      className="relative border-t border-[hsl(220,10%,22%)]"
      style={{ background: "hsl(222,14%,7%)" }}
    >
      <div className="max-w-[1400px] mx-auto px-8 md:px-16 py-6 flex items-center justify-between">
        {/* Left */}
        <p className="font-mono text-[10px] tracking-[0.15em] text-[hsl(220,8%,40%)]">
          VIDISH BIJALWAN · {year}
        </p>

        {/* Center — tagline */}
        <p className="hidden md:block font-mono text-[10px] tracking-[0.1em] text-[hsl(220,8%,30%)]">
          INTELLIGENCE ARCHIVE
        </p>

        {/* Right — status */}
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[hsl(145,55%,45%)] animate-pulse-amber" />
          <span className="font-mono text-[10px] tracking-[0.12em] text-[hsl(145,55%,45%)]">
            SYSTEM ONLINE
          </span>
        </div>
      </div>
    </footer>
  )
}
