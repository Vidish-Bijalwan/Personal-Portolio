"use client";

/**
 * Presentational sections for /profile. Page-agnostic: they take data via
 * props so they can be rendered in the real page and in screenshot
 * harnesses with mock data.
 */
import { useRef } from "react";
import Link from "next/link";
import {
  Check,
  Download,
  Film,
  History,
  Image as ImageIcon,
  Loader2,
  Lock,
  Pencil,
  Receipt,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatINR } from "@/src/lib/vilish/types";
import { displaySrcFor } from "@/src/lib/me/profile";
import type { MyGenerationItem } from "@/app/api/me/generations/route";
import type { MyOrderItem } from "@/app/api/me/orders/route";

export interface ProfileData {
  displayName: string | null;
  email: string | null;
  avatarUrl: string | null;
  memberSince: string | null;
}

export function initialsFor(name: string | null, email: string | null): string {
  const src = (name ?? "").trim() || (email ?? "").trim();
  return (src[0] ?? "?").toUpperCase();
}

export function shortDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** Downscale an uploaded image to a 256px JPEG data URL for the avatar. */
export async function fileToAvatarDataUrl(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas unavailable");
  const scale = Math.max(size / bitmap.width, size / bitmap.height);
  const w = bitmap.width * scale;
  const h = bitmap.height * scale;
  ctx.drawImage(bitmap, (size - w) / 2, (size - h) / 2, w, h);
  bitmap.close();
  return canvas.toDataURL("image/jpeg", 0.85);
}

export function displayNameFor(p: ProfileData | null): string {
  return (
    p?.displayName?.trim() ||
    (p?.email ? p.email.split("@")[0] : "Creator")
  );
}

export function ProfileHeader({
  profile,
  onEdit,
}: {
  profile: ProfileData;
  onEdit: () => void;
}) {
  const name = displayNameFor(profile);
  return (
    <div className="pro-card flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:p-6">
      <div
        className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full text-[26px] font-bold"
        style={{ background: "var(--pro-accent-strong)", color: "#fff" }}
      >
        {profile.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={profile.avatarUrl}
            alt={name}
            className="h-full w-full object-cover"
          />
        ) : (
          initialsFor(profile.displayName, profile.email)
        )}
      </div>
      <div className="min-w-0 flex-1">
        <h1
          className="pro-display truncate text-[26px] font-bold leading-tight"
          style={{ color: "var(--pro-fg)" }}
        >
          {name}
        </h1>
        <p
          className="truncate text-[13.5px]"
          style={{ color: "var(--pro-muted)" }}
        >
          {profile.email}
          {profile.memberSince
            ? ` · creating since ${shortDate(profile.memberSince)}`
            : ""}
        </p>
      </div>
      <button
        type="button"
        onClick={onEdit}
        className="inline-flex min-h-[42px] items-center gap-2 self-start rounded-[12px] border px-4 py-2 text-[13.5px] font-semibold sm:self-center"
        style={{ borderColor: "var(--pro-border)", color: "var(--pro-fg)" }}
      >
        <Pencil className="h-4 w-4" strokeWidth={2} />
        Edit profile
      </button>
    </div>
  );
}

export function OrderStatusBadge({ status }: { status: string }) {
  const verified = status === "PAYMENT_VERIFIED";
  const pending = status === "PAYMENT_PENDING";
  const awaiting =
    status === "PAYMENT_SUBMITTED" || status === "PAYMENT_AWAITING_OWNER";
  const label = verified
    ? "Paid"
    : pending
      ? "Pending"
      : awaiting
        ? "Awaiting confirmation"
        : status.replace(/_/g, " ").toLowerCase();
  return (
    <span
      className="inline-flex items-center rounded-full border px-2.5 py-1 text-[11.5px] font-semibold"
      style={{
        borderColor: "var(--pro-border)",
        color: verified
          ? "#4caf7d"
          : pending
            ? "var(--pro-accent)"
            : "var(--pro-muted)",
        background: "var(--pro-bg-sunken)",
      }}
    >
      {verified && <Check className="mr-1 h-3 w-3" strokeWidth={2.5} />}
      {label}
    </span>
  );
}

