import { AppError } from "@/server/lib/errors";
import {
  BillingPlansService,
  type SaasPlanFeatures,
  type SaasPlanLimits,
} from "@/services/billing-plans.service";
import { CreditGuardService } from "@/services/credit-guard.service";

export interface UserEntitlementsResult {
  userId: string;
  planId: string;
  planName: string;
  limits: SaasPlanLimits;
  features: SaasPlanFeatures;
  creditsUsed: number;
  monthlyCreditsLimit: number;
  creditsRemaining: number;
  isDepleted: boolean;
}

export const PlanEntitlementService = {
  /**
   * Resolves the user's active plan, effective feature permissions, and quota usage.
   */
  async getUserEntitlements(userId: string): Promise<UserEntitlementsResult> {
    let planId = "starter";
    let creditsUsed = 0;
    let monthlyCreditsLimit = 500;

    try {
      const { db } = await import("@/db");
      const { userQuotas } = await import("@/db/schema");
      const { eq } = await import("drizzle-orm");

      const [quota] = await db
        .select()
        .from(userQuotas)
        .where(eq(userQuotas.userId, userId))
        .limit(1);

      if (quota) {
        planId = quota.planId ?? "starter";
        creditsUsed = quota.creditsUsed ?? 0;
        monthlyCreditsLimit = quota.monthlyCreditsLimit ?? 500;
      }
    } catch {
      // Fallback
    }

    const allPlans = await BillingPlansService.getAllPlans();
    const activePlan =
      allPlans.find((p) => p.id.toLowerCase() === planId.toLowerCase()) ||
      allPlans.find((p) => p.id.toLowerCase() === "free") ||
      allPlans.find((p) => p.id.toLowerCase() === "starter") ||
      allPlans[0];

    const limits: SaasPlanLimits = activePlan?.limits ?? {
      maxDomains: 1,
      maxCompetitors: 2,
      competitorScans: 5,
      keywordSearches: 15,
      monthlyCredits: 50,
      auditPages: 100,
      uptimeMonitors: 0,
      teamMembers: 1,
    };

    const features: SaasPlanFeatures = activePlan?.features ?? {
      advanced_analytics: true,
      action_roadmap: true,
      my_reports_builder: false,
      brand_analysis: true,
      ad_readiness: false,
      viral_detector: false,
      trends_radar: false,
      competitors_directory: true,
      competitor_ads: false,
      competitor_analysis: false,
      keyword_research: true,
      rank_tracker: true,
      backlink_analysis: false,
      site_audit: true,
      gbp_integration: false,
      map_rank_tracker: false,
      review_management: false,
      listing_management: false,
      ai_visibility: false,
      ai_content_studio: false,
      ai_seo_fixer: false,
      indexnow_submitter: false,
      uptime_ssl_monitoring: false,
      white_label_pdf: false,
      team_management: false,
      mcp_api_access: false,
      priority_support: false,
    };

    const creditsRemaining = Math.max(0, monthlyCreditsLimit - creditsUsed);

    return {
      userId,
      planId: activePlan?.id ?? planId,
      planName: activePlan?.name ?? "Free Plan",
      limits,
      features,
      creditsUsed,
      monthlyCreditsLimit,
      creditsRemaining,
      isDepleted: creditsRemaining <= 0,
    };
  },

  /**
   * Asserts that a user's plan includes access to a specific feature.
   * Throws FORBIDDEN_PLAN_FEATURE AppError if not permitted.
   */
  async assertFeatureAccess(
    userId: string,
    feature: keyof SaasPlanFeatures,
  ): Promise<void> {
    const entitlements = await this.getUserEntitlements(userId);
    const hasAccess = Boolean(entitlements.features[feature]);

    if (!hasAccess) {
      const featureLabel = feature.replace(/_/g, " ");
      throw new AppError(
        "FORBIDDEN_PLAN_FEATURE",
        `The feature "${featureLabel}" is not available on your current plan (${entitlements.planName}). Please upgrade your plan to unlock this feature.`,
      );
    }
  },

  /**
   * Asserts that the user has at least `requiredCredits` available in their quota.
   * Throws INSUFFICIENT_CREDITS AppError if insufficient.
   */
  async assertSufficientCredits(
    userId: string,
    requiredCredits: number,
  ): Promise<void> {
    const balance = await CreditGuardService.checkBalance(userId);
    if (balance.available < requiredCredits) {
      throw new AppError(
        "INSUFFICIENT_CREDITS",
        `Action requires ${requiredCredits} credits, but you only have ${balance.available} remaining this billing cycle. Please upgrade or top-up.`,
      );
    }
  },
};
