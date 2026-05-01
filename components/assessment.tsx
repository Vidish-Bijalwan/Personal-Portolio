"use client"

import { Card } from "@/components/ui/card"
import { FileText, Link as LinkIcon, Video, ExternalLink } from "lucide-react"

export default function Assessment() {
  return (
    <section id="assessment" className="py-20 md:py-32 bg-muted/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="heading-lg font-serif mb-4 relative inline-block">
            PESE600 Sessional Assessment
            <span className="absolute -bottom-2 left-0 w-full h-1 bg-primary rounded-full"></span>
          </h2>
          <p className="body-lg text-foreground/70 max-w-2xl mx-auto">
            Submission Form for updated e-portfolio link, handwritten essay, and recorded self-introduction.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Card 1: E-Portfolio Link */}
          <Card className="p-6 border border-secondary/50 hover:shadow-lg transition-all duration-300 group hover:-translate-y-2 flex flex-col items-center text-center bg-card">
            <div className="p-4 rounded-full bg-primary/10 mb-6 group-hover:bg-primary/20 transition-colors">
              <LinkIcon className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-3">E-Portfolio Link</h3>
            <p className="text-foreground/70 mb-6 flex-grow">
              The live, updated version of this interactive portfolio website containing all projects and assignments.
            </p>
            <a 
              href="#" 
              onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className="w-full py-3 px-4 rounded-md bg-primary text-primary-foreground font-medium flex items-center justify-center hover:opacity-90 transition-opacity shadow"
            >
              You Are Here
            </a>
          </Card>

          {/* Card 2: Handwritten Essay */}
          <Card className="p-6 border border-secondary/50 hover:shadow-lg transition-all duration-300 group hover:-translate-y-2 flex flex-col items-center text-center bg-card">
            <div className="p-4 rounded-full bg-primary/10 mb-6 group-hover:bg-primary/20 transition-colors">
              <FileText className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-3">Handwritten Essay</h3>
            <p className="text-foreground/70 mb-6 flex-grow">
              Topic: <strong>Remote Work – Future of Employment</strong>.<br /> Scanned PDF copy attached.
            </p>
            <a 
              href="/essay.pdf" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-full py-3 px-4 rounded-md bg-secondary text-secondary-foreground font-medium flex items-center justify-center hover:bg-secondary/80 transition-colors border shadow-sm"
            >
              View Document <ExternalLink className="h-4 w-4 ml-2" />
            </a>
          </Card>

          {/* Card 3: Self Introduction Video */}
          <Card className="p-6 border border-secondary/50 hover:shadow-lg transition-all duration-300 group hover:-translate-y-2 flex flex-col items-center text-center bg-card md:col-span-1 sm:col-span-2 col-span-1">
            <div className="p-4 rounded-full bg-primary/10 mb-6 group-hover:bg-primary/20 transition-colors">
              <Video className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-3">Self Introduction</h3>
            <p className="text-foreground/70 mb-4 flex-grow">
              A 1-minute recorded self introduction video summarizing my background and aspirations.
            </p>
            
            <div className="w-full aspect-video bg-black/80 rounded-md flex flex-col items-center justify-center relative overflow-hidden group/video border border-primary/20">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-transparent pointer-events-none"></div>
              
              <Video className="h-10 w-10 text-primary/50 mb-2 animate-pulse" />
              <span className="text-sm font-medium animate-pulse text-primary/80 z-10 px-4">
                Video Placeholder
              </span>
              
              {/* NOTE: Update the src property below when video is ready */}
              {/* <video src="/self-intro.mp4" controls className="absolute inset-0 w-full h-full object-cover z-20"></video> */}
            </div>
          </Card>
        </div>
      </div>
    </section>
  )
}
