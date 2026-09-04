import { describe, it, expect } from "vitest";
import { CompetitorStrategyService } from "@/services/competitor-strategy.service";

describe("CompetitorStrategyService", () => {
  it("generates a structured 5-Pillar Competitor Strategy Teardown with 3 attack plays", async () => {
    const report = await CompetitorStrategyService.generateTeardown(
      "test-proj-123",
      "competitor.com",
      2840
    );

    expect(report).toBeDefined();
    expect(report.targetDomain).toBe("competitor.com");
    expect(report.locationCode).toBe(2840);

    // Pillar 1: Positioning
    expect(report.positioning).toBeDefined();
    expect(typeof report.positioning.coreHook).toBe("string");
    expect(report.positioning.messagingStrengths.length).toBeGreaterThan(0);

    // Pillar 2: Funnel Angles
    expect(report.funnelAngles).toBeDefined();
    expect(report.funnelAngles.primaryValueDrivers.length).toBeGreaterThan(0);
    expect(report.funnelAngles.pricingFrictionPoints.length).toBeGreaterThan(0);

    // Pillar 3: Content Moat
    expect(report.contentMoat).toBeDefined();
    expect(report.contentMoat.topThemes.length).toBeGreaterThan(0);
    expect(typeof report.contentMoat.contentMoatSummary).toBe("string");

    // Pillar 4: Vulnerabilities
    expect(report.vulnerabilities).toBeDefined();
    expect(report.vulnerabilities.strikingDistanceKeywords.length).toBeGreaterThan(0);
    expect(report.vulnerabilities.contentWeaknesses.length).toBeGreaterThan(0);

    // Pillar 5: Attack Playbook & SAM AI Integration
    expect(report.attackPlaybook).toBeDefined();
    expect(report.attackPlaybook.plays.length).toBe(3);
    report.attackPlaybook.plays.forEach((play) => {
      expect(play.id).toBeDefined();
      expect(play.title).toBeDefined();
      expect(play.objective).toBeDefined();
      expect(play.actionSteps.length).toBeGreaterThan(0);
      expect(play.suggestedPromptForSam.length).toBeGreaterThan(20);
    });
  });
});
