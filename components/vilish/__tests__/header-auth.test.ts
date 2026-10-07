/**
 * Etch — header auth control guards.
 *
 * The site header must always expose auth state: a "Log in" button for
 * guests and an account menu (email + log out) for signed-in users.
 * File-content tests so a removed control fails fast without a browser.
 */
import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = new URL("../../..", import.meta.url).pathname.replace(/\/$/, "");
const read = (p: string) => readFileSync(join(ROOT, p), "utf8");

describe("header auth control", () => {
  it("auth-button.tsx exists and wires next-auth session state", () => {
    expect(existsSync(join(ROOT, "components/vilish/auth-button.tsx"))).toBe(true);
    const src = read("components/vilish/auth-button.tsx");
    expect(src).toContain("useSession");
    expect(src).toContain("signOut");
    expect(src).toContain("AuthModal");
  });

  it("shows Log in for guests and Log out for signed-in users", () => {
    const src = read("components/vilish/auth-button.tsx");
    expect(src).toContain("Log in");
    expect(src).toContain("Log out");
    expect(src).toContain("session?.user?.email");
  });

  it("nav renders the AuthButton next to Create", () => {
    const nav = read("components/vilish/nav.tsx");
    expect(nav).toContain("AuthButton");
    expect(nav).toContain('from "./auth-button"');
    expect(nav).toContain("<AuthButton />");
  });
});
