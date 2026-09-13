import { BRAND_CONFIG } from "@/config/brand";
import { SecurityAuditService } from "@/services/security-audit.service";

export interface SaasPlanLimits {
  maxDomains: number;
  monthlyCredits: number;
  auditPages: number;
  uptimeMonitors: number;
}

export interface SaasPlanFeatures {
  // 1. Overview & Strategy
  advanced_analytics: boolean;
  action_roadmap: boolean;
  my_reports_builder: boolean;
  // 2. Brand & Ad Readiness
  brand_analysis: boolean;
  ad_readiness: boolean;
  viral_detector: boolean;
  trends_radar: boolean;
  // 3. Competitor Intelligence
  competitors_directory: boolean;
  competitor_ads: boolean;
  competitor_analysis: boolean;
  // 4. Core SEO
  keyword_research: boolean;
  rank_tracker: boolean;
  backlink_analysis: boolean;
  site_audit: boolean;
  // 5. Local SEO
  gbp_integration: boolean;
  map_rank_tracker: boolean;
  review_management: boolean;
  listing_management: boolean;
  // 6. AI Engines & Enterprise
  ai_visibility: boolean;
  ai_content_studio: boolean;
  ai_seo_fixer: boolean;
  indexnow_submitter: boolean;
  uptime_ssl_monitoring: boolean;
  white_label_pdf: boolean;
  team_management: boolean;
  mcp_api_access: boolean;
  priority_support: boolean;
  // Backward compatibility aliases
  whiteLabelPdf?: boolean;
  mcpAccess?: boolean;
  indexnowSubmit?: boolean;
  aeoAudit?: boolean;
  customBranding?: boolean;
  prioritySupport?: boolean;
}

export interface AdminPlanRecord {
  id: string;
  name: string;
  priceUsd: number;
  priceNgn: number;
  billingInterval: string;
  isActive: boolean;
  limits: SaasPlanLimits;
  features: SaasPlanFeatures;
}

const DEFAULT_PLANS: AdminPlanRecord[] = BRAND_CONFIG.pricing.tiers.map((t) => {
  const isAgency =
    (t.id as string) === "agency" || (t.id as string) === "enterprise";
  const isProOrAbove = (t.id as string) !== "starter";

  return {
    id: t.id,
    name: t.name,
    priceUsd: t.priceMonthlyUSD,
    priceNgn: t.priceMonthlyNGN,
    billingInterval: "month",
    isActive: true,
    limits: {
      maxDomains: t.id === "starter" ? 5 : t.id === "pro" ? 20 : 9999,
      monthlyCredits: t.id === "starter" ? 500 : t.id === "pro" ? 2500 : 10000,
      auditPages: t.id === "starter" ? 5000 : t.id === "pro" ? 50000 : 250000,
      uptimeMonitors: t.id === "starter" ? 0 : t.id === "pro" ? 5 : 50,
    },
    features: {
      // 1. Overview & Strategy
      advanced_analytics: true,
      action_roadmap: true,
      my_reports_builder: isAgency,
      // 2. Brand & Ad Readiness
      brand_analysis: true,
      ad_readiness: isProOrAbove,
      viral_detector: isProOrAbove,
      trends_radar: isProOrAbove,
      // 3. Competitor Intelligence
      competitors_directory: true,
      competitor_ads: isProOrAbove,
      competitor_analysis: isProOrAbove,
      // 4. Core SEO
      keyword_research: true,
      rank_tracker: true,
      backlink_analysis: isProOrAbove,
      site_audit: true,
      // 5. Local SEO
      gbp_integration: isProOrAbove,
      map_rank_tracker: isProOrAbove,
      review_management: isAgency,
      listing_management: isAgency,
      // 6. AI Engines & Enterprise
      ai_visibility: isProOrAbove,
      ai_content_studio: isProOrAbove,
      ai_seo_fixer: isAgency,
      indexnow_submitter: isProOrAbove,
      uptime_ssl_monitoring: isProOrAbove,
      white_label_pdf: isAgency,
      team_management: isAgency,
      mcp_api_access: isProOrAbove,
      priority_support: isAgency,
      // Compatibility aliases
      whiteLabelPdf: isAgency,
      mcpAccess: isProOrAbove,
      indexnowSubmit: isProOrAbove,
      aeoAudit: isProOrAbove,
      customBranding: isAgency,
      prioritySupport: isAgency,
    },
  };
});

