"use client";

/**
 * /profile — the user's own space. Thin wiring over the presentational
 * sections in components/vilish/profile/profile-sections.tsx:
 * data fetching, tab state, the watch-room unlock flow (POST the unlock
 * endpoint the server returns per item → PaymentModal → refresh).
 */
import { Suspense, useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Image as ImageIcon,
  Loader2,
  Receipt,
  Settings as SettingsIcon,
  User as UserIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import VilishNav from "@/components/vilish/nav";
import VilishFooter from "@/components/vilish/footer";
import PaymentModal from "@/components/vilish/payment-modal";
import AuthModal from "@/components/vilish/auth-modal";
import type { ManualPayment } from "@/components/vilish/payment";
import type { MyGenerationItem } from "@/app/api/me/generations/route";
import type { MyOrderItem } from "@/app/api/me/orders/route";
import {
  CreationsGrid,
  ProfileHeader,
  PurchasesList,
  SettingsForm,
  displayNameFor,
  fileToAvatarDataUrl,
  type ProfileData,
} from "@/components/vilish/profile/profile-sections";

type Tab = "creations" | "purchases" | "settings";

function ProfilePageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { status: authStatus } = useSession();
  const [tab, setTab] = useState<Tab>(() => {
    const t = searchParams.get("tab");
    return t === "purchases" || t === "settings" ? t : "creations";
  });
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [generations, setGenerations] = useState<MyGenerationItem[]>([]);
  const [orders, setOrders] = useState<MyOrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState("");
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // unlock flow (mirrors the watch room exactly)
  const [payModal, setPayModal] = useState<{
    jobId: string;
    payment: ManualPayment;
  } | null>(null);
  const [unlockBusyId, setUnlockBusyId] = useState<string | null>(null);
  const [unlockError, setUnlockError] = useState("");

  // settings form
  const [nameDraft, setNameDraft] = useState("");
  const [avatarDraft, setAvatarDraft] = useState<string | null | undefined>(
    undefined,
  );
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");

  const authed = authStatus === "authenticated";

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setListError("");
    try {
      const [pRes, gRes, oRes] = await Promise.all([
        fetch("/api/me/profile", { cache: "no-store" }),
        fetch("/api/me/generations?limit=24", { cache: "no-store" }),
        fetch("/api/me/orders", { cache: "no-store" }),
      ]);
      if (!pRes.ok) throw new Error("Could not load your profile.");
      const p = (await pRes.json()) as ProfileData;
      setProfile(p);
      setNameDraft(p.displayName ?? "");
      setAvatarDraft(p.avatarUrl ?? null);
      if (gRes.ok) {
        const g = await gRes.json();
        setGenerations(g.items ?? []);
      }
      if (oRes.ok) {
        const o = await oRes.json();
        setOrders(o.items ?? []);
      }
    } catch (e) {
      setListError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authed) void fetchAll();
    else if (authStatus === "unauthenticated") setLoading(false);
  }, [authed, authStatus, fetchAll]);

  async function startUnlock(item: MyGenerationItem) {
    if (!item.unlock || unlockBusyId) return;
    setUnlockBusyId(item.id);
    setUnlockError("");
    try {
      const res = await fetch(item.unlock.url, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(item.unlock.body),
      });
      const body = await res.json().catch(() => null);
      if (body?.adminBypass) {
        await fetchAll();
        return;
      }
      if (!res.ok || !body?.payment) {
        setUnlockError(
          body?.error || "Could not start the unlock. Please try again.",
        );
        return;
      }
      setPayModal({
        jobId: body.generationId ?? body.id ?? item.id,
        payment: body.payment as ManualPayment,
      });
    } catch {
      setUnlockError("Network error. Please try again.");
    } finally {
      setUnlockBusyId(null);
    }
  }

  async function saveProfile() {
    setSaving(true);
    setSaveMsg("");
    try {
      const res = await fetch("/api/me/profile", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          displayName: nameDraft,
          avatarUrl: avatarDraft === undefined ? undefined : avatarDraft,
        }),
      });
      const body = await res.json().catch(() => null);
      if (!res.ok) {
        setSaveMsg(body?.error || "Could not save. Please try again.");
        return;
      }
      setProfile((p) =>
        p
          ? {
              ...p,
              displayName: body.displayName ?? p.displayName,
              avatarUrl: body.avatarUrl ?? p.avatarUrl,
            }
          : p,
      );
      setSaveMsg("Saved.");
    } catch {
      setSaveMsg("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function onAvatarFile(file: File | undefined) {
    if (!file) return;
    try {
      const dataUrl = await fileToAvatarDataUrl(file);
      setAvatarDraft(dataUrl);
      setSaveMsg("");
    } catch {
      setSaveMsg("Could not read that image. Try a JPG or PNG.");
    }
  }

  return (
    <div className="pro-surface pro-body flex min-h-screen flex-col antialiased">
      <VilishNav />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-20 pt-8 sm:pt-12">
        {authStatus === "loading" || (authed && loading && !profile) ? (
          <div
            className="flex items-center justify-center gap-2 py-24 text-[14px]"
            style={{ color: "var(--pro-muted)" }}
          >
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading your profile…
          </div>
        ) : !authed ? (
          <div className="pro-card mx-auto mt-16 max-w-md p-8 text-center">
            <UserIcon
              className="mx-auto h-10 w-10"
              style={{ color: "var(--pro-accent)" }}
              strokeWidth={1.6}
            />
            <h1
              className="pro-display mt-4 text-[24px] font-bold"
              style={{ color: "var(--pro-fg)" }}
            >
              Your creations live here
            </h1>
            <p
              className="mt-2 text-[14px] leading-6"
              style={{ color: "var(--pro-muted)" }}
            >
              Log in to see your generation history, purchases and downloads —
              everything from the last 30 days in one place.
            </p>
            <button
              type="button"
              onClick={() => setAuthModalOpen(true)}
              className="pro-btn-primary mt-6 w-full"
            >
              Log in
            </button>
            <AuthModal
              open={authModalOpen}
              onClose={() => setAuthModalOpen(false)}
              onAuthenticated={() => setAuthModalOpen(false)}
            />
          </div>
        ) : (
          profile && (
            <>
              <ProfileHeader
                profile={profile}
                onEdit={() => setTab("settings")}
              />

              {/* tabs */}
              <div
                className="mt-6 flex gap-1 border-b"
                style={{ borderColor: "var(--pro-border)" }}
                role="tablist"
                aria-label="Profile sections"
              >
                {(
                  [
                    { id: "creations", label: "My creations", Icon: ImageIcon },
                    { id: "purchases", label: "Purchases", Icon: Receipt },
                    {
                      id: "settings",
                      label: "Settings",
                      Icon: SettingsIcon,
                    },
                  ] as const
                ).map(({ id, label, Icon }) => (
                  <button
                    key={id}
                    type="button"
                    role="tab"
                    aria-selected={tab === id}
                    onClick={() => setTab(id)}
                    className="inline-flex min-h-[48px] items-center gap-2 border-b-2 px-4 py-3 text-[14px] font-semibold transition-colors"
                    style={{
                      borderColor:
                        tab === id ? "var(--pro-accent)" : "transparent",
                      color:
                        tab === id ? "var(--pro-fg)" : "var(--pro-muted)",
                    }}
                  >
                    <Icon className="h-4 w-4" strokeWidth={2} />
                    {label}
                  </button>
                ))}
              </div>

              {listError && (
                <p
                  className="mt-4 rounded-[12px] border px-4 py-3 text-[13.5px]"
                  style={{
                    borderColor: "var(--pro-border)",
                    color: "#d97a7a",
                    background: "var(--pro-bg-elev)",
                  }}
                >
                  {listError}
                </p>
              )}

              {tab === "creations" && (
                <CreationsGrid
                  items={generations}
                  unlockBusyId={unlockBusyId}
                  onUnlock={(item) => void startUnlock(item)}
                  unlockError={unlockError}
                />
              )}

              {tab === "purchases" && <PurchasesList orders={orders} />}

              {tab === "settings" && (
                <SettingsForm
                  profile={profile}
                  nameDraft={nameDraft}
                  onNameChange={setNameDraft}
                  avatarDraft={avatarDraft}
                  onAvatarFile={(f) => void onAvatarFile(f)}
                  onAvatarRemove={() => setAvatarDraft(null)}
                  onSave={() => void saveProfile()}
                  saving={saving}
                  saveMsg={saveMsg}
                />
              )}
            </>
          )
        )}
      </main>
      <VilishFooter />
      {payModal && (
        <PaymentModal
          jobId={payModal.jobId}
          initialPayment={payModal.payment}
          onClose={() => setPayModal(null)}
          navigate={(url) => router.push(url)}
          onPaymentVerified={() => {
            setPayModal(null);
            void fetchAll();
          }}
        />
      )}
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense
      fallback={
        <div className="pro-surface flex min-h-screen items-center justify-center">
          <Loader2
            className="h-6 w-6 animate-spin"
            style={{ color: "var(--pro-muted)" }}
          />
        </div>
      }
    >
      <ProfilePageInner />
    </Suspense>
  );
}
