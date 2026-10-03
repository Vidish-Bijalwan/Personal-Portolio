"use client"

import { FileText, Link as LinkIcon, Video, ExternalLink } from "lucide-react"

export default function Assessment() {
  return (
    <section
      id="assessment"
      className="relative py-20"
      style={{ background: "hsl(222,14%,8%)", borderTop: "1px solid hsl(220,10%,22%)" }}
    >
      <div className="max-w-[1400px] mx-auto px-8 md:px-16">
        {/* Header */}
        <div className="flex items-center gap-3 mb-12">
          <div className="w-6 h-px bg-[hsl(38,95%,56%)]" />
          <span className="mono-label text-[10px]">PESE600 · SESSIONAL ASSESSMENT</span>
          <div className="flex-1 h-px bg-[hsl(220,10%,22%)]" />
          <span className="font-mono text-[9px] tracking-[0.1em] text-[hsl(220,8%,36%)]">EVALUATOR ACCESS</span>
        </div>

        <p className="text-sm text-[hsl(220,8%,62%)] mb-12 font-light max-w-xl">
          Submission materials for the PESE600 Sessional Assessment — e-portfolio, handwritten essay, and recorded self-introduction.
        </p>

        {/* Assessment panels */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-[hsl(220,10%,22%)]">
          {/* Panel 1 */}
          <div
            className="p-8 group hover:bg-[hsl(222,12%,13%)] transition-colors duration-250"
            style={{ background: "hsl(222,14%,10%)" }}
          >
            <div className="flex items-center gap-2 mb-6">
              <LinkIcon className="w-4 h-4 text-[hsl(38,95%,56%)]" />
              <span className="mono-label text-[10px]">E-PORTFOLIO</span>
            </div>
            <p className="text-sm text-[hsl(220,8%,66%)] leading-relaxed mb-8">
              The live, updated interactive portfolio. You are currently viewing it.
            </p>
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="font-mono text-[11px] tracking-[0.1em] text-[hsl(38,95%,56%)] hover:text-[hsl(40,12%,94%)] transition-colors duration-250"
            >
              → YOU ARE HERE
            </button>
          </div>

          {/* Panel 2 */}
          <div
            className="p-8 group hover:bg-[hsl(222,12%,13%)] transition-colors duration-250"
            style={{ background: "hsl(222,14%,10%)" }}
          >
            <div className="flex items-center gap-2 mb-6">
              <FileText className="w-4 h-4 text-[hsl(38,95%,56%)]" />
              <span className="mono-label text-[10px]">HANDWRITTEN ESSAY</span>
            </div>
            <p className="text-sm text-[hsl(220,8%,66%)] leading-relaxed mb-2">
              Topic:{" "}
              <span className="text-[hsl(40,12%,84%)]">Remote Work — Future of Employment</span>
            </p>
            <p className="text-xs text-[hsl(220,8%,52%)] mb-8">Scanned PDF submission.</p>
            <a
              href="/essay.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-[11px] tracking-[0.1em] text-[hsl(220,8%,60%)] hover:text-[hsl(38,95%,56%)] transition-colors duration-250 flex items-center gap-2"
            >
              → VIEW DOCUMENT
            </a>
          </div>

          {/* Panel 3 */}
          <div
            className="p-8 group"
            style={{ background: "hsl(222,14%,10%)" }}
          >
            <div className="flex items-center gap-2 mb-6">
              <Video className="w-4 h-4 text-[hsl(38,95%,56%)]" />
              <span className="mono-label text-[10px]">SELF INTRODUCTION</span>
            </div>
            <p className="text-sm text-[hsl(220,8%,66%)] leading-relaxed mb-4">
              1-minute recorded self-introduction — background, skills, and aspirations.
            </p>
            <div
              className="w-full aspect-video overflow-hidden"
              style={{ border: "1px solid hsl(220,10%,24%)" }}
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
