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
  title: "Vidish Bijalwan — AI Systems Engineer",
  description:
    "A living engineering archive documenting the evolution of an AI engineer building retrieval systems, autonomous workflows, and intelligence infrastructure.",
  keywords: [
    "AI Engineer",
    "Machine Learning",
    "RAG",
    "Retrieval Systems",
    "AI Infrastructure",
    "Python",
    "LangChain",
  ],
  authors: [{ name: "Vidish Bijalwan", url: "https://vidish.me" }],
  openGraph: {
    title: "Vidish Bijalwan — AI Systems Engineer",
    description: "A cinematic engineering archive. Building retrieval systems, AI agents, and intelligence infrastructure.",
    url: "https://vidish.me",
    siteName: "Vidish Bijalwan",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Vidish Bijalwan — AI Systems Engineer",
    description: "Building retrieval systems, AI agents, and intelligence infrastructure.",
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
