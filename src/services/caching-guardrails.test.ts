import { describe, it, expect, vi } from "vitest";

vi.mock("cloudflare:workers", () => ({ env: {} }));

import { generateQueryHash } from "@/services/caching-guardrails.service";

describe("caching-guardrails.service", () => {
  it("generates deterministic SHA-256 query hashes", async () => {
    const hash1 = await generateQueryHash("keywords.related", {
      keyword: "seo software",
      locationCode: 2840,
    });
    const hash2 = await generateQueryHash("keywords.related", {
      keyword: "seo software",
      locationCode: 2840,
    });
    const hash3 = await generateQueryHash("keywords.related", {
      keyword: "rank tracker",
      locationCode: 2840,
    });

    expect(hash1).toBeDefined();
    expect(hash1).toBe(hash2);
    expect(hash1).not.toBe(hash3);
    expect(hash1.length).toBe(64);
  });
});
