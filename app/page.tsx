import Hero from "@/components/hero"
import Navbar from "@/components/navbar"
import About from "@/components/about"
import Skills from "@/components/skills"
import AiProjects from "@/components/ai-projects"
import FrontendProjects from "@/components/frontend-projects"
import Experience from "@/components/experience"
import Contact from "@/components/contact"
import Footer from "@/components/footer"
import AnimatedCursor from "@/components/animated-cursor"
import PageTransition from "@/components/page-transition"
import ScrollToTop from "@/components/scroll-to-top"
import Testimonials from "@/components/testimonials"
import Blog from "@/components/blog"
import ScrollProgress from "@/components/scroll-progress"
import KeyboardHelper from "@/components/keyboard-helper"
import AccessibilityMenu from "@/components/accessibility-menu"
import SkipToContent from "@/components/skip-to-content"

export default function Home() {
  return (
    <>
      <SkipToContent />
      <main id="main-content" className="min-h-screen bg-background overflow-hidden">
        <AnimatedCursor />
        <PageTransition />
        <ScrollProgress />
        <ScrollToTop />
        <KeyboardHelper />
        <AccessibilityMenu />
        <Navbar />
        <Hero />
        <About />
        <Skills />
        <AiProjects />
        <FrontendProjects />
        <Experience />
        <Testimonials />
        <Blog />
        <Contact />
        <Footer />
      </main>
    </>
  )
}
