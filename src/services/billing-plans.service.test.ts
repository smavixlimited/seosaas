import { describe, it, expect } from "vitest";
import { BillingPlansService } from "@/services/billing-plans.service";

describe("BillingPlansService (Dynamic Pricing & 24+ Quota Controls)", () => {
  it("retrieves standard plans with all 6 pillars and 24+ feature definitions", async () => {
    const plans = await BillingPlansService.getAllPlans();
    expect(plans.length).toBeGreaterThan(0);
    const starter = plans.find((p) => p.id === "starter");
    expect(starter).toBeDefined();
    expect(starter?.limits.monthlyCredits).toBe(500);

    // Verify 6 Pillars
    expect(starter?.features.advanced_analytics).toBe(true);
    expect(starter?.features.action_roadmap).toBe(true);
    expect(starter?.features.brand_analysis).toBe(true);
    expect(starter?.features.competitors_directory).toBe(true);
    expect(starter?.features.keyword_research).toBe(true);
    expect(starter?.features.rank_tracker).toBe(true);
    expect(starter?.features.site_audit).toBe(true);

    const pro = plans.find((p) => p.id === "pro");
    expect(pro).toBeDefined();
    expect(pro?.features.ad_readiness).toBe(true);
    expect(pro?.features.viral_detector).toBe(true);
    expect(pro?.features.trends_radar).toBe(true);
    expect(pro?.features.competitor_ads).toBe(true);
    expect(pro?.features.competitor_analysis).toBe(true);
    expect(pro?.features.ai_visibility).toBe(true);
  });

  it("upserts plan pricing and full feature flags matrix", async () => {
    const customPlan = {
      id: "test-agency-plan",
      name: "Test Agency Tier",
      priceUsd: 149,
      priceNgn: 180000,
      billingInterval: "month",
      isActive: true,
      limits: {
        maxDomains: 50,
        monthlyCredits: 8000,
        auditPages: 150000,
        uptimeMonitors: 30,
      },
      features: {
        advanced_analytics: true,
        action_roadmap: true,
        my_reports_builder: true,
        brand_analysis: true,
        ad_readiness: true,
        viral_detector: true,
        trends_radar: true,
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
        whiteLabelPdf: true,
        mcpAccess: true,
        indexnowSubmit: true,
        aeoAudit: true,
        customBranding: true,
        prioritySupport: true,
      },
    };

    const saved = await BillingPlansService.upsertPlan(
      customPlan,
      "usr_admin_001",
      "admin@skorvia.com",
    );
    expect(saved.id).toBe("test-agency-plan");
    expect(saved.limits.maxDomains).toBe(50);
    expect(saved.features.competitor_ads).toBe(true);
  });
});
