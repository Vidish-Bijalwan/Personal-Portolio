"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";

/**
 * Theme toggle for the pro chrome. Sun/moon swap with a mounted guard
 * so server and client render identically (no hydration flash).
 * Styled with pro tokens so it reads correctly in both themes.
 */
export default function ProThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <span className="inline-block h-10 w-10" aria-hidden />;
  }

  const isDark = resolvedTheme !== "light";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className="inline-flex h-10 w-10 items-center justify-center rounded-[10px] transition-colors"
      style={{ color: "var(--pro-muted)" }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "var(--pro-bg-elev)";
        e.currentTarget.style.color = "var(--pro-fg)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "transparent";
        e.currentTarget.style.color = "var(--pro-muted)";
      }}
    >
      {isDark ? (
        <Sun className="h-[18px] w-[18px]" strokeWidth={2} />
      ) : (
        <Moon className="h-[18px] w-[18px]" strokeWidth={2} />
      )}
    </button>
  );
}
