import type { Metadata } from "next";

/**
 * /payment/* — payment return/recovery pages (client components).
 * Transactional, per-session pages: never index them.
 */
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function PaymentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
