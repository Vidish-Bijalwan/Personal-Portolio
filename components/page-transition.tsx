"use client"

import { useEffect, useState } from "react"

export default function PageTransition() {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setTimeout(() => {
      setIsLoading(false)
    }, 1500)
  }, [])

  useEffect(() => {
    if (!isLoading) {
      document.body.style.overflow = "auto"
    } else {
      document.body.style.overflow = "hidden"
    }
  }, [isLoading])

  return (
    <>
      <div
        className={`fixed inset-0 bg-background z-[200] flex items-center justify-center transition-opacity duration-500 ${
          isLoading ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <div
          className={`flex flex-col items-center transition-opacity duration-500 ${isLoading ? "opacity-100" : "opacity-0"}`}
        >
          <div className="w-24 h-24 relative">
            <div
              className="absolute inset-0 rounded-full border-t-2 border-primary animate-spin"
              style={{ animationDuration: "1.5s" }}
            />
            <div
              className="absolute inset-2 rounded-full border-t-2 border-primary animate-spin"
              style={{ animationDuration: "2s", animationDirection: "reverse" }}
            />
            <div
              className="absolute inset-4 rounded-full border-t-2 border-primary animate-spin"
              style={{ animationDuration: "2.5s" }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xl font-bold text-primary">VB</span>
            </div>
          </div>
          <p className="mt-4 text-foreground/70">Loading...</p>
        </div>
      </div>

      <div
        className={`fixed inset-0 pointer-events-none z-[199] bg-primary origin-top transition-transform duration-700 ease-in-out ${
          isLoading ? "scale-y-100" : "scale-y-0"
        }`}
        style={{ transitionDelay: isLoading ? "0ms" : "1500ms" }}
      />
    </>
  )
}
