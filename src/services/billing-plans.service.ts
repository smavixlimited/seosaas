import { BRAND_CONFIG } from "@/config/brand";
import { SecurityAuditService } from "@/services/security-audit.service";

export interface SaasPlanLimits {
  maxDomains: number;
  maxCompetitors: number;
  competitorScans: number;
  keywordSearches: number;
  monthlyCredits: number;
  auditPages: number;
  uptimeMonitors: number;
  teamMembers: number;
}

export interface SaasPlanFeatures {
  // 1. Overview & Strategy
  advanced_analytics: boolean;
  action_roadmap: boolean;
  my_reports_builder: boolean;
  // 2. Brand & Reputation
  brand_analysis: boolean;
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
  ad_readiness?: boolean;
  viral_detector?: boolean;
  trends_radar?: boolean;
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

const DEFAULT_PLANS: AdminPlanRecord[] = [
  {
    id: "free",
    name: "Free Plan",
    priceUsd: 0,
    priceNgn: 0,
    billingInterval: "month",
    isActive: true,
    limits: {
      maxDomains: 1,
      maxCompetitors: 2,
      competitorScans: 5,
      keywordSearches: 15,
      monthlyCredits: 50,
      auditPages: 100,
      uptimeMonitors: 0,
      teamMembers: 1,
    },
    features: {
      advanced_analytics: true,
      action_roadmap: true,
      my_reports_builder: false,
      brand_analysis: true,
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
    },
  },
  {
    id: "starter",
    name: "Starter Plan",
    priceUsd: 29,
    priceNgn: 35000,
    billingInterval: "month",
    isActive: true,
    limits: {
      maxDomains: 3,
      maxCompetitors: 5,
      competitorScans: 25,
      keywordSearches: 100,
      monthlyCredits: 500,
      auditPages: 5000,
      uptimeMonitors: 2,
      teamMembers: 2,
    },
    features: {
      advanced_analytics: true,
      action_roadmap: true,
      my_reports_builder: false,
      brand_analysis: true,
      competitors_directory: true,
      competitor_ads: false,
      competitor_analysis: true,
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
      indexnow_submitter: true,
      uptime_ssl_monitoring: true,
      white_label_pdf: false,
      team_management: false,
      mcp_api_access: false,
      priority_support: false,
    },
  },
  {
    id: "pro",
    name: "Professional Plan",
    priceUsd: 79,
    priceNgn: 95000,
    billingInterval: "month",
    isActive: true,
    limits: {
      maxDomains: 10,
      maxCompetitors: 20,
      competitorScans: 100,
      keywordSearches: 500,
      monthlyCredits: 2500,
      auditPages: 50000,
      uptimeMonitors: 10,
      teamMembers: 5,
    },
    features: {
      advanced_analytics: true,
      action_roadmap: true,
      my_reports_builder: false,
      brand_analysis: true,
      competitors_directory: true,
      competitor_ads: true,
      competitor_analysis: true,
      keyword_research: true,
      rank_tracker: true,
      backlink_analysis: true,
      site_audit: true,
      gbp_integration: true,
      map_rank_tracker: true,
      review_management: true,
      listing_management: true,
      ai_visibility: true,
      ai_content_studio: true,
      ai_seo_fixer: false,
      indexnow_submitter: true,
      uptime_ssl_monitoring: true,
      white_label_pdf: false,
      team_management: true,
      mcp_api_access: true,
      priority_support: false,
      ad_readiness: true,
      viral_detector: true,
      trends_radar: true,
      aeoAudit: true,
    },
  },
  {
    id: "agency",
    name: "Agency & Scale",
    priceUsd: 199,
    priceNgn: 240000,
    billingInterval: "month",
    isActive: true,
    limits: {
      maxDomains: 50,
      maxCompetitors: 100,
      competitorScans: 500,
      keywordSearches: 2500,
      monthlyCredits: 10000,
      auditPages: 250000,
      uptimeMonitors: 50,
      teamMembers: 25,
    },
    features: {
      advanced_analytics: true,
      action_roadmap: true,
      my_reports_builder: true,
      brand_analysis: true,
      competitors_directory: true,
      competitor_ads: true,
      competitor_analysis: true,
      keyword_research: true,
      rank_tracker: true,
      backlink_analysis: true,
      site_audit: true,
      gbp_integration: true,
      map_rank_tracker: true,
      review_management: true,
      listing_management: true,
      ai_visibility: true,
      ai_content_studio: true,
      ai_seo_fixer: true,
      indexnow_submitter: true,
      uptime_ssl_monitoring: true,
      white_label_pdf: true,
      team_management: true,
      mcp_api_access: true,
      priority_support: true,
      ad_readiness: true,
      viral_detector: true,
      trends_radar: true,
      aeoAudit: true,
      whiteLabelPdf: true,
      mcpAccess: true,
      indexnowSubmit: true,
      customBranding: true,
      prioritySupport: true,
    },
  },
];

export const BillingPlansService = {
  /**
   * Retrieves all SaaS plans for admin management.
   * Merges database customizations with default plans so plans never disappear.
   */
  async getAllPlans(): Promise<AdminPlanRecord[]> {
    try {
      const { db } = await import("@/db");
      const { saasPlans } = await import("@/db/schema");

      const rows = await db.select().from(saasPlans);
      const dbPlanMap = new Map(rows.map((r) => [r.id, r]));

      const allPlanIds = Array.from(
        new Set([...DEFAULT_PLANS.map((p) => p.id), ...rows.map((r) => r.id)]),
      );

      return allPlanIds.map((planId) => {
        const defaultPlan = DEFAULT_PLANS.find((p) => p.id === planId);
        const p = dbPlanMap.get(planId);

        if (!p && defaultPlan) {
          return defaultPlan;
        }

        if (!p) {
          return (
            defaultPlan || {
              id: planId,
              name: planId,
              priceUsd: 0,
              priceNgn: 0,
              billingInterval: "month",
              isActive: true,
              limits: {
                maxDomains: 1,
                maxCompetitors: 2,
                competitorScans: 5,
                keywordSearches: 15,
                monthlyCredits: 50,
                auditPages: 100,
                uptimeMonitors: 0,
                teamMembers: 1,
              },
              features: DEFAULT_PLANS[0].features,
            }
          );
        }

        let limits: SaasPlanLimits = defaultPlan?.limits || {
          maxDomains: 1,
          maxCompetitors: 2,
          competitorScans: 5,
          keywordSearches: 15,
          monthlyCredits: 50,
          auditPages: 100,
          uptimeMonitors: 0,
          teamMembers: 1,
        };

        let features: SaasPlanFeatures = defaultPlan?.features || {
          advanced_analytics: true,
          action_roadmap: true,
          my_reports_builder: false,
          brand_analysis: true,
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
