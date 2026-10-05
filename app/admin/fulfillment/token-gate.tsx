"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { setAdminToken } from "./admin-token";

/**
 * Renders the admin-token gate (same look as /admin). When a token is
 * confirmed working, calls onAuthed(token). When the user clicks "Use a
 * different token", resets back to the input.
 */
export default function TokenGate({
  title,
  description,
  verify,
  children,
  initialToken,
}: {
  title: string;
  description: string;
  verify: (token: string) => Promise<boolean>;
  children: (token: string) => React.ReactNode;
  initialToken?: string | null;
}) {
  const [token, setToken] = useState(initialToken ?? "");
  const [authed, setAuthed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      const ok = await verify(token);
      if (!ok) {
        setError("Invalid token.");
        setAuthed(false);
        return;
      }
      setAdminToken(token);
      setAuthed(true);
    } catch {
      setError("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!authed) {
    return (
      <div className="mx-auto w-full max-w-sm rounded-[16px] border border-white/[0.08] bg-[#121214] p-6">
        <h1 className="text-[16px] font-semibold">{title}</h1>
        <p className="mt-1 text-[13px] text-white/45">{description}</p>
        <label htmlFor="admin-token" className="mt-4 block text-[13px] font-medium text-white/70">
          Admin token
        </label>
        <input
          id="admin-token"
          type="password"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder="Paste admin token"
          autoComplete="off"
          className="mt-2 w-full rounded-[10px] border border-white/[0.1] bg-[#0D0D0F] px-3.5 py-2.5 text-[14px] text-[#F5F5F3] placeholder:text-white/30 outline-none focus:border-white/30"
        />
        <button
          type="button"
          onClick={submit}
          disabled={loading || !token}
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-[10px] border border-white/[0.12] bg-[#18181B] px-4 py-2.5 text-[14px] font-medium hover:border-white/25 disabled:opacity-40"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          Continue
        </button>
        {error && <p className="mt-3 text-[13px] text-red-300/80">{error}</p>}
        <p className="mt-3 text-[12px] text-white/35">
          Kept in this tab&apos;s session storage only — never sent anywhere
          except this site&apos;s admin API.
        </p>
      </div>
    );
  }

  return <>{children(token)}</>;
}
