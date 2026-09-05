import { describe, it, expect, beforeEach } from "vitest";
import { BillingPlansService } from "@/services/billing-plans.service";

describe("BillingPlansService (Dynamic Pricing & Quota Controls)", () => {
  beforeEach(() => {
    // Reset state if needed
  });

  it("retrieves standard plans with default fallback", async () => {
    const plans = await BillingPlansService.getAllPlans();
    expect(plans.length).toBeGreaterThan(0);
    const starter = plans.find((p) => p.id === "starter");
    expect(starter).toBeDefined();
    expect(starter?.priceUsd).toBeGreaterThanOrEqual(0);
    expect(starter?.limits.monthlyCredits).toBeGreaterThan(0);
  });

  it("upserts plan pricing and feature flags", async () => {
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
        my_reports_builder: true,
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
    expect(saved.priceUsd).toBe(149);
    expect(saved.priceNgn).toBe(180000);
    expect(saved.limits.monthlyCredits).toBe(8000);
    expect(saved.features.whiteLabelPdf).toBe(true);
  });

  it("toggles active/archived plan status", async () => {
    const isArchived = await BillingPlansService.togglePlanStatus(
      "test-agency-plan",
      false,
      "usr_admin_001",
      "admin@skorvia.com",
    );
    expect(isArchived).toBe(false);

    const isReactivated = await BillingPlansService.togglePlanStatus(
      "test-agency-plan",
      true,
      "usr_admin_001",
      "admin@skorvia.com",
    );
    expect(isReactivated).toBe(true);
  });
});
