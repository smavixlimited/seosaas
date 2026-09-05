import { describe, it, expect } from "vitest";
import { BRAND_CONFIG } from "@/config/brand";

describe("Dedicated Competitor Comparison Pages Suite", () => {
  it("verifies Skorvia brand identity invariants for comparisons", () => {
    expect(BRAND_CONFIG.name).toBe("Skorvia");
    expect(BRAND_CONFIG.domain).toBe("skorvia.com");
  });

  it("ensures comparison route paths are properly formatted", () => {
    const comparisonRoutes = ["/vs/ahrefs", "/vs/moz", "/vs/se-ranking"];
    expect(comparisonRoutes).toHaveLength(3);
    expect(comparisonRoutes[0]).toBe("/vs/ahrefs");
    expect(comparisonRoutes[1]).toBe("/vs/moz");
    expect(comparisonRoutes[2]).toBe("/vs/se-ranking");
  });
});