export const BillingPlansService = {
  /**
   * Retrieves all SaaS plans for admin management.
   */
  async getAllPlans(): Promise<AdminPlanRecord[]> {
    try {
      const { db } = await import("@/db");
      const { saasPlans } = await import("@/db/schema");

      const rows = await db.select().from(saasPlans);
      if (rows.length === 0) {
        return DEFAULT_PLANS;
      }

      return rows.map((p) => {
        let limits: SaasPlanLimits = {
          maxDomains: 5,
          monthlyCredits: 500,
          auditPages: 5000,
          uptimeMonitors: 0,
        };
        let features: SaasPlanFeatures = {
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
          backlink_analysis: true,
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
          whiteLabelPdf: false,
          mcpAccess: false,
          indexnowSubmit: false,
          aeoAudit: false,
          customBranding: false,
          prioritySupport: false,
        };

        try {
          limits = { ...limits, ...JSON.parse(p.limitsJson) };
        } catch {}
        try {
          features = { ...features, ...JSON.parse(p.featuresJson) };
        } catch {}

        return {
          id: p.id,
          name: p.name,
          priceUsd: p.priceUsd,
          priceNgn: p.priceNgn,
          billingInterval: p.billingInterval,
          isActive: Boolean(p.isActive),
          limits,
          features,
        };
      });
    } catch {
      return DEFAULT_PLANS;
    }
  },

  /**
   * Retrieves active SaaS plans for public pricing / billing page.
   */
  async getActivePlans(): Promise<AdminPlanRecord[]> {
    const all = await this.getAllPlans();
    return all.filter((p) => p.isActive);
  },

  /**
   * Upserts a plan definition and logs an immutable audit event.
   */
  async upsertPlan(
    plan: AdminPlanRecord,
    adminId: string,
    adminEmail: string,
  ): Promise<AdminPlanRecord> {
    const limitsJson = JSON.stringify(plan.limits);
    const featuresJson = JSON.stringify(plan.features);

    try {
      const { db } = await import("@/db");
      const { saasPlans } = await import("@/db/schema");
      const { eq } = await import("drizzle-orm");

      const [existing] = await db
        .select()
        .from(saasPlans)
        .where(eq(saasPlans.id, plan.id))
        .limit(1);

      if (existing) {
        await db
          .update(saasPlans)
          .set({
            name: plan.name,
            priceUsd: plan.priceUsd,
            priceNgn: plan.priceNgn,
            billingInterval: plan.billingInterval,
            isActive: plan.isActive,
            limitsJson,
            featuresJson,
          })
          .where(eq(saasPlans.id, plan.id));
      } else {
        await db.insert(saasPlans).values({
          id: plan.id,
          name: plan.name,
          priceUsd: plan.priceUsd,
          priceNgn: plan.priceNgn,
          billingInterval: plan.billingInterval,
          isActive: plan.isActive,
          limitsJson,
          featuresJson,
        });
      }

      // Record audit log
      await SecurityAuditService.recordAuditLog({
        adminId,
        adminEmail,
        action: existing ? "PLAN_PRICE_CHANGED" : "PLAN_CREATED",
        targetId: plan.id,
        targetType: "saas_plan",
        metadata: {
          planId: plan.id,
          name: plan.name,
          priceUsd: plan.priceUsd,
          priceNgn: plan.priceNgn,
          isActive: plan.isActive,
        },
      });
    } catch (err) {
      console.warn("Failed to persist saasPlan to DB:", err);
    }

    return plan;
  },

  /**
   * Toggles active/archived state for a plan.
   */
  async togglePlanStatus(
    planId: string,
    isActive: boolean,
    adminId: string,
    adminEmail: string,
  ): Promise<boolean> {
    try {
      const { db } = await import("@/db");
      const { saasPlans } = await import("@/db/schema");
      const { eq } = await import("drizzle-orm");

      await db
        .update(saasPlans)
        .set({ isActive })
        .where(eq(saasPlans.id, planId));

      await SecurityAuditService.recordAuditLog({
        adminId,
        adminEmail,
        action: isActive ? "PLAN_ACTIVATED" : "PLAN_ARCHIVED",
        targetId: planId,
        targetType: "saas_plan",
        metadata: { planId, isActive },
      });
    } catch (err) {
      console.warn("Failed to toggle plan status in DB:", err);
    }

    return isActive;
  },
};
