import type { Metadata } from "next";

/**
 * /profile — the signed-in user's own dashboard (client component).
 * Personal, session-gated content: never index it.
 */
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
