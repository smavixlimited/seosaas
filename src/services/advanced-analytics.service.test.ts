import { describe, it, expect } from "vitest";
import { AdvancedAnalyticsService } from "@/services/advanced-analytics.service";

describe("AdvancedAnalyticsService (Executive Growth & SEO Command Center)", () => {
  it("generates truthful analytics overview with KPIs and ranking matrix", async () => {
    const report = await AdvancedAnalyticsService.getAnalyticsOverview(
      "test-proj-123",
      "30d",
    );

    expect(report).toBeDefined();
    expect(report.projectId).toBe("test-proj-123");
    expect(report.dateRange).toBe("30d");
    
    // Executive KPIs
    expect(report.kpis.totalImpressions).toBeGreaterThanOrEqual(0);
    expect(report.kpis.totalClicks).toBeGreaterThanOrEqual(0);
    expect(report.kpis.averageCtr).toBeGreaterThanOrEqual(0);
    expect(report.kpis.averagePosition).toBeGreaterThanOrEqual(0);
    expect(report.kpis.estimatedMonthlyTrafficValue).toBeGreaterThanOrEqual(0);
    expect(report.kpis.adSpendSavingsEquivalent).toBeGreaterThanOrEqual(0);
    expect(report.kpis.technicalHealthScore).toBeGreaterThanOrEqual(0);
    expect(report.kpis.aiSearchVisibilityScore).toBeGreaterThanOrEqual(0);

    // Ranking Distribution
    expect(report.rankingDistribution).toBeDefined();
    expect(report.rankingDistribution.top3).toBeGreaterThanOrEqual(0);
    expect(report.rankingDistribution.top10).toBeGreaterThanOrEqual(0);
    expect(report.rankingDistribution.top20).toBeGreaterThanOrEqual(0);

    // Strategic Recommendations
    expect(report.strategicRecommendations.length).toBeGreaterThan(0);
    report.strategicRecommendations.forEach((rec) => {
      expect(rec.title).toBeDefined();
      expect(rec.impactValue).toBeDefined();
      expect(rec.suggestedPrompt.length).toBeGreaterThan(20);
    });
  });

  it("exports formatted CSV report with executive metrics", async () => {
    const report = await AdvancedAnalyticsService.getAnalyticsOverview(
      "test-proj-123",
      "30d",
    );

    const csv = AdvancedAnalyticsService.exportToCsv(report);
    expect(csv).toContain("Skorvia Executive Growth & SEO Analytics Report");
    expect(csv).toContain("Total Impressions");
    expect(csv).toContain("Est. Monthly Organic Traffic Value ($)");
    expect(csv).toContain("Top Performing Commercial Keywords");
  });
});