export function CreationsGrid({
  items,
  unlockBusyId,
  onUnlock,
  unlockError,
}: {
  items: MyGenerationItem[];
  unlockBusyId: string | null;
  onUnlock: (item: MyGenerationItem) => void;
  unlockError: string;
}) {
  return (
    <section aria-label="My creations" className="mt-6">
      <p
        className="mb-4 inline-flex items-center gap-2 text-[12.5px]"
        style={{ color: "var(--pro-faint)" }}
      >
        <History className="h-3.5 w-3.5" strokeWidth={2} />
        Showing creations from the last 30 days
      </p>
      {items.length === 0 ? (
        <div className="pro-card p-10 text-center">
          <ImageIcon
            className="mx-auto h-8 w-8"
            style={{ color: "var(--pro-faint)" }}
            strokeWidth={1.6}
          />
          <p
            className="mt-3 text-[14.5px] font-semibold"
            style={{ color: "var(--pro-fg)" }}
          >
            Nothing here yet
          </p>
          <p
            className="mt-1 text-[13.5px]"
            style={{ color: "var(--pro-muted)" }}
          >
            Your generated images and videos will appear here.
          </p>
          <Link href="/create" className="pro-btn-primary mt-5 inline-flex">
            Start creating
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 sm:gap-4">
          {items.map((g) => {
            const isVideo = g.mediaType === "video";
            const locked = g.status === "done" && !g.unlocked;
            const busy = unlockBusyId === g.id;
            // Unlocked rows render the clean file inline (no watermark);
            // locked rows keep the watermarked preview.
            const cardSrc = displaySrcFor({
              unlocked: g.unlocked,
              downloadUrl: g.downloadUrl,
              thumbnailUrl: g.thumbnailUrl,
            });
            return (
              <div key={g.id} className="pro-card group overflow-hidden">
                <div className="relative aspect-square overflow-hidden bg-black/20">
                  {g.status === "done" ? (
                    isVideo ? (
                      <video
                        src={cardSrc}
                        className="h-full w-full object-cover"
                        muted
                        playsInline
                        preload="metadata"
                      />
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={cardSrc}
                        alt={g.prompt}
                        loading="lazy"
                        className="h-full w-full object-cover"
                      />
                    )
                  ) : (
                    <div
                      className="flex h-full w-full items-center justify-center text-[12px] font-medium"
                      style={{ color: "var(--pro-muted)" }}
                    >
                      {g.status === "failed" ? "Failed" : "In progress…"}
                    </div>
                  )}
                  {locked && g.status === "done" && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/45 p-3 text-center">
                      <Lock
                        className="h-5 w-5 text-white/90"
                        strokeWidth={2}
                      />
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => onUnlock(g)}
                        className="pro-btn-primary min-h-[40px] px-4 py-2 text-[13px] disabled:opacity-60"
                      >
                        {busy ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            Unlock —{" "}
                            {g.pricePaise !== null
                              ? formatINR(g.pricePaise)
                              : ""}
                          </>
                        )}
                      </button>
                    </div>
                  )}
                  {g.unlocked && (
                    <a
                      href={g.downloadUrl ?? undefined}
                      className="absolute inset-x-3 bottom-3 hidden items-center justify-center gap-2 rounded-[10px] bg-black/70 py-2 text-[12.5px] font-semibold text-white backdrop-blur transition group-hover:flex"
                    >
                      <Download className="h-3.5 w-3.5" strokeWidth={2} />
                      Download
                    </a>
                  )}
                </div>
                <div className="p-3">
                  <p
                    className="truncate text-[12.5px] font-medium"
                    style={{ color: "var(--pro-fg)" }}
                    title={g.prompt}
                  >
                    {g.prompt}
                  </p>
                  <div className="mt-1.5 flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
                    <span
                      className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide"
                      style={{ color: "var(--pro-faint)" }}
                    >
                      {isVideo ? (
                        <Film className="h-3 w-3" strokeWidth={2} />
                      ) : (
                        <ImageIcon className="h-3 w-3" strokeWidth={2} />
                      )}
                      {isVideo ? "Video" : "Image"}
                      {g.unlocked && (
                        <span style={{ color: "#4caf7d" }}> · unlocked</span>
                      )}
                    </span>
                    <span
                      className="text-[11px]"
                      style={{ color: "var(--pro-faint)" }}
                    >
                      {shortDate(g.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      {unlockError && (
        <p
          className="mt-4 rounded-[12px] border px-4 py-3 text-[13.5px]"
          style={{
            borderColor: "var(--pro-border)",
            color: "#d97a7a",
            background: "var(--pro-bg-elev)",
          }}
        >
          {unlockError}
        </p>
      )}
    </section>
  );
}

export function PurchasesList({ orders }: { orders: MyOrderItem[] }) {
  return (
    <section aria-label="Purchase history" className="mt-6">
      {orders.length === 0 ? (
        <div className="pro-card p-10 text-center">
          <Receipt
            className="mx-auto h-8 w-8"
            style={{ color: "var(--pro-faint)" }}
            strokeWidth={1.6}
          />
          <p
            className="mt-3 text-[14.5px] font-semibold"
            style={{ color: "var(--pro-fg)" }}
          >
            No purchases yet
          </p>
          <p
            className="mt-1 text-[13.5px]"
            style={{ color: "var(--pro-muted)" }}
          >
            When you unlock a creation, it will show up here with its receipt.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {orders.map((o) => (
            <div
              key={o.code}
              className="pro-card flex flex-col gap-3 p-4 sm:flex-row sm:items-center"
            >
              <div className="min-w-0 flex-1">
                <p
                  className="truncate text-[14px] font-semibold"
                  style={{ color: "var(--pro-fg)" }}
                >
                  {o.itemLabel}
                </p>
                <p
                  className="mt-0.5 text-[12px]"
                  style={{ color: "var(--pro-faint)" }}
                >
                  {shortDate(o.createdAt)} · Order {o.code}
                </p>
              </div>
              <OrderStatusBadge status={o.status} />
              <span
                className="text-[15px] font-bold"
                style={{ color: "var(--pro-fg)" }}
              >
                {formatINR(o.amountPaise)}
              </span>
              {o.downloadUrl ? (
                <a
                  href={o.downloadUrl}
                  className="inline-flex min-h-[40px] items-center justify-center gap-2 rounded-[10px] border px-4 py-2 text-[13px] font-semibold"
                  style={{
                    borderColor: "var(--pro-border)",
                    color: "var(--pro-fg)",
                  }}
                >
                  <Download className="h-3.5 w-3.5" strokeWidth={2} />
                  Download
                </a>
              ) : o.generationId ? (
                <Link
                  href={`/watch/${o.generationId}`}
                  className="inline-flex min-h-[40px] items-center justify-center rounded-[10px] border px-4 py-2 text-[13px] font-semibold"
                  style={{
                    borderColor: "var(--pro-border)",
                    color: "var(--pro-muted)",
                  }}
                >
                  View
                </Link>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export function SettingsForm({
  profile,
  nameDraft,
  onNameChange,
  avatarDraft,
  onAvatarFile,
  onAvatarRemove,
  onSave,
  saving,
  saveMsg,
}: {
  profile: ProfileData;
  nameDraft: string;
  onNameChange: (v: string) => void;
  avatarDraft: string | null | undefined;
  onAvatarFile: (f: File | undefined) => void;
  onAvatarRemove: () => void;
  onSave: () => void;
  saving: boolean;
  saveMsg: string;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  return (
    <section aria-label="Profile settings" className="mt-6">
      <div className="pro-card max-w-xl p-5 sm:p-6">
        <h2
          className="pro-display text-[18px] font-bold"
          style={{ color: "var(--pro-fg)" }}
        >
          Profile settings
        </h2>
        <div className="mt-5 flex items-center gap-4">
          <div
            className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full text-[22px] font-bold"
            style={{ background: "var(--pro-accent-strong)", color: "#fff" }}
          >
            {avatarDraft ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatarDraft}
                alt="Avatar preview"
                className="h-full w-full object-cover"
              />
            ) : (
              initialsFor(nameDraft || null, profile.email)
            )}
          </div>
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="inline-flex min-h-[40px] items-center rounded-[10px] border px-4 py-2 text-[13px] font-semibold"
              style={{
                borderColor: "var(--pro-border)",
                color: "var(--pro-fg)",
              }}
            >
              Upload photo
            </button>
            {avatarDraft && (
              <button
                type="button"
                onClick={onAvatarRemove}
                className="text-left text-[12.5px] font-medium"
                style={{ color: "var(--pro-muted)" }}
              >
                Remove photo
              </button>
            )}
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => onAvatarFile(e.target.files?.[0])}
            />
          </div>
        </div>
        <label
          className="mt-5 block text-[13px] font-semibold"
          style={{ color: "var(--pro-fg)" }}
          htmlFor="profile-display-name"
        >
          Display name
        </label>
        <input
          id="profile-display-name"
          type="text"
          value={nameDraft}
          maxLength={40}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder="What should we call you?"
          className="mt-1.5 min-h-[46px] w-full rounded-[12px] border px-4 py-2.5 text-[14px] outline-none"
          style={{
            borderColor: "var(--pro-border)",
            background: "var(--pro-bg-sunken)",
            color: "var(--pro-fg)",
          }}
        />
        <p
          className="mt-1.5 text-[12px]"
          style={{ color: "var(--pro-faint)" }}
        >
          Signed in as {profile.email} — your email never changes here.
        </p>
        <div className="mt-5 flex items-center gap-3">
          <button
            type="button"
            onClick={onSave}
            disabled={saving}
            className="pro-btn-primary min-h-[44px] px-6 disabled:opacity-60"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Save changes"
            )}
          </button>
          {saveMsg && (
            <span
              className="inline-flex items-center gap-1.5 text-[13px] font-medium"
              style={{ color: saveMsg === "Saved." ? "#4caf7d" : "#d97a7a" }}
            >
              {saveMsg === "Saved." && (
                <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
              )}
              {saveMsg}
            </span>
          )}
        </div>
      </div>
    </section>
  );
}
