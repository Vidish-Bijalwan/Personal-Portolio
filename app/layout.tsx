import React from "react"
import "./globals.css"
import "./pro-theme.css"
import { Chakra_Petch, IBM_Plex_Sans, IBM_Plex_Mono, Inter, Space_Grotesk } from "next/font/google"
import { AuthSessionProvider } from "@/components/vilish/session-provider"
import { ThemeProvider } from "@/components/theme-provider"
import SiteBackdrop from "@/components/motion/SiteBackdrop"
import StickyMobileCTA from "@/components/vilish/sticky-mobile-cta"
import ContactFab from "@/components/contact-fab"
import SwRegister from "@/components/pwa/sw-register"
import InstallPrompt from "@/components/pwa/install-prompt"

const chakraPetch = Chakra_Petch({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
  display: "swap",
})

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-ibm-plex-sans",
  display: "swap",
})

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-ibm-plex-mono",
  display: "swap",
})

/* Professional type pairing for the redesigned homepage/nav/footer.
   Existing font variables are kept untouched for inner pages. */
const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
})

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-grotesk",
  display: "swap",
})

export const viewport = {
  themeColor: "#080808",
};

/* Site-wide metadata defaults. Homepage SEO (title/description/OG +
   canonical "/") lives in app/page.tsx — every public page carries its own
   alternates.canonical so no page emits a bare-domain or duplicate canonical. */
export const metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://tryetch.online",
  ),
  icons: {
    icon: "/icon.svg",
  },
  // Web app manifest (app/manifest.ts): PWA installability + share_target.
  manifest: "/manifest.webmanifest",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${chakraPetch.variable} ${ibmPlexSans.variable} ${ibmPlexMono.variable} ${inter.variable} ${spaceGrotesk.variable} font-sans`}
        suppressHydrationWarning
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {/* Fixed animated backdrop behind all content; never intercepts clicks. */}
          <SiteBackdrop />
          <AuthSessionProvider>{children}</AuthSessionProvider>
          <StickyMobileCTA />
          <ContactFab />
          <SwRegister />
          <InstallPrompt />
        </ThemeProvider>
      </body>
    </html>
  )
}
