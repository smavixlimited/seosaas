import { SecurityAuditService } from "@/services/security-audit.service";
import { AppError } from "@/server/lib/errors";

export interface CancellationSurveyRecord {
  id: string;
  userId: string;
  userEmail: string;
  planId: string;
  reason: string;
  feedback?: string;
  acceptedRetentionDiscount: boolean;
  createdAt: string;
}

export interface UserCreditUsageSummary {
  userId: string;
  creditsUsed: number;
  monthlyCreditsLimit: number;
  creditsRemaining: number;
  percentageUsed: number;
  isNearLimit: boolean; // >= 80%
  isDepleted: boolean; // >= 100%
  planId: string;
  planName?: string;
}

// In-Memory store for surveys and retention discounts
const cancellationSurveys = new Map<string, CancellationSurveyRecord>();
const activeRetentionDiscounts = new Map<
  string,
  { discountPercent: number; expiresAt: number }
>();

export const RetentionService = {
  /**
   * Retrieves real-time credit balance and usage meter from database for topbar.
   */
  async getUserCreditUsage(userId: string): Promise<UserCreditUsageSummary> {
    let creditsUsed = 0;
    let monthlyCreditsLimit = 500;
    let planId = "starter";

    try {
      const { db } = await import("@/db");
      const { userQuotas, saasPlans } = await import("@/db/schema");
      const { eq } = await import("drizzle-orm");

      const [row] = await db
        .select()
        .from(userQuotas)
        .where(eq(userQuotas.userId, userId))
        .limit(1);

      if (row) {
        // Check for expired subscription past 24-hour grace period
        if (row.planId && row.planId !== "starter" && row.resetAt) {
          const { SubscriptionLifecycleService } =
            await import("@/services/subscription-lifecycle.service");
          if (SubscriptionLifecycleService.isPastGracePeriod(row.resetAt)) {
            await SubscriptionLifecycleService.downgradeUserToStarter(userId);
            row.planId = "starter";
            row.monthlyCreditsLimit = 500;
          }
        }

        creditsUsed = row.creditsUsed ?? 0;
        monthlyCreditsLimit = row.monthlyCreditsLimit ?? 500;
        planId = row.planId ?? "starter";
      } else {
        // Initialize default user quotas in database for new user
        const resetAt = new Date(
          Date.now() + 30 * 24 * 60 * 60 * 1000,
        ).toISOString();
        try {
          await db.insert(userQuotas).values({
            userId,
            planId: "starter",
            monthlyCreditsLimit: 500,
            creditsUsed: 0,
            crawlPagesUsed: 0,
            uptimeMonitorsCount: 0,
            resetAt,
          });
        } catch {}
      }
    } catch (err) {
      console.warn("getUserCreditUsage database error, using fallback:", err);
    }

    const creditsRemaining = Math.max(0, monthlyCreditsLimit - creditsUsed);
    const percentageUsed = Math.min(
      100,
      Math.round((creditsUsed / Math.max(1, monthlyCreditsLimit)) * 100),
    );
    const isNearLimit = percentageUsed >= 80;
    const isDepleted = creditsRemaining <= 0;
    let planName = "Free Plan";
    if (planId === "starter") planName = "Starter Plan";
    else if (planId === "growth") planName = "Growth Plan";
    else if (planId === "pro") planName = "Pro Plan";
    else if (planId === "agency") planName = "Agency Plan";
    else if (planId === "enterprise") planName = "Enterprise Plan";
    else if (planId === "free") planName = "Free Plan";

    try {
      const { BillingPlansService } =
        await import("@/services/billing-plans.service");
      const allPlans = await BillingPlansService.getAllPlans();
      const dbPlan = allPlans.find(
        (p) => p.id.toLowerCase() === planId.toLowerCase(),
      );
      if (dbPlan?.name) {
        planName = dbPlan.name;
      }
    } catch {}

    return {
      userId,
      creditsUsed,
      monthlyCreditsLimit,
      creditsRemaining,
      percentageUsed,
      isNearLimit,
      isDepleted,
      planId,
      planName,
    };
  },

  /**
   * Processes cancellation exit survey and applies retention offer.
   */
  async processCancellationSurvey(params: {
    userId: string;
    userEmail: string;
    planId: string;
    reason: string;
    feedback?: string;
    acceptRetentionDiscount?: boolean;
  }): Promise<{
    surveyRecorded: boolean;
    discountApplied: boolean;
    discountDetails?: { discountPercent: number; months: number };
  }> {
    const id = `surv_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const acceptedDiscount = Boolean(params.acceptRetentionDiscount);

    const record: CancellationSurveyRecord = {
      id,
      userId: params.userId,
      userEmail: params.userEmail,
      planId: params.planId,
      reason: params.reason,
      feedback: params.feedback,
      acceptedRetentionDiscount: acceptedDiscount,
      createdAt: new Date().toISOString(),
    };

    const discountExpiresAt = acceptedDiscount
      ? new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString()
      : null;

    try {
      const { db } = await import("@/db");
      const { cancellationSurveys: surveysTable } = await import("@/db/schema");

      await db.insert(surveysTable).values({
        id: record.id,
        userId: record.userId,
        userEmail: record.userEmail,
        planId: record.planId,
        reason: record.reason,
        feedback: record.feedback || null,
        acceptedRetentionDiscount: record.acceptedRetentionDiscount,
        discountPercent: acceptedDiscount ? 30 : 0,
        discountExpiresAt,
        createdAt: record.createdAt,
      });
    } catch {}

    cancellationSurveys.set(id, record);

    if (acceptedDiscount) {
      // Apply 30% retention discount for 3 months
      activeRetentionDiscounts.set(params.userId, {
        discountPercent: 30,
        expiresAt: Date.now() + 90 * 24 * 60 * 60 * 1000,
      });

      await SecurityAuditService.recordAuditLog({
        adminId: params.userId,
        adminEmail: params.userEmail,
        action: "RETENTION_DISCOUNT_APPLIED",
        targetId: params.userId,
        targetType: "user_billing",
        metadata: { discountPercent: 30, months: 3, reason: params.reason },
      });

      return {
        surveyRecorded: true,
        discountApplied: true,
        discountDetails: { discountPercent: 30, months: 3 },
      };
    }

    await SecurityAuditService.recordAuditLog({
      adminId: params.userId,
      adminEmail: params.userEmail,
      action: "SUBSCRIPTION_CANCELLED_SURVEY",
      targetId: params.userId,
      targetType: "user_billing",
      metadata: { reason: params.reason, feedback: params.feedback || "" },
    });

    return {
      surveyRecorded: true,
      discountApplied: false,
    };
  },

  /**
   * Checks if user has an active retention discount.
   */
  async hasActiveDiscountAsync(
    userId: string,
  ): Promise<{ hasDiscount: boolean; discountPercent?: number }> {
    try {
      const { db } = await import("@/db");
      const { cancellationSurveys: surveysTable } = await import("@/db/schema");
      const { eq, and, desc } = await import("drizzle-orm");

      const [row] = await db
        .select()
        .from(surveysTable)
        .where(
          and(
            eq(surveysTable.userId, userId),
            eq(surveysTable.acceptedRetentionDiscount, true),
          ),
        )
        .orderBy(desc(surveysTable.createdAt))
        .limit(1);

      if (
        row &&
        row.discountExpiresAt &&
        new Date(row.discountExpiresAt).getTime() > Date.now()
      ) {
        return {
          hasDiscount: true,
          discountPercent: row.discountPercent ?? 30,
        };
      }
    } catch {}

    const discount = activeRetentionDiscounts.get(userId);
    if (!discount) return { hasDiscount: false };
    if (discount.expiresAt < Date.now()) {
      activeRetentionDiscounts.delete(userId);
      return { hasDiscount: false };
    }
    return { hasDiscount: true, discountPercent: discount.discountPercent };
  },

  hasActiveDiscount(userId: string): {
    hasDiscount: boolean;
    discountPercent?: number;
  } {
    const discount = activeRetentionDiscounts.get(userId);
    if (!discount) return { hasDiscount: false };
    if (discount.expiresAt < Date.now()) {
      activeRetentionDiscounts.delete(userId);
      return { hasDiscount: false };
    }
    return { hasDiscount: true, discountPercent: discount.discountPercent };
  },
};
