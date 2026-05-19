import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "*.{js,ts,jsx,tsx,mdx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ["var(--font-ibm-plex-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-ibm-plex-mono)", "monospace"],
      },
      colors: {
        // ShadCN semantic tokens (kept for compatibility)
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Industrial design system tokens
        ink: {
          DEFAULT: "hsl(var(--ink))",
          deep: "hsl(var(--ink-deep))",
        },
        charcoal: "hsl(var(--charcoal))",
        graphite: "hsl(var(--graphite))",
        steel: "hsl(var(--steel))",
        silver: "hsl(var(--silver))",
        ivory: "hsl(var(--ivory))",
        amber: {
          DEFAULT: "hsl(var(--amber))",
          dim: "hsl(var(--amber-dim))",
        },
        signal: {
          green: "hsl(var(--signal-green))",
          amber: "hsl(var(--signal-amber))",
          warning: "hsl(var(--signal-warning))",
        },
      },
      spacing: {
        // Strict 8px grid — only these values
        "1": "4px",
        "2": "8px",
        "3": "12px",
        "4": "16px",
        "6": "24px",
        "8": "32px",
        "12": "48px",
        "16": "64px",
        "24": "96px",
        "32": "128px",
      },
      borderRadius: {
        none: "0",
        sm: "2px",
        DEFAULT: "4px",
        md: "4px",
        lg: "6px",
        full: "9999px",
      },
      fontSize: {
        // Editorial type scale
        "2xs": ["11px", { lineHeight: "1.4", letterSpacing: "0.08em" }],
        xs: ["13px", { lineHeight: "1.4", letterSpacing: "0.04em" }],
        sm: ["15px", { lineHeight: "1.5" }],
        base: ["18px", { lineHeight: "1.6" }],
        lg: ["24px", { lineHeight: "1.4" }],
        xl: ["32px", { lineHeight: "1.2" }],
        "2xl": ["48px", { lineHeight: "1.1" }],
        "3xl": ["64px", { lineHeight: "1.0" }],
        "4xl": ["96px", { lineHeight: "0.95" }],
        "5xl": ["128px", { lineHeight: "0.9" }],
      },
      transitionTimingFunction: {
        expo: "cubic-bezier(0.16, 1, 0.3, 1)",
        precision: "cubic-bezier(0.4, 0, 0.2, 1)",
      },
      transitionDuration: {
        "250": "250ms",
        "400": "400ms",
        "600": "600ms",
        "800": "800ms",
        "1200": "1200ms",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "scan-line": {
          "0%": { transform: "translateX(-100%)", opacity: "0" },
          "10%": { opacity: "1" },
          "90%": { opacity: "1" },
          "100%": { transform: "translateX(100vw)", opacity: "0" },
        },
        "reveal-right": {
          from: { clipPath: "inset(0 100% 0 0)" },
          to: { clipPath: "inset(0 0% 0 0)" },
        },
        "reveal-up": {
          from: { clipPath: "inset(100% 0 0 0)", opacity: "0" },
          to: { clipPath: "inset(0% 0 0 0)", opacity: "1" },
        },
        "pulse-amber": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.3" },
        },
        "blink": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0" },
        },
        "drift": {
          "0%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-6px)" },
          "100%": { transform: "translateY(0px)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "scan-line": "scan-line 2s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "reveal-right": "reveal-right 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "reveal-up": "reveal-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "pulse-amber": "pulse-amber 2s ease-in-out infinite",
        "blink": "blink 1.2s step-end infinite",
        "drift": "drift 4s ease-in-out infinite",
      },
      zIndex: {
        "0": "0",
        "10": "10",
        "20": "20",
        "30": "30",
        "40": "40",
        "50": "50",
        "nav": "100",
        "overlay": "200",
        "modal": "300",
        "toast": "400",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}

export default config
