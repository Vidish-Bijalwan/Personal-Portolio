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

export const viewport = {
  themeColor: "#080808",
};

export const metadata = {
  title: "Vidish — One creation. One price.",
  description:
    "Generate AI images without another monthly subscription. See the exact price before you pay — from ₹29.",
  openGraph: {
    title: "Vidish — One creation. One price.",
    description:
      "Generate AI images without another monthly subscription. See the exact price before you pay — from ₹29.",
    siteName: "Vidish",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Vidish — One creation. One price.",
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
