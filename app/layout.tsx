import React from "react"
import "./globals.css"
import { Chakra_Petch, IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google"
import { AuthSessionProvider } from "@/components/vilish/session-provider"
import SiteBackdrop from "@/components/motion/SiteBackdrop"
import CyberCursor from "@/components/motion/CyberCursor"

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

export const viewport = {
  themeColor: "#080808",
};

export const metadata = {
  title: "AI Image Generator India — ₹29 per Creation | Pixaura",
  description:
    "Generate custom AI images for a fixed ₹29 each. No subscription, pay with UPI, human-reviewed quality. Portraits, product photos, posters & more.",
  icons: {
    icon: "/icon.svg",
  },
  openGraph: {
    title: "AI Image Generator India — ₹29 per Creation | Pixaura",
    description:
      "Generate custom AI images for a fixed ₹29 each. No subscription, pay with UPI, human-reviewed quality. Portraits, product photos, posters & more.",
    siteName: "Pixaura",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Image Generator India — ₹29 per Creation | Pixaura",
    description:
      "Generate custom AI images for a fixed ₹29 each. No subscription, pay with UPI, human-reviewed quality. Portraits, product photos, posters & more.",
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${chakraPetch.variable} ${ibmPlexSans.variable} ${ibmPlexMono.variable} font-sans`}
        suppressHydrationWarning
      >
        {/* Fixed animated backdrop behind all content; never intercepts clicks.
            Cursor is a pointer-events-none augmentation — native cursor untouched. */}
        <SiteBackdrop />
        <CyberCursor />
        <AuthSessionProvider>{children}</AuthSessionProvider>
      </body>
    </html>
  )
}
