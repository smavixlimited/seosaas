import { describe, it, expect } from "vitest";
import { RetentionService } from "@/services/retention.service";

describe("Phase 25: Monetization, Credit Usage Meter & Retention Suite", () => {
  const testUserId = "usr_retention_test_01";
  const testUserEmail = "client@skorvia-user.com";

  describe("1. Real-Time Credit Usage & Topbar Meter", () => {
    it("calculates accurate credit metrics and depletion status", async () => {
      const usage = await RetentionService.getUserCreditUsage(testUserId);

      expect(usage.userId).toBe(testUserId);
      expect(usage.creditsRemaining).toBeGreaterThanOrEqual(0);
      expect(usage.monthlyCreditsLimit).toBeGreaterThanOrEqual(1);
      expect(usage.percentageUsed).toBeGreaterThanOrEqual(0);
      expect(usage.percentageUsed).toBeLessThanOrEqual(100);
      expect(typeof usage.isNearLimit).toBe("boolean");
      expect(typeof usage.isDepleted).toBe("boolean");
    });
  });

  describe("2. Cancellation Exit Survey & 30% Retention Discount", () => {
    it("records exit survey and successfully applies 30% 3-month retention discount", async () => {
      const result = await RetentionService.processCancellationSurvey({
        userId: testUserId,
        userEmail: testUserEmail,
        planId: "pro",
        reason: "Too expensive",
        feedback: "Great tool but budget constraints this quarter.",
        acceptRetentionDiscount: true,
      });

      expect(result.surveyRecorded).toBe(true);
      expect(result.discountApplied).toBe(true);
      expect(result.discountDetails?.discountPercent).toBe(30);
      expect(result.discountDetails?.months).toBe(3);

      const discountCheck = RetentionService.hasActiveDiscount(testUserId);
      expect(discountCheck.hasDiscount).toBe(true);
      expect(discountCheck.discountPercent).toBe(30);
    });

    it("records survey when user proceeds with full cancellation without discount", async () => {
      const result = await RetentionService.processCancellationSurvey({
        userId: "usr_cancelling_user_02",
        userEmail: "leaving@example.com",
        planId: "starter",
        reason: "Temporary project finished",
        acceptRetentionDiscount: false,
      });

      expect(result.surveyRecorded).toBe(true);
      expect(result.discountApplied).toBe(false);

      const discountCheck = RetentionService.hasActiveDiscount("usr_cancelling_user_02");
      expect(discountCheck.hasDiscount).toBe(false);
    });
  });
});
