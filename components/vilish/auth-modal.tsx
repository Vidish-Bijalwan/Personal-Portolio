"use client";

/**
 * Lazy-auth modal. Rendered ONLY when the user attempts a protected action
 * (pay / send request) without a session. After a successful sign-in it
 * calls onAuthenticated() so the caller resumes the pending action —
 * the user never loses what they were doing.
 *
 * Security: the modal is pure UI. Auth state is the httpOnly session cookie
 * set by Auth.js; protected routes re-validate server-side regardless.
 */
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { signIn } from "next-auth/react";
import { Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";

/** Mirrors the server's generic message — identical for every login failure. */
const GENERIC_LOGIN_ERROR = "Invalid email or password.";
const RATE_LIMIT_ERROR = "Too many attempts. Please wait a minute and try again.";

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  /** Called after a session is established; resume the pending action here. */
  onAuthenticated: () => void;
}

export default function AuthModal({ open, onClose, onAuthenticated }: AuthModalProps) {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (open) {
      setError("");
      setBusy(false);
    }
  }, [open ]);

  // Escape closes the modal (unless a sign-in request is in flight),
  // matching the payment modal and lightbox keyboard behavior.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !busy) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, busy, onClose]);

  if (!open) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      const trimmedEmail = email.trim();
      if (mode === "signup") {
        const res = await fetch("/api/auth/signup", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ email: trimmedEmail, password, name: name.trim() }),
        });
        const body = await res.json().catch(() => null);
        if (res.status === 429) {
          setError(RATE_LIMIT_ERROR);
          return;
        }
        if (!res.ok) {
          setError(body?.error || "Could not create your account. Please try again.");
          return;
        }
      }
      // Auth.js credentials sign-in. Every failure (unknown email, wrong
      // password) surfaces as CredentialsSignin and maps to ONE generic
      // message — no user enumeration.
      const result = await signIn("credentials", {
        email: trimmedEmail,
        password,
        redirect: false,
      });
      if (!result) {
        setError("Could not sign in. Please try again.");
        return;
      }
      if (result.error === "RateLimited" || result.status === 429) {
        setError(RATE_LIMIT_ERROR);
        return;
      }
      if (result.error) {
        setError(GENERIC_LOGIN_ERROR);
        return;
      }
      if (result.ok) {
        onAuthenticated();
        return;
      }
      setError("Could not sign in. Please try again.");
    } catch {
      setError("Could not sign in. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  const inputCls =
    "w-full rounded-[10px] border border-white/[0.12] bg-[#0D0D0F] px-4 py-3 text-[14px] text-white placeholder:text-white/30 outline-none focus:border-white/35";

  // Rendered in a portal on document.body: `position: fixed` breaks when
  // any ancestor has a CSS transform (the hero/composer trees animate),
  // which pushed the dialog partly off-screen on some viewports.
  const dialog = (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-0 sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={mode === "login" ? "Sign in" : "Create account"}
      onClick={(e) => {
        if (e.target === e.currentTarget && !busy) onClose();
      }}
    >
      <div className="max-h-[92dvh] w-full max-w-md overflow-y-auto rounded-t-[20px] border border-white/[0.1] bg-[#121214] p-6 sm:rounded-[20px]">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="font-display text-[19px] font-semibold tracking-[0.01em]">
              {mode === "login" ? "Sign in to continue" : "Create your account"}
            </h2>
            <p className="mt-1 text-[12px] text-white/45">
              {mode === "login"
                ? "One step — then your request goes through."
                : "Free forever. Pay only per creation."}
            </p>
          </div>
          <button
            type="button"
            onClick={() => !busy && onClose()}
            className="rounded-[8px] p-2.5 text-white/50 hover:bg-white/[0.06] hover:text-white/85"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-1 rounded-[10px] bg-[#0D0D0F] p-1">
          {(["login", "signup"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => {
                setMode(m);
                setError("");
              }}
              className={cn(
                "min-h-[44px] rounded-[8px] px-3 py-2 text-[13px] font-medium transition-colors",
                mode === m ? "bg-white/[0.08] text-white" : "text-white/45 hover:text-white/70",
              )}
            >
              {m === "login" ? "Sign in" : "Sign up"}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          {mode === "signup" && (
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name (optional)"
              autoComplete="name"
              maxLength={120}
              className={inputCls}
            />
          )}
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email address"
            autoComplete="email"
            required
            className={inputCls}
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={mode === "signup" ? "Password (min 8 characters)" : "Password"}
            autoComplete={mode === "signup" ? "new-password" : "current-password"}
            required
            minLength={8}
            maxLength={128}
            className={inputCls}
          />
          {error && (
            <p className="text-[13px] text-red-400" role="alert">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={busy}
            className="v-iris-bg flex w-full items-center justify-center gap-2 rounded-[10px] px-4 py-3 text-[14px] font-semibold text-[#080808] transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {busy && <Loader2 className="h-4 w-4 animate-spin" />}
            {mode === "login" ? "Sign in" : "Create account"}
          </button>
        </form>

        <p className="mt-4 text-center text-[11px] leading-5 text-white/35">
          Your session is kept in a secure cookie on this device.
        </p>
      </div>
    </div>
  );

  if (typeof document === "undefined") return dialog;
  return createPortal(dialog, document.body);
}
