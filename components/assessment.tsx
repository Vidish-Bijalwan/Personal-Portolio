"use client"

import { FileText, Link as LinkIcon, Video, ExternalLink } from "lucide-react"

export default function Assessment() {
  return (
    <section
      id="assessment"
      className="relative py-20"
      style={{ background: "hsl(0,0%,3%)", borderTop: "1px solid hsl(210,5%,12%)" }}
    >
      <div className="max-w-[1400px] mx-auto px-8 md:px-16">
        {/* Header */}
        <div className="flex items-center gap-3 mb-12">
          <div className="w-6 h-px bg-[hsl(38,90%,52%)]" />
          <span className="mono-label text-[10px]">PESE600 · SESSIONAL ASSESSMENT</span>
          <div className="flex-1 h-px bg-[hsl(210,5%,12%)]" />
          <span className="font-mono text-[9px] tracking-[0.1em] text-[hsl(210,5%,24%)]">EVALUATOR ACCESS</span>
        </div>

        <p className="text-sm text-[hsl(210,5%,50%)] mb-12 font-light max-w-xl">
          Submission materials for the PESE600 Sessional Assessment — e-portfolio, handwritten essay, and recorded self-introduction.
        </p>

        {/* Assessment panels */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-[hsl(210,5%,12%)]">
          {/* Panel 1 */}
          <div
            className="p-8 group hover:bg-[hsl(0,0%,7%)] transition-colors duration-250"
            style={{ background: "hsl(0,0%,4%)" }}
          >
            <div className="flex items-center gap-2 mb-6">
              <LinkIcon className="w-4 h-4 text-[hsl(38,90%,52%)]" />
              <span className="mono-label text-[10px]">E-PORTFOLIO</span>
            </div>
            <p className="text-sm text-[hsl(210,5%,55%)] leading-relaxed mb-8">
              The live, updated interactive portfolio. You are currently viewing it.
            </p>
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="font-mono text-[11px] tracking-[0.1em] text-[hsl(38,90%,52%)] hover:text-[hsl(40,10%,88%)] transition-colors duration-250"
            >
              → YOU ARE HERE
            </button>
          </div>

          {/* Panel 2 */}
          <div
            className="p-8 group hover:bg-[hsl(0,0%,7%)] transition-colors duration-250"
            style={{ background: "hsl(0,0%,4%)" }}
          >
            <div className="flex items-center gap-2 mb-6">
              <FileText className="w-4 h-4 text-[hsl(38,90%,52%)]" />
              <span className="mono-label text-[10px]">HANDWRITTEN ESSAY</span>
            </div>
            <p className="text-sm text-[hsl(210,5%,55%)] leading-relaxed mb-2">
              Topic:{" "}
              <span className="text-[hsl(40,10%,78%)]">Remote Work — Future of Employment</span>
            </p>
            <p className="text-xs text-[hsl(210,5%,40%)] mb-8">Scanned PDF submission.</p>
            <a
              href="/essay.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-[11px] tracking-[0.1em] text-[hsl(210,5%,48%)] hover:text-[hsl(38,90%,52%)] transition-colors duration-250 flex items-center gap-2"
            >
              → VIEW DOCUMENT
            </a>
          </div>

          {/* Panel 3 */}
          <div
            className="p-8 group"
            style={{ background: "hsl(0,0%,4%)" }}
          >
            <div className="flex items-center gap-2 mb-6">
              <Video className="w-4 h-4 text-[hsl(38,90%,52%)]" />
              <span className="mono-label text-[10px]">SELF INTRODUCTION</span>
            </div>
            <p className="text-sm text-[hsl(210,5%,55%)] leading-relaxed mb-4">
              1-minute recorded self-introduction — background, skills, and aspirations.
            </p>
            <div
              className="w-full aspect-video overflow-hidden"
              style={{ border: "1px solid hsl(210,5%,14%)" }}
            >
              <video
                src="/self-intro.mp4"
                controls
                preload="metadata"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
