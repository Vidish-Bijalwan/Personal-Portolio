"use client";

/**
 * Header auth control for Etch.
 *
 * Logged out → "Log in" button that opens the lazy-auth modal.
 * Logged in → avatar chip (email initial) with a dropdown showing the
 * signed-in email and a "Log out" action.
 *
 * Session state is a UI hint only (next-auth/react); every protected API
 * route re-validates the session server-side via requireSession().
 */
import { useEffect, useRef, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { ChevronDown, LogIn, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import AuthModal from "./auth-modal";

export default function AuthButton() {
  const { data: session, status } = useSession();
  const [modalOpen, setModalOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const email = session?.user?.email ?? "";
  const initial = (email.trim()[0] ?? "?").toUpperCase();

  // Close the dropdown on outside click / Escape.
  useEffect(() => {
    if (!menuOpen) return;
    const onPointer = (e: PointerEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  if (status === "loading") {
    return (
      <span
        aria-hidden
        className="inline-flex h-10 w-10 items-center rounded-full bg-white/[0.06]"
      />
    );
  }

  if (status !== "authenticated") {
    return (
      <>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="inline-flex min-h-[44px] items-center gap-1.5 rounded-[12px] border border-white/[0.12] px-4 py-2 text-[13.5px] font-semibold text-[#F5F5F3] transition-colors hover:border-[#D7FF3F]/40 hover:text-white"
        >
          <LogIn className="h-4 w-4 text-[#D7FF3F]" strokeWidth={2} />
          Log in
        </button>
        <AuthModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          onAuthenticated={() => setModalOpen(false)}
        />
      </>
    );
  }

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={menuOpen}
        aria-label={`Account: ${email}`}
        onClick={() => setMenuOpen((o) => !o)}
        className={cn(
          "inline-flex min-h-[44px] items-center gap-1.5 rounded-full border border-white/[0.12] bg-white/[0.04] py-1 pl-1 pr-2 transition-colors hover:border-[#D7FF3F]/40",
          menuOpen && "border-[#D7FF3F]/40",
        )}
      >
        <span
          aria-hidden
          className="v-iris-bg flex h-8 w-8 items-center justify-center rounded-full text-[14px] font-bold text-[#080808]"
        >
          {initial}
        </span>
        <ChevronDown
          className={cn("h-3.5 w-3.5 text-white/50 transition-transform", menuOpen && "rotate-180")}
          strokeWidth={2.2}
        />
      </button>
      {menuOpen && (
        <div
          role="menu"
          className="absolute right-0 top-[calc(100%+8px)] z-50 w-60 overflow-hidden rounded-[14px] border border-white/[0.1] bg-[#101010] shadow-[0_16px_48px_-12px_rgba(0,0,0,0.8)]"
        >
          <p className="truncate border-b border-white/[0.07] px-4 py-3 text-[12.5px] text-white/55">
            Signed in as
            <span className="block truncate text-[13px] font-semibold text-[#F5F5F3]">
              {email}
            </span>
          </p>
          <button
            type="button"
            role="menuitem"
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex min-h-[44px] w-full items-center gap-2.5 px-4 py-2.5 text-left text-[13.5px] font-medium text-[#F5F5F3] transition-colors hover:bg-white/[0.05]"
          >
            <LogOut className="h-4 w-4 text-white/50" strokeWidth={2} />
            Log out
          </button>
        </div>
      )}
    </div>
  );
}
