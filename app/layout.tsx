import React from "react"
import "./globals.css"
import "./pro-theme.css"
import { Chakra_Petch, IBM_Plex_Sans, IBM_Plex_Mono, Inter, Space_Grotesk } from "next/font/google"
import { AuthSessionProvider } from "@/components/vilish/session-provider"
import { ThemeProvider } from "@/components/theme-provider"
import SiteBackdrop from "@/components/motion/SiteBackdrop"
import CyberCursor from "@/components/motion/CyberCursor"
import StickyMobileCTA from "@/components/vilish/sticky-mobile-cta"

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

export const metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://vidish.me",
  ),
  title: "AI Image Generator India — ₹19 per Creation | Etch",
  description:
    "Generate custom AI images for a fixed ₹19 each. No subscription, pay with UPI, human-reviewed quality. Portraits, product photos, posters & more.",
  icons: {
    icon: "/icon.svg",
  },
  openGraph: {
    title: "AI Image Generator India — ₹19 per Creation | Etch",
    description:
      "Generate custom AI images for a fixed ₹19 each. No subscription, pay with UPI, human-reviewed quality. Portraits, product photos, posters & more.",
    siteName: "Etch",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Etch — one creation, one price. AI images and video tools with no subscription.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Image Generator India — ₹19 per Creation | Etch",
    description:
      "Generate custom AI images for a fixed ₹19 each. No subscription, pay with UPI, human-reviewed quality. Portraits, product photos, posters & more.",
    images: ["/og-image.png"],
  },
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
          {/* Fixed animated backdrop behind all content; never intercepts clicks.
              Cursor is a pointer-events-none augmentation — native cursor untouched. */}
          <SiteBackdrop />
          <CyberCursor />
          <AuthSessionProvider>{children}</AuthSessionProvider>
          <StickyMobileCTA />
        </ThemeProvider>
      </body>
    </html>
  )
}
