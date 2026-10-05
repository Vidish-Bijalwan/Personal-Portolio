import { describe, expect, it } from "vitest";
import {
  advanceTypewriter,
  HOLD_DELAY_MS,
  initialTypewriterState,
  PROMPT_IDEAS,
  typewriterDelay,
  typewriterText,
  TYPE_DELAY_MS,
  DELETE_DELAY_MS,
  type TypewriterState,
} from "@/lib/vilish/typewriter";

describe("typewriter state machine", () => {
  it("offers several distinct example prompts", () => {
    expect(PROMPT_IDEAS.length).toBeGreaterThanOrEqual(4);
    expect(new Set(PROMPT_IDEAS).size).toBe(PROMPT_IDEAS.length);
  });

  it("types one character per tick, then holds, then deletes", () => {
    let s = initialTypewriterState();
    const first = PROMPT_IDEAS[0]!;
    expect(typewriterText(s)).toBe("");
    expect(typewriterDelay(s)).toBe(TYPE_DELAY_MS);

    for (let i = 0; i < first.length; i++) s = advanceTypewriter(s);
    expect(typewriterText(s)).toBe(first);

    s = advanceTypewriter(s);
    expect(typewriterDelay(s)).toBe(HOLD_DELAY_MS);
    expect(typewriterText(s)).toBe(first); // held text unchanged

    s = advanceTypewriter(s); // holding -> deleting
    expect(typewriterDelay(s)).toBe(DELETE_DELAY_MS);
    const afterDelete = advanceTypewriter(s);
    expect(typewriterText(afterDelete)).toBe(first.slice(0, -1));
  });

  it("moves to the next idea after deleting everything", () => {
    let s = initialTypewriterState();
    const first = PROMPT_IDEAS[0]!;
    for (let i = 0; i < first.length; i++) s = advanceTypewriter(s);
    s = advanceTypewriter(s); // -> holding
    s = advanceTypewriter(s); // -> deleting
    for (let i = 0; i < first.length; i++) s = advanceTypewriter(s);
    expect(typewriterText(s)).toBe("");
    s = advanceTypewriter(s); // -> next idea, typing
    expect(s.idea).toBe(1);
    s = advanceTypewriter(s);
    expect(typewriterText(s)).toBe(PROMPT_IDEAS[1]!.slice(0, 1));
  });

  it("wraps around to the first idea", () => {
    let s: TypewriterState = { idea: PROMPT_IDEAS.length - 1, chars: 0, phase: "deleting" };
    s = advanceTypewriter(s);
    expect(s.idea).toBe(0);
    expect(s.phase).toBe("typing");
  });
});
