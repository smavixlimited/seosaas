import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("cloudflare:workers", () => ({ env: {} }));

import { AudienceTrustService } from "@/services/audience-trust.service";

describe("Audience Trust & Sentiment (Pre-Ad Gate) Service", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("formats database row correctly with fallback structures", () => {
    const mockRow = {
      id: "trust_test_123",
      projectId: "proj_abc",
      trustScore: 88,
      preAdGateStatus: "approved",
      sentimentDistributionJson: JSON.stringify({ positive: 80, neutral: 15, negative: 5 }),
      trustSignalsJson: JSON.stringify([
        {
          type: "social_proof",
          title: "Verified Reviews",
          source: "Landing Page",
          sentiment: "positive",
          snippet: "High customer satisfaction rating",
          verified: true,
        },
      ]),
      riskAlertsJson: JSON.stringify([
        {
          severity: "low",
          category: "ad_comment_risk",
          title: "Low Ad Risk",
          description: "Positive sentiment",
          recommendedAction: "Maintain moderation",
        },
      ]),
      recommendedAction: "🟢 AD-READY",
      createdAt: "2026-09-07T12:00:00.000Z",
    };

    const result = AudienceTrustService.formatDbRow(
      "proj_abc",
      mockRow,
      "Acme Corp",
      "https://acme.com",
      "E-Commerce & Retail",
      "E-Commerce Sales / Direct Checkout (ROAS)",
      "Meta Ads (Facebook & Instagram)",
    );

    expect(result.id).toBe("trust_test_123");
    expect(result.brandName).toBe("Acme Corp");
    expect(result.websiteUrl).toBe("https://acme.com");
    expect(result.industry).toBe("E-Commerce & Retail");
    expect(result.campaignGoal).toBe("E-Commerce Sales / Direct Checkout (ROAS)");
    expect(result.adPlatform).toBe("Meta Ads (Facebook & Instagram)");
    expect(result.trustScore).toBe(88);
    expect(result.preAdGateStatus).toBe("approved");
    expect(result.sentimentDistribution.positive).toBe(80);
    expect(result.trustSignals.length).toBe(1);
    expect(result.riskAlerts.length).toBe(1);
    expect(result.preAdChecklist.length).toBeGreaterThan(0);
  });

  it("executes trust audit with custom campaign goal & ad platform", async () => {
    const result = await AudienceTrustService.runTrustAudit("test_project_id", {
      campaignGoal: "High-Ticket B2B Demos / Sales Calls",
      adPlatform: "LinkedIn Ads",
    });

    expect(result).toBeDefined();
    expect(typeof result.trustScore).toBe("number");
    expect(["approved", "caution", "rejected"]).toContain(result.preAdGateStatus);
    expect(result.campaignGoal).toBe("High-Ticket B2B Demos / Sales Calls");
    expect(result.adPlatform).toBe("LinkedIn Ads");
    expect(result.sentimentDistribution.positive).toBeGreaterThan(0);
    expect(result.trustSignals.length).toBeGreaterThan(0);
    expect(result.riskAlerts.length).toBeGreaterThan(0);
    expect(result.preAdChecklist.length).toBeGreaterThan(0);
    expect(result.recommendedAction).toBeDefined();
  });

  it("evaluates Media / News publication and Site Traffic with specialized checklist", async () => {
    const result = await AudienceTrustService.runTrustAudit("news_project_id", {
      industry: "Media / News & Publishing",
      campaignGoal: "Site Traffic & Reader Engagement",
      adPlatform: "Meta Ads (Facebook & Instagram)",
    });

    expect(result).toBeDefined();
    expect(result.industry).toBe("Media / News & Publishing");
    expect(result.campaignGoal).toBe("Site Traffic & Reader Engagement");
    expect(result.preAdChecklist.some((c) => c.item.toLowerCase().includes("article load speed") || c.item.toLowerCase().includes("core web vitals"))).toBe(true);
    expect(result.preAdChecklist.some((c) => c.item.toLowerCase().includes("author bylines") || c.item.toLowerCase().includes("editorial"))).toBe(true);
    expect(result.preAdChecklist.some((c) => c.item.toLowerCase().includes("newsletter"))).toBe(true);
  });

  it("evaluates Healthcare & FinTech with regulatory compliance checklists", async () => {
    const result = await AudienceTrustService.runTrustAudit("health_project_id", {
      industry: "Healthcare & Wellness",
      campaignGoal: "Lead Generation & Inquiries",
      adPlatform: "Google Search & Performance Max",
    });

    expect(result).toBeDefined();
    expect(result.industry).toBe("Healthcare & Wellness");
    expect(result.preAdChecklist.some((c) => c.item.toLowerCase().includes("encryption") || c.item.toLowerCase().includes("disclaimers"))).toBe(true);
  });

  it("evaluates Mobile App Installs with App Store badges and attribution", async () => {
    const result = await AudienceTrustService.runTrustAudit("app_project_id", {
      industry: "Mobile Gaming & Apps",
      campaignGoal: "App Installs & User Signups",
      adPlatform: "TikTok Ads",
    });

    expect(result).toBeDefined();
    expect(result.campaignGoal).toBe("App Installs & User Signups");
    expect(result.preAdChecklist.some((c) => c.item.toLowerCase().includes("app store") || c.item.toLowerCase().includes("skadnetwork"))).toBe(true);
  });
});
