/**
 * Etch — admin allowlist tests.
 *
 * isAdminEmail() gates the owner testing bypass (no caps, no paywalls).
 * The email always comes from the verified Auth.js session, never the client.
 */
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { adminEmails, isAdminEmail } from "../admin";

const OWNER = "vidishofficial@gmail.com";

beforeEach(() => {
  vi.stubEnv("ADMIN_EMAILS", OWNER);
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("adminEmails", () => {
  it("parses a single email", () => {
    expect(adminEmails()).toEqual([OWNER]);
  });

  it("parses multiple emails with whitespace and mixed case", () => {
    vi.stubEnv("ADMIN_EMAILS", `  VidishOfficial@Gmail.com ,, other@example.com `);
    expect(adminEmails()).toEqual([OWNER, "other@example.com"]);
  });

  it("returns empty when unset", () => {
    vi.stubEnv("ADMIN_EMAILS", "");
    expect(adminEmails()).toEqual([]);
  });
});

describe("isAdminEmail", () => {
  it("matches the owner email case-insensitively", () => {
    expect(isAdminEmail("VidishOfficial@GMAIL.com")).toBe(true);
  });

  it("rejects other emails", () => {
    expect(isAdminEmail("stranger@example.com")).toBe(false);
  });

  it("rejects null/undefined/empty", () => {
    expect(isAdminEmail(null)).toBe(false);
    expect(isAdminEmail(undefined)).toBe(false);
    expect(isAdminEmail("")).toBe(false);
  });

  it("rejects everyone when the allowlist is empty", () => {
    vi.stubEnv("ADMIN_EMAILS", "");
    expect(isAdminEmail(OWNER)).toBe(false);
  });

  it("does not substring-match (evasion check)", () => {
    expect(isAdminEmail(`evil${OWNER}`)).toBe(false);
    expect(isAdminEmail(`${OWNER}.evil.com`)).toBe(false);
  });
});
