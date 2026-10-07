/**
 * Etch — Cashfree is the PRIMARY payment mode.
 *
 * File-content regression test: the payment modal must open on the Cashfree
 * "Pay online instantly" flow by default, with manual UPI demoted to a quiet
 * secondary link. Reads source (like seo-checklist.test.ts) — no browser.
 */
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = new URL("../../..", import.meta.url).pathname.replace(/\/$/, "");
const read = (p: string) => readFileSync(join(ROOT, p), "utf8");

describe("payment modal — Cashfree primary", () => {
  const modal = () => read("components/vilish/payment-modal.tsx");

  it("opens on the online (Cashfree) mode by default", () => {
    expect(modal()).toContain('initialPayMode = "online"');
    expect(modal()).toContain("useState<PayMode>(initialPayMode)");
    expect(modal()).not.toContain('useState<PayMode>("upi")');
  });

  it("offers manual UPI as a quiet secondary link", () => {
    expect(modal()).toContain("Prefer manual UPI? Pay via QR");
    expect(modal()).not.toContain("Back to manual UPI (no extra fee)");
  });

  it("resets to the online mode when a new order is created", () => {
    expect(modal()).toMatch(/setPayMode\("online"\)/);
  });

  it("header is mode-neutral", () => {
    expect(modal()).toContain("Complete payment");
    expect(modal()).not.toContain(">Pay with UPI<");
  });

  it("paints above the sticky site nav (z-[100])", () => {
    // Real-device bug: the sheet reached the top of the viewport and the
    // sticky nav (z-[100]) painted over the modal header.
    expect(modal()).toContain("z-[200]");
    expect(modal()).not.toMatch(/fixed inset-0 z-50 flex/);
  });

  it("keeps the manual-UPI QR flow intact", () => {
    const src = modal();
    expect(src).toContain('payMode === "upi"');
    expect(src).toContain("Pay online instantly");
    expect(src).toContain("claimPaymentPaid");
  });
});
