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
 *
 * Styled with pro tokens so it reads in both themes.
 */
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { ChevronDown, Image as ImageIcon, LogIn, LogOut, User as UserIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import AuthModal from "./auth-modal";

interface MiniProfile {
  displayName: string | null;
  avatarUrl: string | null;
}

export default function AuthButton() {
  const { data: session, status } = useSession();
  const [modalOpen, setModalOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [miniProfile, setMiniProfile] = useState<MiniProfile | null>(null);

  const email = session?.user?.email ?? "";
  const initial = (email.trim()[0] ?? "?").toUpperCase();

  // Load the user's display name + avatar once signed in (best-effort).
  useEffect(() => {
    if (status !== "authenticated") {
      setMiniProfile(null);
      return;
    }
    let cancelled = false;
    fetch("/api/me/profile", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((p) => {
        if (!cancelled && p) {
          setMiniProfile({
            displayName: p.displayName ?? null,
            avatarUrl: p.avatarUrl ?? null,
          });
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [status]);

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
        className="inline-flex h-10 w-10 items-center rounded-full"
        style={{ background: "var(--pro-bg-elev)" }}
      />
    );
  }

  if (status !== "authenticated") {
    return (
      <>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="inline-flex min-h-[42px] items-center gap-1.5 rounded-[12px] border px-4 py-2 text-[13.5px] font-semibold transition-colors"
          style={{
            borderColor: "var(--pro-border)",
            color: "var(--pro-fg)",
          }}
        >
          <LogIn
            className="h-4 w-4"
            strokeWidth={2}
            style={{ color: "var(--pro-accent)" }}
          />
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
          "inline-flex min-h-[42px] items-center gap-1.5 rounded-full border py-1 pl-1 pr-2 transition-colors",
        )}
        style={{
          borderColor: menuOpen ? "var(--pro-accent)" : "var(--pro-border)",
          background: "var(--pro-bg-elev)",
        }}
      >
        <span
          aria-hidden
          className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full text-[14px] font-bold"
          style={{
            background: "var(--pro-accent-strong)",
            color: "#fff",
          }}
        >
          {miniProfile?.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={miniProfile.avatarUrl}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            initial
          )}
        </span>
        <ChevronDown
          className={cn("h-3.5 w-3.5 transition-transform", menuOpen && "rotate-180")}
          style={{ color: "var(--pro-muted)" }}
          strokeWidth={2.2}
        />
      </button>
      {menuOpen && (
        <div
          role="menu"
          className="absolute right-0 top-[calc(100%+8px)] z-50 w-60 overflow-hidden rounded-[14px] border"
          style={{
            borderColor: "var(--pro-border)",
            background: "var(--pro-bg-elev)",
            boxShadow: "var(--pro-card-shadow)",
          }}
        >
          <p
            className="truncate border-b px-4 py-3 text-[12.5px]"
            style={{
              borderColor: "var(--pro-border-soft)",
              color: "var(--pro-muted)",
            }}
          >
            Signed in as
            <span
              className="block truncate text-[13px] font-semibold"
              style={{ color: "var(--pro-fg)" }}
            >
              {miniProfile?.displayName?.trim() || email}
            </span>
          </p>
          <Link
            href="/profile"
            role="menuitem"
            onClick={() => setMenuOpen(false)}
            className="flex min-h-[44px] w-full items-center gap-2.5 px-4 py-2.5 text-left text-[13.5px] font-medium transition-colors"
            style={{ color: "var(--pro-fg)" }}
          >
            <UserIcon
              className="h-4 w-4"
              strokeWidth={2}
              style={{ color: "var(--pro-muted)" }}
            />
            Profile
          </Link>
          <Link
            href="/profile?tab=creations"
            role="menuitem"
            onClick={() => setMenuOpen(false)}
            className="flex min-h-[44px] w-full items-center gap-2.5 px-4 py-2.5 text-left text-[13.5px] font-medium transition-colors"
            style={{ color: "var(--pro-fg)" }}
          >
            <ImageIcon
              className="h-4 w-4"
              strokeWidth={2}
              style={{ color: "var(--pro-muted)" }}
            />
            My creations
          </Link>
          <button
            type="button"
            role="menuitem"
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex min-h-[44px] w-full items-center gap-2.5 px-4 py-2.5 text-left text-[13.5px] font-medium transition-colors"
            style={{ color: "var(--pro-fg)" }}
          >
            <LogOut
              className="h-4 w-4"
              strokeWidth={2}
              style={{ color: "var(--pro-muted)" }}
            />
            Log out
          </button>
        </div>
      )}
    </div>
  );
}
