import { describe, it, expect } from "vitest";
import { ConversionAdReadinessService } from "@/services/conversion-ad-readiness.service";

describe("ConversionAdReadinessService (0-100 Conversion & Ad Readiness Scorecard)", () => {
  it("evaluates landing page conversion readiness with 5 sub-pillars and risk rating", async () => {
    const report = await ConversionAdReadinessService.runConversionAudit(
      "test-proj-999",
      "https://example.com/pricing",
      "example.com"
    );

    expect(report).toBeDefined();
    expect(report.targetUrl).toBe("https://example.com/pricing");
    expect(report.overallScore).toBeGreaterThanOrEqual(0);
    expect(report.overallScore).toBeLessThanOrEqual(100);
    expect(["A+", "A", "B+", "B", "C", "D", "F"]).toContain(report.grade);
    expect(["low", "moderate", "high", "critical"]).toContain(report.adWastedSpendRisk);

    // 5 Sub-Pillars
    expect(report.trustAndCredibilityScore).toBeGreaterThanOrEqual(0);
    expect(report.ctaAndOfferClarityScore).toBeGreaterThanOrEqual(0);
    expect(report.pageSpeedAndMobileScore).toBeGreaterThanOrEqual(0);
    expect(report.socialProofAndReviewsScore).toBeGreaterThanOrEqual(0);
    expect(report.frictionAndFormLengthScore).toBeGreaterThanOrEqual(0);

    // Checks Passed & Critical Friction Points
    expect(report.checksPassed.length).toBeGreaterThan(0);
    expect(report.criticalFrictionPoints.length).toBeGreaterThan(0);

    // Prioritized Fixes with SAM AI Prompts
    expect(report.recommendedFixes.length).toBeGreaterThan(0);
    report.recommendedFixes.forEach((fix) => {
      expect(fix.id).toBeDefined();
      expect(fix.title).toBeDefined();
      expect(fix.estimatedConversionLift).toBeDefined();
      expect(fix.suggestedPromptForSam.length).toBeGreaterThan(20);
    });
  });
});
