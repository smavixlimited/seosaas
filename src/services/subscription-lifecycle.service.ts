import { SecurityAuditService } from "@/services/security-audit.service";

export const GRACE_PERIOD_HOURS = 24;
export const GRACE_PERIOD_MS = GRACE_PERIOD_HOURS * 60 * 60 * 1000;

export interface DowngradeResult {
  userId: string;
  previousPlanId: string;
  newPlanId: string;
  downgraded: boolean;
  reason: string;
}

export const SubscriptionLifecycleService = {
  /**
   * Evaluates if a subscription reset date is past the 24-hour grace period window.
   */
  isPastGracePeriod(resetAt: string | Date | null | undefined): boolean {
    if (!resetAt) return false;
    const expiryTime = new Date(resetAt).getTime();
    if (isNaN(expiryTime)) return false;
    return Date.now() > expiryTime + GRACE_PERIOD_MS;
  },

  /**
   * Checks if subscription is in the active 24-hour grace period.
   */
  isInGracePeriod(resetAt: string | Date | null | undefined): boolean {
    if (!resetAt) return false;
    const expiryTime = new Date(resetAt).getTime();
    if (isNaN(expiryTime)) return false;
    const now = Date.now();
    return now > expiryTime && now <= expiryTime + GRACE_PERIOD_MS;
  },

  /**
   * Downgrades an expired user to the Starter (free) plan.
   */
  async downgradeUserToStarter(
    userId: string,
    reason = "SUBSCRIPTION_EXPIRED_24H_GRACE",
  ): Promise<DowngradeResult> {
    try {
      const { db } = await import("@/db");
      const { userQuotas, billingCustomerStatus, member } =
        await import("@/db/schema");
      const { eq } = await import("drizzle-orm");

      const [quota] = await db
        .select()
        .from(userQuotas)
        .where(eq(userQuotas.userId, userId))
        .limit(1);

      const previousPlanId = quota?.planId || "unknown";
      if (previousPlanId === "starter") {
        return {
          userId,
          previousPlanId: "starter",
          newPlanId: "starter",
          downgraded: false,
          reason: "User is already on Starter plan",
        };
      }

      const now = new Date().toISOString();
      const nextResetAt = new Date(
        Date.now() + 30 * 24 * 60 * 60 * 1000,
      ).toISOString();

      // 1. Update user quotas to Starter defaults
      await db
        .update(userQuotas)
        .set({
          planId: "starter",
          monthlyCreditsLimit: 500,
          resetAt: nextResetAt,
          updatedAt: now,
        })
        .where(eq(userQuotas.userId, userId));

      // 2. Resolve organization and mark customer status as expired
      const [mem] = await db
        .select({ organizationId: member.organizationId })
        .from(member)
        .where(eq(member.userId, userId))
        .limit(1);

      if (mem?.organizationId) {
        await db
          .update(billingCustomerStatus)
          .set({
            isPaying: false,
            paidPlanStatus: "expired",
            customerJson: JSON.stringify({
              plan: "starter",
              active: false,
              previousPlan: previousPlanId,
              downgradedAt: now,
              reason,
            }),
            updatedAt: now,
          })
          .where(eq(billingCustomerStatus.organizationId, mem.organizationId));
      }

      // 3. Record security audit log
      await SecurityAuditService.recordAuditLog({
        adminId: "system",
        adminEmail: "system@skorvia.com",
        action: "SUBSCRIPTION_EXPIRED_DOWNGRADED",
        targetId: userId,
        targetType: "user_billing",
        metadata: {
          userId,
          previousPlanId,
          newPlanId: "starter",
          reason,
          downgradedAt: now,
        },
      });

      return {
        userId,
        previousPlanId,
        newPlanId: "starter",
        downgraded: true,
        reason,
      };
    } catch (err) {
      console.warn("Error downgrading expired user to starter:", err);
      return {
        userId,
        previousPlanId: "unknown",
        newPlanId: "starter",
        downgraded: false,
        reason: (err as Error).message,
      };
    }
  },

  /**
   * Scans all users and downgrades those whose paid subscriptions expired > 24 hours ago.
   */
  async checkAndDowngradeExpiredSubscriptions(): Promise<DowngradeResult[]> {
    const results: DowngradeResult[] = [];
    try {
      const { db } = await import("@/db");
      const { userQuotas } = await import("@/db/schema");
      const { ne } = await import("drizzle-orm");

      // Query paid plans only
      const paidRows = await db
        .select()
        .from(userQuotas)
        .where(ne(userQuotas.planId, "starter"));

      for (const row of paidRows) {
        if (this.isPastGracePeriod(row.resetAt)) {
          const res = await this.downgradeUserToStarter(
            row.userId,
            "SUBSCRIPTION_EXPIRED_24H_GRACE",
          );
          results.push(res);
        }
      }
    } catch (err) {
      console.warn("Error running batch subscription expiration check:", err);
    }
    return results;
  },

  /**
   * Renews an active or past-due subscription upon successful payment receipt.
   */
  async renewSubscription(params: {
    userId: string;
    planId: string;
    organizationId?: string;
    billingIntervalDays?: number;
  }): Promise<boolean> {
    try {
      const { db } = await import("@/db");
      const { userQuotas, billingCustomerStatus, member } =
        await import("@/db/schema");
      const { eq } = await import("drizzle-orm");

      const credits =
        params.planId === "agency"
          ? 10000
          : params.planId === "pro"
            ? 2500
            : 500;
      const intervalDays = params.billingIntervalDays ?? 30;
      const now = new Date().toISOString();
      const resetAt = new Date(
        Date.now() + intervalDays * 24 * 60 * 60 * 1000,
      ).toISOString();

      // 1. Update userQuotas: reset credit consumption to 0 and advance resetAt
      await db
        .insert(userQuotas)
        .values({
          userId: params.userId,
          planId: params.planId,
          monthlyCreditsLimit: credits,
          creditsUsed: 0,
          resetAt,
          updatedAt: now,
        })
        .onConflictDoUpdate({
          target: userQuotas.userId,
          set: {
            planId: params.planId,
            monthlyCreditsLimit: credits,
            creditsUsed: 0,
            resetAt,
            updatedAt: now,
          },
        });

      // 2. Discover organizationId if not passed
      let targetOrgId = params.organizationId;
      if (!targetOrgId) {
        const [mem] = await db
          .select({ organizationId: member.organizationId })
          .from(member)
          .where(eq(member.userId, params.userId))
          .limit(1);
        targetOrgId = mem?.organizationId;
      }

      // 3. Mark billing customer status active
      if (targetOrgId) {
        await db
          .insert(billingCustomerStatus)
          .values({
            organizationId: targetOrgId,
            isPaying: true,
            paidPlanId: params.planId,
            paidPlanStatus: "active",
            customerJson: JSON.stringify({
              plan: params.planId,
              active: true,
              renewedAt: now,
              userId: params.userId,
            }),
            syncedAt: now,
            createdAt: now,
            updatedAt: now,
          })
          .onConflictDoUpdate({
            target: billingCustomerStatus.organizationId,
            set: {
              isPaying: true,
              paidPlanId: params.planId,
              paidPlanStatus: "active",
              customerJson: JSON.stringify({
                plan: params.planId,
                active: true,
                renewedAt: now,
                userId: params.userId,
              }),
              updatedAt: now,
            },
          });
      }

      await SecurityAuditService.recordAuditLog({
        adminId: params.userId,
        adminEmail: "user@skorvia.com",
        action: "SUBSCRIPTION_RENEWED",
        targetId: params.userId,
        targetType: "user_billing",
        metadata: {
          userId: params.userId,
          planId: params.planId,
          credits,
          resetAt,
        },
      });

      return true;
    } catch (err) {
      console.warn("Error renewing subscription:", err);
      return false;
    }
  },
};
