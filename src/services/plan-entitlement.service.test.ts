import { describe, it, expect } from "vitest";
import { PlanEntitlementService } from "@/services/plan-entitlement.service";
import { AppError } from "@/server/lib/errors";

describe("PlanEntitlementService", () => {
  it("resolves default entitlements for a new or fallback user", async () => {
    const entitlements =
      await PlanEntitlementService.getUserEntitlements("test-user-id-001");
    expect(entitlements.userId).toBe("test-user-id-001");
    expect(entitlements.planId).toBeDefined();
    expect(entitlements.limits.monthlyCredits).toBeGreaterThanOrEqual(500);
    expect(entitlements.features.advanced_analytics).toBe(true);
    expect(entitlements.features.keyword_research).toBe(true);
  });

  it("passes feature assertion for allowed core features", async () => {
    await expect(
      PlanEntitlementService.assertFeatureAccess(
        "test-user-id-001",
        "keyword_research",
      ),
    ).resolves.toBeUndefined();
  });

  it("checks credit assertion without overdraft", async () => {
    // Assert 10 credits check
    await expect(
      PlanEntitlementService.assertSufficientCredits("test-user-id-001", 10),
    ).resolves.toBeUndefined();
  });
});
