import { describe, it, expect } from "vitest";
import {
  SubscriptionLifecycleService,
  GRACE_PERIOD_MS,
} from "@/services/subscription-lifecycle.service";

describe("SubscriptionLifecycleService (24-Hour Grace Period & Auto-Downgrade)", () => {
  it("accurately identifies expired subscriptions beyond the 24-hour grace period", () => {
    const futureDate = new Date(
      Date.now() + 10 * 24 * 60 * 60 * 1000,
    ).toISOString();
    expect(SubscriptionLifecycleService.isPastGracePeriod(futureDate)).toBe(
      false,
    );

    // Expired 5 hours ago (still in 24h grace period)
    const recentlyExpired = new Date(
      Date.now() - 5 * 60 * 60 * 1000,
    ).toISOString();
    expect(
      SubscriptionLifecycleService.isPastGracePeriod(recentlyExpired),
    ).toBe(false);
    expect(SubscriptionLifecycleService.isInGracePeriod(recentlyExpired)).toBe(
      true,
    );

    // Expired 25 hours ago (past 24h grace period)
    const longExpired = new Date(
      Date.now() - 25 * 60 * 60 * 1000,
    ).toISOString();
    expect(SubscriptionLifecycleService.isPastGracePeriod(longExpired)).toBe(
      true,
    );
    expect(SubscriptionLifecycleService.isInGracePeriod(longExpired)).toBe(
      false,
    );
  });

  it("handles empty or invalid dates gracefully", () => {
    expect(SubscriptionLifecycleService.isPastGracePeriod(null)).toBe(false);
    expect(
      SubscriptionLifecycleService.isPastGracePeriod("invalid-date-string"),
    ).toBe(false);
    expect(SubscriptionLifecycleService.isInGracePeriod(null)).toBe(false);
  });

  it("downgrades expired user to starter cleanly", async () => {
    const result = await SubscriptionLifecycleService.downgradeUserToStarter(
      "test-user-grace-001",
      "SUBSCRIPTION_EXPIRED_24H_GRACE",
    );
    expect(result.newPlanId).toBe("starter");
  });
});
