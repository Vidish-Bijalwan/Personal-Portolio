import React from "react"
import "./globals.css"
import { IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google"

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

export const metadata = {
  title: "VILISH — One creation. One price.",
  description:
    "Generate AI images without another monthly subscription. See the exact price before you pay — from ₹29.",
  themeColor: "#080808",
  openGraph: {
    title: "VILISH — One creation. One price.",
    description:
      "Generate AI images without another monthly subscription. See the exact price before you pay — from ₹29.",
    siteName: "VILISH",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "VILISH — One creation. One price.",
    description:
      "Generate AI images without another monthly subscription. See the exact price before you pay — from ₹29.",
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${ibmPlexSans.variable} ${ibmPlexMono.variable} font-sans`}
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  )
}
