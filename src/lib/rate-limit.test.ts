import { describe, it, expect } from "vitest";
import { rateLimit } from "./rate-limit";

describe("rateLimit", () => {
  it("allows requests up to the limit within the window", () => {
    const key = `test-${Math.random()}`;
    for (let i = 0; i < 3; i++) {
      expect(rateLimit(key, 3, 1000).ok).toBe(true);
    }
  });

  it("blocks the request once the limit is exceeded", () => {
    const key = `test-${Math.random()}`;
    rateLimit(key, 2, 1000);
    rateLimit(key, 2, 1000);
    const third = rateLimit(key, 2, 1000);
    expect(third.ok).toBe(false);
    expect(third.retryAfterMs).toBeGreaterThan(0);
  });

  it("tracks separate keys independently", () => {
    const keyA = `test-a-${Math.random()}`;
    const keyB = `test-b-${Math.random()}`;
    rateLimit(keyA, 1, 1000);
    expect(rateLimit(keyA, 1, 1000).ok).toBe(false);
    expect(rateLimit(keyB, 1, 1000).ok).toBe(true);
  });
});
